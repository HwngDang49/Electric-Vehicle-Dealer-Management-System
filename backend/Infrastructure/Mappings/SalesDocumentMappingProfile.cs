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
            // CreateQuote -> SalesDocument
            CreateMap<CreateQuoteCommand, SalesDocument>()
                .ForMember(d => d.SalesDocId, o => o.Ignore())
                .ForMember(d => d.DocType, o => o.Ignore()) // set trong handler
                .ForMember(d => d.Status, o => o.Ignore()) // set trong handler
                .ForMember(d => d.CreatedAt, o => o.Ignore())
                .ForMember(d => d.UpdatedAt, o => o.Ignore())
                .ForMember(d => d.SalesDocumentItems, o => o.Ignore());

            CreateMap<CreateQuoteItem, SalesDocumentItem>()
                .ForMember(d => d.SdiId, o => o.Ignore())
                .ForMember(d => d.SalesDocId, o => o.Ignore())
                .ForMember(d => d.LineTotal, o => o.Ignore()); // computed column

            // Entity -> List DTO
            CreateMap<SalesDocument, GetQuotesDto>()
                .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer.FullName))
                // map trực tiếp để ProjectTo dịch SQL gọn
                .ForMember(d => d.TotalAmount, o => o.MapFrom(s => s.TotalAmount));

            // Entity -> Details DTO (bao gồm items)
            CreateMap<SalesDocument, GetQuoteDetailDto>()
                .ForMember(d => d.CustomerName, o => o.MapFrom(s => s.Customer.FullName))
                .ForMember(d => d.Items, o => o.MapFrom(s => s.SalesDocumentItems));

            CreateMap<SalesDocumentItem, GetQuoteItemDto>()
                .ForMember(d => d.ProductName, o => o.MapFrom(s => s.Product.Name));


            //CreateOrderMapping
            CreateMap<CreateOrderCommand, SalesDocument>()
               .ForMember(dest => dest.SalesDocId, opt => opt.Ignore())
               .ForMember(dest => dest.DealerId, opt => opt.Ignore())
               .ForMember(dest => dest.DocType, opt => opt.Ignore())
               .ForMember(dest => dest.Status, opt => opt.Ignore())
               .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
               .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
               .ForMember(dest => dest.TotalAmount, opt => opt.Ignore()) // Sẽ được tính toán
               .ForMember(dest => dest.SalesDocumentItems, opt => opt.Ignore()); // Sẽ được tạo riêng

            CreateMap<SalesDocument, GetOrdersListItemDto>()
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.SalesDocId))
                // Bỏ qua OrderCode vì chúng ta sẽ tạo nó trong Handler
                .ForMember(dest => dest.OrderCode, opt => opt.Ignore())
                .ForMember(dest => dest.CustomerName, opt => opt.MapFrom(src => src.Customer.FullName))
                .ForMember(dest => dest.CustomerPhone, opt => opt.MapFrom(src => src.Customer.Phone))
                .ForMember(dest => dest.VehicleName, opt => opt.MapFrom(src =>
                    src.SalesDocumentItems.Select(i => i.Product.Name).FirstOrDefault()))
                .ForMember(dest => dest.VehicleColor, opt => opt.MapFrom(src =>
                    src.SalesDocumentItems.Select(i => i.Product.ColorName).FirstOrDefault()))
                .ForMember(dest => dest.Amount, opt => opt.MapFrom(src => src.TotalAmount))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt));


            // Mapping chính từ SalesDocument -> GetOrderDetailDto
            CreateMap<SalesDocument, GetOrderDetailDto>()
                .ForMember(dest => dest.OrderId, opt => opt.MapFrom(src => src.SalesDocId))
                .ForMember(dest => dest.OrderNumber, opt => opt.MapFrom(src => src.ContractNo))
                .ForMember(dest => dest.Customer, opt => opt.MapFrom(src => src.Customer)) // Map sang DTO con
                .ForMember(dest => dest.Item, opt => opt.MapFrom(src => src.SalesDocumentItems.FirstOrDefault())); // Map sang DTO con

            // Mapping cho DTO con: Customer -> OrderCustomerDto
            CreateMap<Customer, OrderCustomerDto>();

            CreateMap<SalesDocumentItem, OrderItemDto>()
               .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product.Name)) // Corrected property reference
               .ForMember(dest => dest.ProductColor, opt => opt.MapFrom(src => src.Product.ColorName)) // Added mapping for ProductColor
               .ForMember(dest => dest.Vin, opt => opt.MapFrom(src => src.Inventories.Select(i => i.Vin).FirstOrDefault())) // Corrected property reference
               .ForMember(dest => dest.Quantity, opt => opt.MapFrom(src => src.Qty))
               .ForMember(dest => dest.UnitPrice, opt => opt.MapFrom(src => src.UnitPrice))
               .ForMember(dest => dest.LinePromo, opt => opt.MapFrom(src => src.LinePromo))
               .ForMember(dest => dest.LineTotal, opt => opt.MapFrom(src => src.LineTotal ?? 0)); // Handle nullable LineTotal

        }
    }
}
