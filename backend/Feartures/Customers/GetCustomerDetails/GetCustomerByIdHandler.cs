using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Exceptions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace backend.Feartures.Customers.GetCustomerDetails
{
    public class GetCustomerByIdHandler : IRequestHandler<GetCustomerByIdQuery, GetCustomerDetailDto>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetCustomerByIdHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<GetCustomerDetailDto> Handle(GetCustomerByIdQuery query, CancellationToken ct)
        {
            var customer = await _db.Customers.AsNoTracking()
                .Where(c => c.CustomerId == query.Id)
                .ProjectTo<GetCustomerDetailDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (customer is null)
            {
                throw new NotFoundException($"Customer {query.Id} not found.");
            }

            return customer;
        }

    }
}
