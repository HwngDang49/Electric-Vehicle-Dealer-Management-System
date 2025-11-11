using backend.Domain.Enums;
using backend.Infrastructure.Data;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Users.Update
{
    public class UpdateUserValidator : AbstractValidator<UpdateUserCommand>
    {
        private readonly EVDmsDbContext _db;

        public UpdateUserValidator(EVDmsDbContext db)
        {
            _db = db;

            RuleFor(x => x.UserId)
                .GreaterThan(0)
                .WithMessage("User ID must be greater than 0");

            RuleFor(x => x.Request.FullName)
                .MaximumLength(255)
                .When(x => !string.IsNullOrWhiteSpace(x.Request.FullName))
                .WithMessage("Full name cannot exceed 255 characters");

            RuleFor(x => x.Request.Email)
                .EmailAddress()
                .When(x => !string.IsNullOrWhiteSpace(x.Request.Email))
                .WithMessage("Invalid email format")
                .MaximumLength(255)
                .When(x => !string.IsNullOrWhiteSpace(x.Request.Email))
                .WithMessage("Email cannot exceed 255 characters");

            // Validate email uniqueness (excluding current user)
            RuleFor(x => x.Request.Email)
                .MustAsync(async (cmd, email, ct) =>
                {
                    if (string.IsNullOrWhiteSpace(email))
                        return true;

                    var emailExists = await _db.Users
                        .AnyAsync(u => u.Email == email && u.UserId != cmd.UserId, ct);
                    return !emailExists;
                })
                .When(x => !string.IsNullOrWhiteSpace(x.Request.Email))
                .WithMessage("Email already exists");

            RuleFor(x => x.Request.Password)
                .MinimumLength(6)
                .When(x => !string.IsNullOrWhiteSpace(x.Request.Password))
                .WithMessage("Password must be at least 6 characters");

            RuleFor(x => x.Request.Role)
                .IsInEnum()
                .When(x => x.Request.Role.HasValue)
                .WithMessage("Invalid role");

            RuleFor(x => x.Request.Status)
                .IsInEnum()
                .When(x => x.Request.Status.HasValue)
                .WithMessage("Invalid status");

            // Validate DealerId based on Role
            // If Role is being changed, validate DealerId requirement for new role
            RuleFor(x => x.Request)
                .Must((cmd, request) =>
                {
                    if (!request.Role.HasValue)
                        return true; // Role not changed, skip validation

                    var newRole = request.Role.Value;

                    // Admin and EVMStaff cannot have DealerId
                    if (newRole == Role.Admin || newRole == Role.EVMStaff)
                    {
                        // If changing to Admin/EVMStaff, DealerId must be null (or not provided)
                        return !request.DealerId.HasValue;
                    }

                    // DealerManager and DealerStaff must have DealerId when role is changed
                    if (newRole == Role.DealerManager || newRole == Role.DealerStaff)
                    {
                        // If changing to DealerManager/DealerStaff, DealerId must be provided
                        return request.DealerId.HasValue;
                    }

                    return true;
                })
                .When(x => x.Request.Role.HasValue)
                .WithMessage("When changing role to DealerManager or DealerStaff, DealerId is required. When changing to Admin or EVMStaff, DealerId must be null.");

            // Validate BranchId based on Role
            RuleFor(x => x.Request)
                .Must((cmd, request) =>
                {
                    if (!request.Role.HasValue)
                        return true; // Role not changed, skip validation

                    var newRole = request.Role.Value;

                    // Admin and EVMStaff cannot have BranchId
                    if (newRole == Role.Admin || newRole == Role.EVMStaff)
                    {
                        // If changing to Admin/EVMStaff, BranchId must be null (or not provided)
                        return !request.BranchId.HasValue;
                    }

                    // DealerManager cannot have BranchId (manages multiple branches)
                    if (newRole == Role.DealerManager)
                    {
                        // If changing to DealerManager, BranchId must be null (or not provided)
                        return !request.BranchId.HasValue;
                    }

                    // DealerStaff must have BranchId when role is changed
                    if (newRole == Role.DealerStaff)
                    {
                        // If changing to DealerStaff, BranchId must be provided
                        return request.BranchId.HasValue;
                    }

                    return true;
                })
                .When(x => x.Request.Role.HasValue)
                .WithMessage("When changing role to DealerStaff, BranchId is required. When changing to Admin, EVMStaff, or DealerManager, BranchId must be null.");

            RuleFor(x => x.Request.DealerId)
                .MustAsync(async (dealerId, ct) =>
                {
                    if (dealerId == null) return true;
                    return await _db.Dealers.AnyAsync(d => d.DealerId == dealerId.Value, ct);
                })
                .When(x => x.Request.DealerId.HasValue)
                .WithMessage("Dealer does not exist");


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
                .MustAsync(async (cmd, request, ct) =>
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

