using Ardalis.Result;
using MediatR;
using Microsoft.AspNetCore.Mvc;
namespace backend.Feartures.Dealers.Create
{
    [ApiController]
    [Route("api/dealers")]
    public class CreateDealerController : ControllerBase
    {

        private readonly IMediator _mediator;

        public CreateDealerController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<ActionResult<Result<CreateDealerResponse>>> Create([FromBody] CreateDealerCommand command, CancellationToken ct) //syntax: [FromBody] CreateDealerRequest request -> ASP.NET Core sẽ tự động ánh xạ dữ liệu JSON từ body của yêu cầu HTTP vào đối tượng CreateDealerRequest. 
        {
            var result = await _mediator.Send(command, ct); // Gửi lệnh tạo đại lý tới handler thông qua mediator và chờ nhận kết quả trả về.

            if (!result.IsSuccess)
            {
                if (result.Status == ResultStatus.NotFound)
                    return NotFound(result);
                return BadRequest(result);
            }

            var locationUrl = $"/api/dealers/{result.Value.DealerId}"; // Tạo URL cho tài nguyên đại lý mới dựa trên DealerId trả về từ kết quả. Điều này nằm mục đích là theo chuẩn RESTful API. 
            return Created(locationUrl, result);
        }
    }
}
