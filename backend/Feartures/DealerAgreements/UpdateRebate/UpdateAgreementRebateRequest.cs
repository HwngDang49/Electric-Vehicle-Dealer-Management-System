using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.DealerAgreements.UpdateRebate
{
    public class UpdateAgreementRebateRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng tier phải lớn hơn 0")]
        public int? TierQty { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Rebate per unit phải >= 0")]
        public decimal? RebatePerUnit { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Cap amount phải >= 0")]
        public decimal? CapAmount { get; set; }
    }
}

