using System;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Admin.GetDashboardStatistics;

public sealed class GetDashboardStatisticsHandler : IRequestHandler<GetDashboardStatisticsQuery, GetDashboardStatisticsResponse>
{
    private readonly EVDmsDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetDashboardStatisticsHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<GetDashboardStatisticsResponse> Handle(GetDashboardStatisticsQuery request, CancellationToken ct)
    {
        var userRole = _httpContextAccessor.HttpContext!.User.GetRole();

        // Chỉ Admin mới có thể xem thống kê
        if (userRole != Role.Admin.ToString())
        {
            throw new UnauthorizedAccessException("Chỉ Admin mới có thể xem thống kê dashboard");
        }

        // Đếm số dealer đang hoạt động (Status = Live)
        var activeDealersCount = await _db.Dealers
            .AsNoTracking()
            .Where(d => d.Status == DealerStatus.Live.ToString())
            .CountAsync(ct);

        // Đếm số branch đang hoạt động (Status = Active)
        var activeBranchesCount = await _db.Branches
            .AsNoTracking()
            .Where(b => b.Status == BranchStatus.Active.ToString())
            .CountAsync(ct);

        // Đếm tổng số user
        var totalUsersCount = await _db.Users
            .AsNoTracking()
            .CountAsync(ct);

        // Đếm số sản phẩm đang hoạt động (Status = Active)
        var activeProductsCount = await _db.Products
            .AsNoTracking()
            .Where(p => p.Status == ProductStatus.Active.ToString())
            .CountAsync(ct);

        return new GetDashboardStatisticsResponse
        {
            ActiveDealersCount = activeDealersCount,
            ActiveBranchesCount = activeBranchesCount,
            TotalUsersCount = totalUsersCount,
            ActiveProductsCount = activeProductsCount
        };
    }
}

