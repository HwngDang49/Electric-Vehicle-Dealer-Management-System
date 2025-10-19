using Ardalis.Result;
using AutoMapper;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.SalesDocuments.Orders.AllocateVin
{
    public record AllocateVinToToCommand(AllocateVinToRoRequest Request) : IRequest<Result<string>>;

    public class AllocateVinToRoHandler : IRequestHandler<AllocateVinToToCommand, Result<string>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public AllocateVinToRoHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Result<string>> Handle(AllocateVinToToCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // BƯỚC 1: Kiểm tra đơn hàng có tồn tại không
            var order = await _dbContext.Orders
                .Include(o => o.OrderItems) // Lấy cả danh sách sản phẩm trong đơn hàng
                .FirstOrDefaultAsync(o => o.OrderId == req.OrderId, ct);

            if (order == null)
            {
                return Result.NotFound($"Order {req.OrderId} was not found!!!");
            }

            // Kiểm tra trạng thái đơn hàng - chỉ cho phép gán VIN khi đơn hàng đã xác nhận hoặc backorder
            if (order.Status != OrderStatus.Confirmed.ToString()
                && order.Status != OrderStatus.Backordered.ToString())
            {
                return Result.Error("Order status must be Confirmed or Backorder");
            }

            // BƯỚC 2: Tìm VIN trong kho hàng
            var vin = await _dbContext.Inventories
                .Include(v => v.Product) // Lấy thông tin sản phẩm của VIN
                .FirstOrDefaultAsync(v => v.Vin == req.VinCode, ct);

            // Kiểm tra VIN có tồn tại trong hệ thống không
            if (vin == null)
            {
                return Result.NotFound($"Vincode {req.VinCode} was not found in inventory");
            }

            // BƯỚC 3: Kiểm tra VIN có thuộc về đại lý này không
            if (vin.DealerId != order.DealerId)
            {
                return Result.Error($"Vin not match with dealer {order.DealerId}");
            }

            // BƯỚC 4: Kiểm tra VIN có đang ở trạng thái "còn hàng" để gán không
            if (vin.Status != "InStock")
            {
                return Result.Error($"Vin was used (Status: {vin.Status})");
            }

            // BƯỚC 5: Kiểm tra VIN đã được gán cho đơn hàng này chưa (tránh trùng lặp)
            var existingAllocation = await _dbContext.Inventories
                .AnyAsync(i => i.OrderId == req.OrderId && i.Vin == req.VinCode, ct);

            if (existingAllocation)
            {
                return Result.Error($"VIN {req.VinCode} is already allocated to this order");
            }

            // BƯỚC 6: Xác định dòng sản phẩm trong đơn hàng để gán VIN
            OrderItem? targetOrderItem = null;

            if (req.OrderLineId.HasValue)
            {
                // TRƯỜNG HỢP 1: Người dùng chỉ định rõ dòng sản phẩm cần gán VIN
                targetOrderItem = await _dbContext.OrderItems
                    .FirstOrDefaultAsync(oi => oi.OrderItemId == req.OrderLineId
                                        && oi.OrderId == req.OrderId, ct);

                if (targetOrderItem == null)
                {
                    return Result.NotFound($"Order item {req.OrderLineId} not found");
                }

                // Kiểm tra sản phẩm của VIN có khớp với dòng đơn hàng không
                if (targetOrderItem.ProductId != vin.ProductId)
                {
                    return Result.Error("Product VIN not match with Order Line.");
                }
            }
            else
            {
                // TRƯỜNG HỢP 2: Tự động tìm dòng sản phẩm phù hợp theo ProductId
                targetOrderItem = order.OrderItems
                    .FirstOrDefault(oi => oi.ProductId == vin.ProductId);

                if (targetOrderItem == null)
                {
                    return Result.Error($"No order item found    product {vin.ProductId}");
                }
            }

            // BƯỚC 7: Thực hiện gán VIN với transaction để đảm bảo tính nhất quán dữ liệu
            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
            try
            {
                // Kiểm tra CustomerId có hợp lệ không (CustomerId là long, không nullable)
                if (order.CustomerId <= 0)
                {
                    return Result.Error("Order does not have a valid customer ID");
                }

                // Cập nhật thông tin VIN: chuyển từ "còn hàng" sang "đã phân bổ"
                vin.Status = "Allocated";                    // Trạng thái: đã phân bổ
                vin.OrderId = req.OrderId;                   // Liên kết với đơn hàng
                vin.OwnerType = "Dealer";                    // Chủ sở hữu: vẫn là Dealer (theo constraint)
                vin.OwnerId = order.CustomerId;              // ID khách hàng (long, không nullable)
                vin.ReceivedAt = DateTime.UtcNow;            // Thời gian nhận

                // Cập nhật trạng thái đơn hàng: từ "đã xác nhận" sang "đã phân bổ VIN"
                order.Status = OrderStatus.Allocated.ToString();
                order.UpdatedAt = DateTime.UtcNow;

                // Lưu tất cả thay đổi vào database
                await _dbContext.SaveChangesAsync(ct);
                
                // Xác nhận transaction (commit) - hoàn tất giao dịch
                await transaction.CommitAsync(ct);

                return Result.Success($"VIN {req.VinCode} successfully allocated to Order {req.OrderId}");
            }
            catch (DbUpdateException dbEx)
            {
                // Nếu có lỗi xảy ra, hủy bỏ tất cả thay đổi (rollback)
                await transaction.RollbackAsync(ct);
                
                // Lấy chi tiết lỗi database
                var innerEx = dbEx.InnerException?.Message ?? dbEx.Message;
                return Result.Error($"Database error: {innerEx}");
            }
            catch (Exception ex)
            {
                // Nếu có lỗi xảy ra, hủy bỏ tất cả thay đổi (rollback)
                await transaction.RollbackAsync(ct);
                return Result.Error($"Failed to allocate VIN: {ex.Message}");
            }
        }
    }
}
