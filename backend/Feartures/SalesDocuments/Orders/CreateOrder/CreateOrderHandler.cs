using Ardalis.Result;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Common.Services;
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
        private readonly StatusValidationService _statusValidationService;

        public CreateOrderHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor, StatusValidationService statusValidationService)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
            _statusValidationService = statusValidationService;
        }

        public async Task<Result<CreateOrderResponse>> Handle(CreateOrderCommand request, CancellationToken ct)
        {
            request.DealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            var userId = _httpContextAccessor.HttpContext!.User.GetUserId();
            var branchId = _httpContextAccessor.HttpContext!.User.GetBranchId();

            // ✅ Validate Dealer status for retail operations
            var dealerValidation = await _statusValidationService.ValidateDealerForRetail(request.DealerId, ct);
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

            var customerExists = await _db.Customers.AnyAsync(c => c.CustomerId == request.CustomerId && c.DealerId == request.DealerId, ct);
            if (!customerExists)
                return Result.NotFound($"Customer with ID {request.CustomerId} not found for this dealer.");

            // Kiểm tra product status
            var product = await _db.Products.FirstOrDefaultAsync(p => p.ProductId == request.ProductId, ct);
            if (product == null) return Result.Error("Sản phẩm không tồn tại.");

            if (product.Status != "Active")
                return Result.Error($"Sản phẩm '{product.Name}' hiện đang ở trạng thái '{product.Status}' và không thể tạo đơn hàng. Chỉ sản phẩm 'Active' mới có thể được bán.");

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var pricebookEntry = await _db.PricebookItems
                .AsNoTracking()
                .Include(pbi => pbi.Pricebook)
                .Where(pbi => pbi.ProductId == request.ProductId &&
                             pbi.Pricebook.Status == PriceBooks.Active.ToString() &&
                             pbi.Pricebook.EffectiveFrom <= today &&
                             (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= today) &&
                             (pbi.Pricebook.DealerId == request.DealerId || pbi.Pricebook.DealerId == null))
                .OrderByDescending(pbi => pbi.Pricebook.DealerId.HasValue)
                .ThenByDescending(pbi => pbi.Pricebook.EffectiveFrom)
                .Select(pbi => new { pbi.PricebookId, pbi.MsrpPrice })
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
                PricebookId = pricebookEntry.PricebookId,
                BranchId = user?.BranchId ?? branchId,
                CreatedBy = userId
            };

            var newItem = new OrderItem
            {
                ProductId = request.ProductId,
                Qty = request.Quantity,
                UnitPrice = pricebookEntry.MsrpPrice,
                LinePromo = 0 // Will be calculated below
            };
            newOrder.OrderItems.Add(newItem);

            // Tính khuyến mãi
            newItem.LinePromo = await PromotionCalculator.CalculateAsync(_db, request.DealerId, newItem, ct);

            // Không cần tính hoa hồng ngay khi tạo Order

            // Tính toán tổng tiền cuối cùng
            newOrder.TotalAmount = (newItem.UnitPrice * newItem.Qty) - newItem.LinePromo;

            _db.Orders.Add(newOrder);
            await _db.SaveChangesAsync(ct);

            var response = new CreateOrderResponse
            {
                OrderId = newOrder.OrderId,
                Status = newOrder.Status,
                CreatedAt = DateTimeHelper.ToVietnamTime(newOrder.CreatedAt)
            };

            return Result.Success(response);
        }
    }
}