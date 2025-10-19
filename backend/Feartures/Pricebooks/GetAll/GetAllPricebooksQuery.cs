using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Pricebooks.GetAll
{
    public record GetAllPricebooksCommand(string? Status = null)
        : IRequest<Result<List<GetAllPricebooksQuery>>>;

    public class GetAllPricebooksQuery
    {
        public long PricebookId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateOnly? EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int ItemCount { get; set; }
    }
}
