using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Ardalis.Result;
using backend.Common.Helpers;
using backend.Common.Services;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace backend.Feartures.Users.Login
{
    public record UserLoginCommand(UserLoginRequest Request) : IRequest<Result<long>>;
    public record UserLoginJwtCommand(UserLoginRequest Request) : IRequest<Result<string>>;

    public class UserLoginHandler :
        IRequestHandler<UserLoginCommand, Result<long>>,
        IRequestHandler<UserLoginJwtCommand, Result<string>>
    {
        private readonly EVDmsDbContext _db;
        private readonly JwtSettingsRequest _jwtSettings;
        private readonly StatusValidationService _statusValidationService;

        public UserLoginHandler(EVDmsDbContext db, IOptions<JwtSettingsRequest> jwtOptions, StatusValidationService statusValidationService)
        {
            _db = db;
            _jwtSettings = jwtOptions.Value;
            _statusValidationService = statusValidationService;
        }

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

        public async Task<Result<string>> Handle(UserLoginJwtCommand request, CancellationToken ct)
        {
            var req = request.Request;

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == req.Email, ct);
            if (user is null) return Result.Error("Email does not exist.");

            var raw = req.Password + user.Salting;
            if (!HashHelper.BCriptVerify(raw, user.PasswordHash))
                return Result.Error("Password is incorrect.");

            // ✅ Validate User status = Active (only check user status for login)
            if (user.Status != UserStatus.Active.ToString())
                return Result.Error($"User account is not active. Current status: {user.Status}");

            // Note: Dealer and Branch status are NOT checked during login
            // - When dealer/branch is suspended, users can still login to complete existing orders
            // - Retail operations (create order/customer) will be blocked by validation in respective handlers
            // - This allows users to login and complete pending work even when dealer/branch is suspended

            var claims = new List<Claim>
    {
            new(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
    };

            if (user.DealerId.HasValue)
            {
                claims.Add(new Claim("dealer_id", user.DealerId.Value.ToString()));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
                signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return Result.Success(jwt);
        }
    }
}
