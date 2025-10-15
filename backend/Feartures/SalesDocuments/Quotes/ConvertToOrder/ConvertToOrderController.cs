﻿using Ardalis.Result;
using backend.Common.Auth;     // User.GetDealerId()
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Quotes.ConvertToOrder;

[ApiController]
[Route("api/quotes")]
[Authorize]
public sealed class ConvertToOrderController : ControllerBase
{
    private readonly IMediator _mediator;
    public ConvertToOrderController(IMediator mediator) => _mediator = mediator;

    // PATCH /api/quotes/{id}/convert-to-order
    [HttpPatch("{id:long}/convert-to-order")]
    public async Task<ActionResult<Result<ConvertToOrderResponse>>> Convert(
        [FromRoute] long id,
        [FromBody] ConvertToOrderCommand command, // Nhận command từ body để có cờ `confirmChanges`
        CancellationToken ct)
    {
        command.SalesDocId = id;
        command.DealerId = User.GetDealerId();
        var result = await _mediator.Send(command, ct);

        if (!result.IsSuccess) return BadRequest(result);
        return Ok(result);
    }
}
