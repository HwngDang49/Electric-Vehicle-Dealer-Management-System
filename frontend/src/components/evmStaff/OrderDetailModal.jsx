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

  return (
    <div className="evm-staff-app">
      <div className="evm-staff-modal-overlay" onClick={onClose}>
        <div
          className="evm-staff-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="evm-staff-modal-header">
            <div className="evm-staff-modal-header-content">
              <h2>Chi tiết đơn hàng</h2>
              <span className="evm-staff-order-code">
                {formatPOId(order.id)}
              </span>
            </div>
            <button className="evm-staff-modal-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="evm-staff-modal-body">
            {/* Left Column */}
            <div className="evm-staff-modal-column">
              {/* Order Information */}
              <div className="evm-staff-info-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="evm-staff-info-grid">
                  <div className="evm-staff-info-item">
                    <label>Mã đơn hàng:</label>
                    <span>{formatPOId(order.id)}</span>
                  </div>
                  <div className="evm-staff-info-item">
                    <label>Số tiền:</label>
                    <span className="evm-staff-amount">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                  <div className="evm-staff-info-item">
                    <label>Trạng thái:</label>
                    <span
                      className={`evm-staff-status evm-staff-status-${order.status}`}
                    >
                      {getOrderStatusText(order.status || order.statusText)}
                    </span>
                  </div>
                  <div className="evm-staff-info-item">
                    <label>Ngày tạo:</label>
                    <span>{formatDate(order.date)}</span>
                  </div>
                  {order.expectedDate && (
                    <div className="evm-staff-info-item">
                      <label>Ngày giao dự kiến:</label>
                      <span>{formatDate(order.expectedDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="evm-staff-info-section">
                <h3>Thông tin bổ sung</h3>
                <div className="evm-staff-info-grid">
                  <div className="evm-staff-info-item">
                    <label>Người tạo:</label>
                    <span>{order.createByName || order.createBy || "N/A"}</span>
                  </div>
                  <div className="evm-staff-info-item">
                    <label>Người gửi:</label>
                    <span>
                      {order.submittedByName || order.submittedBy || "N/A"}
                    </span>
                  </div>
                  {order.approvedBy && (
                    <div className="evm-staff-info-item">
                      <label>Người duyệt:</label>
                      <span>{order.approvedByName || order.approvedBy}</span>
                    </div>
                  )}
                  {order.confirmedBy && (
                    <div className="evm-staff-info-item">
                      <label>Người xác nhận:</label>
                      <span>{order.confirmedByName || order.confirmedBy}</span>
                    </div>
                  )}
                  <div className="evm-staff-info-item">
                    <label>Ngày cập nhật:</label>
                    <span>{formatDate(order.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="evm-staff-modal-column">
              {/* Credit Information */}
              <div className="evm-staff-info-section">
                <h3>Hạn mức công nợ</h3>
                {creditLoading ? (
                  <div className="evm-staff-loading">
                    <div className="evm-staff-spinner"></div>
                    <p>Đang tải thông tin hạn mức...</p>
                  </div>
                ) : dealerCredit ? (
                  <div className="evm-staff-info-grid">
                    <div className="evm-staff-info-item">
                      <label>Mã đại lý:</label>
                      <span>{order.dealerId}</span>
                    </div>
                    <div className="evm-staff-info-item">
                      <label>Tên chi nhánh:</label>
                      <span>
                        {branchLoading ? (
                          <span className="evm-staff-loading-text">
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
                    <div className="evm-staff-info-item">
                      <label>Tên đại lý:</label>
                      <span>{dealerCredit.dealerName}</span>
                    </div>
                    <div className="evm-staff-info-item">
                      <label>Hạn mức nợ:</label>
                      <span className="evm-staff-amount">
                        {formatCurrency(dealerCredit.creditLimit)}
                      </span>
                    </div>
                    <div className="evm-staff-info-item">
                      <label>Khoản nợ đã sử dụng:</label>
                      <span className="evm-staff-amount">
                        {formatCurrency(dealerCredit.creditUsed)}
                      </span>
                    </div>
                    <div className="evm-staff-info-item">
                      <label>Khoản nợ khả dụng:</label>
                      <span
                        className={`evm-staff-amount ${
                          dealerCredit.creditAvailable < 0
                            ? "evm-staff-amount-negative"
                            : ""
                        }`}
                      >
                        {formatCurrency(dealerCredit.creditAvailable)}
                      </span>
                    </div>
                    {dealerCredit.creditAvailable < order.amount && (
                      <div className="evm-staff-warning">
                        ⚠️ Cảnh báo: Đơn hàng này vượt quá hạn mức công nợ khả
                        dụng!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="evm-staff-error">
                    <p>Không thể tải thông tin hạn mức công nợ</p>
                  </div>
                )}
              </div>

              {/* Product Details */}
              {order.items && order.items.length > 0 && (
                <div className="evm-staff-info-section">
                  <h3>Chi tiết sản phẩm</h3>
                  <div className="evm-staff-items-table">
                    <div className="evm-staff-items-header">
                      <div className="evm-staff-item-cell">Tên sản phẩm</div>
                      <div className="evm-staff-item-cell">Đơn giá</div>
                      <div className="evm-staff-item-cell">Số lượng</div>
                      <div className="evm-staff-item-cell">Thành tiền</div>
                    </div>
                    {order.items.map((item, index) => (
                      <div key={index} className="evm-staff-item-row">
                        <div className="evm-staff-item-cell">
                          {item.productName || `Product ${item.productId}`}
                        </div>
                        <div className="evm-staff-item-cell">
                          {formatCurrency(item.unitPrice)}
                        </div>
                        <div className="evm-staff-item-cell">
                          {item.quantity}
                        </div>
                        <div className="evm-staff-item-cell">
                          {formatCurrency(item.lineTotal)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="evm-staff-total-section">
                    <div className="evm-staff-total-item">
                      <label>Tổng số lượng:</label>
                      <span>
                        {order.totalQuantity ||
                          order.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )}
                      </span>
                    </div>
                    <div className="evm-staff-total-item">
                      <label>Tổng số sản phẩm:</label>
                      <span>{order.itemCount || order.items.length}</span>
                    </div>
                    <div className="evm-staff-total-item">
                      <label>Tổng tiền:</label>
                      <span className="evm-staff-amount">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="evm-staff-modal-footer">
            <div className="evm-staff-modal-actions">
              {order.status === "Submit" && (
                <>
                  <button
                    className={`evm-staff-btn evm-staff-btn-auto ${
                      dealerCredit &&
                      dealerCredit.creditAvailable < order.amount
                        ? "evm-staff-btn-disabled"
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
                    className={`evm-staff-btn evm-staff-btn-manual ${
                      dealerCredit &&
                      dealerCredit.creditAvailable < order.amount
                        ? "evm-staff-btn-disabled"
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
                  className="evm-staff-btn evm-staff-btn-create-invoice"
                  onClick={() => onCreateInvoice && onCreateInvoice(order)}
                >
                  Tạo Invoice
                </button>
              )}
              {order.status === "Confirm" && order.hasInvoice && (
                <button
                  className="evm-staff-btn evm-staff-btn-invoice-created"
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
