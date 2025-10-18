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
        var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
        var userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        if (cmd.Items is null || cmd.Items.Count != 1)
            throw new BusinessRuleException("Một Báo giá phải chứa đúng 1 sản phẩm.");

        var quoteItemRequest = cmd.Items.First();

        // 1. Guard: Kiểm tra Customer và Product
        var customerOk = await _db.Customers.AnyAsync(c => c.CustomerId == cmd.CustomerId && c.DealerId == dealerId, ct);
        if (!customerOk) return Result.Error("Khách hàng không thuộc đại lý này.");

        var productExists = await _db.Products.AnyAsync(p => p.ProductId == quoteItemRequest.ProductId, ct);
        if (!productExists) return Result.Error("Sản phẩm không tồn tại.");

        // 2. TỰ ĐỘNG TÌM GIÁ: Tìm bảng giá hợp lệ nhất
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var pricebookEntry = await _db.PricebookItems
            .AsNoTracking()
            .Include(pbi => pbi.Pricebook)
            .Where(pbi => pbi.ProductId == quoteItemRequest.ProductId &&
                         pbi.Pricebook.Status == PriceBooks.Active.ToString() &&
                         pbi.Pricebook.EffectiveFrom <= today &&
                         (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= today))
            .OrderByDescending(pbi => pbi.Pricebook.EffectiveFrom)
            .Select(pbi => new { pbi.PricebookId, pbi.MsrpPrice, pbi.OemDiscountAmount })
            .FirstOrDefaultAsync(ct);

        if (pricebookEntry is null || pricebookEntry.MsrpPrice <= 0)
            return Result.Error($"Sản phẩm không có giá bán hợp lệ tại thời điểm này.");

        // 3. Khởi tạo Báo giá và Item
        var now = DateTime.UtcNow;
        var newQuote = new Quote
        {
            DealerId = dealerId,
            CustomerId = cmd.CustomerId,
            Status = QuoteStatus.Draft.ToString(),
            CreatedBy = userId,
            CreatedAt = now,
            UpdatedAt = now,
            PricebookId = pricebookEntry.PricebookId
        };

        var newItem = new QuoteItem
        {
            ProductId = quoteItemRequest.ProductId,
            Qty = quoteItemRequest.Qty,
            UnitPrice = pricebookEntry.MsrpPrice, // Lấy giá từ Pricebook
            OemDiscountApplied = pricebookEntry.OemDiscountAmount ?? 0
        };
        newQuote.QuoteItems.Add(newItem);

        // 4. TỰ ĐỘNG TÍNH KHUYẾN MÃI
        newItem.LinePromo = await PromotionCalculator.CalculateAsync(_db, dealerId, newItem, ct);

        // 5. Tính tổng tiền cuối cùng
        newQuote.TotalAmount = (newItem.UnitPrice * newItem.Qty) - (newItem.OemDiscountApplied ?? 0) - (newItem.LinePromo ?? 0);

        // 6. Lưu vào DB
        _db.Quotes.Add(newQuote);
        await _db.SaveChangesAsync(ct);

        return Result.Success(newQuote.QuoteId);
    }
}