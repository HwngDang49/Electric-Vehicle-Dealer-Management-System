using System.Security.Cryptography;
using System.Text;
using System.Net;

namespace backend.Common.Helpers
{
    public static class VNPayHelper
    {
        /// <summary>
        /// Build URL thanh toán VNPay
        /// </summary>
        public static string BuildPaymentUrl(
            string baseUrl,
            string hashSecret,
            IDictionary<string, string> parameters)
        {
            // Sắp xếp tham số theo Key (StringComparer.Ordinal)
            var sorted = new SortedDictionary<string, string>(parameters, StringComparer.Ordinal);

            // Tạo query string với URL encoding
            // VNPay yêu cầu ký trên chuỗi ĐÃ URL-ENCODE
            var query = string.Join("&", sorted.Select(kv => $"{kv.Key}={WebUtility.UrlEncode(kv.Value)}"));

            // Tạo chữ ký
            var secureHash = HmacSHA512(hashSecret, query);

            // Trả về URL hoàn chỉnh kèm chữ ký
            return $"{baseUrl}?{query}&vnp_SecureHashType=HmacSHA512&vnp_SecureHash={secureHash}";
        }

        /// <summary>
        /// Tạo chữ ký HMAC SHA512 (lowercase hex)
        /// </summary>
        public static string HmacSHA512(string key, string inputData)
        {
            var hash = new StringBuilder();
            var keyBytes = Encoding.UTF8.GetBytes(key);
            var inputBytes = Encoding.UTF8.GetBytes(inputData);
            using (var hmac = new HMACSHA512(keyBytes))
            {
                var hashValue = hmac.ComputeHash(inputBytes);
                foreach (var theByte in hashValue)
                {
                    hash.Append(theByte.ToString("x2"));
                }
            }

            return hash.ToString();
        }
    }
}
