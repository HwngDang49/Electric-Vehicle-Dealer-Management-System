using Ardalis.Result;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Contracts.SignContract
{
    public sealed class MarkAsSignedHandler : IRequestHandler<MarkAsSignedCommand, Result<DateTime>>
    {
        private readonly EVDmsDbContext _db;
        public MarkAsSignedHandler(EVDmsDbContext db) => _db = db;

        public async Task<Result<DateTime>> Handle(MarkAsSignedCommand request, CancellationToken ct)
        {
        var order = await _db.Orders.FirstOrDefaultAsync(o =>
            o.OrderId == request.OrderId &&
            o.DealerId == request.DealerId, ct);

        if (order is null)
            return Result.NotFound($"Order #{request.OrderId} not found.");

        // --- CÁC QUY TẮC NGHIỆP VỤ QUAN TRỌNG ---
        // Kiểm tra contract tồn tại
        var contract = await _db.Contracts
            .FirstOrDefaultAsync(c => c.OrderId == request.OrderId, ct);

        if (contract == null)
            return Result.NotFound($"Contract for Order #{request.OrderId} not found.");

        if (string.IsNullOrEmpty(contract.ContractNo))
            return Result.Error("Contract number is required before signing.");

        if (contract.SignedAt.HasValue)
            return Result.Error("Contract has already been signed.");

        // Cập nhật contract với thời gian ký
        var signedAt = DateTimeHelper.UtcNow();
        contract.SignedAt = signedAt;
        order.UpdatedAt = signedAt;

        await _db.SaveChangesAsync(ct);

            // Trả về ngày giờ đã ký thành công
            return Result.Success(signedAt);
        }
    }
}
