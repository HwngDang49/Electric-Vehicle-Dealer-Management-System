import React, { useState, useEffect } from "react";
import "./PaymentManagement.css";
import invoiceApiService from "../../services/invoiceApi";
import paymentApiService from "../../services/paymentApi";

const PaymentManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Load invoices from API
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = await invoiceApiService.getList();
        console.log("📋 API Response:", data);
        // Đảm bảo data là array
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

  // Handle payment processing
  const handlePayment = async () => {
    if (!selectedInvoice) return;

    try {
      setProcessingPayment(true);
      console.log(
        "💳 Processing payment for invoice:",
        selectedInvoice.invoiceId
      );

      // Create payment - sẽ tự động cập nhật Invoice status sang Processing
      const paymentData = {
        InvoiceId: selectedInvoice.invoiceId, // Backend expect chữ I hoa
        Method: "Bank Transfer", // Có thể để user chọn
        ReferenceNo: `PAY-${Date.now()}`,
        Note: "Payment initiated by dealer",
      };

      await paymentApiService.createPayment(paymentData);

      // Reload invoices from backend
      const data = await invoiceApiService.getList();
      setInvoices(Array.isArray(data) ? data : []);

      // Update selected invoice
      const updatedInvoice = data.find(
        (inv) => inv.invoiceId === selectedInvoice.invoiceId
      );
      if (updatedInvoice) {
        setSelectedInvoice(updatedInvoice);
      }

      // Show success message
      alert("✅ Đã tạo thanh toán thành công! Invoice chuyển sang Processing.");
    } catch (error) {
      console.error("❌ Error processing payment:", error);
      console.error("❌ Error response data:", error.response?.data);
      console.error("❌ Error response status:", error.response?.status);
      console.error("❌ Full error:", JSON.stringify(error.response, null, 2));

      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        "Unknown error";
      alert("Lỗi khi xử lý thanh toán: " + errorMsg);
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-management">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý thanh toán</h1>
        <p className="page-subtitle">
          Theo dõi và quản lý các giao dịch thanh toán của đại lý
        </p>
      </div>

      {/* Payment Table */}
      <div className="payment-table-section">
        <div className="table-header">
          <h3 className="table-title">Danh sách giao dịch</h3>
        </div>

        <div className="table-container">
          <table className="payment-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Dealer ID</th>
                <th>PO ID</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.invoiceId}>
                  <td>
                    <div className="invoice-info">
                      <div className="invoice-id">{invoice.invoiceNo}</div>
                    </div>
                  </td>
                  <td>
                    <div className="dealer-info">
                      <div className="dealer-id">DL-{invoice.dealerId}</div>
                    </div>
                  </td>
                  <td>
                    <div className="po-info">
                      <div className="po-id">PO-{invoice.poId || "N/A"}</div>
                    </div>
                  </td>
                  <td>
                    <div className="amount-info">
                      <div className="amount">
                        {formatCurrency(invoice.amount)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleViewDetails(invoice)}
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="no-data">
            <div className="no-data-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h3>Không tìm thấy dữ liệu</h3>
            <p>Không có giao dịch nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Chi tiết hóa đơn</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="invoice-detail-grid">
                <div className="detail-section">
                  <h3 className="section-title">Thông tin cơ bản</h3>
                  <div className="detail-row">
                    <span className="detail-label">Mã hóa đơn:</span>
                    <span className="detail-value">
                      {selectedInvoice.invoiceNo}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Loại hóa đơn:</span>
                    <span className="detail-value">{selectedInvoice.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Trạng thái:</span>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        selectedInvoice.status
                      )}`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Số tiền:</span>
                    <span className="detail-value amount">
                      {formatCurrency(selectedInvoice.amount)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Tiền tệ:</span>
                    <span className="detail-value">
                      {selectedInvoice.currency}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="section-title">Thông tin liên quan</h3>
                  <div className="detail-row">
                    <span className="detail-label">Mã đại lý:</span>
                    <span className="detail-value">
                      DL-{selectedInvoice.dealerId}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Mã đơn hàng:</span>
                    <span className="detail-value">
                      {selectedInvoice.poId
                        ? `PO-${selectedInvoice.poId}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Mã bán hàng:</span>
                    <span className="detail-value">
                      {selectedInvoice.saleDocId
                        ? `SD-${selectedInvoice.saleDocId}`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3 className="section-title">Thông tin thời gian</h3>
                  <div className="detail-row">
                    <span className="detail-label">Ngày tạo:</span>
                    <span className="detail-value">
                      {new Date(selectedInvoice.issuedAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Hạn thanh toán:</span>
                    <span className="detail-value">
                      {new Date(selectedInvoice.dueAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Thời gian tạo:</span>
                    <span className="detail-value">
                      {new Date(selectedInvoice.issuedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                </div>

                {selectedInvoice.note && (
                  <div className="detail-section">
                    <h3 className="section-title">Ghi chú</h3>
                    <div className="detail-row">
                      <span className="detail-label">Nội dung:</span>
                      <span className="detail-value">
                        {selectedInvoice.note}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              {selectedInvoice.status === "Pending" ? (
                <button
                  className="modal-btn payment-btn"
                  onClick={handlePayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? "Đang xử lý..." : "Thanh toán"}
                </button>
              ) : selectedInvoice.status === "Processing" ? (
                <button className="modal-btn processing-btn" disabled>
                  Đang xử lý thanh toán
                </button>
              ) : (
                <button className="modal-btn paid-btn" disabled>
                  Đã thanh toán
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
