using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Exceptions;
using backend.Common.Services;
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
    private readonly StatusValidationService _statusValidationService;

    public CreateQuoteHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor, StatusValidationService statusValidationService)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
        _statusValidationService = statusValidationService;
    }

    public async Task<Result<long>> Handle(CreateQuoteCommand cmd, CancellationToken ct)
    {
        var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
        var userId = _httpContextAccessor.HttpContext!.User.GetUserId();
        var branchId = _httpContextAccessor.HttpContext!.User.GetBranchId();

        // ✅ Validate Dealer status for retail operations
        var dealerValidation = await _statusValidationService.ValidateDealerForRetail(dealerId, ct);
        if (!dealerValidation.IsSuccess)
            return dealerValidation;

        // ✅ Validate Branch status if user has branch (DealerStaff/DealerManager)
        User? user = null;
        if (userId.HasValue)
        {
            user = await _db.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == userId.Value, ct);

            if (user != null && user.BranchId.HasValue)
            {
                var branchValidation = await _statusValidationService.ValidateBranchForRetail(user.BranchId.Value, ct);
                if (!branchValidation.IsSuccess)
                    return branchValidation;
            }
        }

        if (cmd.Items is null || cmd.Items.Count != 1)
            throw new BusinessRuleException("Một Báo giá phải chứa đúng 1 sản phẩm.");

        var quoteItemRequest = cmd.Items.First();

        // 1. Guard: Kiểm tra Customer và Product
        var customerOk = await _db.Customers.AnyAsync(c => c.CustomerId == cmd.CustomerId && c.DealerId == dealerId, ct);
        if (!customerOk) return Result.Error("Khách hàng không thuộc đại lý này.");

        var product = await _db.Products.FirstOrDefaultAsync(p => p.ProductId == quoteItemRequest.ProductId, ct);
        if (product == null) return Result.Error("Sản phẩm không tồn tại.");

        if (product.Status != "Active")
            return Result.Error($"Sản phẩm '{product.Name}' hiện đang ở trạng thái '{product.Status}' và không thể tạo báo giá. Chỉ sản phẩm 'Active' mới có thể được bán.");

        // 2. TỰ ĐỘNG TÌM GIÁ: Tìm bảng giá hợp lệ nhất
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var pricebookEntry = await _db.PricebookItems
            .AsNoTracking()
            .Include(pbi => pbi.Pricebook) //lấy ra được dgì rồi? lấy ra được cái pricebook liên quan đến pricebook item/ gồm dealer id, status, effectivefrom, effectiveto
            .Where(pbi => pbi.ProductId == quoteItemRequest.ProductId &&
                         pbi.Pricebook.Status == PriceBooks.Active.ToString() &&
                         pbi.Pricebook.EffectiveFrom <= today &&
                         (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= today) &&
                         pbi.Pricebook.DealerId == dealerId || pbi.Pricebook.DealerId == null)
            .OrderByDescending(pbi => pbi.Pricebook.DealerId.HasValue)
            .ThenByDescending(pdi => pdi.Pricebook.EffectiveFrom)
            .Select(pbi => new { pbi.PricebookId, pbi.MsrpPrice })
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
            BranchId = user?.BranchId ?? branchId,
            CreatedAt = now,
            UpdatedAt = now,
            PricebookId = pricebookEntry.PricebookId,
            SubtotalAmount = pricebookEntry.MsrpPrice * quoteItemRequest.Qty,
        };

        var newItem = new QuoteItem
        {
            ProductId = quoteItemRequest.ProductId,
            Qty = quoteItemRequest.Qty,
            UnitPrice = pricebookEntry.MsrpPrice, // Lấy giá từ Pricebook
            LinePromo = 0
        };
        newQuote.QuoteItems.Add(newItem);

        //TỰ ĐỘNG TÍNH KHUYẾN MÃI
        newItem.LinePromo = await PromotionCalculator.CalculateAsync(_db, dealerId, newItem, ct);
        // LineTotal = (UnitPrice * Qty) - LinePromo
        newQuote.PromotionAmount = newItem.LinePromo;
        newQuote.TotalAmount = (newItem.UnitPrice * newItem.Qty) - newItem.LinePromo;

        // 7. Lưu vào DB
        _db.Quotes.Add(newQuote);
        await _db.SaveChangesAsync(ct);

        return Result.Success(newQuote.QuoteId);
    }
}