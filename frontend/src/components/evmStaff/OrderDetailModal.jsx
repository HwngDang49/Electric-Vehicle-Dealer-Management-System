import React, { useState, useEffect } from "react";
import "./OrderDetailModal.css";
import { formatDate } from "../../utils/dateUtils";
import { fetchDealerCredit } from "../../services/orderService";

const OrderDetailModal = ({
  order,
  isOpen,
  onClose,
  onAutoConfirm,
  onManualConfirm,
  onCreateInvoice,
}) => {
  const [dealerCredit, setDealerCredit] = useState(null);
  const [creditLoading, setCreditLoading] = useState(false);

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
    }
  }, [isOpen, order?.dealerId]);

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

  return (
    <div className="evm-staff-modal-overlay" onClick={onClose}>
      <div
        className="evm-staff-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evm-staff-modal-header">
          <div className="evm-staff-modal-header-content">
            <h2>Chi tiết đơn hàng</h2>
            <span className="evm-staff-order-code">{order.id}</span>
          </div>
          <button className="evm-staff-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="evm-staff-modal-body">
          {/* Order Information */}
          <div className="evm-staff-info-section">
            <h3>Thông tin đơn hàng</h3>
            <div className="evm-staff-info-grid">
              <div className="evm-staff-info-item">
                <label>Mã đơn hàng:</label>
                <span>{order.id}</span>
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
                  {order.statusText}
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
                    <div className="evm-staff-item-cell">{item.quantity}</div>
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
                      order.items.reduce((sum, item) => sum + item.quantity, 0)}
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
                  <label>Mã chi nhánh:</label>
                  <span>{order.branchId}</span>
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
                    ⚠️ Cảnh báo: Đơn hàng này vượt quá hạn mức công nợ khả dụng!
                  </div>
                )}
              </div>
            ) : (
              <div className="evm-staff-error">
                <p>Không thể tải thông tin hạn mức công nợ</p>
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
                    dealerCredit && dealerCredit.creditAvailable < order.amount
                      ? "evm-staff-btn-disabled"
                      : ""
                  }`}
                  onClick={handleAutoConfirm}
                  disabled={
                    !dealerCredit || dealerCredit.creditAvailable < order.amount
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
                    dealerCredit && dealerCredit.creditAvailable < order.amount
                      ? "evm-staff-btn-disabled"
                      : ""
                  }`}
                  onClick={handleManualConfirm}
                  disabled={
                    !dealerCredit || dealerCredit.creditAvailable < order.amount
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
              <div className="evm-staff-status-info">
                <span className="evm-staff-status-confirmed">
                  ✅ Đơn hàng đã có Invoice
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
