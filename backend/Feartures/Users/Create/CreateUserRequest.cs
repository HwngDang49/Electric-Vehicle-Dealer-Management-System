using backend.Domain.Enums;

namespace backend.Feartures.Users
{
    public class CreateUserRequest
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public Role Role { get; set; }
        public UserStatus Status { get; set; } = UserStatus.Active;
        public long DealerId { get; set; }
        public long BranchId { get; set; }
    }
}
