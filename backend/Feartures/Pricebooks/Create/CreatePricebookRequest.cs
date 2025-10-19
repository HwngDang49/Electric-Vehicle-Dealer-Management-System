using backend.Domain.Entities;
using backend.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.Pricebooks.Create
{
    public class CreatePricebookRequest
    {
        [Required]
        public string Name { get; set; }
        
        [Required]
        public DateTime Effective_To { get; set; }
        
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
        /// Giá sàn (có thể để trống)
        /// </summary>
        [Range(1, 1000000000, ErrorMessage = "Giá sàn phải từ 1 đến 1,000,000,000")]
        public decimal? FloorPrice { get; set; }
        
        /// <summary>
        /// Số tiền giảm giá OEM (có thể để trống, null = không giảm giá)
        /// </summary>
        [Range(0, 1000000000, ErrorMessage = "Số tiền giảm giá phải từ 0 đến 1,000,000,000")]
        public decimal? OemDiscountAmount { get; set; }
        
        /// <summary>
        /// Phần trăm giảm giá OEM (có thể để trống, null = không giảm giá)
        /// </summary>
        [Range(0, 100, ErrorMessage = "Phần trăm giảm giá phải từ 0 đến 100")]
        public decimal? OemDiscountPercent { get; set; } = null;
    }
}
