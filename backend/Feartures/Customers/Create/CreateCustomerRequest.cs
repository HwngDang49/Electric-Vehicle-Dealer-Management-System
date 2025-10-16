using System.Text.Json.Serialization;
using Ardalis.Result;
using backend.Common.Markers;
using backend.Domain.Enums;
using MediatR;

namespace backend.Feartures.Customers.Create
{

    /// <summary>
    /// Command tạo Customer mới (DealerId lấy từ token; không nhận trong body).
    /// </summary>
    public sealed class CreateCustomerRequest : IRequest<Result<CreateCustomerResponse>>, ITransactionalRequest
    {
        [JsonIgnore]
        public long DealerId { get; set; }  // set trong Handler từ token

        public string FullName { get; set; } = default!;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? IdNumber { get; set; }
        public string? Address { get; set; }
        public CustomerStatus? Status { get; set; } // Contact/Prospect/Customer (nullable)
    }

    public sealed class CreateCustomerResponse
    {
        public long CustomerId { get; set; }
        public string Status { get; set; } = "Contact";
        public DateTime CreatedAt { get; set; }
    }
}
