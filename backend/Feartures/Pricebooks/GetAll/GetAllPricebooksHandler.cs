using Ardalis.Result;
using AutoMapper;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.GetAll
{
    public class GetAllPricebooksHandler : IRequestHandler<GetAllPricebooksCommand, Result<List<GetAllPricebooksQuery>>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetAllPricebooksHandler(
            EVDmsDbContext dbContext,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<List<GetAllPricebooksQuery>>> Handle(GetAllPricebooksCommand request, CancellationToken ct)
        {
            // ✅ Handle Admin users (may not have dealerId)
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
                    // User doesn't have dealerId - return empty list or error
                    return Result.Error("Dealer context is required for this operation.");
                }
            }

            // Query cơ bản - load PricebookItems using Include
            var query = _dbContext.Pricebooks
                .Include(pb => pb.PricebookItems)
                .AsNoTracking();
            
            // ✅ Filter by dealerId only if user has one (Admin can see all)
            if (dealerId.HasValue)
            {
                query = query.Where(pb => pb.DealerId == dealerId.Value);
            }

            // Filter theo status 
            if (!string.IsNullOrEmpty(request.Status))
            {
                query = query.Where(pb => pb.Status == request.Status);
            }

            // Lấy tất cả dữ liệu (không phân trang)
            var pricebooks = await query
                .OrderByDescending(pb => pb.CreatedAt)
                .ToListAsync(ct);

            var result = pricebooks.Select(pb => new GetAllPricebooksQuery
            {
                PricebookId = pb.PricebookId,
                Name = pb.Name,
                DealerId = pb.DealerId,
                EffectiveFrom = pb.EffectiveFrom,
                EffectiveTo = pb.EffectiveTo,
                Status = pb.Status,
                CreatedAt = pb.CreatedAt,
                ItemCount = pb.PricebookItems.Count
            }).ToList();

            return Result.Success(result);
        }
    }
}
