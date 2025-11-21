using Ardalis.Result;
using AutoMapper;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using backend.Infrastructure.Mappings;
using backend.Infrastructure.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Invoices.Create
{
    public record CreateInvoiceCommand(CreateInvoiceRequest Request, long CurrentId) : IRequest<Result<long>>;
    public class CreateInvoiceHandler : IRequestHandler<CreateInvoiceCommand, Result<long>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly NotificationService _notificationService;

        public CreateInvoiceHandler(EVDmsDbContext dbContext, IMapper mapper, NotificationService notificationService)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        public async Task<Result<long>> Handle(CreateInvoiceCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;



            // kiểm xem type đang ở kiểu nào
            var invoiceType = req.Type.ToString();

            long? salesDocId = null;
            long? poId = null;
            // tạo để xem invoice đó sẽ thuộc loại nào 
            //var invoiceType = MapInvoiceType(req.Type);

            if (invoiceType == "B2B")
            {
                if (req.PoId <= 0)
                    return Result.Error("PoId is require to B2B");
                poId = req.PoId; // nếu là b2b thì po phải cái id
                salesDocId = null; // còn này chỉ dành cho khách hàng thôi 
            }

            else // đối với Retail
            {
                if (req.SaleDocId <= 0)
                    return Result.Error("SaleDocId is require to Retail");
                salesDocId = req.SaleDocId;
                poId = null; // QUAN TRỌNG: để null (đừng gán 0)
            }

            // để subTotal tính tổng giá trị đơn hàng
            decimal? subTotal = 0;
            if (invoiceType == InvoiceType.B2B.ToString())
            {
                // load item trong po để tạo invoice
                var po = await _dbContext.PurchaseOrders
                                    .Include(p => p.PoItems)
                                    .FirstOrDefaultAsync(p => p.PoId == req.PoId, ct);

                // kiểm tra xem po tồn tại hong
                if (po == null)
                {
                    return Result.NotFound($"Purchare Order {req.PoId} not found");
                }

                if (po.DealerId != req.DealerId)
                {
                    return Result.Error($"DealerId not match with Purchase order");
                }

                if (po.Status != POStatus.Confirm.ToString())
                {
                    return Result.Invalid(new ValidationError { Identifier = "PO", ErrorMessage = "PO need stay Confirmed to create Invoices" });
                }
                //kiểm tra trong po có hàng không
                if (po.PoItems == null || po.PoItems.Count == 0)
                    return Result.Invalid(new ValidationError { Identifier = "PO", ErrorMessage = "PO not exist product" });

                // kiểm tra xem poID đó đã có invoice chưa
                // có rồi thì quăng lỗi => po has been haved invoiced


                var invoiceExists = await _dbContext.Invoices
                    .AsNoTracking()
                    .FirstOrDefaultAsync(i => i.PoId == req.PoId && i.InvoiceType == "B2B", ct);
                if (invoiceExists != null)
                    return Result.Success(invoiceExists.InvoiceId);

                // Validate VIN đã được allocate đủ theo từng dòng PO
                foreach (var poItem in po.PoItems)
                {
                    var allocatedCount = await _dbContext.Inventories
                        .Where(inv => inv.ProductId == poItem.ProductId
                                      && inv.OwnerType == "Manufacturer"
                                      && inv.Status == "Allocated"
                                      && inv.PoId == po.PoId)
                        .CountAsync(ct);

                    if (allocatedCount < poItem.Qty)
                    {
                        return Result.Error($"not enough allocated VIN for product {poItem.ProductId}. Required {poItem.Qty}, allocated {allocatedCount}.");
                    }
                }

                // Tính từ PoItems
                foreach (var item in po.PoItems)
                {
                    var line = item.LineTotal;
                    if (line < 0) line = 0;
                    subTotal += line;
                }

                // set creditUsed khi tạo invoice B2B 
                var dealer = await _dbContext.Dealers.FirstOrDefaultAsync(d => d.DealerId == po.DealerId, ct);
                if (dealer is null)
                    return Result.Error($"Dealer {po.DealerId} not found");
                dealer.CreditUsed += subTotal ?? 0;
            }


            if (invoiceType == InvoiceType.Retail.ToString())
            {

                // kiểm tra xem sale docId
                var retailOrder = await _dbContext.Orders
                                    .Include(r => r.OrderItems)
                                    .FirstOrDefaultAsync(r => r.OrderId == req.SaleDocId, ct);

                if (retailOrder == null)
                    return Result.NotFound($"Reatail Order {req.SaleDocId} not found");

                if (retailOrder.DealerId != req.DealerId)
                {
                    return Result.Error($"DealerId not match with Reatail order");
                }
                //kiểm tra trong po có hàng không
                if (retailOrder.OrderItems == null || retailOrder.OrderItems.Count == 0)
                    return Result.Invalid(new ValidationError
                    {
                        Identifier = "Retail",
                        ErrorMessage = "Retail order not exist product"
                    });

                // kiểm tra xem poID đó đã có invoice chưa
                // có rồi thì quăng lỗi => po has been haved invoiced
                var invoiceExists = _dbContext.Invoices.FirstOrDefault(i => i.SalesDocId == req.SaleDocId);
                if (invoiceExists != null)
                    return Result.Error("Retail order has been had invoiced");

                // Tính từ OrderItems
                foreach (var item in retailOrder.OrderItems)
                {
                    var line = item.LineTotal;
                    if (line < 0) line = 0;
                    subTotal += line;
                }
            }

            var amount = subTotal;
            if (amount <= 0) return Result.Error("PO total is zero. Nothing to invoice.");
            // Khởi tạo Invoice

            var invoice = new Invoice
            {
                InvoiceType = invoiceType,
                InvoiceNo = "INV" + DateTime.UtcNow.ToString("yyyyMMddHHmmss"),
                DealerId = req.DealerId,
                SalesDocId = salesDocId, // null khi type B2B
                PoId = poId, // null khi Retail
                Currency = "VND",
                Amount = amount ?? 0,
                Status = InvoiceStatus.Pending.ToString(),
                IssuedAt = DateTime.UtcNow,
                DueAt = DateTime.UtcNow.AddDays(30)
            };

            _dbContext.Invoices.Add(invoice);
            await _dbContext.SaveChangesAsync(ct);

            // Send notification to Dealer Manager about credit update (only for B2B invoices where CreditUsed was increased)
            if (invoiceType == "B2B" && req.DealerId > 0)
            {
                try
                {
                    var dealer = await _dbContext.Dealers
                        .AsNoTracking()
                        .FirstOrDefaultAsync(d => d.DealerId == req.DealerId, ct);
                    
                    if (dealer != null)
                    {
                        var creditAvailable = dealer.CreditLimit - dealer.CreditUsed;
                        await _notificationService.NotifyDealerCreditUpdated(
                            dealer.DealerId,
                            dealer.CreditLimit,
                            dealer.CreditUsed,
                            creditAvailable,
                            dealer.WalletBalance
                        );
                    }
                }
                catch (Exception ex)
                {
                    // Log error but don't fail invoice creation
                    Console.WriteLine($"[CreateInvoiceHandler] Error sending credit update notification: {ex.Message}");
                }
            }

            return Result.Success(invoice.InvoiceId);
        }
    }
}
