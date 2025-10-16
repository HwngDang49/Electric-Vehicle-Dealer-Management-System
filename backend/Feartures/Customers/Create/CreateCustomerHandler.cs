using Ardalis.Result;
using AutoMapper;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Customers.Create
{
    public sealed class CreateCustomerHandler
        : IRequestHandler<CreateCustomerRequest, Result<CreateCustomerResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _http;

        public CreateCustomerHandler(EVDmsDbContext db, IMapper mapper, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _mapper = mapper;
            _http = httpContextAccessor;
        }

        public async Task<Result<CreateCustomerResponse>> Handle(CreateCustomerRequest req, CancellationToken ct)
        {
            // 1) DealerId từ token
            req.DealerId = _http.HttpContext!.User.GetDealerId();

            // 2) Rule checks (được gộp từ RuleChecker cũ)
            // 2.1 Dealer phải tồn tại
            var dealerExists = await _db.Dealers
                .AsNoTracking()
                .AnyAsync(d => d.DealerId == req.DealerId, ct);
            if (!dealerExists) return Result.NotFound($"Dealer {req.DealerId} not found.");

            // 2.2 Email không trùng trong cùng dealer
            if (!string.IsNullOrWhiteSpace(req.Email))
            {
                var dupEmail = await _db.Customers
                    .AsNoTracking()
                    .AnyAsync(c => c.DealerId == req.DealerId && c.Email == req.Email, ct);
                if (dupEmail) return Result.Error("Customer email already exists in this dealer.");
            }

            // 2.3 Phone không trùng trong cùng dealer
            if (!string.IsNullOrWhiteSpace(req.Phone))
            {
                var dupPhone = await _db.Customers
                    .AsNoTracking()
                    .AnyAsync(c => c.DealerId == req.DealerId && c.Phone == req.Phone, ct);
                if (dupPhone) return Result.Error("Customer phone already exists in this dealer.");
            }

            // 3) Map DTO -> Entity
            var entity = _mapper.Map<Customer>(req);
            entity.DealerId = req.DealerId;

            // 4) Status default nếu null
            entity.Status = req.Status?.ToString() ?? entity.Status ?? "Contact";

            // 5) Timestamps
            entity.CreatedAt = DateTimeHelper.UtcNow();

            // 6) Save
            _db.Customers.Add(entity);
            await _db.SaveChangesAsync(ct);

            // 7) Response
            var response = new CreateCustomerResponse
            {
                CustomerId = entity.CustomerId,
                Status = entity.Status ?? "Contact",
                CreatedAt = entity.CreatedAt
            };

            return Result.Success(response);
        }
    }
}
