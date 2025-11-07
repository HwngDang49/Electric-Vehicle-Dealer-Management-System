using Ardalis.Result;
using AutoMapper;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Common.Services;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Customers.Create
{
    public sealed class CreateCustomerHandler
        : IRequestHandler<CreateCustomerCommand, Result<CreateCustomerResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;
        private readonly StatusValidationService _statusValidationService;

        public CreateCustomerHandler(EVDmsDbContext db, IMapper mapper, IHttpContextAccessor httpContextAccessor, StatusValidationService statusValidationService)
        {
            _db = db;
            _mapper = mapper;
            _http = httpContextAccessor;
            _statusValidationService = statusValidationService;
        }

        public async Task<Result<CreateCustomerResponse>> Handle(CreateCustomerCommand command, CancellationToken ct)
        {
            command.DealerId = _http.HttpContext!.User.GetDealerId();
            var userId = _http.HttpContext!.User.GetUserId();
            var branchId = _http.HttpContext!.User.GetBranchId();

            // ✅ Validate Branch status if user has branch (DealerStaff/DealerManager)
            // Users in Suspended/Closed branches cannot create new customers
            User? user = null;
            if (userId.HasValue)
            {
                user = await _db.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.UserId == userId.Value, ct);

                if (user != null && user.BranchId.HasValue)
                {
                    var branch = await _db.Branches
                        .AsNoTracking()
                        .FirstOrDefaultAsync(b => b.BranchId == user.BranchId.Value, ct);

                    if (branch != null)
                    {
                        var branchStatus = Enum.Parse<BranchStatus>(branch.Status);
                        if (branchStatus != BranchStatus.Active)
                        {
                            return Result.Error($"Cannot create customer. Branch must be in 'Active' status to create new customers. Current branch status: {branch.Status}");
                        }
                    }
                }
            }

            // 2.1 Dealer phải tồn tại
            var dealerExists = await _db.Dealers
                .AsNoTracking()
                .AnyAsync(d => d.DealerId == command.DealerId, ct);
            if (!dealerExists) return Result.NotFound($"Dealer {command.DealerId} not found.");

            // 2.2 Email không trùng trong cùng dealer
            if (!string.IsNullOrWhiteSpace(command.Email))
            {
                var dupEmail = await _db.Customers
                    .AsNoTracking()
                    .AnyAsync(c => c.DealerId == command.DealerId && c.Email == command.Email, ct);
                if (dupEmail) return Result.Error("Customer email already exists in this dealer.");
            }

            // 2.3 Phone không trùng trong cùng dealer
            if (!string.IsNullOrWhiteSpace(command.Phone))
            {
                var dupPhone = await _db.Customers
                    .AsNoTracking()
                    .AnyAsync(c => c.DealerId == command.DealerId && c.Phone == command.Phone, ct);
                if (dupPhone) return Result.Error("Customer phone already exists in this dealer.");
            }

            // 3) Map DTO -> Entity
            var entity = _mapper.Map<Customer>(command);
            entity.DealerId = command.DealerId;

            // 4) Status default nếu null
            entity.Status = command.Status?.ToString() ?? entity.Status ?? "Contact";

            // 5) Set BranchId and CreatedBy
            entity.BranchId = user?.BranchId ?? branchId;
            entity.CreatedBy = userId;

            // 6) Timestamps
            entity.CreatedAt = DateTimeHelper.UtcNow();

            // 7) Save
            _db.Customers.Add(entity);
            await _db.SaveChangesAsync(ct);

            // 8) Response - Convert CreatedAt từ UTC sang giờ VN
            var response = new CreateCustomerResponse
            {
                CustomerId = entity.CustomerId,
                Status = entity.Status ?? "Contact",
                CreatedAt = DateTimeHelper.ToVietnamTime(entity.CreatedAt)
            };

            return Result.Success(response);
        }
    }
}
