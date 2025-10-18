using System.Text.Json.Serialization;
using Ardalis.Result;
using MediatR;

namespace backend.Feartures.SalesDocuments.Contracts.SignContract
{
    public sealed class MarkAsSignedCommand : IRequest<Result<DateTime>>
    {
        [JsonIgnore]
        public long OrderId { get; set; }

        [JsonIgnore]
        public long DealerId { get; set; }
    }
}
