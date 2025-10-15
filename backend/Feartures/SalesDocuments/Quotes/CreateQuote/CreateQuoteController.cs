using Ardalis.Result;
using backend.Common.Auth;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.SalesDocuments.Quotes.CreateQuote
{
    [ApiController]
    [Route("api/quotes")] // Route chuyên biệt cho Báo giá
    [Authorize] // Yêu cầu người dùng phải đăng nhập
    public sealed class CreateQuoteController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CreateQuoteController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Tạo một báo giá mới.
        /// </summary>
        [HttpPost("{id:long}/create-quote")]
        public async Task<ActionResult<Result<long>>> CreateQuote(
            [FromRoute] long id,
            [FromBody] CreateQuoteCommand command,
            CancellationToken cancellationToken)
        {
            // 1. Lấy DealerId từ thông tin xác thực (JWT Token) của người dùng.
            //    Đây là bước bảo mật quan trọng để đảm bảo nhân viên chỉ có thể
            //    tạo báo giá cho chính đại lý của họ.
            command.DealerId = User.GetDealerId();

            // 2. Gửi command cho MediatR để xử lý.
            //    MediatR sẽ tìm đến CreateQuoteHandler để thực thi logic.
            var result = await _mediator.Send(command, cancellationToken);

            // 3. Xử lý kết quả trả về từ Handler.
            if (!result.IsSuccess)
            {
                // Nếu Handler trả về lỗi, chúng ta tạo một response lỗi chuẩn
                // bằng ProblemDetails, giúp frontend dễ dàng xử lý.
                return Problem(
                    statusCode: StatusCodes.Status400BadRequest,
                    title: "One or more business rules failed.",
                    detail: result.Errors.FirstOrDefault());
            }


            return Ok(new { quoteId = result.Value });
        }
    }
}

