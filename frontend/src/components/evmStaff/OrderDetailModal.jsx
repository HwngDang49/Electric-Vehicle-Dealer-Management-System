import React, { useState } from "react";
import "./OrderDetailModal.css";
import { formatDate } from "../../utils/dateUtils";
import {
  canApproveOrder,
  canRejectOrder,
  DEALER_CREDIT_LIMIT,
} from "../../services/orderService";

const OrderDetailModal = ({
  order,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onCreateDeliveryOrder,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !order) {
    return null;
  }

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(order.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await onReject(order.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateDeliveryOrder = () => {
    if (onCreateDeliveryOrder) {
      onCreateDeliveryOrder(order);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const dealerCreditLimit = DEALER_CREDIT_LIMIT;
  const currentDebt = order.dealerCurrentDebt || 0;
  const remainingCredit = dealerCreditLimit - currentDebt;
  const canApprove = canApproveOrder(order);
  const canReject = canRejectOrder(order);

  return (
    <div className="evm-staff-modal-overlay" onClick={onClose}>
      <div
        className="evm-staff-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="evm-staff-modal-header">
          <h2>Chi tiết đơn hàng</h2>
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
              <div className="evm-staff-info-item">
                <label>Ngày giao dự kiến:</label>
                <span>{formatDate(order.expectedDeliveryDate)}</span>
              </div>
              <div className="evm-staff-info-item">
                <label>Độ ưu tiên:</label>
                <span
                  className={`evm-staff-priority evm-staff-priority-${order.priority}`}
                >
                  {order.priority === "high"
                    ? "Cao"
                    : order.priority === "medium"
                    ? "Trung bình"
                    : "Thấp"}
                </span>
              </div>
            </div>
          </div>

          {/* Dealer Information */}
          <div className="evm-staff-info-section">
            <h3>Thông tin đại lý</h3>
            <div className="evm-staff-info-grid">
              <div className="evm-staff-info-item">
                <label>Mã đại lý:</label>
                <span>{order.dealerId}</span>
              </div>
              <div className="evm-staff-info-item">
                <label>Tên đại lý:</label>
                <span>{order.dealerName}</span>
              </div>
              <div className="evm-staff-info-item">
                <label>Địa chỉ:</label>
                <span>{order.dealerAddress}</span>
              </div>
              <div className="evm-staff-info-item">
                <label>Số điện thoại:</label>
                <span>{order.dealerPhone}</span>
              </div>
              <div className="evm-staff-info-item">
                <label>Email:</label>
                <span>{order.dealerEmail}</span>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="evm-staff-info-section">
            <h3>Chi tiết sản phẩm</h3>
            <div className="evm-staff-info-grid">
              <div className="evm-staff-info-item">
                <label>Mẫu xe:</label>
                <span>{order.vehicleModel || order.items?.[0]?.product}</span>
              </div>
              <div className="evm-staff-info-item">
                <label>Phiên bản:</label>
                <span>{order.vehicleVersion || order.items?.[0]?.version}</span>
              </div>
              <div className="evm-staff-info-item">
                <label>Màu sắc:</label>
                <span>{order.vehicleColor || order.items?.[0]?.color}</span>
              </div>
              <div className="evm-staff-info-item">
                <label>Số lượng:</label>
                <span>{order.items?.[0]?.quantity || 1}</span>
              </div>
              <div className="evm-staff-info-item">
                <label>Đơn giá:</label>
                <span>
                  {formatCurrency(order.items?.[0]?.unitPrice || order.amount)}
                </span>
              </div>
              <div className="evm-staff-info-item">
                <label>Thành tiền:</label>
                <span className="evm-staff-amount">
                  {formatCurrency(order.amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.note && (
            <div className="evm-staff-info-section">
              <h3>Ghi chú</h3>
              <div className="evm-staff-notes">
                <p>{order.note}</p>
              </div>
            </div>
          )}

          {/* Debt Information */}
          <div className="evm-staff-info-section">
            <h3>Thông tin công nợ</h3>
            <div className="evm-staff-info-grid">
              <div className="evm-staff-info-item">
                <label>Hạn mức tối đa:</label>
                <span className="evm-staff-amount">
                  {formatCurrency(dealerCreditLimit)}
                </span>
              </div>
              <div className="evm-staff-info-item">
                <label>Công nợ hiện tại:</label>
                <span className="evm-staff-amount">
                  {formatCurrency(currentDebt)}
                </span>
              </div>
              <div className="evm-staff-info-item">
                <label>Hạn mức còn lại:</label>
                <span
                  className={`evm-staff-amount ${
                    remainingCredit < 0 ? "evm-staff-amount-negative" : ""
                  }`}
                >
                  {formatCurrency(remainingCredit)}
                </span>
              </div>
              <div className="evm-staff-info-item">
                <label>Sau khi duyệt đơn:</label>
                <span
                  className={`evm-staff-amount ${
                    currentDebt + order.amount > dealerCreditLimit
                      ? "evm-staff-amount-negative"
                      : ""
                  }`}
                >
                  {formatCurrency(currentDebt + order.amount)}
                </span>
              </div>
            </div>
            {!canApprove && (
              <div className="evm-staff-warning">
                ⚠️ Cảnh báo: Duyệt đơn hàng này sẽ vượt quá hạn mức công nợ cho
                phép!
              </div>
            )}
          </div>
        </div>

        <div className="evm-staff-modal-footer">
          <div className="evm-staff-modal-actions">
            {order.status === "pending" && (
              <>
                <button
                  className={`evm-staff-btn evm-staff-btn-reject ${
                    !canReject ? "evm-staff-btn-disabled" : ""
                  }`}
                  onClick={canReject ? handleReject : undefined}
                  disabled={isProcessing || !canReject}
                  title={!canReject ? "Có thể duyệt đơn hàng này" : ""}
                >
                  {isProcessing ? "Đang xử lý..." : "Từ chối"}
                </button>
                <button
                  className={`evm-staff-btn evm-staff-btn-approve ${
                    !canApprove ? "evm-staff-btn-disabled" : ""
                  }`}
                  onClick={canApprove ? handleApprove : undefined}
                  disabled={isProcessing || !canApprove}
                  title={!canApprove ? "Vượt quá hạn mức công nợ" : ""}
                >
                  {isProcessing ? "Đang xử lý..." : "Duyệt"}
                </button>
              </>
            )}
            {order.status === "approved" && (
              <button
                className="evm-staff-btn evm-staff-btn-create-delivery"
                onClick={handleCreateDeliveryOrder}
                title="Tạo đơn giao hàng cho đơn hàng đã duyệt"
              >
                📦 Tạo đơn giao hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
