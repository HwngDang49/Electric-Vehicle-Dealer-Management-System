using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Dealers.Close
{
    public record CloseDealerCommand(long DealerId) : IRequest<Result>;
    //record thay vì class vì nó chỉ chứa dữ liệu, không có logic phức tạp
    //record tự động tạo constructor và các phương thức như Equals, GetHashCode
    //ví dụ: var cmd = new CloseDealerCommand(123);
    // nếu không để record thì phải tự viết constructor và các phương thức này
}
