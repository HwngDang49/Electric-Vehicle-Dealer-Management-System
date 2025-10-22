using backend.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.Pricebooks.Update
{
    /// <summary>
    /// Request để update toàn bộ Pricebook
    /// </summary>
    public class UpdatePricebookFullRequest
    {
        [Required(ErrorMessage = "Tên bảng giá không được để trống")]
        [MaxLength(255, ErrorMessage = "Tên bảng giá không được vượt quá 255 ký tự")]
        public string Name { get; set; } = string.Empty;

        public long? DealerId { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu không được để trống")]
        public DateOnly EffectiveFrom { get; set; }

        public DateOnly? EffectiveTo { get; set; }

        [Required(ErrorMessage = "Trạng thái không được để trống")]
        public PricebookStatus Status { get; set; }
    }

    /// <summary>
    /// Request để update status Pricebook (quick action)
    /// </summary>
    public class UpdatePricebookStatusRequest
    {
        [Required(ErrorMessage = "Trạng thái không được để trống")]
        public PricebookStatus Status { get; set; }
    }
}
