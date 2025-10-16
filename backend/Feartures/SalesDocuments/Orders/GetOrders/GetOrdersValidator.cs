using FluentValidation;

namespace backend.Feartures.SalesDocuments.Orders.GetOrders;

public sealed class GetOrdersValidator : AbstractValidator<GetOrdersQuery>
{
    public GetOrdersValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0).WithMessage("Số trang phải lớn hơn 0.");

        RuleFor(x => x.PageSize)
            .GreaterThan(0).WithMessage("Kích thước trang phải lớn hơn 0.")
            .LessThanOrEqualTo(100).WithMessage("Kích thước trang không được vượt quá 100.");
    }
}