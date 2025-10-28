import React, { useState, useEffect } from "react";
import "./PaymentManagement.css";
import invoiceApiService from "../../services/invoiceApi";
import apiClient from "../../services/api";

const PaymentManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load invoices from API
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceApiService.getList();
      console.log("📋 API Response:", data);
      // Đảm bảo data là array
      let invoiceList = Array.isArray(data) ? data : [];

      // Sort by issuedAt descending (newest first)
      invoiceList.sort((a, b) => {
        const dateA = new Date(a.issuedAt || a.createdAt || 0);
        const dateB = new Date(b.issuedAt || b.createdAt || 0);
        return dateB - dateA; // Descending order
      });

      setInvoices(invoiceList);
      setError(null);
    } catch (err) {
      console.error("Error loading invoices:", err);
      setError("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadInvoices();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "processing":
        return "status-processing";
      case "paid":
        return "status-paid";
      case "overdue":
        return "status-overdue";
      default:
        return "status-default";
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = invoices.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get visible page numbers (max 5 pages at a time)
  const getVisiblePages = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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
    setConfirmingPayment(false);
  };

  // Handle confirm payment (EVM Staff xác nhận thanh toán)
  const handleConfirmPayment = async () => {
    if (!selectedInvoice) return;

    try {
      setConfirmingPayment(true);
      console.log(
        "✅ EVM Staff confirming payment for invoice:",
        selectedInvoice.invoiceId
      );

      // Gọi API confirm payment
      const response = await apiClient.post(
        `/confirm-payment/${selectedInvoice.invoiceId}`
      );
      console.log("✅ Payment confirmed:", response.data);

      // Reload invoices
      await loadInvoices();
      handleCloseModal();

      alert("✅ Đã xác nhận thanh toán thành công! Tiền đã được trừ.");
    } catch (error) {
      console.error("❌ Error confirming payment:", error);
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      alert("Lỗi khi xác nhận thanh toán: " + errorMsg);
    } finally {
      setConfirmingPayment(false);
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
          <button className="retry-btn" onClick={() => loadInvoices()}>
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
          {/* Table Header */}
          <div className="table-header-row">
            <div className="table-header-cell">Invoice ID</div>
            <div className="table-header-cell">Dealer ID</div>
            <div className="table-header-cell">PO ID</div>
            <div className="table-header-cell">Amount</div>
            <div className="table-header-cell">Status</div>
            <div className="table-header-cell">Action</div>
          </div>

          {/* Table Rows */}
          <div className="table-rows">
            {currentInvoices.map((invoice) => (
              <div key={invoice.invoiceId} className="table-row">
                <div className="table-cell">
                  <span className="cell-content">{invoice.invoiceNo}</span>
                </div>
                <div className="table-cell">
                  <span className="cell-content">DL-{invoice.dealerId}</span>
                </div>
                <div className="table-cell">
                  <span className="cell-content">
                    PO-{invoice.poId || "N/A"}
                  </span>
                </div>
                <div className="table-cell">
                  <span className="cell-content amount">
                    {formatCurrency(invoice.amount)}
                  </span>
                </div>
                <div className="table-cell">
                  <span
                    className={`status-badge ${getStatusBadgeClass(
                      invoice.status
                    )}`}
                  >
                    {invoice.status}
                  </span>
                </div>
                <div className="table-cell">
                  <button
                    className="action-btn"
                    onClick={() => handleViewDetails(invoice)}
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
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

        {/* Pagination */}
        {invoices.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Hiển thị {startIndex + 1}-{Math.min(endIndex, invoices.length)}{" "}
              trong tổng số {invoices.length} giao dịch
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Trước
              </button>

              {getVisiblePages().map((page) => (
                <button
                  key={page}
                  className={`pagination-number ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau →
              </button>
            </div>
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
              {selectedInvoice.status === "Processing" && (
                <button
                  className="modal-btn confirm-payment-btn"
                  onClick={handleConfirmPayment}
                  disabled={confirmingPayment}
                >
                  {confirmingPayment ? (
                    <>
                      <span className="spinner"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Xác nhận thanh toán
                    </>
                  )}
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
