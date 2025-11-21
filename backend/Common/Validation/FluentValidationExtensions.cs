using System.Text.RegularExpressions;
using FluentValidation;

namespace backend.Common.Validation
{
    public static class FluentValidationExtensions
    {
        private static readonly Regex VietnamesePhoneRegex =
            new(RegexPatterns.VietnamesePhone, RegexOptions.Compiled | RegexOptions.CultureInvariant);
        
        private static readonly Regex VietnameseTaxIdRegex =
            new(RegexPatterns.VietnameseTaxId, RegexOptions.Compiled | RegexOptions.CultureInvariant);

        /// <summary>
        /// Kiểm tra chuỗi (nếu có) phải là số di động Việt Nam hợp lệ.
        /// Dùng cho field optional. Nếu muốn required, thêm .NotEmpty() ở validator.
        /// </summary>
        public static IRuleBuilderOptions<T, string?> MustBeVietnamesePhoneNumber<T>(
            this IRuleBuilder<T, string?> rule)
        {
            return rule
                .Matches(VietnamesePhoneRegex)
                .WithMessage("'{PropertyName}' is not a valid Vietnamese phone number.");
        }

        /// <summary>
        /// Kiểm tra chuỗi (nếu có) phải là mã số thuế Việt Nam hợp lệ (format: XXXXXXXXXX-XXX).
        /// Dùng cho field optional. Nếu muốn required, thêm .NotEmpty() ở validator.
        /// </summary>
        public static IRuleBuilderOptions<T, string?> MustBeVietnameseTaxId<T>(
            this IRuleBuilder<T, string?> rule)
        {
            return rule
                .Matches(VietnameseTaxIdRegex)
                .WithMessage("'{PropertyName}' phải có định dạng mã số thuế hợp lệ (XXXXXXXXXX-XXX).");
        }
    }
}

