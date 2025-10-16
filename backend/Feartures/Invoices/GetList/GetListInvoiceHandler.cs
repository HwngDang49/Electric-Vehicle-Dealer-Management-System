using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Invoices.GetList
{
    public record GetListInvoiceCommand : IRequest<Result<List<GetListInvoiceQuery>>>;
    public class GetListInvoiceHandler
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public GetListInvoiceHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Result<List<GetListInvoiceQuery>>> Handle(GetListInvoiceCommand cmd, CancellationToken ct)
        {
            var results = await _dbContext.Invoices
                                .ProjectTo<GetListInvoiceQuery>(_mapper.ConfigurationProvider)
                                .ToListAsync();

            return Result.Success(results);
        }
    }
}
