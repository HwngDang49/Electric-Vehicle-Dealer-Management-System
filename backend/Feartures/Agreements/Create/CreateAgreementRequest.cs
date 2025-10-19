using backend.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.Agreements.Create
{
    public class CreateAgreementRequest
    {
        [Required]
        public long DealerId { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Code { get; set; } = default!;
        
        [Required]
        [StringLength(255)]
        public string Title { get; set; } = default!;
        
        [Required]
        public DateOnly StartDate { get; set; }
        
        public DateOnly? EndDate { get; set; }
        
        [StringLength(500)]
        public string? PaymentTerms { get; set; }
        
        public AgreementStatus Status { get; set; } = AgreementStatus.Active;
        
        [Url]
        public string? FileUrl { get; set; }
        
        /// <summary>
        /// Danh sách Rebate rules cho Agreement
        /// </summary>
        public List<CreateRebateRuleRequest> RebateRules { get; set; } = new();
    }

    public class CreateRebateRuleRequest
    {
        [Required]
        [StringLength(20)]
        public string Period { get; set; } = "Monthly"; // Monthly, Quarterly, Yearly
        
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Tier Quantity phải lớn hơn 0")]
        public int TierQty { get; set; }
        
        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Rebate per unit phải >= 0")]
        public decimal RebatePerUnit { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "Cap amount phải >= 0")]
        public decimal? CapAmount { get; set; }
    }
}
