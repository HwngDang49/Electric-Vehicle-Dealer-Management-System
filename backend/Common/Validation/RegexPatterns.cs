namespace backend.Common.Validation
{
    public static class RegexPatterns
    {
        // Di động Việt Nam: 0x… / +84x… (x ∈ 3|5|7|8|9), tổng 10 số
        public const string VietnamesePhone = @"^(?:0|\+84)(?:3|5|7|8|9)\d{8}$";
    }
}
