namespace backend.Common.Paging
{
    public sealed class ApiError
    {
        public string Code { get; init; } = "Unauthorized";
        public string Message { get; init; } = "Invalid credentials";
        public IDictionary<string, string[]>? Details { get; init; }
    }
}
