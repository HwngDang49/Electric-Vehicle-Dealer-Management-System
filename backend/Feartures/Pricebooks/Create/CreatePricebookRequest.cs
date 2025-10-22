using backend.Domain.Entities;
using backend.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.Pricebooks.Create
{
    public class CreatePricebookRequest
    {
        /// <summary>
        /// NULL = Global pricebook (áp dụng cho tất cả dealer)
        /// NOT NULL = Per-dealer pricebook (override global cho dealer cụ thể)
        /// </summary>
        public long? DealerId { get; set; }

        [Required(ErrorMessage = "Tên bảng giá không được để trống")]
        [MaxLength(255, ErrorMessage = "Tên bảng giá không được vượt quá 255 ký tự")]
        public string Name { get; set; }
        
        [Required(ErrorMessage = "Ngày bắt đầu không được để trống")]
        public DateOnly EffectiveFrom { get; set; }
        
        /// <summary>
        /// Ngày kết thúc (nullable). Khi qua ngày này, pricebook tự động chuyển sang Expired
        /// </summary>
        public DateOnly? EffectiveTo { get; set; }
        
        public PricebookStatus Status { get; set; } = PricebookStatus.Active;

        [Required]
        public List<PricebookItemUpsertDto> PricebookItems { get; set; } = new();
    }

    public sealed class PricebookItemUpsertDto
    {
        [Required]
        public long ProductId { get; set; }
        
        [Required]
        [Range(1, 1000000000, ErrorMessage = "Giá MSRP phải từ 1 đến 1,000,000,000")]
        public decimal MsrpPrice { get; set; }
        
        /// <summary>
        /// Giá sàn (bắt buộc, phải >= MSRP)
        /// </summary>
        [Required]
        [Range(1, 1000000000, ErrorMessage = "Giá sàn phải từ 1 đến 1,000,000,000")]
        public decimal FloorPrice { get; set; }
    }
}
