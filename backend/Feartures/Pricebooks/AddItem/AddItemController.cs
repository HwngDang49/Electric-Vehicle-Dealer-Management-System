using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.AddItem
{
    [ApiController]
    [Route("api/admin/pricebooks")]
    [Authorize]
    public class AddItemController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AddItemController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Thêm sản phẩm mới vào pricebook
        /// </summary>
        /// <param name="pricebookId">ID của pricebook</param>
        /// <param name="request">Thông tin sản phẩm cần thêm</param>
        /// <param name="ct">Cancellation token</param>
        /// <returns>ID của PricebookItem vừa tạo</returns>
        [HttpPost("{pricebookId}/items")]
        public async Task<IActionResult> AddItem(
            [FromRoute] long pricebookId,
            [FromBody] AddItemRequest request,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new AddItemCommand(pricebookId, request), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == Ardalis.Result.ResultStatus.NotFound)
                {
                    return NotFound(result.Errors);
                }
                return BadRequest(result.Errors);
            }

            return Ok(new { 
                message = "Thêm sản phẩm vào bảng giá thành công",
                pricebookItemId = result.Value 
            });
        }
    }
}

