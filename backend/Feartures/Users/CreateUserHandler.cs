using System.Net.WebSockets;
using Ardalis.Result;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Users
{
    public record CreateUserCommand(CreateUserRequest Request) : IRequest<Result<long>>;
    public class CreateUserHandler : IRequestHandler<CreateUserCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;

        public CreateUserHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<long>> Handle(CreateUserCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            var existed = await _db.Users
                .AnyAsync(u => u.Email == req.Email, ct);

            if (existed)
            {
                return Result.Error("Email already exists.");
            }

            var user = new User
            {
                Email = req.Email,
                FullName = req.FullName,
                PasswordHash = req.Password,
                Role = req.Role.ToString(),
                BranchId = req.BranchId,
                DealerId = req.DealerId,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var checkDealerId = await _db.Dealers.FirstOrDefaultAsync(d => d.DealerId == req.DealerId, ct);

            if (checkDealerId == null)
            {
                return Result.Error("DealerId does not exist.");
            }
            var checkBranchId = await _db.Branches.FirstOrDefaultAsync(b => b.BranchId == req.BranchId, ct);

            // đang thiếu phần check branch xem có thuộc dealer đó không 

            if (checkBranchId == null)
            {
                return Result.Error("BranchId does not exist.");
            }

            _db.Users.Add(user);
            await _db.SaveChangesAsync(ct);

            return Result.Success(user.UserId);
        }
    }
}
