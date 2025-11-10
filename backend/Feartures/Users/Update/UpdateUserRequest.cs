using backend.Domain.Enums;

namespace backend.Feartures.Users.Update
{
    public class UpdateUserRequest
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; } // Optional - only update if provided
        public Role? Role { get; set; }
        public UserStatus? Status { get; set; }

        /// <summary>
        /// DealerId - Nullable. Required for DealerManager/DealerStaff, must be null for Admin/EVMStaff
        /// </summary>
        public long? DealerId { get; set; }

        /// <summary>
        /// BranchId - Nullable. CH? tính m?i dealerStaff
        /// Must be null for Admin/EVMStaff/DealerManager.
        /// </summary>
        public long? BranchId { get; set; }
    }
}

