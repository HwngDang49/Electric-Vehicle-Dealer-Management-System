using Ardalis.Result;
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

        public CreateDealerHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<long>> Handle(CreateDealerCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request; // Lấy thông tin yêu cầu từ lệnh (command)

            // Kiểm tra trùng mã đại lý
            var exists = await _db.Dealers
                .AnyAsync(d => d.Code == req.Code, ct);

            if (exists)
                return Result.Error("Dealer code already exists.");

            var dealer = new Dealer
            {
                Code = req.Code,
                Name = req.Name,
                CreditLimit = req.CreditLimit,
                LegalName = req.LegalName,
                TaxId = req.TaxId,
                Status = req.Status.ToString(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Dealers.Add(dealer);
            await _db.SaveChangesAsync(ct);

            return Result.Success(dealer.DealerId);
        }
    }
}
