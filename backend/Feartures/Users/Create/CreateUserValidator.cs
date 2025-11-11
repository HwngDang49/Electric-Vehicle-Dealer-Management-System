using backend.Domain.Enums;
using backend.Infrastructure.Data;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Users.Create
{
    public class CreateUserValidator : AbstractValidator<CreateUserCommand>
    {
        private readonly EVDmsDbContext _db;

        public CreateUserValidator(EVDmsDbContext db)
        {
            _db = db;

            RuleFor(x => x.Request.FullName)
                .NotEmpty()
                .WithMessage("Full name is required")
                .MaximumLength(255)
                .WithMessage("Full name cannot exceed 255 characters");

            RuleFor(x => x.Request.Email)
                .NotEmpty()
                .WithMessage("Email is required")
                .EmailAddress()
                .WithMessage("Invalid email format")
                .MaximumLength(255)
                .WithMessage("Email cannot exceed 255 characters");

            RuleFor(x => x.Request.Password)
                .NotEmpty()
                .WithMessage("Password is required")
                .MinimumLength(6)
                .WithMessage("Password must be at least 6 characters");

            RuleFor(x => x.Request.Role)
                .IsInEnum()
                .WithMessage("Invalid role");

            RuleFor(x => x.Request.Status)
                .IsInEnum()
                .WithMessage("Invalid status");

            // Validation cho Admin và EVMStaff - KHÔNG được có DealerId và BranchId
            RuleFor(x => x.Request.DealerId)
                .Null()
                .When(x => x.Request.Role == Role.Admin || x.Request.Role == Role.EVMStaff)
                .WithMessage("Admin and EVM Staff cannot have Dealer assigned");

            RuleFor(x => x.Request.BranchId)
                .Null()
                .When(x => x.Request.Role == Role.Admin || x.Request.Role == Role.EVMStaff)
                .WithMessage("Admin and EVM Staff cannot have Branch assigned");

            // Validation cho DealerManager - BẮT BUỘC có DealerId, KHÔNG được có BranchId (quản lý nhiều branch)
            RuleFor(x => x.Request.DealerId)
                .NotNull()
                .When(x => x.Request.Role == Role.DealerManager)
                .WithMessage("Dealer Manager must have Dealer assigned");

            RuleFor(x => x.Request.BranchId)
                .Null()
                .When(x => x.Request.Role == Role.DealerManager)
                .WithMessage("Dealer Manager cannot have Branch assigned (they manage multiple branches)");

            // Validation cho DealerStaff - BẮT BUỘC có DealerId và BranchId
            RuleFor(x => x.Request.DealerId)
                .NotNull()
                .When(x => x.Request.Role == Role.DealerStaff)
                .WithMessage("Dealer Staff must have Dealer assigned");

            RuleFor(x => x.Request.BranchId)
                .NotNull()
                .When(x => x.Request.Role == Role.DealerStaff)
                .WithMessage("Dealer Staff must have Branch assigned");

            // Validate Dealer exists
            RuleFor(x => x.Request.DealerId)
                .MustAsync(async (dealerId, ct) =>
                {
                    if (dealerId == null) return true;
                    return await _db.Dealers.AnyAsync(d => d.DealerId == dealerId.Value, ct);
                })
                .When(x => x.Request.DealerId.HasValue)
                .WithMessage("Dealer does not exist");

            // Validate Branch exists
            RuleFor(x => x.Request.BranchId)
                .MustAsync(async (branchId, ct) =>
                {
                    if (branchId == null) return true;
                    return await _db.Branches.AnyAsync(b => b.BranchId == branchId.Value, ct);
                })
                .When(x => x.Request.BranchId.HasValue)
                .WithMessage("Branch does not exist");

            // Validate Branch thuộc về Dealer đã chọn (chỉ khi có cả DealerId và BranchId)
            RuleFor(x => x.Request)
                .MustAsync(async (request, ct) =>
                {
                    if (!request.DealerId.HasValue || !request.BranchId.HasValue)
                        return true;

                    var branch = await _db.Branches
                        .FirstOrDefaultAsync(b => b.BranchId == request.BranchId.Value, ct);

                    return branch != null && branch.DealerId == request.DealerId.Value;
                })
                .When(x => x.Request.DealerId.HasValue && x.Request.BranchId.HasValue)
                .WithMessage("Branch does not belong to the selected Dealer");
        }
    }
}

