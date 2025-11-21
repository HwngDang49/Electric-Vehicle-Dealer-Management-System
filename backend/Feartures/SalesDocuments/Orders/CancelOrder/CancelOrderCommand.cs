using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Orders.CancelOrder;

public sealed class CancelOrderCommand : IRequest<Result>
{
    [JsonIgnore]
    public long OrderId { get; set; } // Lấy từ route URL

    [JsonIgnore]
    public long DealerId { get; set; } // Lấy từ JWT Token
}

