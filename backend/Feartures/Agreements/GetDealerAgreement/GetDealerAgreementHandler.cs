using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Agreements.GetDealerAgreement
{
    public sealed class GetDealerAgreementHandler : IRequestHandler<GetDealerAgreementCommand, Result<GetDealerAgreementQuery>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetDealerAgreementHandler(EVDmsDbContext dbContext, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<GetDealerAgreementQuery>> Handle(GetDealerAgreementCommand cmd, CancellationToken ct)
        {
            var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();

            var agreement = await _dbContext.DealerAgreements
                .Include(a => a.AgreementRebates)
                .Where(a => a.DealerId == dealerId && a.Status == "Active")
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync(ct);

            if (agreement == null)
            {
                return Result.Error("Dealer chưa có Agreement Active");
            }

            var result = _mapper.Map<GetDealerAgreementQuery>(agreement);
            return Result.Success(result);
        }
    }
}
