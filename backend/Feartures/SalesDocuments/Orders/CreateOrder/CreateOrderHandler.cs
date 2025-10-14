using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.CreateOrder
{
    public sealed class CreateOrderHandler : IRequestHandler<CreateOrderCommand, Result<CreateOrderResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        // Bỏ IMapper vì bạn không dùng nó trong code mẫu
        public CreateOrderHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<CreateOrderResponse>> Handle(CreateOrderCommand request, CancellationToken ct)
        {
            request.DealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            var customerExists = await _db.Customers.AnyAsync(c => c.CustomerId == request.CustomerId && c.DealerId == request.DealerId, ct);
            if (!customerExists)
                return Result.NotFound($"Customer with ID {request.CustomerId} not found for this dealer.");

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var pricebookEntry = await _db.Pricebooks
                .AsNoTracking()
                .Where(p => (p.DealerId == request.DealerId || p.DealerId == null) &&
                             p.ProductId == request.ProductId &&
                             p.Status == "Active" &&
                             p.EffectiveFrom <= today &&
                             (p.EffectiveTo == null || p.EffectiveTo >= today)) // Thêm check EffectiveTo cho chắc chắn
                .OrderByDescending(p => p.EffectiveFrom).ThenByDescending(p => p.DealerId)
                .Select(p => new { p.PricebookId, p.MsrpPrice })
                .FirstOrDefaultAsync(ct);

            if (pricebookEntry is null || pricebookEntry.MsrpPrice <= 0)
                return Result.Error($"Product with ID {request.ProductId} is invalid or has no active price.");

            // Khởi tạo Order và Item
            var now = DateTime.UtcNow;
            var newOrder = new SalesDocument
            {
                DealerId = request.DealerId,
                CustomerId = request.CustomerId,
                DocType = "Order",
                Status = "Draft",
                CreatedAt = now,
                UpdatedAt = now,
                PricebookId = pricebookEntry.PricebookId
            };

            var newItem = new SalesDocumentItem
            {
                ProductId = request.ProductId,
                Qty = request.Quantity,
                UnitPrice = pricebookEntry.MsrpPrice
            };
            newOrder.SalesDocumentItems.Add(newItem);

            newItem.LinePromo = await PromotionCalculator.CalculateAsync(_db, newOrder.DealerId, newItem, ct);

            // Tính toán tổng tiền cuối cùng
            newOrder.TotalAmount = (newItem.UnitPrice * newItem.Qty) - newItem.LinePromo;

            _db.SalesDocuments.Add(newOrder);
            await _db.SaveChangesAsync(ct);

            var response = new CreateOrderResponse
            {
                OrderId = newOrder.SalesDocId,
                Status = newOrder.Status,
                CreatedAt = newOrder.CreatedAt
            };

            return Result.Success(response);
        }
    }
}