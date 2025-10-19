using Ardalis.Result;
using backend.Domain.Enums;
using MediatR;

namespace backend.Feartures.Pricebooks.UpdateStatus
{
    public sealed class UpdatePricebookStatusCommand : IRequest<Result>
    {
        public long PricebookId { get; set; }
        public PricebookStatus Status { get; set; }
    }
}
