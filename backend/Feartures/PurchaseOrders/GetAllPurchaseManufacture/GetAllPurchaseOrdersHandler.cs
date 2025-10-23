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
                var query = _context.PurchaseOrders
                    .Include(po => po.PoItems)
                    .ThenInclude(item => item.Product)
                    .Where(po => po.Status == "Submit" || po.Status == "Confirm")
                    .OrderByDescending(po => po.CreateAt);

                var totalCount = await query.CountAsync(cancellationToken);

                var purchaseOrders = await query
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync(cancellationToken);

                var items = purchaseOrders.Select(po => new PoListItemDto
                {
                    PoId = po.PoId,
                    DealerId = po.DealerId,
                    BranchId = po.BranchId,
                    Status = po.Status,
                    ExpectedDate = po.ExpectedDate?.ToDateTime(TimeOnly.MinValue),
                    TotalAmount = po.TotalAmount,
                    CreateAt = po.CreateAt,
                    UpdateAt = po.UpdateAt,
                    CreateBy = po.CreateBy,
                    SubmittedBy = po.SubmittedBy,
                    ApprovedBy = po.ApprovedBy,
                    ConfirmedBy = po.ConfirmedBy,
                    ItemCount = po.PoItems.Count,
                    TotalQuantity = po.PoItems.Sum(item => item.Qty),
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
