using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Exceptions;
using backend.Domain.Enums;         // DocType
using backend.Feartures.SalesDocuments.Quotes.GetQuoteDetails;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Features.SalesDocuments.Details
{
    public sealed class GetQuoteDetailsHandler : IRequestHandler<GetQuoteByIdQuery, GetQuoteDetailDto>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public GetQuoteDetailsHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<GetQuoteDetailDto> Handle(GetQuoteByIdQuery query, CancellationToken cancellationToken)
        {
            var dto = await _dbContext.SalesDocuments
                .AsNoTracking()
                .Where(sd =>
                    sd.SalesDocId == query.SalesDocId &&
                    sd.DealerId == query.DealerId &&
                    sd.DocType == DocTypeEnum.Quote.ToString())
                .ProjectTo<GetQuoteDetailDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(cancellationToken);

            if (dto is null)
                throw new NotFoundException($"Quote with ID #{query.SalesDocId} was not found.");

            // tính IsExpired sau khi materialize
            dto.IsExpired = dto.LockedUntil.HasValue && DateTime.UtcNow > dto.LockedUntil.Value;

            return dto;
        }
    }
}
