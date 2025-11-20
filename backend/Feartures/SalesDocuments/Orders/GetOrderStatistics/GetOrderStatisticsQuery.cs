using MediatR;

namespace backend.Feartures.SalesDocuments.Orders.GetOrderStatistics;

public sealed class GetOrderStatisticsQuery : IRequest<GetOrderStatisticsResponse>
{
    public string Period { get; set; } = "month"; // "month" or "quarter"
    public int? Year { get; set; }
    public int? Month { get; set; }
    public int? Quarter { get; set; }
}

public sealed class GetOrderStatisticsResponse
{
    public List<DealerOrderStatistic> Statistics { get; set; } = new();
    public string Period { get; set; } = default!;
    public string PeriodLabel { get; set; } = default!;
}

public sealed class DealerOrderStatistic
{
    public long DealerId { get; set; }
    public string DealerName { get; set; } = default!;
    public string DealerCode { get; set; } = default!;
    public string PeriodLabel { get; set; } = default!; // "2024-01" for month, "2024-Q1" for quarter
    public int OrderCount { get; set; }
    public int PurchaseOrderCount { get; set; }
}

