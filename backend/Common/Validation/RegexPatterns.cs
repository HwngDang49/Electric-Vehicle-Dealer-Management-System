namespace backend.Common.Validation
{
    public static class RegexPatterns
    {
        // Di động Việt Nam: 0x… / +84x… (x ∈ 3|5|7|8|9), tổng 10 số
        public const string VietnamesePhone = @"^(?:0|\+84)(?:3|5|7|8|9)\d{8}$";
        
        // Mã số thuế Việt Nam: 10 chữ số + 1 dấu gạch + 3 chữ số (XXXXXXXXXX-XXX)
        public const string VietnameseTaxId = @"^\d{10}-\d{3}$";
    }
}
