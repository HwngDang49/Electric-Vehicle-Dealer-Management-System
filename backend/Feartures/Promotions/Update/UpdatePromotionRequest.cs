using backend.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.Promotions.Update
{
    /// <summary>
    /// Request để update Promotion (chỉ khi status = Draft)
    /// </summary>
    public class UpdatePromotionRequest
    {
        [Required(ErrorMessage = "Tên promotion không được để trống")]
        [MaxLength(255, ErrorMessage = "Tên promotion không được vượt quá 255 ký tự")]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }

        public long? DealerId { get; set; }

        [Required(ErrorMessage = "FundedBy không được để trống")]
        public FundedBy FundedBy { get; set; }

        [Required(ErrorMessage = "StackingRule không được để trống")]
        public StackingRule StackingRule { get; set; }

        [Required(ErrorMessage = "Số tiền giảm không được để trống")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền giảm phải lớn hơn 0")]
        public decimal AmountOff { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu không được để trống")]
        public DateOnly EffectiveFrom { get; set; }

        public DateOnly? EffectiveTo { get; set; }
    }

    /// <summary>
    /// Request để update status của Promotion
    /// </summary>
    public class UpdatePromotionStatusRequest
    {
        [Required(ErrorMessage = "Status không được để trống")]
        public PromotionStatus Status { get; set; }
    }
}

