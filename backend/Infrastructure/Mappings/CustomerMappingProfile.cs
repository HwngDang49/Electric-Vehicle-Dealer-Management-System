using AutoMapper;
using backend.Domain.Entities;
using backend.Feartures.Customers.Create;
using backend.Feartures.Customers.GetListCustomer;

namespace backend.Infrastructure.Mappings
{
    public class CustomerMappingProfile : Profile
    {
        public CustomerMappingProfile()
        {
            CreateMap<Customer, GetCustomersDto>();

            //CreateMap<Customer, GetCustomerDetailDto>();

            CreateMap<CreateCustomerRequest, Customer>()
             .ForMember(d => d.CustomerId, o => o.Ignore())
             .ForMember(d => d.CreatedAt, o => o.Ignore())
             .ForMember(d => d.Status, o => o.Ignore()); // set trong handler

            //update
            // CreateMap<UpdateCustomerCommand, Customer>()
            //   .ForAllMembers(o => o.Condition((src, dest, val) => val != null))
            //   .ForMember(d => d.CustomerId, o => o.Ignore())
            //   .ForMember(d => d.CreatedAt,  o => o.Ignore());
        }
    }
}
