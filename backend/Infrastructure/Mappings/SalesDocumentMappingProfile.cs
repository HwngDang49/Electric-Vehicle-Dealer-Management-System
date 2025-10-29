using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.SalesDocuments.Orders.CreateOrder;
using backend.Feartures.SalesDocuments.Orders.GetOrderDetail;
using backend.Feartures.SalesDocuments.Orders.GetOrders;
using backend.Feartures.SalesDocuments.Quotes.CreateQuote;
using backend.Feartures.SalesDocuments.Quotes.GetQuoteDetails;
using backend.Feartures.SalesDocuments.Quotes.GetQuotes;

namespace backend.Infrastructure.Mappings
{
    public sealed class SalesDocumentMappingProfile : Profile
    {
        public SalesDocumentMappingProfile()
        {
            // CreateQuote -> Quote
            CreateMap<CreateQuoteCommand, Quote>()
                .ForMember(d => d.QuoteId, o => o.Ignore())
                .ForMember(d => d.Status, o => o.Ignore()) // set trong handler
                .ForMember(d => d.CreatedAt, o => o.Ignore())
                .ForMember(d => d.UpdatedAt, o => o.Ignore())
                .ForMember(d => d.QuoteItems, o => o.Ignore());

            CreateMap<CreateQuoteItem, QuoteItem>()
                .ForMember(d => d.QuoteItemId, o => o.Ignore())
                .ForMember(d => d.QuoteId, o => o.Ignore())
                .ForMember(d => d.LineTotal, o => o.Ignore()); // computed column

            // Entity -> List DTO
            CreateMap<Quote, GetQuotesDto>()
                .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer.FullName))
                .ForMember(d => d.CustomerPhone, o => o.MapFrom(s => s.Customer.Phone))
                .ForMember(d => d.CustomerEmail, o => o.MapFrom(s => s.Customer.Email))
                .ForMember(d => d.CustomerAddress, o => o.MapFrom(s => s.Customer.Address))
                .ForMember(d => d.CustomerIdNumber, o => o.MapFrom(s => s.Customer.IdNumber))
                .ForMember(d => d.TotalAmount, o => o.MapFrom(s => s.TotalAmount))
                // Vehicle summary from first item (list view)
                .ForMember(d => d.ProductId,
                    o => o.MapFrom(s => s.QuoteItems != null && s.QuoteItems.Count > 0 ? s.QuoteItems.First().ProductId : (long?)null))
                .ForMember(d => d.ModelCode,
                    o => o.MapFrom(s => s.QuoteItems != null && s.QuoteItems.Count > 0 ? s.QuoteItems.First().Product.ModelCode : null))
                .ForMember(d => d.VariantCode,
                    o => o.MapFrom(s => s.QuoteItems != null && s.QuoteItems.Count > 0 ? s.QuoteItems.First().Product.VariantCode : null))
                .ForMember(d => d.ColorName,
                    o => o.MapFrom(s => s.QuoteItems != null && s.QuoteItems.Count > 0 ? s.QuoteItems.First().Product.ColorName : null))
                .ForMember(d => d.ColorCode,
                    o => o.MapFrom(s => s.QuoteItems != null && s.QuoteItems.Count > 0 ? s.QuoteItems.First().Product.ColorCode : null))
                .ForMember(d => d.BasePrice,
                    o => o.MapFrom(s => s.QuoteItems != null && s.QuoteItems.Count > 0 ? s.QuoteItems.First().UnitPrice : (decimal?)null))
                .ForMember(d => d.OemDiscountAmount,
                    o => o.MapFrom(s => s.QuoteItems != null && s.QuoteItems.Count > 0 ? s.QuoteItems.First().LinePromo : (decimal?)null))
                .ForMember(d => d.BatteryKwh,
                    o => o.MapFrom(s => s.QuoteItems != null && s.QuoteItems.Count > 0 ? s.QuoteItems.First().Product.BatteryKwh : (decimal?)null))
                .ForMember(d => d.MotorKw,
                    o => o.MapFrom(s => s.QuoteItems != null && s.QuoteItems.Count > 0 ? s.QuoteItems.First().Product.MotorKw : (decimal?)null))
                .ForMember(d => d.RangeKm,
                    o => o.MapFrom(s => s.QuoteItems != null && s.QuoteItems.Count > 0 ? s.QuoteItems.First().Product.RangeKm : (decimal?)null));

