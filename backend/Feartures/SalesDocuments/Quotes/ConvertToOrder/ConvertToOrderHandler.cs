using Ardalis.Result;
using backend.Common.Exceptions;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Quotes.ConvertToOrder
{
    public sealed class ConvertToOrderHandler : IRequestHandler<ConvertToOrderCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        public ConvertToOrderHandler(EVDmsDbContext db) => _db = db;

        public async Task<Result<long>> Handle(ConvertToOrderCommand request, CancellationToken ct)
        {
            // Tải quote + items
            var quote = await _db.SalesDocuments
                .Include(sd => sd.SalesDocumentItems)
                .FirstOrDefaultAsync(sd =>
                    sd.SalesDocId == request.SalesDocId &&
                    sd.DealerId == request.DealerId &&
                    sd.DocType == DocTypeEnum.Quote.ToString(), ct);

            if (quote is null)
                throw new NotFoundException($"Quote #{request.SalesDocId} not found.");

            // Chỉ Finalized mới convert
            if (quote.QuoteStatusEnum != QuoteStatus.Finalized)
                throw new BusinessRuleException($"Only Finalized quotes can be converted. Current: {quote.Status}");

            // Hết hạn không được convert
            var now = DateTimeHelper.UtcNow();
            if (quote.LockedUntil.HasValue && now > quote.LockedUntil.Value)
                throw new BusinessRuleException("Quote is expired. Please re-finalize or create a new quote.");

            // Tạo Order mới (KHÔNG đổi status của Quote)
            var order = new SalesDocument
            {
                DocType = DocTypeEnum.Order.ToString(),
                DealerId = quote.DealerId,
                CustomerId = quote.CustomerId,
                PricebookId = quote.PricebookId,
                Status = OrderStatus.Draft.ToString(),                 // hợp lệ cho Order theo CHECK constraint
                CreatedAt = now,
                UpdatedAt = now,
                TotalAmount = quote.SalesDocumentItems.Sum(i => (i.UnitPrice * i.Qty) - i.LineDiscount - i.LinePromo)
            };

            _db.SalesDocuments.Add(order);
            await _db.SaveChangesAsync(ct); // có order.SalesDocId


            // Copy items 1:1 (KHÔNG gộp)
            var orderItems = quote.SalesDocumentItems.Select(i => new SalesDocumentItem
            {
                SalesDocId = order.SalesDocId,
                ProductId = i.ProductId,
                UnitPrice = i.UnitPrice,
                Qty = i.Qty,
                LineDiscount = i.LineDiscount,
                LinePromo = i.LinePromo
            });

            await _db.SalesDocumentItems.AddRangeAsync(orderItems, ct);
            await _db.SaveChangesAsync(ct);

            return Result.Success(order.SalesDocId);
        }
    }
}
