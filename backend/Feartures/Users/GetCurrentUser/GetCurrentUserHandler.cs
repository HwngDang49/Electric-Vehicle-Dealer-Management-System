using Ardalis.Result;
using AutoMapper;
using backend.Common.Auth;
using backend.Feartures.PurchaseOrders.Create;
using backend.Feartures.Users.GetUser;
using backend.Infrastructure.Data;
using MediatR;

namespace backend.Feartures.Users.GetCurrentUser
{
    public class GetCurrentUserHandler : IRequestHandler<GetCurrentUserQuery, GetCurrentUserResponse>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetCurrentUserHandler(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Task<GetCurrentUserResponse> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
        {
            // Lấy ClaimsPrincipal của user từ HttpContext
            var user = _httpContextAccessor.HttpContext?.User;

            if (user is null)
            {
                throw new UnauthorizedAccessException("Cannot access user claims.");
            }

            // Dùng extension method trong claimsPricipal
            var userId = user.GetUserId();

            if (userId is null)
            {
                throw new UnauthorizedAccessException("User ID not found in token.");
            }

            // Tạo response
            var response = new GetCurrentUserResponse
            {
                Id = userId.Value, // userId là long? nên cần .Value
            };

            return Task.FromResult(response);
        }
    }
}
