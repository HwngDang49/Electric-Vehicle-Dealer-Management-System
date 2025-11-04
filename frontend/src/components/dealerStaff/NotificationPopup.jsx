import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import apiClient from "../../services/api";
import "./NotificationPopup.css";

const NotificationPopup = ({ isOpen, onClose, onNotificationsRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);



  const loadNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API endpoint when backend is ready
      // For now, check backorders with available VINs
      const response = await apiClient.get("/orders", {
        params: {
          status: "Backordered",
          pageNumber: 1,
          pageSize: 100,
        },
      });

      const ordersData = response.data?.value?.items || response.data?.items || [];
      const notificationsList = [];

      // Check each backordered order for available VINs
      for (const order of ordersData) {
        if (order.statusType === "backordered" || order.status === "Backordered") {
          try {
            // Get order detail to get productId (order list doesn't include productId)
            const orderDetailResponse = await apiClient.get(`/orders/${order.orderId}`);
            const orderDetail = orderDetailResponse.data?.value || orderDetailResponse.data || {};
            const productId = orderDetail.item?.productId;
            
            if (!productId) {
              console.warn(`Order ${order.orderId} has no productId`);
              continue;
            }

            // Check for available VINs
            const vinResponse = await apiClient.get("/orders/available-vins", {
              params: {
                ProductId: productId,
                Status: "InStock",
                Page: 1,
                PageSize: 1,
              },
            });

            const vins = vinResponse.data?.items || vinResponse.data?.value?.items || [];
            if (vins.length > 0) {
              const vin = vins[0];
              const notificationId = `vin-${order.orderId}-${vin.vin}`;
              
              // Get read notification IDs from localStorage
              const readNotificationIds = JSON.parse(
                localStorage.getItem("readNotificationIds") || "[]"
              );
              
              const isRead = readNotificationIds.includes(notificationId);
              
              notificationsList.push({
                id: notificationId,
                type: "vin_available",
                title: "VIN đã có trong kho",
                message: `VIN ${vin.vin} đã được nhập vào kho và sẵn sàng cho đơn hàng ${order.orderCode || `DH${order.orderId}`}`,
                orderId: order.orderId,
                orderCode: order.orderCode || `DH${order.orderId}`,
                vin: vin.vin,
                productName: vin.productName || vin.ProductName || orderDetail.item?.productName || "N/A",
                createdAt: new Date().toISOString(),
                read: isRead,
              });
            }
          } catch (error) {
            console.error(`Error checking VINs for order ${order.orderId}:`, error);
          }
        }
      }

      setNotifications(notificationsList);
      
      // Mark all notifications as read after loading
      if (notificationsList.length > 0) {
        const readNotificationIds = JSON.parse(
          localStorage.getItem("readNotificationIds") || "[]"
        );
        const allNotificationIds = notificationsList.map((n) => n.id);
        const newReadIds = [...new Set([...readNotificationIds, ...allNotificationIds])];
        localStorage.setItem("readNotificationIds", JSON.stringify(newReadIds));
        
        // Notify parent to refresh count
        if (onNotificationsRead) {
          onNotificationsRead();
        }
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Vừa xong";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="notification-popup-overlay" onClick={onClose}>
      <div className="notification-popup" onClick={(e) => e.stopPropagation()}>
        <div className="notification-popup-header">
          <h2>Thông báo</h2>
          <button className="notification-popup-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="notification-popup-content">
          {loading ? (
            <div className="notification-loading">
              <div className="notification-spinner"></div>
              <p>Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <p>Không có thông báo mới</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? "unread" : ""}`}
                >
                  <div className="notification-icon">
                    {notification.type === "vin_available" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-meta">
                      <span className="notification-time">{formatTimeAgo(notification.createdAt)}</span>
                      {notification.orderCode && (
                        <span className="notification-order">Đơn: {notification.orderCode}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationPopup;
