using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Exceptions;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Feartures.SalesDocuments.Shared; // Dùng PromotionCalculator
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Quotes.CreateQuote;

public sealed class CreateQuoteHandler : IRequestHandler<CreateQuoteCommand, Result<long>>
{
    private readonly EVDmsDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CreateQuoteHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<long>> Handle(CreateQuoteCommand cmd, CancellationToken ct)
    {
        cmd.DealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

        if (cmd.Items is null || cmd.Items.Count != 1)
            throw new BusinessRuleException("Một Báo giá phải chứa đúng 1 sản phẩm.");

        var quoteItemRequest = cmd.Items.First();

        // 1. Guard: Kiểm tra Customer và Product
        var customerOk = await _db.Customers.AnyAsync(c => c.CustomerId == cmd.CustomerId && c.DealerId == cmd.DealerId, ct);
        if (!customerOk) return Result.Error("Khách hàng không thuộc đại lý này.");

        var productExists = await _db.Products.AnyAsync(p => p.ProductId == quoteItemRequest.ProductId, ct);
        if (!productExists) return Result.Error("Sản phẩm không tồn tại.");

        // 2. TỰ ĐỘNG TÌM GIÁ: Tìm bảng giá hợp lệ nhất
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var pricebookEntry = await _db.Pricebooks
            .AsNoTracking()
            .Where(p => (p.DealerId == cmd.DealerId || p.DealerId == null) &&
                         p.ProductId == quoteItemRequest.ProductId &&
                         p.Status == PriceBooks.Active.ToString() &&
                         p.EffectiveFrom <= today &&
                         (p.EffectiveTo == null || p.EffectiveTo >= today))
            .OrderByDescending(p => p.EffectiveFrom).ThenByDescending(p => p.DealerId) // Ưu tiên dealer > global
            .Select(p => new { p.PricebookId, p.MsrpPrice })
            .FirstOrDefaultAsync(ct);

        if (pricebookEntry is null || pricebookEntry.MsrpPrice <= 0)
            return Result.Error($"Sản phẩm không có giá bán hợp lệ tại thời điểm này.");

        // 3. Khởi tạo Báo giá và Item
        var now = DateTime.UtcNow;
        var newQuote = new SalesDocument
        {
            DealerId = cmd.DealerId,
            CustomerId = cmd.CustomerId,
            DocType = DocTypeEnum.Quote.ToString(),
            Status = QuoteStatus.Draft.ToString(),
            CreatedAt = now,
            UpdatedAt = now,
            PricebookId = pricebookEntry.PricebookId
        };

        var newItem = new SalesDocumentItem
        {
            ProductId = quoteItemRequest.ProductId,
            Qty = quoteItemRequest.Qty,
            UnitPrice = pricebookEntry.MsrpPrice, // Lấy giá từ Pricebook
            LineDiscount = 0m // Chiết khấu mặc định là 0
        };
        newQuote.SalesDocumentItems.Add(newItem);

        // 4. TỰ ĐỘNG TÍNH KHUYẾN MÃI
        newItem.LinePromo = await PromotionCalculator.CalculateAsync(_db, newQuote.DealerId, newItem, ct);

        // 5. Tính tổng tiền cuối cùng
        newQuote.TotalAmount = (newItem.UnitPrice * newItem.Qty) - newItem.LineDiscount - newItem.LinePromo;

        // 6. Lưu vào DB
        _db.SalesDocuments.Add(newQuote);
        await _db.SaveChangesAsync(ct);

        return Result.Success(newQuote.SalesDocId);
    }
}