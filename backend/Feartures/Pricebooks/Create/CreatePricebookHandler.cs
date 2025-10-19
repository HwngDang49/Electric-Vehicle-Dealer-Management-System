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
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            // 1. Validate business rules
            var validationResult = await ValidateBusinessRules(req, dealerId, ct);
            if (!validationResult.IsSuccess)
                return validationResult;

            // 2. Check for duplicate pricebook name
            var existingPricebook = await _dbContext.Pricebooks
                .AnyAsync(p => p.DealerId == dealerId &&
                              p.Name == req.Name &&
                              p.Status == PricebookStatus.Active.ToString(), ct);

            if (existingPricebook)
                return Result.Error($"Đã tồn tại bảng giá với tên '{req.Name}' cho đại lý này");

            // 3. Validate all products exist and belong to dealer
            var productIds = req.PricebookItems.Select(x => x.ProductId).ToList();
            var existingProducts = await _dbContext.Products
                .Where(p => productIds.Contains(p.ProductId) && p.Status == "Active")
                .Select(p => p.ProductId)
                .ToListAsync(ct);

            var missingProducts = productIds.Except(existingProducts).ToList();
            if (missingProducts.Any())
                return Result.Error($"Không tìm thấy sản phẩm với ID: {string.Join(", ", missingProducts)}");

            // 4. Create pricebook with transaction
            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
            try
            {
                var now = DateTime.UtcNow;
                var pricebook = new Pricebook
                {
                    DealerId = dealerId,
                    Name = req.Name,
                    EffectiveFrom = DateOnly.FromDateTime(now),
                    Status = req.Status.ToString(),
                    CreatedAt = now
                };

                _dbContext.Pricebooks.Add(pricebook);
                await _dbContext.SaveChangesAsync(ct);

                // 5. Create pricebook items
                var pricebookItems = req.PricebookItems.Select(item => new PricebookItem
                {
                    PricebookId = pricebook.PricebookId,
                    ProductId = item.ProductId,
                    MsrpPrice = item.MsrpPrice,
                    FloorPrice = item.FloorPrice,
                    OemDiscountAmount = item.OemDiscountAmount,
                    OemDiscountPercent = item.OemDiscountPercent,
                    CreatedAt = now
                }).ToList();

                _dbContext.PricebookItems.AddRange(pricebookItems);
                await _dbContext.SaveChangesAsync(ct);

                await transaction.CommitAsync(ct);

                return Result.Success(pricebook.PricebookId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                return Result.Error($"Lỗi khi tạo bảng giá: {ex.Message}");
            }
        }

        private async Task<Result<long>> ValidateBusinessRules(CreatePricebookRequest req, long dealerId, CancellationToken ct)
        {
            // Validate dealer exists
            var dealerExists = await _dbContext.Dealers
                .AnyAsync(d => d.DealerId == dealerId, ct);

            if (!dealerExists)
                return Result.Error("Đại lý không tồn tại");


            // Validate pricebook items
            if (!req.PricebookItems.Any())
                return Result.Error("Bảng giá phải có ít nhất một sản phẩm");

            // Check for duplicate products in the same pricebook
            var duplicateProducts = req.PricebookItems
                .GroupBy(x => x.ProductId)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateProducts.Any())
                return Result.Error($"Sản phẩm bị trùng lặp trong bảng giá: {string.Join(", ", duplicateProducts)}");

            return Result.Success(0L);
        }
    }
}
