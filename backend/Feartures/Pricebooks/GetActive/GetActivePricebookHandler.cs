using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.GetActive
{
    public sealed class GetActivePricebookHandler : IRequestHandler<GetActivePricebookCommand, Result<GetActivePricebookQuery>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetActivePricebookHandler(EVDmsDbContext dbContext, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<GetActivePricebookQuery>> Handle(GetActivePricebookCommand cmd, CancellationToken ct)
        {
            // ✅ Handle Admin users (may not have dealerId)
            // Note: GetActivePricebook is typically used for retail operations, Admin shouldn't use this
            var userRole = _httpContextAccessor.HttpContext!.User.GetRole();
            long? dealerId = null;
            
            // Only get dealerId if user is not Admin
            if (userRole != Role.Admin.ToString())
            {
                try
                {
                    dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
                }
                catch (UnauthorizedAccessException)
                {
                    return Result.Error("Dealer context is required for this operation.");
                }
            }
            else
            {
                // Admin users cannot use GetActivePricebook - this is for retail operations
                return Result.Error("Admin users cannot access active pricebook. Please use GetPricebook or GetAllPricebooks instead.");
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // PRIORITY: Per-dealer > Global
            // 1. Tìm per-dealer pricebook trước
            var perDealerPricebook = await _dbContext.Pricebooks
                .Include(pb => pb.PricebookItems)
                    .ThenInclude(pi => pi.Product)
                .Where(pb => pb.DealerId == dealerId &&
                           pb.Status == "Active" &&
                           pb.EffectiveFrom <= today &&
                           (pb.EffectiveTo == null || pb.EffectiveTo >= today))
                .OrderByDescending(pb => pb.EffectiveFrom)
                .FirstOrDefaultAsync(ct);

            if (perDealerPricebook != null)
            {
                return BuildResult(perDealerPricebook);
            }

            // 2. Nếu không có per-dealer, fallback sang global pricebook
            var globalPricebook = await _dbContext.Pricebooks
                .Include(pb => pb.PricebookItems)
                    .ThenInclude(pi => pi.Product)
                .Where(pb => pb.DealerId == null && // Global
                           pb.Status == "Active" &&
                           pb.EffectiveFrom <= today &&
                           (pb.EffectiveTo == null || pb.EffectiveTo >= today))
                .OrderByDescending(pb => pb.EffectiveFrom)
                .FirstOrDefaultAsync(ct);

            if (globalPricebook == null)
            {
                return Result.Error("Không có pricebook nào đang active hiện tại.");
            }

            return BuildResult(globalPricebook);
        }

        private Result<GetActivePricebookQuery> BuildResult(Pricebook pricebook)
        {

            var result = new GetActivePricebookQuery
            {
                PricebookId = pricebook.PricebookId,
                Name = pricebook.Name,
                EffectiveFrom = pricebook.EffectiveFrom,
                EffectiveTo = pricebook.EffectiveTo,
                Status = pricebook.Status,
                CreatedAt = pricebook.CreatedAt,
                Items = pricebook.PricebookItems.Select(pi => new GetActivePricebookItemQuery
                {
                    PricebookItemId = pi.PricebookItemId,
                    ProductId = pi.ProductId,
                    ProductName = pi.Product.Name,
                    ModelCode = pi.Product.ModelCode!,
                    VariantCode = pi.Product.VariantCode!,
                    MsrpPrice = pi.MsrpPrice,
                    FloorPrice = pi.FloorPrice
                }).ToList()
            };

            return Result.Success(result);
        }
    }
}
