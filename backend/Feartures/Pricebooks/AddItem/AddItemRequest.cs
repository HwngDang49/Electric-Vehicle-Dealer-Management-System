using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.Pricebooks.AddItem
{
    /// <summary>
    /// Request để thêm item vào pricebook đã tồn tại
    /// </summary>
    public class AddItemRequest
    {
        [Required(ErrorMessage = "ProductId không được để trống")]
        public long ProductId { get; set; }
        
        [Required(ErrorMessage = "Giá MSRP không được để trống")]
        [Range(1, 1000000000, ErrorMessage = "Giá MSRP phải từ 1 đến 1,000,000,000")]
        public decimal MsrpPrice { get; set; }
        
        [Required(ErrorMessage = "Giá sàn không được để trống")]
        [Range(1, 1000000000, ErrorMessage = "Giá sàn phải từ 1 đến 1,000,000,000")]
        public decimal FloorPrice { get; set; }
    }
}

