using System.Net.WebSockets;
using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Common.Services;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Email;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Feartures.Users
{
    public record CreateUserCommand(CreateUserRequest Request) : IRequest<Result<long>>;
    public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly StatusValidationService _statusValidationService;

        public CreateUserHandler(
            EVDmsDbContext db,
            IMapper mapper,
            IEmailService emailService,
            StatusValidationService statusValidationService)
        {
            _db = db;
            _mapper = mapper;
            _emailService = emailService;
            _statusValidationService = statusValidationService;
        }

        public async Task<Result<long>> Handle(CreateUserCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // ✅ Validate Dealer status = Live or Onboarding (nếu có DealerId)
            if (req.DealerId.HasValue)
            {
                var dealerValidation = await _statusValidationService.ValidateDealerForConfig(req.DealerId.Value, allowOnboarding: true, ct);
                if (!dealerValidation.IsSuccess)
                    return dealerValidation;
            }

            // ✅ Validate Branch status = Active (nếu có BranchId)
            if (req.BranchId.HasValue)
            {
                var branchValidation = await _statusValidationService.ValidateBranchForConfig(req.BranchId.Value, ct);
                if (!branchValidation.IsSuccess)
                    return branchValidation;
            }

            var existed = await _db.Users
                .AnyAsync(u => u.Email == req.Email, ct);

            if (existed)
            {
                return Result.Error("Email already exists.");
            }
            //random cho 100 ký tự
            var salting = HashHelper.GenerateRandomString(100);
            //gán vào password tạo ra 1 chuỗi dài
            var saltedPassword = req.Password + salting;
            //hash bảo mật
            var hashedPassword = HashHelper.BCriptHash(saltedPassword);

            var user = _mapper.Map<User>(req);


            user.Salting = salting;
            user.PasswordHash = hashedPassword;


            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);


            var emailSent = await _emailService.SendWelcomeEmailAsync(
                toEmail: user.Email,
                fullName: user.FullName ?? "User",
                temporaryPassword: req.Password,  // Password gốc (chưa hash)
                role: user.Role ?? "User",
                ct: ct);

            // nếu trạng thái chưa gửi quăng lỗi
            if (!emailSent)
            {
                return Result.Error($"Error sending {user.Email}");
            }

            return Result.Success(user.UserId);
        }
    }
}
