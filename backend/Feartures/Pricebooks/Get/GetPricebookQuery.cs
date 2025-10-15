using Ardalis.Result;
using Azure.Core;
using backend.Domain.Enums;
using MediatR;

namespace backend.Feartures.Pricebooks.Get
{
    public record GetPricebookCommand(long pricebookId) : IRequest<Result<GetPricebookQuery>>;
    public class GetPricebookQuery
    {
        public string? Name { get; set; }
        public long? MsrpPrice { get; set; }
        public long? FloorPrice { get; set; }
        public DateOnly? EffectiveTo { get; set; }
        public string Status { get; set; }
    }
}
