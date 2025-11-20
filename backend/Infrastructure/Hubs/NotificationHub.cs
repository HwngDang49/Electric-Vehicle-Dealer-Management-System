using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace backend.Infrastructure.Hubs
{
    /// <summary>
    /// SignalR Hub for real-time notifications
    /// Groups: dealer-{dealerId} for dealer-specific notifications
    /// </summary>
    [Authorize]
    public class NotificationHub : Hub
    {
        /// <summary>
        /// Join a dealer group when connection is established
        /// </summary>
        public async Task JoinDealerGroup(string dealerId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"dealer-{dealerId}");
        }

        /// <summary>
        /// Leave a dealer group
        /// </summary>
        public async Task LeaveDealerGroup(string dealerId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"dealer-{dealerId}");
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
