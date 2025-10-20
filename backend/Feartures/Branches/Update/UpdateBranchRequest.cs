using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.Branches.Update;

public class UpdateBranchRequest
{
    [Required]
    public long BranchId { get; set; }

    [Required]
    public string Code { get; set; } = default!;

    [Required]
    public string Name { get; set; } = default!;

    public string? Address { get; set; }

    // Keep status as string to stay compatible with existing data (Active/Inactive/...)
    [Required]
    public string Status { get; set; } = default!;
}

