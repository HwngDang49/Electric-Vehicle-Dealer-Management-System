import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./NotificationPopup.css";
import signalRService from "../../services/signalRService";

const NotificationPopup = ({ isOpen, onClose, onNotificationsRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load notifications from sessionStorage on mount
  const loadStoredNotifications = () => {
    try {
      const stored = sessionStorage.getItem('dealerManagerNotifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading stored notifications:", error);
      return [];
    }
  };

  useEffect(() => {
    if (isOpen) {
      const stored = loadStoredNotifications();
      setNotifications(stored);
    }
  }, [isOpen]);

  // Mark all notifications as read when popup is opened
  useEffect(() => {
    if (isOpen && notifications.length > 0) {
      const readNotificationIds = JSON.parse(
        localStorage.getItem("dealerManagerReadNotificationIds") || "[]"
      );
      
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0) {
        const newReadIds = unreadNotifications.map(n => n.id);
        const updatedReadIds = [...new Set([...readNotificationIds, ...newReadIds])];
        localStorage.setItem("dealerManagerReadNotificationIds", JSON.stringify(updatedReadIds));
        
        // Update notifications to mark as read
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updatedNotifications);
        
        // Save to sessionStorage
        try {
          sessionStorage.setItem('dealerManagerNotifications', JSON.stringify(updatedNotifications));
        } catch (error) {
          console.error("Error saving notifications to sessionStorage:", error);
        }
        
        // Trigger refresh notification count
        if (onNotificationsRead) {
          onNotificationsRead();
        }
      }
    }
  }, [isOpen, notifications.length, onNotificationsRead]);

  // Register callback for claim settled notifications
  useEffect(() => {
    const handleClaimSettled = (data) => {
      console.log("NotificationPopup received claim settled:", data);
      
      const notification = {
        id: `claim-settled-${data.claimId || data.ClaimId}-${data.paidAt || data.PaidAt || Date.now()}`,
        type: "claim_settled",
        title: data.isFullySettled || data.IsFullySettled 
          ? "Claim đã được thanh toán đầy đủ" 
          : "Claim đã được thanh toán một phần",
        message: data.isFullySettled || data.IsFullySettled
          ? `Claim ${data.claimId || data.ClaimId}${data.period || data.Period ? ` - Kỳ ${data.period || data.Period}` : ''} đã được thanh toán đầy đủ với số tiền ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(data.paidAmount || data.PaidAmount || 0)}`
          : `Claim ${data.claimId || data.ClaimId}${data.period || data.Period ? ` - Kỳ ${data.period || data.Period}` : ''} đã được thanh toán ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(data.paidAmount || data.PaidAmount || 0)}. Tổng claim: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(data.totalAmount || data.TotalAmount || 0)}`,
        claimId: data.claimId || data.ClaimId,
        amount: data.paidAmount || data.PaidAmount,
        totalAmount: data.totalAmount || data.TotalAmount,
        period: data.period || data.Period,
        isFullySettled: data.isFullySettled || data.IsFullySettled,
        createdAt: data.paidAt || data.PaidAt || new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => {
        // Check if notification already exists
        const exists = prev.some(n => n.id === notification.id);
        if (exists) {
          return prev;
        }
        // Add new notification at the beginning
        const updated = [notification, ...prev];
        // Save to sessionStorage
        try {
          sessionStorage.setItem('dealerManagerNotifications', JSON.stringify(updated));
        } catch (error) {
          console.error("Error saving notifications to sessionStorage:", error);
        }
        return updated;
      });

      // Trigger refresh notification count
      if (onNotificationsRead) {
        onNotificationsRead();
      }
    };

    // Register callback
    signalRService.registerClaimSettledCallback(handleClaimSettled);

    // Cleanup: unregister callback on unmount
    return () => {
      signalRService.unregisterClaimSettledCallback(handleClaimSettled);
    };
  }, [onNotificationsRead]);

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
    <div className="dealer-manager-notification-popup-overlay" onClick={onClose}>
      <div className="dealer-manager-notification-popup" onClick={(e) => e.stopPropagation()}>
        <div className="dealer-manager-notification-popup-header">
          <h2>Thông báo</h2>
          <button className="dealer-manager-notification-popup-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="dealer-manager-notification-popup-content">
          {loading ? (
            <div className="dealer-manager-notification-loading">
              <div className="dealer-manager-notification-spinner"></div>
              <p>Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="dealer-manager-notification-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <p>Không có thông báo mới</p>
            </div>
          ) : (
            <div className="dealer-manager-notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`dealer-manager-notification-item ${!notification.read ? "unread" : ""}`}
                  onClick={() => {
                    // Mark as read when clicked
                    if (!notification.read) {
                      const readNotificationIds = JSON.parse(
                        localStorage.getItem("dealerManagerReadNotificationIds") || "[]"
                      );
                      if (!readNotificationIds.includes(notification.id)) {
                        readNotificationIds.push(notification.id);
                        localStorage.setItem("dealerManagerReadNotificationIds", JSON.stringify(readNotificationIds));
                      }
                      
                      const updated = notifications.map(n => n.id === notification.id ? { ...n, read: true } : n);
                      setNotifications(updated);
                      
                      // Save to sessionStorage
                      try {
                        sessionStorage.setItem('dealerManagerNotifications', JSON.stringify(updated));
                      } catch (error) {
                        console.error("Error saving notifications to sessionStorage:", error);
                      }
                      
                      if (onNotificationsRead) {
                        onNotificationsRead();
                      }
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="dealer-manager-notification-icon">
                    {notification.type === "new_order" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                    )}
                    {notification.type === "payment" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                    )}
                    {notification.type === "claim_settled" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    )}
                    {!notification.type && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                    )}
                  </div>
                  <div className="dealer-manager-notification-content-item">
                    <div className="dealer-manager-notification-title">{notification.title || "Thông báo"}</div>
                    <div className="dealer-manager-notification-message">{notification.message || ""}</div>
                    <div className="dealer-manager-notification-meta">
                      <span className="dealer-manager-notification-time">{formatTimeAgo(notification.createdAt)}</span>
                      {(notification.poCode || notification.orderCode || notification.invoiceNo || notification.claimId) && (
                        <span className="dealer-manager-notification-code">
                          {notification.poCode || notification.orderCode || notification.invoiceNo || `CL${notification.claimId}`}
                        </span>
                      )}
                      {notification.period && (
                        <span className="dealer-manager-notification-code">
                          Kỳ {notification.period}
                        </span>
                      )}
                      {notification.amount && (
                        <span className="dealer-manager-notification-amount">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 }).format(notification.amount)}
                        </span>
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

