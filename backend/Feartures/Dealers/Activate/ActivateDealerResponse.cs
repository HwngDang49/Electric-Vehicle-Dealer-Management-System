namespace backend.Feartures.Dealers.Activate
{
    public sealed record ActivateDealerResponse
    {
        public long DealerId { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }
}
