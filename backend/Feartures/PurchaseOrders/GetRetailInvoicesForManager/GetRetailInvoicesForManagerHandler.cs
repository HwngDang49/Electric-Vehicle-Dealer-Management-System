using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.GetRetailInvoicesForManager
{
    public class GetRetailInvoicesForManagerHandler : IRequestHandler<GetRetailInvoicesForManagerQuery, Result<GetRetailInvoicesForManagerResponse>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetRetailInvoicesForManagerHandler(EVDmsDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<GetRetailInvoicesForManagerResponse>> Handle(GetRetailInvoicesForManagerQuery query, CancellationToken ct)
        {
            try
            {
                // Lấy DealerId từ JWT token
                long dealerId;
                try
                {
                    dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
                }
                catch (UnauthorizedAccessException)
                {
                    return Result.Error("Dealer context is required. Only DealerStaff and DealerManager can access this endpoint.");
                }

                var userRole = _httpContextAccessor.HttpContext!.User.GetRole();

                // Lấy tháng và năm hiện tại
                var now = DateTimeHelper.ToVietnamTime(DateTime.UtcNow);
                var targetMonth = now.Month;
                var targetYear = now.Year;

                // Query invoices: Retail, Paid, thuộc dealer, trong tháng hiện tại
                var baseQuery = _dbContext.Invoices
                    .Include(i => i.Payments)
                    .Include(i => i.SalesDoc)
                        .ThenInclude(sd => sd!.OrderItems)
                            .ThenInclude(oi => oi.Product)
                    .Where(i => i.InvoiceType == InvoiceType.Retail.ToString() &&
                                i.DealerId == dealerId &&
                                i.Status == InvoiceStatus.Paid.ToString());

                // DealerManager: lấy tất cả invoices của dealer (không filter branch)
                // DealerStaff: chỉ lấy invoices của branch của mình
                var branchId = _httpContextAccessor.HttpContext!.User.GetBranchId();
                if (branchId.HasValue && userRole != Role.DealerManager.ToString())
                {
                    baseQuery = baseQuery.Where(i => i.BranchId == branchId.Value);
                }

                var invoices = await baseQuery.ToListAsync(ct);

                // Lọc invoices đã Paid trong tháng hiện tại (dựa vào PaidAt từ Payment)
                var paidInvoicesThisMonth = invoices.Where(i =>
                {
                    var latestPaidPayment = i.Payments
                        .Where(p => (p.Status == "Captured" || p.Status == "Paid") && p.PaidAt.HasValue)
                        .OrderByDescending(p => p.PaidAt)
                        .FirstOrDefault();

                    if (latestPaidPayment?.PaidAt == null)
                        return false;

                    var paidAt = DateTimeHelper.ToVietnamTime(latestPaidPayment.PaidAt.Value);
                    return paidAt.Year == targetYear && paidAt.Month == targetMonth;
                }).ToList();

                // Đếm số lượng xe theo tên xe (orderName)
                // Mỗi invoice = 1 xe
                var modelSalesMap = new Dictionary<string, int>();

                foreach (var invoice in paidInvoicesThisMonth)
                {
                    string orderName = "Unknown";

                    // Lấy orderName từ OrderItems (Product.Name)
                    if (invoice.SalesDoc?.OrderItems != null && invoice.SalesDoc.OrderItems.Any())
                    {
                        var firstOrderItem = invoice.SalesDoc.OrderItems.First();
                        orderName = firstOrderItem.Product?.Name ?? "Unknown";
                    }

                    if (!modelSalesMap.ContainsKey(orderName))
                    {
                        modelSalesMap[orderName] = 0;
                    }
                    modelSalesMap[orderName] += 1; // Mỗi invoice = 1 xe
                }

                // Convert map thành list cho pie chart
                var pieChartData = modelSalesMap.Select(kv => new PieChartDataItem
                {
                    Name = kv.Key,
                    Value = kv.Value
                }).ToList();

                var response = new GetRetailInvoicesForManagerResponse
                {
                    PieChartData = pieChartData
                };

                return Result.Success(response);
            }
            catch (Exception ex)
            {
                return Result.Error($"Error fetching retail invoices for manager: {ex.Message}");
            }
        }
    }
}

