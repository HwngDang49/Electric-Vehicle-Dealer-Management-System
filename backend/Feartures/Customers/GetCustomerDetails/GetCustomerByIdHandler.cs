using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Common.Exceptions;
using backend.Common.Helpers;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
namespace backend.Feartures.Customers.GetCustomerDetails
{
    public class GetCustomerByIdHandler : IRequestHandler<GetCustomerByIdQuery, GetCustomerDetailDto>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public GetCustomerByIdHandler(EVDmsDbContext db, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<GetCustomerDetailDto> Handle(GetCustomerByIdQuery query, CancellationToken ct)
        {
            var branchId = _httpContextAccessor.HttpContext?.User.GetBranchId();
            var userId = _httpContextAccessor.HttpContext?.User.GetUserId();
            
            var customer = await _db.Customers.AsNoTracking()
                .Where(c => c.CustomerId == query.Id)
                .ProjectTo<GetCustomerDetailDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (customer is null)
            {
                throw new NotFoundException($"Customer {query.Id} not found.");
            }
            
            // Validate BranchId và CreatedBy nếu user có branch
            if (branchId.HasValue)
            {
                var customerEntity = await _db.Customers
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.CustomerId == query.Id, ct);
                    
                if (customerEntity == null || customerEntity.BranchId != branchId.Value)
                {
                    throw new NotFoundException($"Customer {query.Id} not found.");
                }
                
                // Nếu user có userId, validate CreatedBy
                if (userId.HasValue && customerEntity.CreatedBy != userId.Value)
                {
                    throw new NotFoundException($"Customer {query.Id} not found.");
                }
            }

            
            var hasQuote = await _db.Quotes
                .AnyAsync(q => q.CustomerId == query.Id, ct);
            
            customer.HasQuote = hasQuote;

            // Convert CreatedAt từ UTC sang giờ VN
            customer.CreatedAt = DateTimeHelper.ToVietnamTime(customer.CreatedAt);

            return customer;
        }

    }
}
