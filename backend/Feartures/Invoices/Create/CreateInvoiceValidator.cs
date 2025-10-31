using backend.Domain.Enums;
using FluentValidation;

namespace backend.Feartures.Invoices.Create;

public class CreateInvoiceValidator : AbstractValidator<CreateInvoiceCommand>
{
    public CreateInvoiceValidator()
    {
        // kiểm type invoice
        RuleFor(x => x.Request.Type)
            .IsInEnum()
            .WithMessage("Invoice type must be valid (Retail or B2B)");

        RuleFor(x => x.Request.DealerId)
            .GreaterThan(0)
            .WithMessage("DealerId is required and must be greater than 0");

        // đối với b2b
        When(x => x.Request.Type == InvoiceType.B2B, () =>
        {
            RuleFor(x => x.Request.PoId)
                .GreaterThan(0)
                .WithMessage("PoId is required for B2B invoice and must be greater than 0");

            RuleFor(x => x.Request.SaleDocId) // không được khi mà b2b
                .Equal(0)
                .When(x => x.Request.Type == InvoiceType.B2B)
                .WithMessage("SaleDocId should not be provided for B2B invoice");
        });

        //đối với retal
        When(x => x.Request.Type == InvoiceType.Retail, () =>
        {
            RuleFor(x => x.Request.SaleDocId)
                .GreaterThan(0)
                .WithMessage("SaleDocId is required for Retail invoice and must be greater than 0");

            RuleFor(x => x.Request.PoId) // ngược lại đang reatail đâu ra b2b
                .Equal(0)
                .When(x => x.Request.Type == InvoiceType.Retail)
                .WithMessage("PoId should not be provided for Retail invoice");
        });
    }
}
