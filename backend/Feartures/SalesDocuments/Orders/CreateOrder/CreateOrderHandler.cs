using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Feartures.SalesDocuments.Shared;
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
            var pricebookEntry = await _db.PricebookItems
                .AsNoTracking()
                .Include(pbi => pbi.Pricebook)
                .Where(pbi => pbi.ProductId == request.ProductId &&
                             pbi.Pricebook.Status == PriceBooks.Active.ToString() &&
                             pbi.Pricebook.EffectiveFrom <= today &&
                             (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= today))
                .OrderByDescending(pbi => pbi.Pricebook.EffectiveFrom)
                .Select(pbi => new { pbi.PricebookId, pbi.MsrpPrice, pbi.OemDiscountAmount })
                .FirstOrDefaultAsync(ct);

            if (pricebookEntry is null || pricebookEntry.MsrpPrice <= 0)
                return Result.Error($"Product with ID {request.ProductId} is invalid or has no active price.");

            // Khởi tạo Order và Item
            var now = DateTime.UtcNow;
            var newOrder = new Order
            {
                DealerId = request.DealerId,
                CustomerId = request.CustomerId,
                Status = OrderStatus.Draft.ToString(),
                CreatedAt = now,
                UpdatedAt = now,
                PricebookId = pricebookEntry.PricebookId
            };

            var newItem = new OrderItem
            {
                ProductId = request.ProductId,
                Qty = request.Quantity,
                UnitPrice = pricebookEntry.MsrpPrice,
                OemDiscountApplied = pricebookEntry.OemDiscountAmount ?? 0
            };
            newOrder.OrderItems.Add(newItem);

            // Tính khuyến mãi
            newItem.LinePromo = await PromotionCalculator.CalculateAsync(_db, request.DealerId, newItem, ct);

            // Tính toán tổng tiền cuối cùng
            newOrder.TotalAmount = (newItem.UnitPrice * newItem.Qty) - (newItem.LinePromo ?? 0);

            _db.Orders.Add(newOrder);
            await _db.SaveChangesAsync(ct);

            var response = new CreateOrderResponse
            {
                OrderId = newOrder.OrderId,
                Status = newOrder.Status,
                CreatedAt = newOrder.CreatedAt
            };

            return Result.Success(response);
        }
    }
}