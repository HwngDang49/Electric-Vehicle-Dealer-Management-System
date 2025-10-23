using Ardalis.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using backend.Infrastructure.Data;

namespace backend.Feartures.PurchaseOrders.GetAllPurchaseOrders
{
    public class GetAllPurchaseOrdersHandler : IRequestHandler<GetAllPurchaseOrdersQuery, Result<List<PoListItemDto>>>
    {
        private readonly EVDmsDbContext _context;

        public GetAllPurchaseOrdersHandler(EVDmsDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<PoListItemDto>>> Handle(GetAllPurchaseOrdersQuery request, CancellationToken cancellationToken)
        {
            var purchaseOrders = await _context.PurchaseOrders
                .Include(po => po.PoItems)
                    .ThenInclude(item => item.Product)
                .OrderByDescending(po => po.CreateAt)
                .ToListAsync(cancellationToken);

            var result = purchaseOrders.Select(po => new PoListItemDto
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

            return Result.Success(result);
        }
    }
}
