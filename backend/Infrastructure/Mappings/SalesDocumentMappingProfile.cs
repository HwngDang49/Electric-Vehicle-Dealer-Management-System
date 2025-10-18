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
                .ForMember(d => d.TotalAmount, o => o.MapFrom(s => s.TotalAmount));

            // Entity -> Details DTO (bao gồm items)
            CreateMap<Quote, GetQuoteDetailDto>()
                .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer.FullName))
                .ForMember(d => d.Items, o => o.MapFrom(s => s.QuoteItems));

            CreateMap<QuoteItem, GetQuoteItemDto>()
                .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product.Name));

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
                .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer.FullName))
                .ForMember(d => d.CustomerPhone, o => o.MapFrom(s => s.Customer.Phone))
                .ForMember(d => d.VehicleName, o => o.MapFrom(s => s.OrderItems.FirstOrDefault() != null ? s.OrderItems.First().Product.Name : ""))
                .ForMember(d => d.VehicleColor, o => o.MapFrom(s => s.OrderItems.FirstOrDefault() != null ? s.OrderItems.First().Product.ColorName : ""))
                .ForMember(d => d.Amount, o => o.MapFrom(s => s.TotalAmount));

            // Entity -> Details DTO (sử dụng GetOrderDetailDto có sẵn)
            CreateMap<Order, GetOrderDetailDto>()
                .ForMember(d => d.OrderCode, o => o.MapFrom(s => $"DH{s.CreatedAt:yyyyMMdd}-{s.OrderId}"))
                .ForMember(d => d.Customer, o => o.MapFrom(s => s.Customer))
                .ForMember(d => d.Item, o => o.MapFrom(s => s.OrderItems.FirstOrDefault()));

            // Customer -> OrderCustomerDto
            CreateMap<Customer, OrderCustomerDto>()
                .ForMember(d => d.FullName, o => o.MapFrom(s => s.FullName))
                .ForMember(d => d.Phone, o => o.MapFrom(s => s.Phone))
                .ForMember(d => d.Email, o => o.MapFrom(s => s.Email))
                .ForMember(d => d.Address, o => o.MapFrom(s => s.Address));

            // OrderItem -> OrderItemDto
            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product.Name))
                .ForMember(d => d.ProductColor, o => o.MapFrom(s => s.Product.ColorName))
                .ForMember(d => d.Quantity, o => o.MapFrom(s => s.Qty))
                .ForMember(d => d.LinePromo, o => o.MapFrom(s => s.LinePromo ?? 0))
                .ForMember(d => d.LineTotal, o => o.MapFrom(s => s.LineTotal ?? 0));
        }
    }
}