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
            var order = await _db.SalesDocuments.FirstOrDefaultAsync(sd =>
                sd.SalesDocId == request.SalesDocId &&
                sd.DealerId == request.DealerId &&
                sd.DocType == DocTypeEnum.Order.ToString(), ct);

            if (order is null)
                return Result.NotFound($"Order #{request.SalesDocId} not found.");

            // --- CÁC QUY TẮC NGHIỆP VỤ QUAN TRỌNG ---
            // 1. Phải có số hợp đồng rồi mới được ký
            if (string.IsNullOrWhiteSpace(order.ContractNo))
                return Result.Error("Cannot mark as signed. A contract number must be created first.");

            // 2. Không cho phép ký lại nếu đã ký rồi
            if (order.SignedAt.HasValue)
                return Result.Error($"This order was already signed at {order.SignedAt.Value}.");

            // Gán thời gian ký là thời gian UTC hiện tại của server
            order.SignedAt = DateTimeHelper.UtcNow();
            order.UpdatedAt = (DateTime)order.SignedAt;

            await _db.SaveChangesAsync(ct);

            // Trả về ngày giờ đã ký thành công
            return Result.Success(order.SignedAt.Value);
        }
    }
}
