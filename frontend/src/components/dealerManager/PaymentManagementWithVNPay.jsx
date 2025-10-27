/**
 * =====================================================
 * EXAMPLE: PaymentManagement with VNPay Integration
 * =====================================================
 *
 * File này là VÍ DỤ cách thêm VNPay vào PaymentManagement
 * KHÔNG cần thay thế file cũ!
 *
 * Nếu muốn dùng, đổi tên file này thành PaymentManagement.jsx
 * và backup file cũ trước.
 *
 * HOẶC chỉ cần COPY phần code VNPay từ file này
 * sang file PaymentManagement.jsx hiện tại!
 */

import React, { useState, useEffect } from "react";
import "./PaymentManagement.css";
import invoiceApiService from "../../services/invoiceApi";
import paymentApiService from "../../services/paymentApi";
import VNPayPaymentModal from "./VNPayPaymentModal"; // <-- THÊM DÒNG NÀY

const PaymentManagementWithVNPay = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // ========== THÊM STATE CHO VNPAY ==========
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [vnpayInvoice, setVNpayInvoice] = useState(null);
  // ==========================================

  // Load invoices from API
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = await invoiceApiService.getList();
        setInvoices(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error loading invoices:", err);
        setError("Không thể tải danh sách hóa đơn");
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Processing":
        return "status-processing";
      case "Paid":
        return "status-paid";
      case "Overdue":
        return "status-overdue";
      default:
        return "status-default";
    }
  };

  // Handle view invoice details
  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedInvoice(null);
    setProcessingPayment(false);
  };

  // ========== THÊM HANDLER CHO VNPAY ==========
  const handleVNPayPayment = (invoice) => {
    setVNpayInvoice(invoice);
    setShowVNPayModal(true);
  };
  // ============================================

  // Handle payment processing (CODE CŨ - KHÔNG ĐỔI)
  const handlePayment = async () => {
    if (!selectedInvoice) return;

    try {
      setProcessingPayment(true);
      const paymentData = {
        InvoiceId: selectedInvoice.invoiceId,
        Method: "Bank Transfer",
        ReferenceNo: `PAY-${Date.now()}`,
        Note: "Payment initiated by dealer",
      };

      await paymentApiService.createPayment(paymentData);
      const data = await invoiceApiService.getList();
      setInvoices(Array.isArray(data) ? data : []);

      const updatedInvoice = data.find(
        (inv) => inv.invoiceId === selectedInvoice.invoiceId
      );

      if (updatedInvoice) {
        setSelectedInvoice(updatedInvoice);
      }

      alert("Đã tạo thanh toán thành công! Invoice chuyển sang Processing.");
    } catch (err) {
      console.error("Payment error:", err);
      alert("Lỗi khi xử lý thanh toán: " + err.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-container">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-header">
        <h2>Quản lý Thanh toán</h2>
        <p className="subtitle">
          Xem và quản lý các hóa đơn của bạn (Có {invoices.length} hóa đơn)
        </p>
      </div>

      <div className="invoices-grid">
        {invoices.map((invoice) => (
          <div key={invoice.invoiceId} className="invoice-card">
            <div className="invoice-header">
              <h3>{invoice.invoiceNo}</h3>
              <span
                className={`status-badge ${getStatusBadgeClass(
                  invoice.status
                )}`}
              >
                {invoice.status}
              </span>
            </div>

            <div className="invoice-details">
              <div className="detail-row">
                <span className="label">Khách hàng:</span>
                <span className="value">{invoice.dealerName || "N/A"}</span>
              </div>
              <div className="detail-row">
                <span className="label">Số tiền:</span>
                <span className="value amount">
                  {formatCurrency(invoice.amount)}
                </span>
              </div>
            </div>

            <div className="invoice-actions">
              <button
                className="action-button view"
                onClick={() => handleViewDetails(invoice)}
              >
                👁️ Xem chi tiết
              </button>

              {/* ========== THÊM NÚT VNPAY ========== */}
              {invoice.status !== "Paid" && (
                <button
                  className="action-button vnpay"
                  onClick={() => handleVNPayPayment(invoice)}
                  title="Thanh toán qua VNPay"
                >
                  💳 VNPay
                </button>
              )}
              {/* ==================================== */}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL XEM CHI TIẾT (CODE CŨ - KHÔNG ĐỔI) */}
      {showDetailModal && selectedInvoice && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết hóa đơn</h2>
            <p>Invoice No: {selectedInvoice.invoiceNo}</p>
            <p>Amount: {formatCurrency(selectedInvoice.amount)}</p>
            <button onClick={handlePayment} disabled={processingPayment}>
              {processingPayment ? "Đang xử lý..." : "Thanh toán"}
            </button>
            <button onClick={handleCloseModal}>Đóng</button>
          </div>
        </div>
      )}

      {/* ========== THÊM VNPAY MODAL ========== */}
      {showVNPayModal && vnpayInvoice && (
        <VNPayPaymentModal
          invoice={vnpayInvoice}
          onClose={() => {
            setShowVNPayModal(false);
            setVNpayInvoice(null);
          }}
        />
      )}
      {/* ======================================= */}
    </div>
  );
};

export default PaymentManagementWithVNPay;
