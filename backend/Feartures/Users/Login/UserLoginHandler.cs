using Ardalis.Result;
using backend.Common.Helpers;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Users.Login
{
    public record UserLoginCommand(UserLoginRequest Request) : IRequest<Result<long>>;
    public class UserLoginHandler : IRequestHandler<UserLoginCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;

        public UserLoginHandler(EVDmsDbContext db) => _db = db;

        public async Task<Result<long>> Handle(UserLoginCommand request, CancellationToken ct)
        {
            var req = request.Request;

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email, ct);

            if (user == null)
            {
                return Result.Error("User not found !!!");
            }

            var password = req.Password + user.Salting;

            if (!HashHelper.BCriptVerify(password, user.PasswordHash))
            {
                return Result.Error("Password is incorrect !!!");
            }

            return Result.Success(user.UserId);
        }
    }
}
