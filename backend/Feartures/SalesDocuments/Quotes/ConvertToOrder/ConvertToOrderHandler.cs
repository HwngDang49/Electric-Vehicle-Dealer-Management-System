using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Exceptions;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Feartures.SalesDocuments.Shared; // Dùng PromotionCalculator
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Quotes.ConvertToOrder;

public sealed class ConvertToOrderHandler : IRequestHandler<ConvertToOrderCommand, Result<ConvertToOrderResponse>>
{
    private readonly EVDmsDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;
    public ConvertToOrderHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<ConvertToOrderResponse>> Handle(ConvertToOrderCommand request, CancellationToken ct)
    {
        var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
        var now = DateTime.UtcNow;

        var quote = await _db.Quotes
            .AsNoTracking()
            .Include(q => q.QuoteItems)
            .FirstOrDefaultAsync(q => q.QuoteId == request.QuoteId && q.DealerId == dealerId, ct);

        if (quote is null)
            throw new NotFoundException($"Quote #{request.QuoteId} not found.");

        if (quote.Status != QuoteStatus.Finalized.ToString() || !quote.LockedUntil.HasValue || now > quote.LockedUntil.Value)
            throw new BusinessRuleException("Quote must be Finalized and not expired.");

        var quoteItem = quote.QuoteItems.First();

        // Luôn tính toán lại khuyến mãi để kiểm tra
        var recalculatedPromo = await PromotionCalculator.CalculateAsync(_db, dealerId, quoteItem, ct);

        // KỊCH BẢN A: Khuyến mãi không đổi (Happy Path)
        if (recalculatedPromo == (quoteItem.LinePromo ?? 0))
        {
            var orderId = await CreateOrderFromQuoteAsync(quote, now, ct);
            return Result.Success(new ConvertToOrderResponse { OrderId = orderId });
        }

        // KỊCH BẢN B: Khuyến mãi đã thay đổi (Critical Path)
        // B1: Người dùng đã xem và xác nhận thay đổi
        if (request.ConfirmChanges)
        {
            var orderId = await CreateOrderFromQuoteAsync(quote, now, ct, recalculatedPromo);
            return Result.Success(new ConvertToOrderResponse { OrderId = orderId });
        }

        // B2: Đây là lần đầu, trả về bản xem trước cho UI
        var newTotal = (quoteItem.UnitPrice * quoteItem.Qty) - (quoteItem.OemDiscountApplied ?? 0) - recalculatedPromo;
        var summary = new ChangeSummaryDto
        {
            OldTotalAmount = quote.TotalAmount,
            NewLinePromo = recalculatedPromo,
            OldLinePromo = quoteItem.LinePromo ?? 0,
            NewTotalAmount = newTotal
        };

        return Result.Success(new ConvertToOrderResponse
        {
            RequiresConfirmation = true,
            ChangeSummary = summary
        });
    }

    // Phương thức private helper để tránh lặp code
    private async Task<long> CreateOrderFromQuoteAsync(Quote quote, DateTime createdAt, CancellationToken ct, decimal? newLinePromo = null)
    {
        var quoteItem = quote.QuoteItems.First();
        var order = new Order
        {
            DealerId = quote.DealerId,
            QuoteId = quote.QuoteId,
            CustomerId = quote.CustomerId,
            PricebookId = quote.PricebookId,
            Status = OrderStatus.Draft.ToString(),
            CreatedAt = createdAt,
            UpdatedAt = createdAt,
        };

        var orderItem = new OrderItem
        {
            ProductId = quoteItem.ProductId,
            UnitPrice = quoteItem.UnitPrice,
            Qty = quoteItem.Qty,
            OemDiscountApplied = quoteItem.OemDiscountApplied,
            // Nếu có giá trị mới, dùng giá trị mới. Nếu không, dùng giá trị cũ.
            LinePromo = newLinePromo ?? quoteItem.LinePromo
        };
        order.OrderItems.Add(orderItem);

        order.TotalAmount = (orderItem.UnitPrice * orderItem.Qty) - (orderItem.OemDiscountApplied ?? 0) - (orderItem.LinePromo ?? 0);

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);
        return order.OrderId;
    }
}