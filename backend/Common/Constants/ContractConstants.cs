namespace backend.Common.Constants
{
    /// <summary>
    /// Chứa các hằng số liên quan đến quy tắc sinh số hợp đồng.
    /// </summary>
    public static class ContractConstants
    {
        /// <summary>
        /// Tiền tố của số hợp đồng.
        /// </summary>
        public const string Prefix = "HD";

        /// <summary>
        /// Định dạng năm trong số hợp đồng.
        /// </summary>
        public const string YearFormat = "yyyy";

        /// <summary>
        /// Số chữ số cho phần số thứ tự (ví dụ: 5 -> 00001).
        /// </summary>
        public const int PaddingWidth = 5;
    }
}
