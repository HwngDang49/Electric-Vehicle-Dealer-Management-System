using AutoMapper;
using backend.Domain.Entities;
using backend.Domain.Enums;
using backend.Feartures.Branches.Create;
using backend.Feartures.Invoices.GetList;

namespace backend.Infrastructure.Mappings
{
    public class InvoiceMappingProfile : Profile
    {
        public InvoiceMappingProfile()
        {
            CreateMap<CreateBranchCommand, Invoice>()
                .ForMember(i => i.InvoiceId, o => o.Ignore())
                .ForMember(i => i.InvoiceNo, o => o.Ignore())
                ;

            CreateMap<Invoice, GetListInvoiceQuery>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => Enum.Parse<InvoiceStatus>(src.Status)))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => Enum.Parse<InvoiceType>(src.InvoiceType)));
        }
    }
}
