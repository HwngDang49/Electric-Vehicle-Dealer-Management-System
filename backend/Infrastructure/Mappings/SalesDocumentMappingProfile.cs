﻿using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.SalesDocuments.Orders.CreateOrder;
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


        }
    }
}
