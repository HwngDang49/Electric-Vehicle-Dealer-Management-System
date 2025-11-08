using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
using backend.Common.Helpers;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.GetOrderDetail;

public sealed class GetOrderDetailHandler : IRequestHandler<GetOrderDetailQuery, Result<GetOrderDetailDto>>
{
    private readonly EVDmsDbContext _db;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public GetOrderDetailHandler(EVDmsDbContext db, IMapper mapper, IHttpContextAccessor httpContextAccessor)
    {
        _db = db;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<GetOrderDetailDto>> Handle(GetOrderDetailQuery request, CancellationToken ct)
    {
        var dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
        var branchId = _httpContextAccessor.HttpContext!.User.GetBranchId();
        var userId = _httpContextAccessor.HttpContext!.User.GetUserId();

        var orderQuery = _db.Orders
                    .AsNoTracking()
                    .Where(o => o.OrderId == request.OrderId &&
                                 o.DealerId == dealerId);
        
        // Filter theo BranchId và CreatedBy nếu user có branch
        if (branchId.HasValue)
        {
            orderQuery = orderQuery.Where(o => o.BranchId == branchId.Value);
            
            // Nếu user có userId, chỉ lấy data do user đó tạo
            if (userId.HasValue)
            {
                orderQuery = orderQuery.Where(o => o.CreatedBy == userId.Value);
            }
        }
        
        var orderDetail = await orderQuery
                    .ProjectTo<GetOrderDetailDto>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync(ct);

        if (orderDetail is null)
        {
            return Result.NotFound($"Không tìm thấy Đơn hàng #{request.OrderId}.");
        }

        // Manually populate VIN from Inventory table
        if (orderDetail.Item != null)
        {
            var inventory = await _db.Inventories
                .AsNoTracking()
                .Where(i => i.OrderId == request.OrderId && i.ProductId == orderDetail.Item.ProductId)
                .FirstOrDefaultAsync(ct);
            
            if (inventory != null)
            {
                orderDetail.Item.Vin = inventory.Vin;
            }
        }

        // Convert DateTime từ UTC sang giờ VN cho response
        orderDetail.CreatedAt = DateTimeHelper.ToVietnamTime(orderDetail.CreatedAt);
        if (orderDetail.DeliveredAt.HasValue)
        {
            orderDetail.DeliveredAt = DateTimeHelper.ToVietnamTime(orderDetail.DeliveredAt.Value);
        }
        if (orderDetail.Contract != null && orderDetail.Contract.SignedAt.HasValue)
        {
            orderDetail.Contract.SignedAt = DateTimeHelper.ToVietnamTime(orderDetail.Contract.SignedAt.Value);
        }

        return Result.Success(orderDetail);
    }
}