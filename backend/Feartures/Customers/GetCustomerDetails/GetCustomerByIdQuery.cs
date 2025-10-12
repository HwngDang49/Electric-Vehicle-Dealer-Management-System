using MediatR;

namespace backend.Feartures.Customers.GetCustomerDetails
{
    public sealed class GetCustomerByIdQuery : IRequest<GetCustomerDetailDto>
    {
        public long Id { get; set; }
    }

    public sealed class GetCustomerDetailDto
    {
        public long CustomerId { get; set; }
        public long DealerId { get; set; }
        public string FullName { get; set; } = default!;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? IdNumber { get; set; }
        public string? Address { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
