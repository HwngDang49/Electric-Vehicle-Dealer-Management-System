using Ardalis.Result;
using AutoMapper;
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

            //Tự động tìm VIN phù hợp cho từng sản phẩm trong đơn hàng
            var allocatedVins = new List<string>();
            var errors = new List<string>();

            foreach (var orderItem in order.OrderItems)
            {
                // Tìm VIN có sẵn cho sản phẩm này
                var availableVin = await _dbContext.Inventories
                    .Include(v => v.Product)
                    .Where(v => v.DealerId == order.DealerId
                            && v.ProductId == orderItem.ProductId
                            && v.Status == "InStock"
                            && v.OrderId == null) // Chưa được gán
                    .FirstOrDefaultAsync(ct);

                if (availableVin == null)
                {
                    errors.Add($"No available VIN found for product {orderItem.ProductId}");
                    continue;
                }

                // Gán VIN cho đơn hàng
                availableVin.Status = "Allocated";
                availableVin.OrderId = req.OrderId;
                availableVin.OwnerType = "Dealer";
                availableVin.OwnerId = order.CustomerId;
                availableVin.ReceivedAt = DateTime.UtcNow;

                allocatedVins.Add(availableVin.Vin);
            }

            // Kiểm tra có lỗi không
            if (errors.Any())
            {
                return Result.Error($"Allocation failed: {string.Join(", ", errors)}");
            }

            if (!allocatedVins.Any())
            {
                return Result.Error("No VIN was allocated");
            }

            // BƯỚC 3: Thực hiện gán VIN với transaction để đảm bảo tính nhất quán dữ liệu
            using var transaction = await _dbContext.Database.BeginTransactionAsync(ct);
            try
            {
                // Kiểm tra CustomerId có hợp lệ không (CustomerId là long, không nullable)
                if (order.CustomerId <= 0)
                {
                    return Result.Error("Order does not have a valid customer ID");
                }

                // Cập nhật trạng thái đơn hàng: từ "đã xác nhận" sang "đã phân bổ VIN"
                order.Status = OrderStatus.Allocated.ToString();
                order.UpdatedAt = DateTime.UtcNow;

                // Lưu tất cả thay đổi vào database
                await _dbContext.SaveChangesAsync(ct);

                // Xác nhận transaction (commit) - hoàn tất giao dịch
                await transaction.CommitAsync(ct);

                // Tạo thông báo kết quả
                var vinsList = string.Join(", ", allocatedVins);
                var noteText = !string.IsNullOrEmpty(req.Note) ? $" (Note: {req.Note})" : "";

                return Result.Success($"Successfully allocated {allocatedVins.Count} VIN to Order {req.OrderId}: {vinsList}{noteText}");
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
