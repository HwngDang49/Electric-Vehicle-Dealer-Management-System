using backend.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.Pricebooks.Update
{
    /// <summary>
    /// Request để update tên Pricebook
    /// </summary>
    public class UpdatePricebookNameRequest
    {
        [Required(ErrorMessage = "Tên bảng giá không được để trống")]
        [MaxLength(255, ErrorMessage = "Tên bảng giá không được vượt quá 255 ký tự")]
        public string Name { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request để update status Pricebook
    /// </summary>
    public class UpdatePricebookStatusRequest
    {
        [Required(ErrorMessage = "Trạng thái không được để trống")]
        public PricebookStatus Status { get; set; }
    }
}
