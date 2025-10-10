using Ardalis.Result;
using backend.Domain.Enums;
using MediatR;

namespace backend.Feartures.Users.GetUser
{
    public record GetUserByIdQuery(long UserId) : IRequest<Result<GetUserDto>>;

    public class GetUserDto
    {
        public long UserId { get; set; }
        public string Username { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string Status { get; set; } = default!;
        public string Role { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public long DealerId { get; set; }
        public long BranchId { get; set; }
    }
}
