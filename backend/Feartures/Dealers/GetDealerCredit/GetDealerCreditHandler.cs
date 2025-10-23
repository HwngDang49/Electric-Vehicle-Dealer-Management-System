using Ardalis.Result;
using MediatR;
using Microsoft.EntityFrameworkCore;
using backend.Infrastructure.Data;

namespace backend.Feartures.Dealers.GetDealerCredit
{
    public class GetDealerCreditHandler : IRequestHandler<GetDealerCreditQuery, Result<DealerCreditDto>>
    {
        private readonly EVDmsDbContext _context;

        public GetDealerCreditHandler(EVDmsDbContext context)
        {
            _context = context;
        }

        public async Task<Result<DealerCreditDto>> Handle(GetDealerCreditQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var dealer = await _context.Dealers
                    .Where(d => d.DealerId == request.DealerId)
                    .FirstOrDefaultAsync(cancellationToken);

                if (dealer == null)
                {
                    return Result.NotFound($"Dealer with ID {request.DealerId} not found");
                }

                var creditDto = new DealerCreditDto
                {
                    DealerId = dealer.DealerId,
                    CreditLimit = dealer.CreditLimit,
                    CreditUsed = dealer.CreditUsed,
                    CreditAvailable = dealer.CreditLimit - dealer.CreditUsed,
                    DealerName = dealer.Name ?? string.Empty
                };

                return Result.Success(creditDto);
            }
            catch (Exception ex)
            {
                return Result.Error($"Error fetching dealer credit information: {ex.Message}");
            }
        }
    }
}
