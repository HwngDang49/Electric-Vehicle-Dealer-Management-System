using System.Collections.Concurrent;

namespace backend.Common.Services
{
    /// <summary>
    /// Service quản lý active sessions trong memory để đảm bảo 1 account chỉ online 1 chỗ
    /// Sử dụng ConcurrentDictionary để thread-safe
    /// </summary>
    public class SessionManagementService
    {
        // Key: UserId, Value: SessionToken (JWT token hiện tại)
        private readonly ConcurrentDictionary<long, string> _activeSessions = new();

        /// <summary>
        /// Lưu session mới cho user. Nếu đã có session cũ, sẽ bị ghi đè (invalidate session cũ)
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="sessionToken">JWT token của session mới</param>
        /// <returns>Session token cũ (nếu có), null nếu không có session cũ</returns>
        public string? SetActiveSession(long userId, string sessionToken)
        {
            // Lấy session cũ trước khi update
            string? oldToken = null;
            if (_activeSessions.TryGetValue(userId, out var existingToken))
            {
                oldToken = existingToken;
            }
            
            // Update hoặc add session mới
            _activeSessions.AddOrUpdate(userId, sessionToken, (key, oldValue) => sessionToken);
            
            // Trả về session cũ (nếu có và khác session mới)
            return oldToken != null && oldToken != sessionToken ? oldToken : null;
        }

        /// <summary>
        /// Kiểm tra xem session token có hợp lệ không (có phải là session hiện tại của user không)
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <param name="sessionToken">JWT token cần kiểm tra</param>
        /// <returns>True nếu session hợp lệ, False nếu không</returns>
        public bool IsValidSession(long userId, string sessionToken)
        {
            if (!_activeSessions.TryGetValue(userId, out var activeToken))
            {
                return false; // User chưa có session nào
            }

            return activeToken == sessionToken;
        }

        /// <summary>
        /// Xóa session của user (khi logout)
        /// </summary>
        /// <param name="userId">User ID</param>
        public void RemoveSession(long userId)
        {
            _activeSessions.TryRemove(userId, out _);
        }

        /// <summary>
        /// Lấy session token hiện tại của user
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>Session token hiện tại, null nếu không có</returns>
        public string? GetActiveSession(long userId)
        {
            return _activeSessions.TryGetValue(userId, out var token) ? token : null;
        }

        /// <summary>
        /// Kiểm tra xem user có đang online không
        /// </summary>
        /// <param name="userId">User ID</param>
        /// <returns>True nếu user đang online, False nếu không</returns>
        public bool IsUserOnline(long userId)
        {
            return _activeSessions.ContainsKey(userId);
        }

        /// <summary>
        /// Lấy số lượng users đang online
        /// </summary>
        /// <returns>Số lượng active sessions</returns>
        public int GetOnlineUserCount()
        {
            return _activeSessions.Count;
        }

        /// <summary>
        /// Lấy tất cả active sessions (chỉ để test/debug)
        /// </summary>
        /// <returns>Dictionary chứa tất cả active sessions</returns>
        public Dictionary<long, string> GetAllActiveSessions()
        {
            return new Dictionary<long, string>(_activeSessions);
        }
    }
}

