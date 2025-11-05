namespace backend.Feartures.Dealers.Close
{
    public sealed record CloseDealerResponse
    {
        public long DealerId { get; set; }
        public DateTime LastUpdatedAt { get; set; }

    }
}
