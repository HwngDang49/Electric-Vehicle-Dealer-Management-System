import React, { useState, useEffect } from "react";
import "./OrderDetailModal.css";
import { formatDate } from "../../utils/dateUtils";
import { fetchDealerCredit } from "../../services/orderService";
import branchApiService from "../../services/branchApi";

const OrderDetailModal = ({
  order,
  isOpen,
  onClose,
  onAutoConfirm,
  onManualConfirm,
  onCreateInvoice,
  onCancelOrder,
  onWarningChange,
}) => {
  const [dealerCredit, setDealerCredit] = useState(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [branchInfo, setBranchInfo] = useState(null);
  const [branchLoading, setBranchLoading] = useState(false);

  // Fetch dealer credit information when modal opens
  useEffect(() => {
    if (isOpen && order?.dealerId) {
      const loadDealerCredit = async () => {
        try {
          setCreditLoading(true);
          const creditData = await fetchDealerCredit(order.dealerId);
          setDealerCredit(creditData);
        } catch (error) {
          console.error("Error loading dealer credit:", error);
          setDealerCredit(null);
        } finally {
          setCreditLoading(false);
        }
      };
      loadDealerCredit();
    } else {
      // Reset warning when modal closes
      if (onWarningChange) {
        onWarningChange(null);
      }
    }
  }, [isOpen, order?.dealerId, onWarningChange]);

  // Notify parent about warning status
  useEffect(() => {
    if (onWarningChange && isOpen && dealerCredit && order) {
      const hasWarning = dealerCredit.creditAvailable < order.amount;
      onWarningChange(
        hasWarning
          ? "Cảnh báo: Đơn hàng này vượt quá hạn mức công nợ khả dụng!"
          : null
      );
    }
  }, [dealerCredit, order, isOpen, onWarningChange]);

  // Fetch branch information when modal opens
  useEffect(() => {
    if (isOpen && order?.branchId) {
      const loadBranchInfo = async () => {
        try {
          setBranchLoading(true);
          console.log("🔄 Fetching branch info for branchId:", order.branchId);
          console.log("🔄 BranchId type:", typeof order.branchId);

          // Try to fetch branch data
          const branchData = await branchApiService.getBranchById(
            parseInt(order.branchId)
          );
          console.log("✅ Branch data received:", branchData);

          // Handle different response structures
          const actualData = branchData.data || branchData;
          console.log("📋 Actual branch data:", actualData);

          // Check if we got valid data
          if (actualData && (actualData.name || actualData.code)) {
            setBranchInfo(actualData);
          } else {
            console.warn("⚠️ Branch data is empty or invalid:", actualData);
            setBranchInfo(null);
          }
        } catch (error) {
          console.error("❌ Error loading branch info:", error);
          setBranchInfo(null);
        } finally {
          setBranchLoading(false);
        }
      };
      loadBranchInfo();
    }
  }, [isOpen, order?.branchId]);

  if (!isOpen || !order) {
    return null;
  }

  const handleAutoConfirm = async () => {
    if (onAutoConfirm) {
      await onAutoConfirm(order);
    }
  };

  const handleManualConfirm = () => {
    if (onManualConfirm) {
      onManualConfirm(order);
    }
  };

  const handleCancelOrder = async () => {
    if (onCancelOrder) {
      await onCancelOrder(order);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatPOId = (id) => {
    // If already in PO-XX format, return as is
    if (typeof id === "string" && id.startsWith("PO-")) {
      return id;
    }
    // Otherwise, format as PO-XX
    return `PO-${id}`;
  };

  // Get order status text in Vietnamese
  const getOrderStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case "SUBMIT":
        return "Đã gửi";
      case "CONFIRM":
        return "Xác nhận";
      case "INTRANSIT":
        return "Đang vận chuyển";
      case "DELIVERY":
        return "Đã giao";
      case "DRAFT":
        return "Nháp";
      case "REJECT":
        return "Từ chối";
      case "CANCEL":
        return "Hủy";
      default:
        return status || "N/A";
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      submit: "pending",
      confirm: "confirmed",
      intransit: "pending",
      delivery: "delivered",
      draft: "draft",
      reject: "draft",
      cancel: "draft",
    };
    return statusMap[status?.toLowerCase()] || "draft";
  };

  return (
    <div className="evm-staff-order-detail-modal-app">
      <div className="evm-staff-order-detail-modal-overlay" onClick={onClose}>
        <div
          className="evm-staff-order-detail-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="evm-staff-order-detail-modal-header">
            <div className="evm-staff-order-detail-modal-header-left">
              <div className="evm-staff-order-detail-modal-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
                </svg>
              </div>
              <div>
                <h2 className="evm-staff-order-detail-modal-title">
                  Chi tiết đơn hàng
                </h2>
                <p className="evm-staff-order-detail-modal-subtitle">
                  {formatPOId(order.id)}
                </p>
              </div>
            </div>
            <div className="evm-staff-order-detail-modal-header-actions">
              <span
                className={`evm-staff-order-status-badge ${getStatusBadgeClass(
                  order.status || order.statusText
                )}`}
              >
                {getOrderStatusText(order.status || order.statusText)}
              </span>
              <button
                className="evm-staff-order-detail-close-btn"
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="evm-staff-order-detail-modal-body">
            <div className="evm-staff-order-details">
              {/* Left Column - Order Info */}
              <div className="evm-staff-order-info-column">
                {/* Order Information */}
                <div className="evm-staff-order-detail-section">
                  <div className="evm-staff-order-detail-card-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5.5C20.95,5.34 21,5.17 21,5A1,1 0 0,0 20,4H5.21L4.27,2M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z" />
                    </svg>
                    <h4>Thông tin đơn hàng</h4>
                  </div>
                  <div className="evm-staff-order-detail-grid">
                    <div className="evm-staff-order-detail-item">
                      <span className="evm-staff-order-detail-label">
                        Mã đơn hàng
                      </span>
                      <span className="evm-staff-order-detail-value">
                        {formatPOId(order.id)}
                      </span>
                    </div>
                    <div className="evm-staff-order-detail-item">
                      <span className="evm-staff-order-detail-label">
                        Số tiền
                      </span>
                      <span className="evm-staff-order-detail-value evm-staff-order-amount">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                    <div className="evm-staff-order-detail-item">
                      <span className="evm-staff-order-detail-label">
                        Trạng thái
                      </span>
                      <span className="evm-staff-order-detail-value">
                        <span
                          className={`evm-staff-order-status-badge ${getStatusBadgeClass(
                            order.status || order.statusText
                          )}`}
                        >
                          {getOrderStatusText(order.status || order.statusText)}
                        </span>
                      </span>
                    </div>
                    <div className="evm-staff-order-detail-item">
                      <span className="evm-staff-order-detail-label">
                        Ngày tạo
                      </span>
                      <span className="evm-staff-order-detail-value">
                        {formatDate(order.date)}
                      </span>
                    </div>
                    {order.expectedDate && (
                      <div className="evm-staff-order-detail-item">
                        <span className="evm-staff-order-detail-label">
                          Ngày giao dự kiến
                        </span>
                        <span className="evm-staff-order-detail-value">
                          {formatDate(order.expectedDate)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                {(order.createByName ||
                  order.createBy ||
                  order.submittedByName ||
                  order.submittedBy ||
                  order.approvedBy ||
                  order.confirmedBy) && (
                  <div className="evm-staff-order-detail-section">
                    <div className="evm-staff-order-detail-card-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                      <h4>Thông tin bổ sung</h4>
                    </div>
                    <div className="evm-staff-order-detail-grid">
                      {(order.createByName || order.createBy) && (
                        <div className="evm-staff-order-detail-item">
                          <span className="evm-staff-order-detail-label">
                            Người tạo
                          </span>
                          <span className="evm-staff-order-detail-value">
                            {order.createByName || order.createBy || "N/A"}
                          </span>
                        </div>
                      )}
                      {(order.submittedByName || order.submittedBy) && (
                        <div className="evm-staff-order-detail-item">
                          <span className="evm-staff-order-detail-label">
                            Người gửi
                          </span>
                          <span className="evm-staff-order-detail-value">
                            {order.submittedByName ||
                              order.submittedBy ||
                              "N/A"}
                          </span>
                        </div>
                      )}
                      {order.approvedBy && (
                        <div className="evm-staff-order-detail-item">
                          <span className="evm-staff-order-detail-label">
                            Người duyệt
                          </span>
                          <span className="evm-staff-order-detail-value">
                            {order.approvedByName || order.approvedBy}
                          </span>
                        </div>
                      )}
                      {order.confirmedBy && (
                        <div className="evm-staff-order-detail-item">
                          <span className="evm-staff-order-detail-label">
                            Người xác nhận
                          </span>
                          <span className="evm-staff-order-detail-value">
                            {order.confirmedByName || order.confirmedBy}
                          </span>
                        </div>
                      )}
                      {order.updatedAt && (
                        <div className="evm-staff-order-detail-item">
                          <span className="evm-staff-order-detail-label">
                            Ngày cập nhật
                          </span>
                          <span className="evm-staff-order-detail-value">
                            {formatDate(order.updatedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Credit & Product Info */}
              <div className="evm-staff-order-actions-column">
                {/* Credit Information */}
                <div className="evm-staff-order-detail-section">
                  <div className="evm-staff-order-detail-card-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                    <h4>Hạn mức công nợ</h4>
                  </div>
                  {creditLoading ? (
                    <div className="evm-staff-order-loading">
                      <div className="evm-staff-order-loading-spinner"></div>
                      <p>Đang tải thông tin hạn mức...</p>
                    </div>
                  ) : dealerCredit ? (
                    <div className="evm-staff-order-detail-grid">
                      <div className="evm-staff-order-detail-item">
                        <span className="evm-staff-order-detail-label">
                          Mã đại lý
                        </span>
                        <span className="evm-staff-order-detail-value">
                          {order.dealerId}
                        </span>
                      </div>
                      <div className="evm-staff-order-detail-item">
                        <span className="evm-staff-order-detail-label">
                          Tên đại lý
                        </span>
                        <span className="evm-staff-order-detail-value">
                          {dealerCredit.dealerName}
                        </span>
                      </div>
                      <div className="evm-staff-order-detail-item">
                        <span className="evm-staff-order-detail-label">
                          Khoản nợ đã sử dụng
                        </span>
                        <span className="evm-staff-order-detail-value">
                          {formatCurrency(dealerCredit.creditUsed)}
                        </span>
                      </div>
                      <div className="evm-staff-order-detail-item">
                        <span className="evm-staff-order-detail-label">
                          Tên chi nhánh
                        </span>
                        <span className="evm-staff-order-detail-value">
                          {branchLoading ? (
                            <span className="evm-staff-order-loading-text">
                              Đang tải...
                            </span>
                          ) : branchInfo ? (
                            `${branchInfo.name || branchInfo.code || "N/A"} (${
                              order.branchId
                            })`
                          ) : (
                            `Chi nhánh ${order.branchId}`
                          )}
                        </span>
                      </div>
                      <div className="evm-staff-order-detail-item">
                        <span className="evm-staff-order-detail-label">
                          Hạn mức nợ
                        </span>
                        <span className="evm-staff-order-detail-value">
                          {formatCurrency(dealerCredit.creditLimit)}
                        </span>
                      </div>
                      <div className="evm-staff-order-detail-item">
                        <span className="evm-staff-order-detail-label">
                          Khoản nợ khả dụng
                        </span>
                        <span
                          className={`evm-staff-order-detail-value ${
                            dealerCredit.creditAvailable < 0
                              ? "evm-staff-order-amount-negative"
                              : ""
                          }`}
                        >
                          {formatCurrency(dealerCredit.creditAvailable)}
                        </span>
                      </div>
                      {dealerCredit.creditAvailable < order.amount && (
                        <div className="evm-staff-order-warning full-width">
                          ⚠️ Cảnh báo: Đơn hàng này vượt quá hạn mức công nợ khả
                          dụng!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="evm-staff-order-error">
                      <p>Không thể tải thông tin hạn mức công nợ</p>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                {order.items && order.items.length > 0 && (
                  <div className="evm-staff-order-detail-section">
                    <div className="evm-staff-order-detail-card-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                      </svg>
                      <h4>Chi tiết sản phẩm</h4>
                    </div>
                    <div className="evm-staff-order-items-table">
                      <div className="evm-staff-order-items-header">
                        <div className="evm-staff-order-item-cell">
                          Tên sản phẩm
                        </div>
                        <div className="evm-staff-order-item-cell">Đơn giá</div>
                        <div className="evm-staff-order-item-cell">
                          Số lượng
                        </div>
                        <div className="evm-staff-order-item-cell">
                          Thành tiền
                        </div>
                      </div>
                      {order.items.map((item, index) => (
                        <div key={index} className="evm-staff-order-item-row">
                          <div className="evm-staff-order-item-cell">
                            {item.productName || `Product ${item.productId}`}
                          </div>
                          <div className="evm-staff-order-item-cell">
                            {formatCurrency(item.unitPrice)}
                          </div>
                          <div className="evm-staff-order-item-cell">
                            {item.quantity}
                          </div>
                          <div className="evm-staff-order-item-cell">
                            {formatCurrency(item.lineTotal)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="evm-staff-order-detail-modal-footer">
            <div className="evm-staff-order-detail-modal-actions">
              {order.status === "Submit" && (
                <>
                  <button
                    className="evm-staff-order-action-btn evm-staff-order-action-btn-cancel"
                    onClick={handleCancelOrder}
                    title="Hủy đơn hàng này"
                  >
                    Hủy đơn hàng
                  </button>
                  <button
                    className={`evm-staff-order-action-btn evm-staff-order-action-btn-auto ${
                      dealerCredit &&
                      dealerCredit.creditAvailable < order.amount
                        ? "evm-staff-order-action-btn-disabled"
                        : ""
                    }`}
                    onClick={handleAutoConfirm}
                    disabled={
                      !dealerCredit ||
                      dealerCredit.creditAvailable < order.amount
                    }
                    title={
                      !dealerCredit
                        ? "Đang tải thông tin hạn mức..."
                        : dealerCredit.creditAvailable < order.amount
                        ? "Đại lý vượt quá hạn mức nợ"
                        : "Xác nhận tự động (FIFO - VIN cũ nhất)"
                    }
                  >
                    Tự động gán VIN
                  </button>
                  <button
                    className={`evm-staff-order-action-btn evm-staff-order-action-btn-manual ${
                      dealerCredit &&
                      dealerCredit.creditAvailable < order.amount
                        ? "evm-staff-order-action-btn-disabled"
                        : ""
                    }`}
                    onClick={handleManualConfirm}
                    disabled={
                      !dealerCredit ||
                      dealerCredit.creditAvailable < order.amount
                    }
                    title={
                      !dealerCredit
                        ? "Đang tải thông tin hạn mức..."
                        : dealerCredit.creditAvailable < order.amount
                        ? "Đại lý vượt quá hạn mức nợ"
                        : "Chọn VIN thủ công"
                    }
                  >
                    Gán VIN thủ công
                  </button>
                </>
              )}
              {order.status === "Confirm" && !order.hasInvoice && (
                <button
                  className="evm-staff-order-action-btn evm-staff-order-action-btn-create-invoice"
                  onClick={() => onCreateInvoice && onCreateInvoice(order)}
                >
                  Tạo Invoice
                </button>
              )}
              {order.status === "Confirm" && order.hasInvoice && (
                <button
                  className="evm-staff-order-action-btn evm-staff-order-action-btn-invoice-created"
                  disabled
                >
                  ✅ Đã tạo hóa đơn B2B
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
