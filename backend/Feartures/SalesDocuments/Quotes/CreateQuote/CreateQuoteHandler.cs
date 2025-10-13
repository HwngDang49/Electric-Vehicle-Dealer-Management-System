using Ardalis.Result;
using AutoMapper;
using backend.Common.Exceptions;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Quotes.CreateQuote
{
    public sealed class CreateQuoteHandler : IRequestHandler<CreateQuoteCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public CreateQuoteHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<long>> Handle(CreateQuoteCommand cmd, CancellationToken ct)
        {
            // Guard phòng thủ (đã có validator nhưng tránh bypass)
            if (cmd.Items is null || cmd.Items.Count != 1)
                throw new BusinessRuleException("A Quote must contain exactly 1 item.");

            // 1) Dealer tồn tại?
            var dealerExists = await _db.Dealers.AnyAsync(d => d.DealerId == cmd.DealerId, ct);
            if (!dealerExists) return Result.Error("Dealer not found.");

            // 2) Customer thuộc dealer?
            var customerOk = await _db.Customers
                .AnyAsync(c => c.CustomerId == cmd.CustomerId && c.DealerId == cmd.DealerId, ct);
            if (!customerOk) return Result.Error("Customer does not belong to dealer.");

            // 3) Pricebook (nếu có) phải thuộc dealer
            if (cmd.PricebookId.HasValue)
            {
                var pricebookOk = await _db.Pricebooks
                    .AnyAsync(p => p.PricebookId == cmd.PricebookId.Value && p.DealerId == cmd.DealerId, ct);
                if (!pricebookOk) return Result.Error("Pricebook not found for this dealer.");
            }

            // 4) Kiểm tra product tồn tại
            var productIds = cmd.Items.Select(i => i.ProductId).Distinct().ToList();
            var existCount = await _db.Products.CountAsync(p => productIds.Contains(p.ProductId), ct);
            if (existCount != productIds.Count)
                return Result.Error("Some products do not exist.");

            // 5) Map header
            var now = DateTimeHelper.UtcNow();
            var entity = _mapper.Map<SalesDocument>(cmd);
            entity.DocTypeEnum = DocTypeEnum.Quote;
            entity.QuoteStatusEnum = QuoteStatus.Draft;
            entity.CreatedAt = entity.UpdatedAt = now;

            // 6) Map 1 item bằng AutoMapper (profile đã cấu hình)
            //    LƯU Ý: Profile đã .Ignore(SdiId, SalesDocId, LineTotal)
            entity.SalesDocumentItems = _mapper.Map<List<SalesDocumentItem>>(cmd.Items);

            // 7) Tính total_amount từ input (LineTotal là computed column)
            entity.TotalAmount = cmd.Items.Sum(i => (i.UnitPrice * i.Qty) - i.LineDiscount - i.LinePromo);

            _db.SalesDocuments.Add(entity);
            await _db.SaveChangesAsync(ct);

            return Result.Success(entity.SalesDocId);
        }
    }
}
