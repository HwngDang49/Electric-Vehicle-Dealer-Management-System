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
        // ✅ Lấy BranchId và UserId từ JWT token
        var branchId = _httpContextAccessor.HttpContext!.User.GetBranchId();
        var userId = _httpContextAccessor.HttpContext!.User.GetUserId();
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

        // Kiểm tra product status hiện tại
        var product = await _db.Products.FirstOrDefaultAsync(p => p.ProductId == quoteItem.ProductId, ct);
        if (product == null)
            throw new BusinessRuleException("Sản phẩm trong quote không tồn tại.");

        if (product.Status != "Active")
            throw new BusinessRuleException($"Sản phẩm '{product.Name}' hiện đang ở trạng thái '{product.Status}' và không thể chuyển đổi thành đơn hàng. Chỉ sản phẩm 'Active' mới có thể được bán.");

        // Luôn tính toán lại khuyến mãi để kiểm tra
        var recalculatedPromo = await PromotionCalculator.CalculateAsync(_db, dealerId, quoteItem, ct);

        // KỊCH BẢN A: Khuyến mãi không đổi (Happy Path)
        if (recalculatedPromo == quoteItem.LinePromo)
        {
            var orderIds = await CreateMultipleOrdersFromQuoteAsync(quote, now, branchId, userId, ct);
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
            var orderIds = await CreateMultipleOrdersFromQuoteAsync(quote, now, branchId, userId, ct, recalculatedPromo);
            return Result.Success(new ConvertToOrderResponse
            {
                OrderIds = orderIds,
                OrderId = orderIds.FirstOrDefault() // Backward compatibility
            });
        }

        // B2: Đây là lần đầu, trả về bản xem trước cho UI
        // TotalAmount phải khớp với LineTotal của OrderItem
        var newTotal = (quoteItem.UnitPrice * quoteItem.Qty) - recalculatedPromo;
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

    // Phương thức private helper để tạo multiple orders dựa trên quantity
    private async Task<List<long>> CreateMultipleOrdersFromQuoteAsync(Quote quote, DateTime createdAt, long? branchId, long? userId, CancellationToken ct, decimal? newLinePromo = null)
    {
        var quoteItem = quote.QuoteItems.First();
        var orderIds = new List<long>();

        // ✅ Sử dụng BranchId từ JWT token nếu có, nếu không thì dùng từ quote
        // BranchId từ token là branch của user đang convert quote
        // BranchId từ quote là branch của quote ban đầu
        var orderBranchId = branchId ?? quote.BranchId;

        // Tạo một order riêng cho mỗi quantity
        for (int i = 0; i < quoteItem.Qty; i++)
        {
            var order = new Order
            {
                DealerId = quote.DealerId,
                QuoteId = quote.QuoteId,
                CustomerId = quote.CustomerId,
                PricebookId = quote.PricebookId,
                BranchId = orderBranchId, // ✅ Set BranchId từ JWT token hoặc từ quote
                CreatedBy = userId, // ✅ Set CreatedBy từ JWT token (user đang convert quote)
                Status = OrderStatus.Draft.ToString(),
                CreatedAt = createdAt,
                UpdatedAt = createdAt,
            };

            var orderItem = new OrderItem
            {
                ProductId = quoteItem.ProductId,
                UnitPrice = quoteItem.UnitPrice,
                Qty = 1, // Mỗi order chỉ có 1 quantity
                // Nếu có giá trị mới, dùng giá trị mới. Nếu không, dùng giá trị cũ.
                LinePromo = newLinePromo ?? quoteItem.LinePromo,
                // Không cần tính hoa hồng ngay khi convert Quote to Order
            };
            order.OrderItems.Add(orderItem);

            // TotalAmount phải khớp với LineTotal của OrderItem
            // LineTotal = (UnitPrice * Qty) - LinePromo
            order.TotalAmount = (orderItem.UnitPrice * orderItem.Qty) - orderItem.LinePromo;

            _db.Orders.Add(order);
            orderIds.Add(order.OrderId);
        }

        await _db.SaveChangesAsync(ct);
        return orderIds;
    }
}