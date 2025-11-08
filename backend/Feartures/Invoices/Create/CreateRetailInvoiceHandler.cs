using Ardalis.Result;
using backend.Common.Auth;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Invoices.Create
{
    public record CreateRetailInvoiceCommand(CreateRetailInvoiceRequest Request, long CurrentUserId) : IRequest<Result<long>>;
    
    public class CreateRetailInvoiceHandler : IRequestHandler<CreateRetailInvoiceCommand, Result<long>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateRetailInvoiceHandler(EVDmsDbContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _dbContext = dbContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Result<long>> Handle(CreateRetailInvoiceCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

            // ✅ Lấy DealerId, BranchId, UserId từ JWT token
            long dealerId;
            try
            {
                dealerId = _httpContextAccessor.HttpContext!.User.GetDealerId();
            }
            catch (UnauthorizedAccessException)
            {
                return Result.Error("Dealer context is required to create retail invoice. Only DealerStaff and DealerManager can create retail invoices.");
            }

            var branchId = _httpContextAccessor.HttpContext!.User.GetBranchId();
            var userId = _httpContextAccessor.HttpContext!.User.GetUserId() ?? cmd.CurrentUserId;

            // Kiểm tra order tồn tại
            var order = await _dbContext.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.OrderId == req.OrderId, ct);

            if (order == null)
                return Result.NotFound($"Order {req.OrderId} not found");

            // ✅ Validate: Order phải thuộc về dealer của user đang đăng nhập
            if (order.DealerId != dealerId)
                return Result.Error("Order does not belong to your dealer. You can only create invoices for orders from your dealer.");

            // Kiểm tra order có items không
            if (order.OrderItems == null || order.OrderItems.Count == 0)
                return Result.Error("Order has no items");

            // Kiểm tra order đã có invoice chưa (sử dụng AsNoTracking để tối ưu)
            var existingInvoice = await _dbContext.Invoices
                .AsNoTracking()
                .FirstOrDefaultAsync(i => i.SalesDocId == req.OrderId && i.InvoiceType == "Retail", ct);
            
            if (existingInvoice != null)
                return Result.Success(existingInvoice.InvoiceId);

            // Tính tổng giá trị từ OrderItems
            decimal subTotal = 0;
            foreach (var item in order.OrderItems)
            {
                decimal lineTotal = item.LineTotal ?? 0; // Handle nullable decimal
                if (lineTotal < 0) lineTotal = 0;
                subTotal += lineTotal;
            }

            if (subTotal <= 0)
                return Result.Error("Order total is zero. Nothing to invoice.");

            // Tạo invoice với InvoiceNo unique (sử dụng GUID để đảm bảo unique)
            var timestamp = DateTime.UtcNow;
            var invoiceNo = $"INV{timestamp:yyyyMMddHHmmss}{req.OrderId:D4}{Guid.NewGuid().ToString("N")[..8]}";

            // ✅ Sử dụng BranchId từ JWT token nếu có, nếu không thì dùng từ order
            // BranchId từ token là branch của user đang tạo invoice
            // BranchId từ order là branch của order ban đầu
            // Nên dùng branchId từ token để đảm bảo invoice được tạo bởi đúng branch
            var invoiceBranchId = branchId ?? order.BranchId;

            var invoice = new Invoice
            {
                InvoiceType = "Retail",
                InvoiceNo = invoiceNo,
                DealerId = dealerId, // ✅ Lấy từ JWT token
                SalesDocId = req.OrderId,
                PoId = null,
                Currency = "VND",
                Amount = subTotal,
                Status = InvoiceStatus.Pending.ToString(),
                IssuedAt = timestamp,
                DueAt = timestamp.AddDays(30),
                BranchId = invoiceBranchId, // ✅ Ưu tiên branchId từ token, fallback về order.BranchId
                CreatedBy = userId // ✅ Sử dụng userId từ token (hoặc từ cmd.CurrentUserId nếu không có trong token)
            };

            try
            {
                _dbContext.Invoices.Add(invoice);
                await _dbContext.SaveChangesAsync(ct);
                return Result.Success(invoice.InvoiceId);
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException ex) when (ex.InnerException is Microsoft.Data.SqlClient.SqlException sqlEx && sqlEx.Number == 2627)
            {
                // Duplicate key exception - có thể invoice đã được tạo bởi request khác
                // Kiểm tra lại và trả về invoice existing
                var existingInvoiceAfterException = await _dbContext.Invoices
                    .AsNoTracking()
                    .FirstOrDefaultAsync(i => i.SalesDocId == req.OrderId && i.InvoiceType == "Retail", ct);
                
                if (existingInvoiceAfterException != null)
                    return Result.Success(existingInvoiceAfterException.InvoiceId);
                
                // Nếu vẫn không tìm thấy, throw lại exception
                throw;
            }
        }
    }
}
