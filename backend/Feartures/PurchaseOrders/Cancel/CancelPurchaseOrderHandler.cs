using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.Cancel;

public sealed class CancelPurchaseOrderHandler : IRequestHandler<CancelPurchaseOrderCommand, Result>
{
    private readonly EVDmsDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CancelPurchaseOrderHandler(EVDmsDbContext db, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result> Handle(CancelPurchaseOrderCommand request, CancellationToken ct)
    {
        var userRole = _httpContextAccessor.HttpContext!.User.GetRole();
        long? dealerId = null;

        // EVM Staff có thể hủy đơn hàng của bất kỳ dealer nào
        // DealerManager/DealerStaff chỉ có thể hủy đơn hàng của dealer mình
        if (userRole == "EVMStaff")
        {
            // EVM Staff không cần check dealerId
            dealerId = null; // Không filter theo dealerId
        }
        else if (userRole == "DealerManager" || userRole == "DealerStaff")
        {
            dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
        }
        else
        {
            return Result.Forbidden("Chỉ EVMStaff, DealerManager hoặc DealerStaff mới có thể hủy đơn hàng.");
        }

        var poQuery = _db.PurchaseOrders.Where(p => p.PoId == request.PoId);
        
        // Nếu không phải EVM Staff, filter theo dealerId
        if (dealerId.HasValue)
        {
            poQuery = poQuery.Where(p => p.DealerId == dealerId.Value);
        }
        
        var po = await poQuery.FirstOrDefaultAsync(ct);

        if (po is null)
        {
            return Result.NotFound($"Không tìm thấy Đơn hàng #{request.PoId}.");
        }

        // Chỉ có thể hủy đơn hàng ở trạng thái Submit (Đã gửi)
        if (po.Status != POStatus.Submit.ToString())
        {
            return Result.Error($"Không thể hủy đơn hàng có trạng thái là '{po.Status}'. Chỉ có thể hủy đơn hàng ở trạng thái 'Submit' (Đã gửi).");
        }

        po.Status = POStatus.Cancel.ToString();
        po.UpdateAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return Result.Success();
    }
}

