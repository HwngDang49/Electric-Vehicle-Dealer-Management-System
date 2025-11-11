import React, { useState, useEffect } from "react";
import "./NotificationManagement.css";
import PageHeader from "./PageHeader";
import purchaseOrderApiService from "../../services/purchaseOrderApi";
import apiClient from "../../services/api";

const NotificationManagement = ({ onBack }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadNotifications();
    // Auto-refresh every 30 seconds to check for new notifications
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const notificationsList = [];

      // 1. Check for new Purchase Orders with Submit status (cần xử lý)
      try {
        const poResponse = await purchaseOrderApiService.getAllPurchaseOrders(
          1,
          1000
        );
        const poItems = poResponse?.data?.items || poResponse?.items || [];

        const submitPOs = poItems.filter(
          (po) => (po.Status || po.status || "").toLowerCase() === "submit"
        );

        submitPOs.forEach((po) => {
          const notificationId = `po-submit-${po.poId || po.PoId}`;
          const readNotificationIds = JSON.parse(
            localStorage.getItem("evmStaffReadNotificationIds") || "[]"
          );
          const isRead = readNotificationIds.includes(notificationId);

          notificationsList.push({
            id: notificationId,
            type: "new_order",
            title: "Đơn hàng mới cần xử lý",
            message: `Đơn hàng ${
              po.poCode || po.PoCode || `PO${po.poId || po.PoId}`
            } đang chờ xử lý`,
            poId: po.poId || po.PoId,
            poCode: po.poCode || po.PoCode || `PO${po.poId || po.PoId}`,
            createdAt: po.createdAt || po.CreatedAt || new Date().toISOString(),
            read: isRead,
          });
        });
      } catch (error) {
        console.error("Error loading purchase orders:", error);
      }

      // 2. Check for orders that need delivery confirmation
      try {
        const orderResponse = await apiClient.get("/orders", {
          params: {
            status: "Ready",
            pageNumber: 1,
            pageSize: 100,
          },
        });

        const ordersData =
          orderResponse.data?.value?.items || orderResponse.data?.items || [];

        ordersData.forEach((order) => {
          const notificationId = `order-ready-${order.orderId}`;
          const readNotificationIds = JSON.parse(
            localStorage.getItem("evmStaffReadNotificationIds") || "[]"
          );
          const isRead = readNotificationIds.includes(notificationId);

          notificationsList.push({
            id: notificationId,
            type: "delivery_ready",
            title: "Đơn hàng sẵn sàng giao",
            message: `Đơn hàng ${
              order.orderCode || `DH${order.orderId}`
            } đã sẵn sàng để giao hàng`,
            orderId: order.orderId,
            orderCode: order.orderCode || `DH${order.orderId}`,
            createdAt: order.createdAt || new Date().toISOString(),
            read: isRead,
          });
        });
      } catch (error) {
        console.error("Error loading ready orders:", error);
      }

      // 3. Load payment confirmation notifications from localStorage
      try {
        const paymentNotifications = JSON.parse(
          localStorage.getItem("evmStaffPaymentNotifications") || "[]"
        );

        paymentNotifications.forEach((notification) => {
          const readNotificationIds = JSON.parse(
            localStorage.getItem("evmStaffReadNotificationIds") || "[]"
          );
          const isRead = readNotificationIds.includes(notification.id);

          notificationsList.push({
            ...notification,
            read: isRead,
          });
        });
      } catch (error) {
        console.error("Error loading payment notifications:", error);
      }

      // Sort by createdAt (newest first)
      notificationsList.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });

      setNotifications(notificationsList);

      // Count unread notifications
      const unread = notificationsList.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setError("Không thể tải thông báo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId) => {
    const readNotificationIds = JSON.parse(
      localStorage.getItem("evmStaffReadNotificationIds") || "[]"
    );

    if (!readNotificationIds.includes(notificationId)) {
      readNotificationIds.push(notificationId);
      localStorage.setItem(
        "evmStaffReadNotificationIds",
        JSON.stringify(readNotificationIds)
      );

      // Update notification state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = () => {
    const allNotificationIds = notifications.map((n) => n.id);
    localStorage.setItem(
      "evmStaffReadNotificationIds",
      JSON.stringify(allNotificationIds)
    );

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    setUnreadCount(0);
  };

  // Pagination calculations
  const totalPages = Math.ceil(notifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNotifications = notifications.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top of notification list
      const notificationList = document.querySelector(
        ".evm-staff-notification-list"
      );
      if (notificationList) {
        notificationList.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Get visible page numbers (max 3 pages)
  const getVisiblePages = () => {
    const pages = [];

    // Always show page 1
    pages.push(1);

    // Show appropriate middle page
    if (totalPages > 1) {
      if (currentPage === 1) {
        if (totalPages > 1) pages.push(2);
      } else if (currentPage === totalPages) {
        if (totalPages > 2) pages.push(totalPages - 1);
      } else {
        pages.push(currentPage);
      }
    }

    // Always show last page if different from first
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
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
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_order":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        );
      case "delivery_ready":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"></path>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
        );
      case "payment_confirmed":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      default:
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        );
    }
  };

  return (
    <div className="evm-staff-notification-management">
      {/* Header Section */}
      <div className="evm-staff-page-header-wrapper">
        <PageHeader
          title="Thông báo"
          subtitle="Quản lý và theo dõi các thông báo hệ thống"
          showBackButton={!!onBack}
          onBack={onBack}
        />
      </div>

      {/* Body Section */}
      <div className="evm-staff-page-body">
        <div className="evm-staff-notification-content">
          <div className="evm-staff-notification-header">
            <div className="evm-staff-notification-info">
              <h2>Tất cả thông báo</h2>
              {unreadCount > 0 && (
                <span className="evm-staff-unread-badge">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            {notifications.length > 0 && unreadCount > 0 && (
              <button
                className="evm-staff-mark-all-read-btn"
                onClick={markAllAsRead}
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          {loading ? (
            <div className="evm-staff-notification-loading">
              <div className="evm-staff-notification-spinner"></div>
              <p>Đang tải thông báo...</p>
            </div>
          ) : error ? (
            <div className="evm-staff-notification-error">
              <p>{error}</p>
              <button onClick={loadNotifications}>Thử lại</button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="evm-staff-notification-empty">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <p>Không có thông báo mới</p>
            </div>
          ) : (
            <>
              <div className="evm-staff-notification-list">
                {currentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`evm-staff-notification-item ${
                      !notification.read ? "unread" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="evm-staff-notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="evm-staff-notification-content-item">
                      <div className="evm-staff-notification-title">
                        {notification.title}
                        {!notification.read && (
                          <span className="evm-staff-unread-dot"></span>
                        )}
                      </div>
                      <div className="evm-staff-notification-message">
                        {notification.message}
                      </div>
                      <div className="evm-staff-notification-meta">
                        <span className="evm-staff-notification-time">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {(notification.poCode ||
                          notification.orderCode ||
                          notification.invoiceNo) && (
                          <span className="evm-staff-notification-code">
                            {notification.poCode ||
                              notification.orderCode ||
                              notification.invoiceNo}
                          </span>
                        )}
                        {notification.amount && (
                          <span className="evm-staff-notification-amount">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                              minimumFractionDigits: 0,
                            }).format(notification.amount)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="evm-staff-notification-pagination">
                  <div className="evm-staff-notification-pagination-info">
                    Hiển thị {startIndex + 1}-
                    {Math.min(endIndex, notifications.length)} trong tổng số{" "}
                    {notifications.length} thông báo
                  </div>
                  <div className="evm-staff-notification-pagination-controls">
                    <button
                      className="evm-staff-notification-pagination-btn"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                      </svg>
                      Trước
                    </button>

                    <div className="evm-staff-notification-pagination-numbers">
                      {getVisiblePages().map((page) => (
                        <button
                          key={page}
                          className={`evm-staff-notification-pagination-number ${
                            currentPage === page ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      className="evm-staff-notification-pagination-btn"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Sau
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
