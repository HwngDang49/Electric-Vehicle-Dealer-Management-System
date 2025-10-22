using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.Update
{
    // Command để update status (quick action)
    public record UpdatePricebookStatusCommand(long PricebookId, UpdatePricebookStatusRequest Request) : IRequest<Result>;

    /// <summary>
    /// Handler cho update status - Quick action để chỉ thay đổi trạng thái
    /// Tự động deactivate các pricebook khác của cùng dealer khi set Active
    /// </summary>
    public class UpdatePricebookStatusHandler : IRequestHandler<UpdatePricebookStatusCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public UpdatePricebookStatusHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(UpdatePricebookStatusCommand cmd, CancellationToken ct)
        {
            var pricebook = await _db.Pricebooks
                .FirstOrDefaultAsync(p => p.PricebookId == cmd.PricebookId, ct);

            if (pricebook == null)
            {
                return Result.NotFound($"Không tìm thấy bảng giá với ID {cmd.PricebookId}");
            }

            // Business Rule: Nếu đang set thành Active, phải deactivate tất cả pricebook khác của cùng dealer
            if (cmd.Request.Status == PricebookStatus.Active)
            {
                var activePricebooks = await _db.Pricebooks
                    .Where(p => p.DealerId == pricebook.DealerId &&
                               p.Status == PricebookStatus.Active.ToString() &&
                               p.PricebookId != cmd.PricebookId)
                    .ToListAsync(ct);

                foreach (var activePb in activePricebooks)
                {
                    activePb.Status = PricebookStatus.Inactive.ToString();
                }
            }

            pricebook.Status = cmd.Request.Status.ToString();
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
