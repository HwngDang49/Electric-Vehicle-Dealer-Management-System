using System;
using System.Collections.Generic;

namespace backend.Domain.Entities;

public partial class DealerAgreement
{
    public long AgreementId { get; set; }

    public long DealerId { get; set; }

    public string Code { get; set; } = null!;

    public string Title { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string? PaymentTerms { get; set; }

    public string Status { get; set; } = null!;

    public string? FileUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<AgreementRebate> AgreementRebates { get; set; } = new List<AgreementRebate>();

    public virtual Dealer Dealer { get; set; } = null!;
}
