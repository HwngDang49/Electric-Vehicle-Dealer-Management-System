using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.Get
{
    public class GetPricebookHandler
    : IRequestHandler<GetPricebookCommand, Result<GetPricebookQuery>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetPricebookHandler(EVDmsDbContext dbContext, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<GetPricebookQuery>> Handle(GetPricebookCommand request, CancellationToken ct)
        {
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            // Lấy thông tin pricebook với chi tiết items, chỉ của dealer hiện tại
            var pricebook = await _dbContext.Pricebooks
                .Include(pb => pb.PricebookItems)
                    .ThenInclude(pi => pi.Product)
                .FirstOrDefaultAsync(pb => pb.PricebookId == request.pricebookId, ct);

            if (pricebook == null)
            {
                return Result.Error("Pricebook does not exist or does not belong to your dealer");
            }

            // Map sang DTO với chi tiết
            var result = new GetPricebookQuery
            {
                PricebookId = pricebook.PricebookId,
                Name = pricebook.Name,
                DealerId = pricebook.DealerId,
                EffectiveFrom = pricebook.EffectiveFrom,
                EffectiveTo = pricebook.EffectiveTo,
                Status = pricebook.Status,
                CreatedAt = pricebook.CreatedAt,
                PricebookItems = pricebook.PricebookItems.Select(pi => new PricebookItemDto
                {
                    PricebookItemId = pi.PricebookItemId,
                    ProductId = pi.ProductId,
                    MsrpPrice = pi.MsrpPrice,
                    FloorPrice = pi.FloorPrice,
                    CreatedAt = pi.CreatedAt
                }).ToList()
            };

            return Result.Success(result);
        }
    }
}