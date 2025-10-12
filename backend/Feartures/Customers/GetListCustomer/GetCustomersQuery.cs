using backend.Common.Paging;
using MediatR;
namespace backend.Feartures.Customers.GetListCustomer
{
    public sealed class GetCustomersQuery : IRequest<PagedResult<GetCustomersDto>>
    {
        public long DealerId { get; set; }
        public string? Status { get; set; }   // "Contact" | "Prospect" | "Customer"
        public string? SearchTerm { get; set; }        // search fullName/phone/email
        public int Page { get; set; } = 1;    // 1-based
        public int PageSize { get; set; } = 20;
    }

    public sealed class GetCustomersDto
    {
        public long CustomerId { get; set; }
        public long DealerId { get; set; }
        public string FullName { get; set; } = default!;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
