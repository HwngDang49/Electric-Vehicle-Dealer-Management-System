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
        
        /// <summary>
        /// DealerId - Nullable. Required for DealerManager/DealerStaff, must be null for Admin/EVMStaff
        /// </summary>
        public long? DealerId { get; set; }
        
        /// <summary>
        /// BranchId - Nullable. Required for DealerManager/DealerStaff, must be null for Admin/EVMStaff
        /// </summary>
        public long? BranchId { get; set; }
    }
}
