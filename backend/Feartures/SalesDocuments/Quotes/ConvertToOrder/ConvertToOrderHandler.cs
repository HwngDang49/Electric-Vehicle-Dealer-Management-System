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

        var quote = await _db.SalesDocuments
            .AsNoTracking()
            .Include(sd => sd.SalesDocumentItems)
            .FirstOrDefaultAsync(sd => sd.SalesDocId == request.SalesDocId && sd.DealerId == dealerId, ct);

        if (quote is null)
            throw new NotFoundException($"Quote #{request.SalesDocId} not found.");

        if (quote.Status != QuoteStatus.Finalized.ToString() || !quote.LockedUntil.HasValue || now > quote.LockedUntil.Value)
            throw new BusinessRuleException("Quote must be Finalized and not expired.");

        var quoteItem = quote.SalesDocumentItems.First();

        // Luôn tính toán lại khuyến mãi để kiểm tra
        var recalculatedPromo = await PromotionCalculator.CalculateAsync(_db, quote.DealerId, quoteItem, ct);

        // KỊCH BẢN A: Khuyến mãi không đổi (Happy Path)
        if (recalculatedPromo == quoteItem.LinePromo)
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
        var newTotal = (quoteItem.UnitPrice * quoteItem.Qty) - quoteItem.LineDiscount - recalculatedPromo;
        var summary = new ChangeSummaryDto
        {
            OldTotalAmount = quote.TotalAmount,
            NewLinePromo = recalculatedPromo,
            OldLinePromo = quoteItem.LinePromo,
            NewTotalAmount = newTotal
        };

        return Result.Success(new ConvertToOrderResponse
        {
            RequiresConfirmation = true,
            ChangeSummary = summary
        });
    }

    // Phương thức private helper để tránh lặp code
    private async Task<long> CreateOrderFromQuoteAsync(SalesDocument quote, DateTime createdAt, CancellationToken ct, decimal? newLinePromo = null)
    {
        var quoteItem = quote.SalesDocumentItems.First();
        var order = new SalesDocument
        {
            DocType = DocTypeEnum.Order.ToString(),
            DealerId = quote.DealerId,
            CustomerId = quote.CustomerId,
            PricebookId = quote.PricebookId,
            Status = QuoteStatus.Draft.ToString(),
            CreatedAt = createdAt,
            UpdatedAt = createdAt,
        };

        var orderItem = new SalesDocumentItem
        {
            ProductId = quoteItem.ProductId,
            UnitPrice = quoteItem.UnitPrice,
            Qty = quoteItem.Qty,
            LineDiscount = quoteItem.LineDiscount,
            // Nếu có giá trị mới, dùng giá trị mới. Nếu không, dùng giá trị cũ.
            LinePromo = newLinePromo ?? quoteItem.LinePromo
        };
        order.SalesDocumentItems.Add(orderItem);

        order.TotalAmount = (orderItem.UnitPrice * orderItem.Qty) - orderItem.LineDiscount - orderItem.LinePromo;

        _db.SalesDocuments.Add(order);
        await _db.SaveChangesAsync(ct);
        return order.SalesDocId;
    }
}