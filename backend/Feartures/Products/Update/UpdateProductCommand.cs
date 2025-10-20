using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Products.Update
{
    public sealed class UpdateProductCommand : IRequest<Result>
    {
        public long ProductId { get; set; }
        public UpdateProductRequest Request { get; set; } = default!;
    }
}