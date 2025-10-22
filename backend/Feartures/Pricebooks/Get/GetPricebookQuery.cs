using Ardalis.Result;
using Azure.Core;
using backend.Domain.Enums;
using MediatR;

namespace backend.Feartures.Pricebooks.Get
{
    public record GetPricebookCommand(long pricebookId) : IRequest<Result<GetPricebookQuery>>;

    public class GetPricebookQuery
    {
        public long PricebookId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateOnly? EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<PricebookItemDto> PricebookItems { get; set; } = new List<PricebookItemDto>();
    }

    public class PricebookItemDto
    {
        public long PricebookItemId { get; set; }
        public long ProductId { get; set; }
        public decimal MsrpPrice { get; set; }
        public decimal FloorPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
