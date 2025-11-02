namespace backend.Feartures.Customers.Create
{
    public sealed class CreateCustomerResponse
    {
        public long CustomerId { get; set; }
        public string Status { get; set; } = "Contact";
        public DateTime CreatedAt { get; set; }
    }
}

