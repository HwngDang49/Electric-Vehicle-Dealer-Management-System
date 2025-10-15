using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Branches.Create;

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
        }
    }
}
