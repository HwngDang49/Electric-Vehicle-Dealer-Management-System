namespace backend.Feartures.PurchaseOrders.Delivery.Confirm
{
    // DTO: Input for confirming delivery (stock-in to dealer)
    public sealed class ConfirmDeliveryRequest
    {
        public long PoId { get; set; }
    }
}


