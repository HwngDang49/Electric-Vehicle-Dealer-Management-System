using Ardalis.Result;
using AutoMapper;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.Update
{
    public class UpdateDealerHandler : IRequestHandler<UpdateDealerCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;
        public UpdateDealerHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result> Handle(UpdateDealerCommand request, CancellationToken ct)
        {
            var dealer = await _db.Dealers.FirstOrDefaultAsync(d => d.DealerId == request.DealerId, ct);
            if (dealer is null) return Result.NotFound($"Dealer {request.DealerId} not found.");

            // Debug: Log the request data
            Console.WriteLine($"UpdateDealerHandler: DealerId={request.DealerId}, Status={request.Body.Status}");

            // check trùng code
            if (!string.IsNullOrWhiteSpace(request.Body.Code) && !string.Equals(request.Body.Code, dealer.Code, StringComparison.Ordinal))
            {
                var codeExists = await _db.Dealers.AnyAsync(d => d.Code == request.Body.Code, ct); // check trùng code d.code == b.code có nghĩa là có dealer nào có code trùng với code mới không
                if (codeExists) return Result.Error("Dealer code already exists.");
                dealer.Code = request.Body.Code!;
            }

            // Map all properties from request to dealer entity
            _mapper.Map(request.Body, dealer); //chỉ map những property có trong request.Body và khác null
            
            // Ensure Status is properly set if provided
            if (!string.IsNullOrWhiteSpace(request.Body.Status))
            {
                dealer.Status = request.Body.Status;
                Console.WriteLine($"UpdateDealerHandler: Status updated to {dealer.Status}");
            }

            dealer.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);
            Console.WriteLine($"UpdateDealerHandler: Dealer {request.DealerId} updated successfully");
            return Result.Success();
        }
    }
}
