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
            var orderIds = await CreateMultipleOrdersFromQuoteAsync(quote, now, ct);
            return Result.Success(new ConvertToOrderResponse 
            { 
                OrderIds = orderIds,
                OrderId = orderIds.FirstOrDefault() // Backward compatibility
            });
        }

        // KỊCH BẢN B: Khuyến mãi đã thay đổi (Critical Path)
        // B1: Người dùng đã xem và xác nhận thay đổi
        if (request.ConfirmChanges)
        {
            var orderIds = await CreateMultipleOrdersFromQuoteAsync(quote, now, ct, recalculatedPromo);
            return Result.Success(new ConvertToOrderResponse 
            { 
                OrderIds = orderIds,
                OrderId = orderIds.FirstOrDefault() // Backward compatibility
            });
        }

        // B2: Đây là lần đầu, trả về bản xem trước cho UI
        // TotalAmount phải khớp với LineTotal của OrderItem
        var newTotal = (quoteItem.UnitPrice - (quoteItem.OemDiscountApplied ?? 0)) * quoteItem.Qty;
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

    // Phương thức private helper để tạo multiple orders dựa trên quantity
    private async Task<List<long>> CreateMultipleOrdersFromQuoteAsync(Quote quote, DateTime createdAt, CancellationToken ct, decimal? newLinePromo = null)
    {
        var quoteItem = quote.QuoteItems.First();
        var orderIds = new List<long>();

        // Tạo một order riêng cho mỗi quantity
        for (int i = 0; i < quoteItem.Qty; i++)
        {
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
                Qty = 1, // Mỗi order chỉ có 1 quantity
                OemDiscountApplied = quoteItem.OemDiscountApplied,
                // Nếu có giá trị mới, dùng giá trị mới. Nếu không, dùng giá trị cũ.
                LinePromo = newLinePromo ?? quoteItem.LinePromo
            };
            order.OrderItems.Add(orderItem);

            // TotalAmount phải khớp với LineTotal của OrderItem
            // LineTotal = (UnitPrice - OemDiscountApplied) * Qty
            order.TotalAmount = (orderItem.UnitPrice - (orderItem.OemDiscountApplied ?? 0)) * orderItem.Qty;

            _db.Orders.Add(order);
            orderIds.Add(order.OrderId);
        }

        await _db.SaveChangesAsync(ct);
        return orderIds;
    }
}