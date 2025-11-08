using System;

namespace backend.Feartures.Invoices.Create
{
    public class CreateRetailInvoiceRequest
    {
        public long OrderId { get; set; }
        // ✅ DealerId không còn cần từ request body, sẽ được lấy từ JWT token
        // Giữ field này để backward compatibility, nhưng sẽ không sử dụng
        [Obsolete("DealerId is now retrieved from JWT token. This field is kept for backward compatibility only.")]
        public long? DealerId { get; set; }
        public string Note { get; set; } = "";
    }
}
