import React, { useState } from "react";
import paymentApiService from "../../services/paymentApi";
import { useToast } from "../../contexts/useToast";
import "./VNPayPaymentModal.css";

const OtherPaymentModal = ({ invoice, onClose, onSuccess }) => {
  const method = "Cash"; // Chỉ hỗ trợ thanh toán tiền mặt
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  if (!invoice) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Create payment với phương thức tiền mặt
      await paymentApiService.createPayment({
        invoiceId: invoice.invoiceId,
        method,
        note: note.trim() || undefined,
      });

      if (onSuccess) onSuccess();
      toast.success("Tạo thanh toán thành công!");
    } catch (e) {
      console.error("Payment creation error:", e);
      console.error("Error response data:", e?.response?.data);
      console.error("Error response status:", e?.response?.status);

      let errorMessage = "Lỗi không xác định";
      let fullErrorText = "";

      // Extract error message from various possible formats
      // Backend trả về BadRequest(result.Errors) - có thể là array hoặc object
      if (Array.isArray(e?.response?.data)) {
        // Nếu response.data là array trực tiếp (Ardalis.Result.Errors)
        errorMessage = e.response.data[0] || "Lỗi không xác định";
        fullErrorText = e.response.data.join(" ").toLowerCase();
      } else if (e?.response?.data?.errors) {
        // Ardalis.Result format: { errors: [...] }
        const errors = e.response.data.errors;
        if (Array.isArray(errors)) {
          errorMessage = errors[0] || "Lỗi không xác định";
          fullErrorText = errors.join(" ").toLowerCase();
        } else {
          errorMessage = errors;
          fullErrorText = String(errors).toLowerCase();
        }
      } else if (e?.response?.data?.error) {
        errorMessage = e.response.data.error;
        fullErrorText = String(errorMessage).toLowerCase();
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
        fullErrorText = String(errorMessage).toLowerCase();
      } else if (typeof e?.response?.data === "string") {
        errorMessage = e.response.data;
        fullErrorText = errorMessage.toLowerCase();
      } else if (e?.message) {
        errorMessage = e.message;
        fullErrorText = errorMessage.toLowerCase();
      }

      // Kiểm tra trong toàn bộ response data nếu có
      if (!fullErrorText && e?.response?.data) {
        fullErrorText = JSON.stringify(e.response.data).toLowerCase();
      }

      // Kiểm tra nếu lỗi liên quan đến không đủ tiền (wallet balance)
      const isInsufficientBalanceError =
        fullErrorText.includes("insufficient wallet balance") ||
        fullErrorText.includes("wallet balance not enough") ||
        fullErrorText.includes("wallet has sufficient funds") ||
        (fullErrorText.includes("wallet balance") &&
          (fullErrorText.includes("not enough") ||
            fullErrorText.includes("insufficient") ||
            fullErrorText.includes("required"))) ||
        (fullErrorText.includes("wallet") &&
          (fullErrorText.includes("balance") ||
            fullErrorText.includes("insufficient")));

      if (isInsufficientBalanceError) {
        toast.error("Tổng doanh thu hiện tại không đủ để thanh toán");
      } else {
        toast.error(`Tạo thanh toán thất bại: ${errorMessage}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vnpay-modal-overlay" onClick={onClose}>
      <div className="vnpay-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="vnpay-modal-header">
          <h2>Thanh toán khác</h2>
          <button className="vnpay-close-button" onClick={onClose}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="vnpay-modal-body">
          <div className="vnpay-invoice-info">
            <h3>Thông tin hóa đơn</h3>
            <div className="vnpay-info-grid">
              <div className="vnpay-info-row">
                <span className="vnpay-label">Số hóa đơn:</span>
                <span className="vnpay-value">{invoice.invoiceNo}</span>
              </div>
              <div className="vnpay-info-row vnpay-total">
                <span className="vnpay-label">Tổng tiền:</span>
                <span className="vnpay-value">
                  {formatCurrency(invoice.amount)}
                </span>
              </div>
            </div>
          </div>

          <div className="vnpay-payment-info">
            <div className="vnpay-info-grid" style={{ gap: 12 }}>
              <div
                className="vnpay-info-row"
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <span className="vnpay-label" style={{ minWidth: 120 }}>
                  Phương thức:
                </span>
                <span className="vnpay-value" style={{ fontWeight: "500" }}>
                  Tiền mặt
                </span>
              </div>

              {/* Note field */}
              <div
                className="vnpay-info-row"
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <span className="vnpay-label" style={{ minWidth: 120 }}>
                  Ghi chú:
                </span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  className="search-input"
                  style={{
                    flex: 1,
                    minHeight: "80px",
                    resize: "vertical",
                    fontFamily: "inherit",
                    padding: "10px",
                    color: "#000",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="vnpay-action-buttons">
            <button
              className="vnpay-cancel-button"
              onClick={onClose}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              className="vnpay-button"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Đang tạo..." : "Tạo thanh toán"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherPaymentModal;
