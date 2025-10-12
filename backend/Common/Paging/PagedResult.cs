namespace backend.Common.Paging
{
    public sealed class PagedResult<T>
    {
        public required IReadOnlyList<T> Items { get; init; }
        public required int Page { get; init; }          // 1-based
        public required int PageSize { get; init; }
        public required int Total { get; init; }

        public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling((double)Total / PageSize);
        public bool HasPrev => Page > 1;
        public bool HasNext => Page < TotalPages;

        public static PagedResult<T> Create(IReadOnlyList<T> items, int page, int pageSize, int total)
            => new() { Items = items, Page = page, PageSize = pageSize, Total = total };
    }
}
