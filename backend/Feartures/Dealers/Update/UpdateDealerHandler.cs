using Ardalis.Result;
using AutoMapper;
using backend.Common.Helpers;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Update
{
    public class UpdateDealerHandler : IRequestHandler<UpdateDealerCommand, Result<UpdateDealerResponse>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        public UpdateDealerHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<UpdateDealerResponse>> Handle(UpdateDealerCommand command, CancellationToken ct)
        {
            var dealer = await _db.Dealers.FirstOrDefaultAsync(d => d.DealerId == command.DealerId, ct);

            if (dealer is null) return Result.NotFound($"Dealer {command.DealerId} not found.");


            if (!string.IsNullOrWhiteSpace(command.Body.Code) && !string.Equals(command.Body.Code, dealer.Code, StringComparison.Ordinal))
            {
                var codeExists = await _db.Dealers.AnyAsync(d => d.Code == command.Body.Code, ct);
                if (codeExists) return Result.Error("Dealer code already exists.");
                dealer.Code = command.Body.Code!;
            }

            _mapper.Map(command.Body, dealer); //chỉ map những property có trong Body và khác null


            if (!string.IsNullOrWhiteSpace(command.Body.Status))
            {
                dealer.Status = command.Body.Status;
            }

            dealer.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            var response = new UpdateDealerResponse
            {
                DealerId = dealer.DealerId,
                LastUpdatedAt = DateTimeHelper.ToVietnamTime(dealer.UpdatedAt)
            };

            return Result.Success(response);
        }
    }
}
