using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Agreements.GetAll
{
    public sealed class GetAllAgreementsHandler : IRequestHandler<GetAllAgreementsCommand, Result<List<GetAllAgreementsQuery>>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public GetAllAgreementsHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Result<List<GetAllAgreementsQuery>>> Handle(GetAllAgreementsCommand cmd, CancellationToken ct)
        {
            var query = _dbContext.DealerAgreements
                .Include(a => a.Dealer)
                .Include(a => a.AgreementRebates)
                .AsQueryable();

            // Filter by status if provided
            if (!string.IsNullOrEmpty(cmd.Status))
            {
                query = query.Where(a => a.Status == cmd.Status);
            }

            var agreements = await query
                .OrderByDescending(a => a.CreatedAt)
                .ProjectTo<GetAllAgreementsQuery>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result.Success(agreements);
        }
    }
}
