namespace backend.Feartures.Dealers.Update
{
    public record UpdateDealerResponse
    {
        public long DealerId { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }
}
