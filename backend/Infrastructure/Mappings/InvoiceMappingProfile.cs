using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Branches.Create;
using backend.Feartures.Invoices.GetList;

namespace backend.Infrastructure.Mappings
{
    public class InvoiceMappingProfile : Profile
    {
        public InvoiceMappingProfile()
        {
            CreateMap<CreateBranchRequest, Invoice>()
                .ForMember(i => i.InvoiceId, o => o.Ignore())
                .ForMember(i => i.InvoiceNo, o => o.Ignore())
                ;

            CreateMap<Invoice, GetListInvoiceQuery>();
        }
    }
}
