using System.ComponentModel.DataAnnotations;

namespace backend.Feartures.DealerAgreements.Create
{
    public class CreateDealerAgreementRequest
    {
        [Required(ErrorMessage = "DealerId is required")]
        public long DealerId { get; set; }

        [Required(ErrorMessage = "Code is required")]
        [MaxLength(50, ErrorMessage = "Code cannot exceed 50 characters")]
        public string Code { get; set; } = default!;

        [Required(ErrorMessage = "Title is required")]
        [MaxLength(255, ErrorMessage = "Title cannot exceed 255 characters")]
        public string Title { get; set; } = default!;

        [Required(ErrorMessage = "StartDate is required")]
        public DateOnly StartDate { get; set; }

        public DateOnly? EndDate { get; set; }

        [MaxLength(100, ErrorMessage = "PaymentTerms cannot exceed 100 characters")]
        public string? PaymentTerms { get; set; }

        public string? FileUrl { get; set; }
    }
}

