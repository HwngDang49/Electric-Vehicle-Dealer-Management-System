using MediatR;

namespace backend.Feartures.Admin.GetDashboardStatistics;

public sealed class GetDashboardStatisticsQuery : IRequest<GetDashboardStatisticsResponse>
{
}

public sealed class GetDashboardStatisticsResponse
{
    public int ActiveDealersCount { get; set; }
    public int ActiveBranchesCount { get; set; }
    public int TotalUsersCount { get; set; }
    public int ActiveProductsCount { get; set; }
}

