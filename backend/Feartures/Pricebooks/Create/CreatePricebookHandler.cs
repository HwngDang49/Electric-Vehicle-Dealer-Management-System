using Ardalis.Result;
using AutoMapper;
using backend.Common.Auth;
using backend.Common.Exceptions;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.Create
{
    public record CreatePricebookCommand(CreatePricebookRequest Request) : IRequest<Result<long>>;

    public class CreatePricebookHandler : IRequestHandler<CreatePricebookCommand, Result<long>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreatePricebookHandler(
            EVDmsDbContext dbContext,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<long>> Handle(CreatePricebookCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;
            
            // 0. CHỈ ADMIN MỚI ĐƯỢC TẠO PRICEBOOK
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();
            if (userRole != Role.Admin.ToString())
            {
                return Result.Forbidden("Chỉ Admin mới được tạo bảng giá");
            }

            // 1. Validate business rules
            var validationResult = await ValidateBusinessRules(req, ct);
            if (!validationResult.IsSuccess)
                return validationResult;

            // 2. KIỂM TRA KHÔNG ĐƯỢC OVERLAP THỜI GIAN
            var hasOverlap = await CheckTimeOverlap(req.DealerId, req.EffectiveFrom, req.EffectiveTo, ct);
            if (hasOverlap)
            {
                var scope = req.DealerId.HasValue ? $"dealer ID {req.DealerId.Value}" : "toàn hệ thống (global)";
                return Result.Error($"Đã tồn tại bảng giá Active trong khung thời gian này cho {scope}. " +
                    "Vui lòng chọn thời gian không trùng lặp.");
            }

            // 3. Validate all products exist (nếu có items)
            if (req.PricebookItems != null && req.PricebookItems.Any())
            {
                var productIds = req.PricebookItems.Select(x => x.ProductId).ToList();
                var existingProducts = await _dbContext.Products
                    .Where(p => productIds.Contains(p.ProductId) && p.Status == "Active")
                    .Select(p => p.ProductId)
                    .ToListAsync(ct);

                var missingProducts = productIds.Except(existingProducts).ToList();
                if (missingProducts.Any())
                    return Result.Error($"Không tìm thấy sản phẩm với ID: {string.Join(", ", missingProducts)}");
            }

            // 4. Create pricebook with transaction
            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
            try
            {
                var now = DateTime.UtcNow;
                var pricebook = new Pricebook
                {
                    DealerId = req.DealerId, // NULL = global, NOT NULL = per-dealer
                    Name = req.Name,
                    EffectiveFrom = req.EffectiveFrom,
                    EffectiveTo = req.EffectiveTo,
                    Status = req.Status.ToString(),
                    CreatedAt = now
                };

                _dbContext.Pricebooks.Add(pricebook);
                await _dbContext.SaveChangesAsync(ct);

                // 5. Create pricebook items (nếu có)
                if (req.PricebookItems != null && req.PricebookItems.Any())
                {
                    var pricebookItems = req.PricebookItems.Select(item => new PricebookItem
                    {
                        PricebookId = pricebook.PricebookId,
                        ProductId = item.ProductId,
                        MsrpPrice = item.MsrpPrice,
                        FloorPrice = item.FloorPrice,
                        CreatedAt = now
                    }).ToList();

                    _dbContext.PricebookItems.AddRange(pricebookItems);
                    await _dbContext.SaveChangesAsync(ct);
                }

                await transaction.CommitAsync(ct);

                return Result.Success(pricebook.PricebookId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                return Result.Error($"Lỗi khi tạo bảng giá: {ex.Message}");
            }
        }

        private async Task<Result<long>> ValidateBusinessRules(CreatePricebookRequest req, CancellationToken ct)
        {
            // Validate thời gian
            if (req.EffectiveTo.HasValue && req.EffectiveFrom >= req.EffectiveTo.Value)
            {
                return Result.Error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
            }

            // Validate dealer exists (nếu không phải global)
            if (req.DealerId.HasValue)
            {
                var dealerExists = await _dbContext.Dealers
                    .AnyAsync(d => d.DealerId == req.DealerId.Value, ct);

                if (!dealerExists)
                    return Result.Error($"Không tìm thấy dealer với ID {req.DealerId.Value}");
            }

            // Check for duplicate products in the same pricebook (nếu có items)
            var duplicateProducts = req.PricebookItems
                .GroupBy(x => x.ProductId)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateProducts.Any())
                return Result.Error($"Sản phẩm bị trùng lặp trong bảng giá: {string.Join(", ", duplicateProducts)}");

            return Result.Success(0L);
        }

        /// <summary>
        /// Kiểm tra không có pricebook Active nào overlap thời gian cho cùng dealer_id
        /// </summary>
        private async Task<bool> CheckTimeOverlap(long? dealerId, DateOnly effectiveFrom, DateOnly? effectiveTo, CancellationToken ct)
        {
            // Query pricebooks có cùng dealer_id (hoặc cùng NULL) và đang Active
            var query = _dbContext.Pricebooks
                .Where(p => p.DealerId == dealerId && 
                           p.Status == PricebookStatus.Active.ToString());

            var existingPricebooks = await query.ToListAsync(ct);

            foreach (var existing in existingPricebooks)
            {
                // Kiểm tra overlap
                // Overlap nếu: (Start1 <= End2) AND (End1 >= Start2)
                var newStart = effectiveFrom;
                var newEnd = effectiveTo ?? DateOnly.MaxValue; // Nếu null = vô hạn
                var existingStart = existing.EffectiveFrom;
                var existingEnd = existing.EffectiveTo ?? DateOnly.MaxValue;

                if (newStart <= existingEnd && newEnd >= existingStart)
                {
                    return true; // Có overlap
                }
            }

            return false; // Không overlap
        }
    }
}
