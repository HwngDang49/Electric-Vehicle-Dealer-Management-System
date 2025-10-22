using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Pricebooks.DeleteItem
{
    [ApiController]
    [Route("api/admin/pricebooks")]
    [Authorize]
    public class DeleteItemController : ControllerBase
    {
        private readonly IMediator _mediator;

        public DeleteItemController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Xóa sản phẩm khỏi pricebook
        /// </summary>
        /// <param name="pricebookId">ID của pricebook</param>
        /// <param name="itemId">ID của PricebookItem cần xóa</param>
        /// <param name="ct">Cancellation token</param>
        [HttpDelete("{pricebookId}/items/{itemId}")]
        public async Task<IActionResult> DeleteItem(
            [FromRoute] long pricebookId,
            [FromRoute] long itemId,
            CancellationToken ct)
        {
            var result = await _mediator.Send(new DeleteItemCommand(pricebookId, itemId), ct);

            if (!result.IsSuccess)
            {
                if (result.Status == Ardalis.Result.ResultStatus.NotFound)
                {
                    return NotFound(result.Errors);
                }
                return BadRequest(result.Errors);
            }

            return Ok(new { 
                message = "Xóa sản phẩm khỏi bảng giá thành công"
            });
        }
    }
}

