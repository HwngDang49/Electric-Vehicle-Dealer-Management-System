using System;

namespace backend.Common.Helpers
{
    public class DateTimeHelper
    {
        /// <summary>
        /// Thời gian UTC hiện tại (chuẩn để lưu DB, so sánh).
        /// </summary>
        public static DateTime UtcNow() => DateTime.UtcNow;

        /// <summary>
        /// UTC không mili-giây: tiện assert/test & so sánh (tuỳ chọn).
        /// </summary>
        public static DateTime UtcNowTrim()
        {
            var now = DateTime.UtcNow;
            return now.AddTicks(-(now.Ticks % TimeSpan.TicksPerSecond));
        }

        /// <summary>
        /// Chuyển đổi UTC DateTime sang giờ Việt Nam (GMT+7)
        /// Hỗ trợ cả Windows ("SE Asia Standard Time") và Linux/Mac ("Asia/Ho_Chi_Minh")
        /// Đặt Kind = Unspecified để khi serialize JSON, frontend sẽ parse như local time (đã là VN time)
        /// </summary>
        public static DateTime ToVietnamTime(DateTime utcDateTime)
        {
            DateTime vnTime;
            try
            {
                // Windows: "SE Asia Standard Time"
                TimeZoneInfo vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
                vnTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, vnTimeZone);
            }
            catch (TimeZoneNotFoundException)
            {
                // Fallback cho Linux/Mac: "Asia/Ho_Chi_Minh"
                try
                {
                    TimeZoneInfo vnTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Ho_Chi_Minh");
                    vnTime = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, vnTimeZone);
                }
                catch
                {
                    // Fallback cuối: AddHours(7) nếu timezone không tồn tại
                    vnTime = utcDateTime.AddHours(7);
                }
            }
            
            // Đặt Kind = Unspecified để khi serialize JSON, nó sẽ serialize như ISO string không có timezone
            // Frontend sẽ parse như local time (coi như đã là VN time)
            return DateTime.SpecifyKind(vnTime, DateTimeKind.Unspecified);
        }
    }
}
