using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.UpdateStatus
{
    public sealed class RemoveProductFromPricebooksCommand : IRequest<Result<int>>
    {
        public long ProductId { get; set; }
    }

    public sealed class RemoveProductFromPricebooksHandler : IRequestHandler<RemoveProductFromPricebooksCommand, Result<int>>
    {
        private readonly EVDmsDbContext _db;

        public RemoveProductFromPricebooksHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<int>> Handle(RemoveProductFromPricebooksCommand request, CancellationToken ct)
        {
            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.ProductId == request.ProductId, ct);

            if (product == null)
            {
                return Result.NotFound($"Product with ID {request.ProductId} not found.");
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var activePricebookItems = await _db.PricebookItems
                .Include(pbi => pbi.Pricebook)
                .Where(pbi => pbi.ProductId == request.ProductId)
                .Where(pbi =>
                    pbi.Pricebook.Status == PricebookStatus.Active.ToString() &&
                    pbi.Pricebook.EffectiveFrom <= today &&
                    (pbi.Pricebook.EffectiveTo == null || pbi.Pricebook.EffectiveTo >= today))
                .ToListAsync(ct);

            if (!activePricebookItems.Any())
            {
                return Result.Success(0);
            }

            var count = activePricebookItems.Count;
            _db.PricebookItems.RemoveRange(activePricebookItems);
            await _db.SaveChangesAsync(ct);

            return Result.Success(count);
        }
    }

    [ApiController]
    [Route("api/admin/products")]
    [Authorize]
    public sealed class RemoveProductFromPricebooksController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RemoveProductFromPricebooksController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpDelete("{productId:long}/remove-from-pricebooks")]
        public async Task<ActionResult<Result<int>>> RemoveProductFromPricebooks(
            [FromRoute] long productId,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new RemoveProductFromPricebooksCommand { ProductId = productId }, ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound) return NotFound(result);
                return BadRequest(result);
            }

            return Ok(new { 
                message = $"Đã xóa sản phẩm khỏi {result.Value} bảng giá",
                removedCount = result.Value
            });
        }
    }
}
