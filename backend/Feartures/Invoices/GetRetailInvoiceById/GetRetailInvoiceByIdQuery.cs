using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Invoices.GetRetailInvoiceById
{
    public class GetRetailInvoiceByIdQuery : IRequest<Result<GetRetailInvoiceByIdResponse>>
    {
        public GetRetailInvoiceByIdRequest Request { get; }
        public GetRetailInvoiceByIdQuery(GetRetailInvoiceByIdRequest request)
        {
            Request = request;
        }
    }
}

