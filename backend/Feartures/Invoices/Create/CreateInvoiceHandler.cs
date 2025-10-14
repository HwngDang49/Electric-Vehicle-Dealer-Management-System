using Ardalis.Result;
using AutoMapper;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Infrastructure.Data;
using backend.Infrastructure.Mappings;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Invoices.Create
{
    public record CreateInvoiceCommand(CreateInvoiceRequest Request, long CurrentId) : IRequest<Result<long>>;
    public class CreateInvoiceHandler : IRequestHandler<CreateInvoiceCommand, Result<long>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public CreateInvoiceHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Result<long>> Handle(CreateInvoiceCommand cmd, CancellationToken ct)
        {
            var req = cmd.Request;

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

            if (po.Status != "Approved")
            {
                return Result.Invalid(new ValidationError { Identifier = "PO", ErrorMessage = "PO need stay Approved to create Invoices" });
            }

            // kiểm tra xem sale docId
            var retailOrder = await _dbContext.SalesDocuments
                                .Include(r => r.SalesDocumentItems)
                                .FirstOrDefaultAsync(r => r.SalesDocId == req.SaleDocId, ct);

            if (retailOrder == null)
                return Result.NotFound($"Purchare Order {req.SaleDocId} not found");

            if (retailOrder.DealerId != req.DealerId)
            {
                return Result.Error($"DealerId not match with Purchase order");
            }

            //kiểm tra trong po có hàng không
            if (po.PoItems == null || po.PoItems.Count == 0)
                return Result.Invalid(new ValidationError { Identifier = "PO", ErrorMessage = "PO not exist product" });


            // kiểm tra xem poID đó đã có invoice chưa
            // có rồi thì quăng lỗi => po has been haved invoiced
            var invoiceExists = _dbContext.Invoices.FirstOrDefault(i => i.PoId == req.PoId);
            if (invoiceExists != null)
                return Result.Error("po has been haved invoiced");

            long? salesDocId = null;
            long? poId = null;
            // tạo để xem invoice đó sẽ thuộc loại nào 
            var invoiceType = MapInvoiceType(req.Type);

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

            // tạo subTotal để gán amount

            decimal? subTotal = 0;

            foreach (var item in po.PoItems)
            {
                var line = item.LineTotal;
                if (line < 0) line = 0;
                subTotal += line;
            }

            var amount = subTotal;
            if (amount <= 0) return Result.Error("PO total is zero. Nothing to invoice.");
            // Khởi tạo Invoice

            var invoice = new Invoice
            {
                InvoiceType = invoiceType,
                InvoiceNo = await GenerateInvoiceNoAsync(ct),
                DealerId = req.DealerId,
                SalesDocId = salesDocId, // null khi type B2B
                PoId = poId, // null khi Retail
                Currency = "VND",
                Amount = amount ?? 0,
                IssuedAt = DateTime.UtcNow,
                DueAt = DateTime.UtcNow
            };

            //foreach (var item in req.Payments)
            //{
            //    invoice.Payments.Add(new Payment
            //    {
            //        Amount = amount ?? 0, // gán cho = 0 nếu là null 
            //        CreatedBy = cmd.CurrentId,
            //        Status = item.Status.ToString(),
            //        Method = item.Method.ToString(),
            //        PaidAt = item.PaidAtUtc ?? DateTime.UtcNow,
            //        Note = invoice.Note
            //    });
            //}

            _dbContext.Invoices.Add(invoice);
            await _dbContext.SaveChangesAsync(ct);

            return Result.Success(invoice.InvoiceId);
        }
        private async Task<string> GenerateInvoiceNoAsync(CancellationToken ct)
        {
            var y = DateTime.UtcNow.Year;
            var m = DateTime.UtcNow.Month;
            var prefix = $"INV-{y}{m:00}-";
            var count = await _dbContext.Invoices
                .CountAsync(i => i.IssuedAt.Year == y && i.IssuedAt.Month == m, ct);
            return $"{prefix}{(count + 1).ToString().PadLeft(6, '0')}";
        }
        private static string MapInvoiceType(InvoiceType t)
        {
            return t switch
            {
                InvoiceType.B2B => "B2B",
                InvoiceType.Retail => "Retail",
                _ => throw new ArgumentOutOfRangeException(nameof(t), $"Unsupported: {t}")
            };
        }
    }
}
