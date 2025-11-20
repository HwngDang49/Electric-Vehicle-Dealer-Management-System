using MediatR;

namespace backend.Feartures.SalesDocuments.Orders.GetVehicleSalesStatistics;

public sealed class GetVehicleSalesStatisticsQuery : IRequest<GetVehicleSalesStatisticsResponse>
{
    // Không cần filter, chỉ lấy dữ liệu tháng hiện tại
}

public sealed class GetVehicleSalesStatisticsResponse
{
    public List<VehicleSalesStatistic> Statistics { get; set; } = new();
    public string Period { get; set; } = default!;
    public string PeriodLabel { get; set; } = default!;
}

public sealed class VehicleSalesStatistic
{
    public long ProductId { get; set; }
    public string ProductName { get; set; } = default!;
    public string? ModelCode { get; set; }
    public int TotalQuantity { get; set; }
    public decimal Percentage { get; set; }
}

