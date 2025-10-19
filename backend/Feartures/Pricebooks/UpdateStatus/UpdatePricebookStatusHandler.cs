using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.UpdateStatus
{
    public sealed class UpdatePricebookStatusHandler : IRequestHandler<UpdatePricebookStatusCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public UpdatePricebookStatusHandler(EVDmsDbContext db) => _db = db;

        public async Task<Result> Handle(UpdatePricebookStatusCommand request, CancellationToken ct)
        {
            var pricebook = await _db.Pricebooks.FirstOrDefaultAsync(p => p.PricebookId == request.PricebookId, ct);

            if (pricebook is null)
            {
                return Result.NotFound($"Pricebook with ID {request.PricebookId} not found.");
            }

            // Business Rule: Nếu đang set thành Active, phải deactivate tất cả pricebook khác
            if (request.Status == PricebookStatus.Active)
            {
                var activePricebooks = await _db.Pricebooks
                    .Where(p => p.Status == PricebookStatus.Active.ToString())
                    .ToListAsync(ct);

                foreach (var activePb in activePricebooks)
                {
                    activePb.Status = PricebookStatus.Inactive.ToString();
                }
            }

            pricebook.Status = request.Status.ToString();

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
