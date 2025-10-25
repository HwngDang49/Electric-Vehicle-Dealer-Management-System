using Ardalis.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using backend.Infrastructure.Data;
using backend.Feartures.PurchaseOrders.GetAllPurchase;
using PagedResult = backend.Common.Paging.PagedResult<backend.Feartures.PurchaseOrders.GetAllPurchase.PoListItemDto>;

namespace backend.Feartures.PurchaseOrders.GetAllPurchase
{
    public class GetAllPurchaseOrdersHandler : IRequestHandler<GetAllPurchaseOrdersQuery, Result<PagedResult>>
    {
        private readonly EVDmsDbContext _context;

        public GetAllPurchaseOrdersHandler(EVDmsDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult>> Handle(GetAllPurchaseOrdersQuery request, CancellationToken cancellationToken)
        {
            try
            {
                // EVM Staff cần thấy PO từ Submit trở đi (Submit, Confirm, InTransit, Delivery, Delivered)
                var query = _context.PurchaseOrders
                    .Include(po => po.PoItems)
                    .ThenInclude(item => item.Product)
                    .Include(po => po.Dealer)
                    .Where(po => po.Status == "Submit" || po.Status == "Confirm" || po.Status == "InTransit" || po.Status == "Delivery" || po.Status == "Delivered")
                    .OrderByDescending(po => po.CreateAt);

                var totalCount = await query.CountAsync(cancellationToken);

                var purchaseOrders = await query
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync(cancellationToken);

                // Lấy danh sách PoId đã có Invoice
                var poIds = purchaseOrders.Select(po => po.PoId).ToList();
                var invoicedPoIds = await _context.Invoices
                    .Where(i => poIds.Contains(i.PoId ?? 0) && i.InvoiceType == "B2B")
                    .Select(i => i.PoId)
                    .ToListAsync(cancellationToken);

                // Lấy thông tin user names
                var userIds = purchaseOrders
                    .SelectMany(po => new[] { po.CreateBy, po.SubmittedBy, po.ApprovedBy, po.ConfirmedBy })
                    .Where(id => id.HasValue)
                    .Select(id => id.Value)
                    .Distinct()
                    .ToList();

                var users = await _context.Users
                    .Where(u => userIds.Contains(u.UserId))
                    .Select(u => new { u.UserId, u.FullName })
                    .ToListAsync(cancellationToken);

                var userDict = users.ToDictionary(u => u.UserId, u => u.FullName);

                var items = purchaseOrders.Select(po => new PoListItemDto
                {
                    PoId = po.PoId,
                    DealerId = po.DealerId,
                    DealerName = po.Dealer?.Name ?? string.Empty,
                    DealerCode = po.Dealer?.Code,
                    BranchId = po.BranchId,
                    Status = po.Status,
                    ExpectedDate = po.ExpectedDate?.ToDateTime(TimeOnly.MinValue),
                    TotalAmount = po.TotalAmount,
                    CreateAt = po.CreateAt,
                    UpdateAt = po.UpdateAt,
                    CreateBy = po.CreateBy,
                    CreateByName = po.CreateBy.HasValue ? userDict.GetValueOrDefault(po.CreateBy.Value) : null,
                    SubmittedBy = po.SubmittedBy,
                    SubmittedByName = po.SubmittedBy.HasValue ? userDict.GetValueOrDefault(po.SubmittedBy.Value) : null,
                    ApprovedBy = po.ApprovedBy,
                    ApprovedByName = po.ApprovedBy.HasValue ? userDict.GetValueOrDefault(po.ApprovedBy.Value) : null,
                    ConfirmedBy = po.ConfirmedBy,
                    ConfirmedByName = po.ConfirmedBy.HasValue ? userDict.GetValueOrDefault(po.ConfirmedBy.Value) : null,
                    ItemCount = po.PoItems.Count,
                    TotalQuantity = po.PoItems.Sum(item => item.Qty),
                    HasInvoice = invoicedPoIds.Contains(po.PoId), // Thêm field này
                    Items = po.PoItems.Select(item => new PoItemDto
                    {
                        PoItemId = item.PoItemId,
                        ProductId = item.ProductId,
                        ProductName = item.Product?.Name,
                        UnitPrice = item.UnitWholesale,
                        Quantity = item.Qty,
                        LineTotal = item.LineTotal ?? 0
                    }).ToList()
                }).ToList();

                // Debug logging
                if (items.Any())
                {
                    var firstItem = items.First();
                    System.Diagnostics.Debug.WriteLine($"First item DealerId: {firstItem.DealerId}");
                    System.Diagnostics.Debug.WriteLine($"First item DealerName: {firstItem.DealerName}");
                    System.Diagnostics.Debug.WriteLine($"First item DealerCode: {firstItem.DealerCode}");
                }

                var pagedResult = PagedResult.Create(
                    items, 
                    request.Page, 
                    request.PageSize, 
                    totalCount
                );

                return Result.Success(pagedResult);
            }
            catch (Exception ex)
            {
                return Result.Error($"Error fetching purchase orders: {ex.Message}");
            }
        }
    }
}
