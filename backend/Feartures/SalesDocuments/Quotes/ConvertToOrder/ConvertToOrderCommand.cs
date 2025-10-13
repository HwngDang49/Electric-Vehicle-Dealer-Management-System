using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Quotes.ConvertToOrder;

public sealed class ConvertToOrderCommand : IRequest<Result<long>> // trả về orderId
{
    [JsonIgnore] public long DealerId { get; set; }  // lấy từ JWT
    public long SalesDocId { get; set; }             // quote id
}
