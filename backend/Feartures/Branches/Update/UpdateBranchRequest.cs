namespace backend.Feartures.Branches.Update;

public class UpdateBranchRequest
{
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? Address { get; set; }
    public string Status { get; set; } = default!;
}

