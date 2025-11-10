using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Common.Services;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Users.Update
{
    public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, Result<UpdateUserResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly StatusValidationService _statusValidationService;

        public UpdateUserHandler(
            EVDmsDbContext db,
            IMapper mapper,
            StatusValidationService statusValidationService)
        {
            _db = db;
            _mapper = mapper;
            _statusValidationService = statusValidationService;
        }

        public async Task<Result<UpdateUserResponse>> Handle(UpdateUserCommand command, CancellationToken ct)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.UserId == command.UserId, ct);

            if (user == null)
            {
                return Result.NotFound($"User with id {command.UserId} not found.");
            }

            var req = command.Request;

            // (nếu có DealerId và đang thay đổi
            if (req.DealerId.HasValue && user.DealerId != req.DealerId.Value)
            {
                var dealerValidation = await _statusValidationService.ValidateDealerForConfig(req.DealerId.Value, allowOnboarding: true, ct);
                if (!dealerValidation.IsSuccess)
                    return dealerValidation;
            }

            // Validate Branch status = Active (nếu có BranchId và đang thay đổi)
            if (req.BranchId.HasValue && user.BranchId != req.BranchId.Value)
            {
                var branchValidation = await _statusValidationService.ValidateBranchForConfig(req.BranchId.Value, ct);
                if (!branchValidation.IsSuccess)
                    return branchValidation;
            }

            // Update FullName if provided
            if (!string.IsNullOrWhiteSpace(req.FullName))
            {
                user.FullName = req.FullName;
            }

            // Update Email if provided (uniqueness already validated in validator)
            if (!string.IsNullOrWhiteSpace(req.Email) && user.Email != req.Email)
            {
                user.Email = req.Email;
            }

            // Update Password if provided
            if (!string.IsNullOrWhiteSpace(req.Password))
            {
                var salting = HashHelper.GenerateRandomString(100);
                var saltedPassword = req.Password + salting;
                var hashedPassword = HashHelper.BCriptHash(saltedPassword);

                user.Salting = salting;
                user.PasswordHash = hashedPassword;
            }

            // Determine current and new role
            var currentRole = Enum.Parse<Role>(user.Role);
            var newRole = req.Role.HasValue ? req.Role.Value : currentRole;

            // Update Role if provided
            if (req.Role.HasValue && req.Role.Value != currentRole)
            {
                user.Role = req.Role.Value.ToString();

                // If changing to Admin/EVMStaff, clear DealerId and BranchId
                if (req.Role == Role.Admin || req.Role == Role.EVMStaff)
                {
                    user.DealerId = null;
                    user.BranchId = null;
                }
                // If changing to DealerManager, clear BranchId (manages multiple branches)
                else if (req.Role == Role.DealerManager)
                {
                    user.BranchId = null;
                }
            }

            // Update Status if provided
            if (req.Status.HasValue)
            {
                user.Status = req.Status.Value.ToString();
            }

            // Update DealerId if provided
            // Note: Validator ensures DealerId/BranchId constraints based on role
            if (req.DealerId.HasValue)
            {
                user.DealerId = req.DealerId.Value;
            }

            // Update BranchId if provided
            // Note: Validator ensures DealerId/BranchId constraints based on role
            if (req.BranchId.HasValue)
            {
                user.BranchId = req.BranchId.Value;
            }

            // Update timestamp
            user.UpdateAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            var response = new UpdateUserResponse
            {
                UserId = user.UserId,
                LastUpdatedAt = user.UpdateAt
            };

            return Result.Success(response);
        }
    }
}

