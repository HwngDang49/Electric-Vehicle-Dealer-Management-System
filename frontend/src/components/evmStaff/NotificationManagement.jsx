import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "./NotificationManagement.css";
import evmStaffSignalRService from "../../services/evmStaffSignalRService";

const NotificationManagement = ({ isOpen, onClose, onNotificationsRead }) => {
  // Load notifications from sessionStorage on mount
  const loadStoredNotifications = () => {
    try {
      const stored = sessionStorage.getItem('evmStaffNotifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading stored notifications:", error);
      return [];
    }
  };

  const [notifications, setNotifications] = useState(loadStoredNotifications);
  const [loading, setLoading] = useState(false);
  const prevIsOpenRef = useRef(false);

  // Mark all notifications as read when popup is opened
  useEffect(() => {
    // Only mark as read when popup transitions from closed to open
    if (isOpen && !prevIsOpenRef.current && notifications.length > 0) {
      const readNotificationIds = JSON.parse(
        localStorage.getItem("evmStaffReadNotificationIds") || "[]"
      );
      
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0) {
        const newReadIds = unreadNotifications.map(n => n.id);
        const updatedReadIds = [...new Set([...readNotificationIds, ...newReadIds])];
        localStorage.setItem("evmStaffReadNotificationIds", JSON.stringify(updatedReadIds));
        
        // Update notifications to mark as read
        const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updatedNotifications);
        
        // Save to sessionStorage
        try {
          sessionStorage.setItem('evmStaffNotifications', JSON.stringify(updatedNotifications));
        } catch (error) {
          console.error("Error saving notifications to sessionStorage:", error);
        }
        
        // Trigger refresh notification count
        if (onNotificationsRead) {
          onNotificationsRead();
        }
      }
    }
    
    // Update ref
    prevIsOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Save notifications to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem('evmStaffNotifications', JSON.stringify(notifications));
    } catch (error) {
      console.error("Error saving notifications to sessionStorage:", error);
    }
  }, [notifications]);

  useEffect(() => {
    // Register callback for new purchase order notifications
    const handleNewPurchaseOrder = (data) => {
      console.log("NotificationManagement received new purchase order:", data);
      
      const notification = {
        id: `po-submit-${data.poId || data.PoId}`,
        type: "new_order",
        title: "Đơn hàng mới cần xử lý",
        message: `Đơn hàng ${data.poCode || data.PoCode || `PO${data.poId || data.PoId}`} từ ${data.dealerName || data.DealerName || `Đại lý ${data.dealerId || data.DealerId}`} đang chờ xử lý`,
        poId: data.poId || data.PoId,
        poCode: data.poCode || data.PoCode || `PO${data.poId || data.PoId}`,
        dealerId: data.dealerId || data.DealerId,
        dealerName: data.dealerName || data.DealerName,
        totalAmount: data.totalAmount || data.TotalAmount,
        createdAt: data.createdAt || data.CreatedAt || new Date().toISOString(),
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
          sessionStorage.setItem('evmStaffNotifications', JSON.stringify(updated));
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
    evmStaffSignalRService.registerCallback(handleNewPurchaseOrder);

    // Cleanup: unregister callback on unmount
    return () => {
      evmStaffSignalRService.unregisterCallback(handleNewPurchaseOrder);
    };
  }, [onNotificationsRead]);

  // Register callback for new claim notifications
  useEffect(() => {
    console.log("NotificationManagement: Registering NewClaim callback");
    const handleNewClaim = (data) => {
      console.log("NotificationManagement received new claim:", data);
      
      const notification = {
        id: `claim-${data.claimId || data.ClaimId}`,
        type: "new_claim",
        title: "Claim mới cần phê duyệt",
        message: `Claim từ ${data.dealerName || data.DealerName || `Đại lý ${data.dealerId || data.DealerId}`}${data.period || data.Period ? ` - Kỳ ${data.period || data.Period}` : ''} đang chờ phê duyệt`,
        claimId: data.claimId || data.ClaimId,
        dealerId: data.dealerId || data.DealerId,
        dealerName: data.dealerName || data.DealerName,
        amount: data.amount || data.Amount,
        period: data.period || data.Period,
        createdAt: data.createdAt || data.CreatedAt || new Date().toISOString(),
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
          sessionStorage.setItem('evmStaffNotifications', JSON.stringify(updated));
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
    evmStaffSignalRService.registerClaimCallback(handleNewClaim);
    console.log("NotificationManagement: Registered NewClaim callback");

    // Cleanup: unregister callback on unmount
    return () => {
      console.log("NotificationManagement: Unregistering NewClaim callback");
      evmStaffSignalRService.unregisterClaimCallback(handleNewClaim);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="evm-staff-notification-popup-overlay" onClick={onClose}>
      <div className="evm-staff-notification-popup" onClick={(e) => e.stopPropagation()}>
        <div className="evm-staff-notification-popup-header">
          <h2>Thông báo</h2>
          <button className="evm-staff-notification-popup-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="evm-staff-notification-popup-content">
          {loading ? (
            <div className="evm-staff-notification-loading">
              <div className="evm-staff-notification-spinner"></div>
              <p>Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="evm-staff-notification-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <p>Không có thông báo mới</p>
            </div>
          ) : (
            <div className="evm-staff-notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`evm-staff-notification-item ${!notification.read ? "unread" : ""}`}
                  onClick={() => {
                    // Mark as read when clicked
                    if (!notification.read) {
                      const readNotificationIds = JSON.parse(
                        localStorage.getItem("evmStaffReadNotificationIds") || "[]"
                      );
                      if (!readNotificationIds.includes(notification.id)) {
                        readNotificationIds.push(notification.id);
                        localStorage.setItem("evmStaffReadNotificationIds", JSON.stringify(readNotificationIds));
                      }
                      
                      const updated = notifications.map(n => n.id === notification.id ? { ...n, read: true } : n);
                      setNotifications(updated);
                      
                      // Save to sessionStorage
                      try {
                        sessionStorage.setItem('evmStaffNotifications', JSON.stringify(updated));
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
                  <div className="evm-staff-notification-icon">
                    {notification.type === "new_order" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                    )}
                    {notification.type === "delivery_ready" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"></path>
                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                    )}
                    {notification.type === "payment_confirmed" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    )}
                    {notification.type === "new_claim" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    )}
                  </div>
                  <div className="evm-staff-notification-content-item">
                    <div className="evm-staff-notification-title">{notification.title}</div>
                    <div className="evm-staff-notification-message">{notification.message}</div>
                    <div className="evm-staff-notification-meta">
                      <span className="evm-staff-notification-time">{formatTimeAgo(notification.createdAt)}</span>
                      {(notification.poCode || notification.orderCode || notification.invoiceNo || notification.claimId) && (
                        <span className="evm-staff-notification-code">
                          {notification.poCode || notification.orderCode || notification.invoiceNo || `CL${notification.claimId}`}
                        </span>
                      )}
                      {notification.period && (
                        <span className="evm-staff-notification-code">
                          Kỳ {notification.period}
                        </span>
                      )}
                      {(notification.totalAmount || notification.amount) && (
                        <span className="evm-staff-notification-amount">
                          {formatCurrency(notification.totalAmount || notification.amount)}
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

export default NotificationManagement;