            // Entity -> Details DTO (bao gồm items)
            CreateMap<Quote, GetQuoteDetailDto>()
                .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer.FullName))
                .ForMember(d => d.CustomerPhone, o => o.MapFrom(s => s.Customer.Phone))
                .ForMember(d => d.CustomerEmail, o => o.MapFrom(s => s.Customer.Email))
                .ForMember(d => d.CustomerAddress, o => o.MapFrom(s => s.Customer.Address))
                .ForMember(d => d.CustomerIdNumber, o => o.MapFrom(s => s.Customer.IdNumber))
                .ForMember(d => d.Items, o => o.MapFrom(s => s.QuoteItems));

            CreateMap<QuoteItem, GetQuoteItemDto>()
                .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product.Name))
                .ForMember(d => d.ModelCode, o => o.MapFrom(s => s.Product.ModelCode))
                .ForMember(d => d.VariantCode, o => o.MapFrom(s => s.Product.VariantCode))
                .ForMember(d => d.ColorName, o => o.MapFrom(s => s.Product.ColorName))
                .ForMember(d => d.ColorCode, o => o.MapFrom(s => s.Product.ColorCode))
                .ForMember(d => d.BatteryKwh, o => o.MapFrom(s => s.Product.BatteryKwh))
                .ForMember(d => d.MotorKw, o => o.MapFrom(s => s.Product.MotorKw))
                .ForMember(d => d.RangeKm, o => o.MapFrom(s => s.Product.RangeKm));

            //CreateOrderMapping
            CreateMap<CreateOrderCommand, Order>()
               .ForMember(dest => dest.OrderId, opt => opt.Ignore())
               .ForMember(dest => dest.DealerId, opt => opt.Ignore())
               .ForMember(dest => dest.Status, opt => opt.Ignore())
               .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
               .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
               .ForMember(dest => dest.OrderItems, opt => opt.Ignore());

            // Entity -> List DTO (sử dụng GetOrdersListItemDto có sẵn)
            CreateMap<Order, GetOrdersListItemDto>()
                .ForMember(d => d.OrderCode, o => o.MapFrom(s => s.OrderId.ToString()))
                .ForMember(d => d.QuoteId, o => o.MapFrom(s => s.QuoteId))
                .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer.FullName))
                .ForMember(d => d.CustomerPhone, o => o.MapFrom(s => s.Customer.Phone))
                .ForMember(d => d.CustomerEmail, o => o.MapFrom(s => s.Customer.Email))
                .ForMember(d => d.VehicleName, o => o.MapFrom(s => s.OrderItems.FirstOrDefault() != null ? s.OrderItems.First().Product.Name : ""))
                .ForMember(d => d.VehicleColor, o => o.MapFrom(s => s.OrderItems.FirstOrDefault() != null ? s.OrderItems.First().Product.ColorName : ""))
                .ForMember(d => d.Amount, o => o.MapFrom(s => s.TotalAmount))
                .ForMember(d => d.HasContract, o => o.MapFrom(s => s.Contracts.Any()))
                .ForMember(d => d.AllocatedVin, o => o.MapFrom(s => s.Inventories.FirstOrDefault() != null ? s.Inventories.First().Vin : null))
                .ForMember(d => d.ContractNumber, o => o.MapFrom(s => s.Contracts.FirstOrDefault() != null ? s.Contracts.First().ContractNo : null))
                .ForMember(d => d.DepositAmount, o => o.MapFrom(s => s.DepositAmount))
                .ForMember(d => d.DepositRequirement, o => o.MapFrom(s => s.DepositRequirement));

            // Entity -> Details DTO (sử dụng GetOrderDetailDto có sẵn)
            CreateMap<Order, GetOrderDetailDto>()
                .ForMember(d => d.OrderCode, o => o.MapFrom(s => $"DH{s.CreatedAt:yyyyMMdd}-{s.OrderId}"))
                .ForMember(d => d.Customer, o => o.MapFrom(s => s.Customer))
                .ForMember(d => d.Item, o => o.MapFrom(s => s.OrderItems.FirstOrDefault()))
                .ForMember(d => d.DepositRequirement, o => o.MapFrom(s => s.DepositRequirement))
                .ForMember(d => d.DeliveredAt, o => o.MapFrom(s => s.DeliveredAt))
                .ForMember(d => d.Contract, o => o.MapFrom(s => s.Contracts.FirstOrDefault()));

            // Customer -> OrderCustomerDto
            CreateMap<Customer, OrderCustomerDto>()
                .ForMember(d => d.FullName, o => o.MapFrom(s => s.FullName))
                .ForMember(d => d.Phone, o => o.MapFrom(s => s.Phone))
                .ForMember(d => d.Email, o => o.MapFrom(s => s.Email))
                .ForMember(d => d.IdNumber, o => o.MapFrom(s => s.IdNumber))
                .ForMember(d => d.Address, o => o.MapFrom(s => s.Address));

            // OrderItem -> OrderItemDto
            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product.Name))
                .ForMember(d => d.ProductColor, o => o.MapFrom(s => s.Product.ColorName))
                .ForMember(d => d.ModelCode, o => o.MapFrom(s => s.Product.ModelCode))
                .ForMember(d => d.ColorCode, o => o.MapFrom(s => s.Product.ColorCode))
                .ForMember(d => d.BatteryKwh, o => o.MapFrom(s => s.Product.BatteryKwh))
                .ForMember(d => d.MotorKw, o => o.MapFrom(s => s.Product.MotorKw))
                .ForMember(d => d.RangeKm, o => o.MapFrom(s => s.Product.RangeKm))
                .ForMember(d => d.Quantity, o => o.MapFrom(s => s.Qty))
                .ForMember(d => d.LinePromo, o => o.MapFrom(s => s.LinePromo))
                .ForMember(d => d.LineTotal, o => o.MapFrom(s => s.LineTotal ?? 0));

            // Contract -> OrderContractDto
            CreateMap<Contract, OrderContractDto>()
                .ForMember(d => d.ContractId, o => o.MapFrom(s => s.ContractId))
                .ForMember(d => d.ContractNo, o => o.MapFrom(s => s.ContractNo))
                .ForMember(d => d.FileUrl, o => o.MapFrom(s => s.FileUrl))
                .ForMember(d => d.SignedAt, o => o.MapFrom(s => s.SignedAt));
        }
    }
}