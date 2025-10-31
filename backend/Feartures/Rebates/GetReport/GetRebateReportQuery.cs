using MediatR;

namespace backend.Feartures.Rebates.GetReport
{
    public sealed class GetRebateReportQuery : IRequest<List<GetRebateReportDto>>
    {
        public long? AgreementId { get; set; } // Optional: filter theo AgreementId
        public string? PeriodFrom { get; set; } // Optional: filter từ Period (YYYY-MM)
        public string? PeriodTo { get; set; } // Optional: filter đến Period (YYYY-MM)
    }

    public sealed class GetRebateReportDto
    {
        public long AgreementId { get; set; }
        public long DealerId { get; set; }
        public string Period { get; set; } = default!;
        
        // Từ v_rebate_period_sales
        public int? OrderCount { get; set; }
        public int? UnitsDelivered { get; set; }
        public decimal? RetailRevenue { get; set; }
        
        // Từ v_rebate_calc
        public int? EffectiveTierQty { get; set; }
        public decimal? RebatePerUnit { get; set; }
        public decimal? CapAmount { get; set; }
        public decimal? GrossRebateAmount { get; set; }
        public decimal? PayableRebateAmount { get; set; }
        
        // Từ Claims
        public decimal? ClaimedAmount { get; set; } // Amount từ Claim (nếu đã tạo)
        public string? ClaimStatus { get; set; } // Status của Claim
        public decimal? TotalSettledAmount { get; set; } // Tổng đã thanh toán từ Settlements
    }
}

