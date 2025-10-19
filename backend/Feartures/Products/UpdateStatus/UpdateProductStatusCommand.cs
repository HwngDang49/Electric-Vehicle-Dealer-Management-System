using Ardalis.Result;
using backend.Domain.Enums;
using MediatR;

namespace backend.Feartures.Products.UpdateStatus
{
    public sealed class UpdateProductStatusCommand : IRequest<Result>
    {
        public long ProductId { get; set; }
        public ProductStatus Status { get; set; }
    }
}
