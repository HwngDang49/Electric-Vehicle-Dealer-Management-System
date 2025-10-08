using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace backend.Feartures.Dealers.Create
{
    [ApiController]
    [Route("api/dealers")] // Định tuyến cho controller, tất cả các endpoint trong controller này sẽ bắt đầu bằng "api/dealers"
    public class CreateDealerController : ControllerBase
    {
        //mediator pattern là một mẫu thiết kế phần mềm giúp tách rời các thành phần trong hệ thống bằng cách sử dụng một đối tượng trung gian (mediator) để quản lý giao tiếp giữa các thành phần đó.
        //ví dụ: trong một ứng dụng web, khi người dùng gửi một yêu cầu để tạo một đại lý mới, controller sẽ không trực tiếp xử lý yêu cầu này mà sẽ gửi lệnh (command) tới mediator.
        // Mediator sẽ chuyển lệnh này tới handler tương ứng để thực hiện các bước cần thiết như xác thực dữ liệu, kiểm tra trùng lặp mã đại lý, và lưu thông tin đại lý vào cơ sở dữ liệu.
        // Khi quá trình xử lý hoàn tất, handler sẽ trả về kết quả (result) cho mediator, và mediator sẽ chuyển kết quả này trở lại controller để trả về phản hồi cho người dùng.

        private readonly IMediator _mediator; // Sử dụng IMediator để gửi lệnh tới handler tương ứng và nhận kết quả trả về từ handler.

        public CreateDealerController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDealerRequest request) //syntax: [FromBody] CreateDealerRequest request -> ASP.NET Core sẽ tự động ánh xạ dữ liệu JSON từ body của yêu cầu HTTP vào đối tượng CreateDealerRequest. 
        {
            var result = await _mediator.Send(new CreateDealerCommand(request)); // Gửi lệnh tạo đại lý tới handler thông qua mediator và chờ nhận kết quả trả về.

            if (result.IsSuccess)
                return Ok(new { dealer_id = result.Value });
            else
                return BadRequest(result.Errors);
        }
    }
}
