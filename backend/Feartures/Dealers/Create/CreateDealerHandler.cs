using Ardalis.Result;
using AutoMapper;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Create
{
    public record CreateDealerCommand(CreateDealerRequest Request) : IRequest<Result<long>>; // Tạo một lệnh (command) để tạo đại lý mới, chứa thông tin yêu cầu trong đối tượng CreateDealerRequest và trả về kết quả là ID của đại lý mới được tạo (kiểu long) hoặc lỗi nếu có.

    public class CreateDealerHandler : IRequestHandler<CreateDealerCommand, Result<long>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public CreateDealerHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<long>> Handle(CreateDealerCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request; // Lấy thông tin yêu cầu từ lệnh (command)

            // Kiểm tra trùng mã đại lý
            var exists = await _db.Dealers
                .AnyAsync(d => d.Code == req.Code, ct);

            if (exists)
                return Result.Error("Dealer code already exists.");

            var dealer = _mapper.Map<Dealer>(req); // Sử dụng AutoMapper để chuyển đổi CreateDealerRequest thành đối tượng Dealer
            dealer.CreatedAt = DateTime.UtcNow; // Thiết lập thời gian tạo đại lý là thời gian hiện tại
            dealer.UpdatedAt = DateTime.UtcNow; // Thiết lập thời gian cập nhật đại lý là thời gian hiện tại

            _db.Dealers.Add(dealer);
            await _db.SaveChangesAsync(ct);

            return Result.Success(dealer.DealerId);
        }
    }
}
