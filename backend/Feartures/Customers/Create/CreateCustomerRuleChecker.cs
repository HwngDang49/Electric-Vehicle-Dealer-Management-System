using backend.Common.Exceptions;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Customers.Create
{
    public class CreateCustomerRuleChecker
    {
        private readonly EVDmsDbContext _db;
        public CreateCustomerRuleChecker(EVDmsDbContext db) => _db = db;


        public async Task CheckAllRules(CreateCustomerRequest req, CancellationToken ct)
        {
            // Rule 1: Dealer tồn tại?
            var dealerExists = await _db.Dealers.AnyAsync(d => d.DealerId == req.DealerId, ct);
            if (!dealerExists)
                throw new NotFoundException($"Dealer {req.DealerId} not found.");

            // Rule 2: Email có bị trùng không?
            if (!string.IsNullOrWhiteSpace(req.Email))
            {
                var dupEmail = await _db.Customers
                    .AnyAsync(c => c.DealerId == req.DealerId && c.Email == req.Email, ct);
                if (dupEmail) throw new BusinessRuleException("Customer email already exists in this dealer.");
            }

            // Rule 3: Phone có bị trùng không?
            if (!string.IsNullOrWhiteSpace(req.Phone))
            {
                var dupPhone = await _db.Customers
                    .AnyAsync(c => c.DealerId == req.DealerId && c.Phone == req.Phone, ct);
                if (dupPhone) throw new BusinessRuleException("Customer phone already exists in this dealer.");
            }
        }

    }
}
