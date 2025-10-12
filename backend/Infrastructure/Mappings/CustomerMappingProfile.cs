using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Customers.Create;

namespace backend.Infrastructure.Mappings
{
    public class CustomerMappingProfile : Profile
    {
        public CustomerMappingProfile()
        {
            CreateMap<CreateCustomerRequest, Customer>()
             .ForMember(d => d.CustomerId, o => o.Ignore())
             .ForMember(d => d.CreatedAt, o => o.Ignore())
             .ForMember(d => d.Status, o => o.Ignore()); // set trong handler
        }
    }
}
