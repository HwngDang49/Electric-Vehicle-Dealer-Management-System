using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Create
{
    public class CreateDealerHandler : IRequestHandler<CreateDealerCommand, Result<CreateDealerResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public CreateDealerHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<CreateDealerResponse>> Handle(CreateDealerCommand command, CancellationToken ct)
        {
            // Kiểm tra trùng mã đại lý
            var exists = await _db.Dealers
                .AnyAsync(d => d.Code == command.Code, ct);

            if (exists)
                return Result.Error("Dealer code already exists.");

            var dealer = _mapper.Map<Dealer>(command); // Sử dụng AutoMapper để chuyển đổi CreateDealerRequest thành đối tượng Dealer
            dealer.CreatedAt = DateTime.UtcNow; // Thiết lập thời gian tạo đại lý là thời gian hiện tại
            dealer.UpdatedAt = DateTime.UtcNow; // Thiết lập thời gian cập nhật đại lý là thời gian hiện tại

            _db.Dealers.Add(dealer);
            await _db.SaveChangesAsync(ct);

            var dealerResponse = new CreateDealerResponse
            {
                DealerId = dealer.DealerId,
                Status = dealer.Status ?? DealerStatus.Onboarding.ToString(),
                CreatedAt = DateTimeHelper.ToVietnamTime(dealer.CreatedAt),
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };

            return Result.Success(dealerResponse);
        }
    }
}
