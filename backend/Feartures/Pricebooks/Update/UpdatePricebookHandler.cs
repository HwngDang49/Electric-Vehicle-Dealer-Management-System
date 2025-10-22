using Ardalis.Result;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.Update
{
    // Command để update tên
    public record UpdatePricebookNameCommand(long PricebookId, UpdatePricebookNameRequest Request) : IRequest<Result>;
    
    // Command để update status
    public record UpdatePricebookStatusCommand(long PricebookId, UpdatePricebookStatusRequest Request) : IRequest<Result>;

    // Handler cho update tên
    public class UpdatePricebookNameHandler : IRequestHandler<UpdatePricebookNameCommand, Result>
    {
        private readonly EVDmsDbContext _db;

        public UpdatePricebookNameHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result> Handle(UpdatePricebookNameCommand cmd, CancellationToken ct)
        {
            var pricebook = await _db.Pricebooks
                .FirstOrDefaultAsync(p => p.PricebookId == cmd.PricebookId, ct);

            if (pricebook == null)
            {
                return Result.NotFound($"Không tìm thấy bảng giá với ID {cmd.PricebookId}");
            }

            // Check duplicate name
            var existingName = await _db.Pricebooks
                .AnyAsync(p => p.Name == cmd.Request.Name && 
                              p.PricebookId != cmd.PricebookId &&
                              p.DealerId == pricebook.DealerId, ct);

            if (existingName)
            {
                return Result.Error($"Đã tồn tại bảng giá với tên '{cmd.Request.Name}'");
            }

            pricebook.Name = cmd.Request.Name;
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }

    // Handler cho update status
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
