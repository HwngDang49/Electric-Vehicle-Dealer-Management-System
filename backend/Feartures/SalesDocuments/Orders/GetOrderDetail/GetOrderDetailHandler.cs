using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Auth;
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

        var orderDetail = await _db.Orders
                    .AsNoTracking()
                    .Where(o => o.OrderId == request.OrderId &&
                                 o.DealerId == dealerId)
                    .ProjectTo<GetOrderDetailDto>(_mapper.ConfigurationProvider)
                    .FirstOrDefaultAsync(ct);

        if (orderDetail is null)
        {
            return Result.NotFound($"Không tìm thấy Đơn hàng #{request.OrderId}.");
        }

        // OrderCode đã được tạo tự động trong AutoMapper

        return Result.Success(orderDetail);
    }
}