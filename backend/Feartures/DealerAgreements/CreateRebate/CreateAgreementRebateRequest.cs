using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.DealerAgreements.CreateRebate
{
    public class CreateAgreementRebateRequest
    {
        [Required(ErrorMessage = "Kỳ rebate không được để trống")]
        [MaxLength(20, ErrorMessage = "Kỳ rebate không được vượt quá 20 ký tự")]
        public string Period { get; set; } = null!;

        [Required(ErrorMessage = "Số lượng tier không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng tier phải lớn hơn 0")]
        public int TierQty { get; set; }

        [Required(ErrorMessage = "Rebate per unit không được để trống")]
        [Range(0, double.MaxValue, ErrorMessage = "Rebate per unit phải >= 0")]
        public decimal RebatePerUnit { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Cap amount phải >= 0")]
        public decimal? CapAmount { get; set; }
    }
}

