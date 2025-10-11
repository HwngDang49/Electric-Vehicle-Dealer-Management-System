using backend.Common.Markers;
using backend.Domain.Enums;
using MediatR;

namespace backend.Feartures.Customers.Create
{
    public class CreateCustomerRequest : IRequest<long>, ITransactionalRequest
    {
        public long DealerId { get; set; }
        public string FullName { get; set; } = default!;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? IdNumber { get; set; }
        public string? Address { get; set; }
        public CustomerStatus? Status { get; set; } // Contact/Prospect/Customer (nullable)
    }
}
