using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Feartures.Invoices.UpdateStatus
{
    public sealed record UpdateInvoiceStatusCommand(UpdateInvoiceStatusRequest Request, long CurrentUserId) : IRequest<Result>;

    public sealed class UpdateInvoiceStatusHandler : IRequestHandler<UpdateInvoiceStatusCommand, Result>
    {
        private readonly EVDmsDbContext _db;
        private readonly ILogger<UpdateInvoiceStatusHandler> _logger;

        public UpdateInvoiceStatusHandler(EVDmsDbContext db, ILogger<UpdateInvoiceStatusHandler> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<Result> Handle(UpdateInvoiceStatusCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;
            _logger.LogInformation("💳 Cập nhật invoice {InvoiceId} sang status {Status} bởi user {UserId}", 
                req.InvoiceId, req.Status, cmd.CurrentUserId);

            // Kiểm tra invoice tồn tại
            var invoice = await _db.Invoices
                .FirstOrDefaultAsync(i => i.InvoiceId == req.InvoiceId, ct);

            if (invoice is null)
            {
                _logger.LogWarning("❌ Invoice {InvoiceId} không tồn tại", req.InvoiceId);
                return Result.NotFound($"Invoice {req.InvoiceId} not found");
            }

            // Validate status
            if (!Enum.TryParse<InvoiceStatus>(req.Status, out var newStatus))
            {
                _logger.LogWarning("❌ Status không hợp lệ: {Status}", req.Status);
                return Result.Error($"Invalid status: {req.Status}");
            }

            var oldStatus = invoice.Status;
            invoice.Status = newStatus.ToString();

            await _db.SaveChangesAsync(ct);

            _logger.LogInformation("✅ Invoice {InvoiceId} đã chuyển từ {OldStatus} sang {NewStatus}", 
                invoice.InvoiceId, oldStatus, invoice.Status);

            return Result.Success();
        }
    }
}

