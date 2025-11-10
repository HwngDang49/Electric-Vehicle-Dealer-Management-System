using Ardalis.Result;
using backend.Common.Helpers;
using backend.Common.Services;
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
        private readonly StatusValidationService _statusValidationService;

        public UpdatePricebookStatusHandler(EVDmsDbContext db, StatusValidationService statusValidationService)
        {
            _db = db;
            _statusValidationService = statusValidationService;
        }

        public async Task<Result> Handle(UpdatePricebookStatusCommand cmd, CancellationToken ct)
        {
            var pricebook = await _db.Pricebooks
                .Include(p => p.PricebookItems)
                .FirstOrDefaultAsync(p => p.PricebookId == cmd.PricebookId, ct);

            if (pricebook == null)
            {
                return Result.NotFound($"Không tìm thấy bảng giá với ID {cmd.PricebookId}");
            }

            // Business Rule: Validate khi activate pricebook
            if (cmd.Request.Status == PricebookStatus.Active)
            {
                // 0. Kiểm tra pricebook đã đến ngày hiệu lực chưa
                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                if (pricebook.EffectiveFrom > today)
                {
                    return Result.Error($"Không thể kích hoạt bảng giá! Bảng giá này có ngày bắt đầu là {pricebook.EffectiveFrom:dd/MM/yyyy}, chưa đến ngày hiệu lực. Chỉ có thể kích hoạt khi đã đến ngày bắt đầu.");
                }

                // ✅ Validate Dealer status = Live (nếu có DealerId) before activation
                if (pricebook.DealerId.HasValue)
                {
                    var dealerValidation = await _statusValidationService.ValidateDealerForActivation(pricebook.DealerId.Value, ct);
                    if (!dealerValidation.IsSuccess)
                        return dealerValidation;
                }

                // 4. Business Rule: Deactivate pricebook khác khi có overlap thời gian
                // Pricebook đã đến ngày hiệu lực nên check overlap và inactive nếu cần
                var activePricebooks = await _db.Pricebooks
                    .Where(p => p.DealerId == pricebook.DealerId &&
                               p.Status == PricebookStatus.Active.ToString() &&
                               p.PricebookId != cmd.PricebookId)
                    .ToListAsync(ct);

                foreach (var activePb in activePricebooks)
                {
                    // Kiểm tra overlap: chỉ inactive nếu có overlap thời gian
                    var newStart = pricebook.EffectiveFrom;
                    var newEnd = pricebook.EffectiveTo ?? DateOnly.MaxValue;
                    var oldStart = activePb.EffectiveFrom;
                    var oldEnd = activePb.EffectiveTo ?? DateOnly.MaxValue;

                    // Overlap nếu: (newStart <= oldEnd) AND (newEnd >= oldStart)
                    if (newStart <= oldEnd && newEnd >= oldStart)
                    {
                        activePb.Status = PricebookStatus.Inactive.ToString();
                    }
                }
            }

            pricebook.Status = cmd.Request.Status.ToString();
            pricebook.UpdatedAt = DateTimeHelper.UtcNow();
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
    }
}
