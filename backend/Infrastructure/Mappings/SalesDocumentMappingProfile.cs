using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.SalesDocuments.CreateQuote;

namespace backend.Infrastructure.Mappings
{
    public sealed class SalesDocumentMappingProfile : Profile
    {
        public SalesDocumentMappingProfile()
        {
            // CreateQuote -> SalesDocument
            CreateMap<CreateQuoteCommand, SalesDocument>()
                .ForMember(d => d.SalesDocId, o => o.Ignore())
                .ForMember(d => d.DocType, o => o.Ignore())   // set trong handler
                .ForMember(d => d.Status, o => o.Ignore())   // set trong handler
                .ForMember(d => d.CreatedAt, o => o.Ignore())
                .ForMember(d => d.UpdatedAt, o => o.Ignore())
                .ForMember(d => d.SalesDocumentItems, o => o.Ignore()); // map items riêng

            CreateMap<CreateQuoteItem, SalesDocumentItem>()
                .ForMember(d => d.SdiId, o => o.Ignore())
                .ForMember(d => d.SalesDocId, o => o.Ignore())
                .ForMember(d => d.LineTotal, o => o.Ignore()); // computed column
        }
    }
}
