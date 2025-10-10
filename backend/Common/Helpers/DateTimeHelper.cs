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
    }
}
