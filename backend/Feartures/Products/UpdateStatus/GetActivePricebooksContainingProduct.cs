using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.UpdateStatus
{
    public sealed class GetActivePricebooksContainingProductCommand : IRequest<Result<List<ActivePricebookInfo>>>
    {
        public long ProductId { get; set; }
    }

    public sealed class ActivePricebookInfo
    {
        public long PricebookId { get; set; }
        public string Name { get; set; } = default!;
        public long? DealerId { get; set; }
        public bool IsGlobal { get; set; }
        public DateOnly EffectiveFrom { get; set; }
        public DateOnly? EffectiveTo { get; set; }
        public string Status { get; set; } = default!;
    }

    public sealed class GetActivePricebooksContainingProductHandler : IRequestHandler<GetActivePricebooksContainingProductCommand, Result<List<ActivePricebookInfo>>>
    {
        private readonly EVDmsDbContext _db;

        public GetActivePricebooksContainingProductHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<List<ActivePricebookInfo>>> Handle(GetActivePricebooksContainingProductCommand request, CancellationToken ct)
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

            var pricebooks = activePricebookItems
                .Select(pbi => pbi.Pricebook)
                .Distinct()
                .Select(pb => new ActivePricebookInfo
                {
                    PricebookId = pb.PricebookId,
                    Name = pb.Name,
                    DealerId = pb.DealerId,
                    IsGlobal = pb.DealerId == null,
                    EffectiveFrom = pb.EffectiveFrom,
                    EffectiveTo = pb.EffectiveTo,
                    Status = pb.Status
                })
                .ToList();

            return Result.Success(pricebooks);
        }
    }

    [ApiController]
    [Route("api/admin/products")]
    [Authorize]
    public sealed class GetActivePricebooksContainingProductController : ControllerBase
    {
        private readonly IMediator _mediator;

        public GetActivePricebooksContainingProductController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{productId:long}/active-pricebooks")]
        public async Task<ActionResult<Result<List<ActivePricebookInfo>>>> GetActivePricebooksContainingProduct(
            [FromRoute] long productId,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new GetActivePricebooksContainingProductCommand { ProductId = productId }, ct);

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound) return NotFound(result);
                return BadRequest(result);
            }

            return Ok(result.Value);
        }
    }
} 