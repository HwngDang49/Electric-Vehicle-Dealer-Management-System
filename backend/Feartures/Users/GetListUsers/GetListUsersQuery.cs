using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Users.GetListUsers
{
    public record GetListUsersQuery : IRequest<Result<List<UserListDto>>>;

    public class UserListDto
    {
        public long UserId { get; set; }
        public string Email { get; set; } = default!;
        public string? FullName { get; set; }
        public string Role { get; set; } = default!;
        public string Status { get; set; } = default!;
        public long? DealerId { get; set; }
        public long? BranchId { get; set; }
        public DateTime CreateAt { get; set; }
        public DateTime UpdateAt { get; set; }
    }
}

