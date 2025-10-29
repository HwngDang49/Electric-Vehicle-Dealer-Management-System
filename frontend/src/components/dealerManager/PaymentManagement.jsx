import React, { useState, useEffect } from "react";
import "./PaymentManagement.css";
import invoiceApiService from "../../services/invoiceApi";
import VNPayPaymentModal from "./VNPayPaymentModal";

const PaymentManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // VNPay states
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [vnpayInvoice, setVNpayInvoice] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load invoices from API
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = await invoiceApiService.getList();
        setInvoices(Array.isArray(data) ? data : []);
        setError(null);
      } catch {
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

  // Status Translation - Map status to Vietnamese for UI display only
  const translateStatus = (status) => {
    const statusTranslation = {
      Pending: "Đang chờ",
      Processing: "Đang xử lý",
      Paid: "Đã thanh toán",
      Overdue: "Quá hạn",
      Draft: "Nháp",
      Submitted: "Đã gửi",
      Approved: "Đã duyệt",
      Confirmed: "Đã xác nhận",
      Cancelled: "Đã hủy",
    };
    return statusTranslation[status] || status;
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

  // Filter and sort invoices based on search and status
  const filteredInvoices = React.useMemo(() => {
    let filtered = invoices;

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter(
        (invoice) =>
          invoice.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.dealerId?.toString().includes(searchTerm) ||
          invoice.poId?.toString().includes(searchTerm)
      );
    }

    // Sort by updatedAt/modifiedAt (newest first), then issuedAt, then invoiceId
    filtered = [...filtered].sort((a, b) => {
      // Priority 1: Sort by updatedAt or modifiedAt if available (newest first)
      const aUpdated = a.updatedAt || a.modifiedAt || a.lastModified;
      const bUpdated = b.updatedAt || b.modifiedAt || b.lastModified;

      if (aUpdated && bUpdated) {
        const dateDiff = new Date(bUpdated) - new Date(aUpdated);
        if (dateDiff !== 0) return dateDiff;
      }

      // Priority 2: Sort by issuedAt if available (newest first)
      if (a.issuedAt && b.issuedAt) {
        const dateDiff = new Date(b.issuedAt) - new Date(a.issuedAt);
        if (dateDiff !== 0) return dateDiff;
      }

      // Priority 3: Fallback to invoiceId (higher ID = newer)
      return (b.invoiceId || 0) - (a.invoiceId || 0);
    });

    return filtered;
  }, [invoices, statusFilter, searchTerm]);

  // Pagination logic - New implementation
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Handle view invoice details
  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedInvoice(null);
  };

  // Handle VNPay payment
  const handleVNPayPayment = (invoice) => {
    setVNpayInvoice(invoice);
    setShowVNPayModal(true);
  };

  // Loading and error states will be shown in the list content area

  return (
    <div className="dealer-manager-app payment-management">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Quản lý thanh toán</h1>
        <p className="page-subtitle">
          Theo dõi và quản lý các giao dịch thanh toán
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <div className="search-filter-left">
          <div className="search-container">
            <input
              type="text"
              placeholder="Tìm kiếm hóa đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-container">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Pending">Chờ thanh toán</option>
              <option value="Processing">Đang xử lý</option>
              <option value="Paid">Đã thanh toán</option>
              <option value="Overdue">Quá hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Table */}
      <div className="payment-list-container">
        <div className="payment-list-header">
          <h2 className="list-title">
            Danh sách giao dịch ({filteredInvoices.length})
          </h2>
        </div>

        <div className="payment-list-content">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải danh sách hóa đơn...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>❌ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="payment-table-container">
              <div className="payment-table-header">
                <div className="table-cell" data-column="1">
                  Invoice ID
                </div>
                <div className="table-cell" data-column="2">
                  Dealer ID
                </div>
                <div className="table-cell" data-column="3">
                  PO ID
                </div>
                <div className="table-cell" data-column="4">
                  Amount
                </div>
                <div className="table-cell" data-column="5">
                  Status
                </div>
                <div className="table-cell" data-column="6">
                  Action
                </div>
              </div>

              {currentInvoices.length > 0 ? (
                <div className="payment-table-rows">
                  {currentInvoices.map((invoice) => (
                    <div key={invoice.invoiceId} className="payment-table-row">
                      <div className="table-cell" data-column="1">
                        <span className="invoice-id">{invoice.invoiceNo}</span>
                      </div>
                      <div className="table-cell" data-column="2">
                        <span className="dealer-id">DL-{invoice.dealerId}</span>
                      </div>
                      <div className="table-cell" data-column="3">
                        <span className="po-id">
                          {invoice.poId ? `PO-${invoice.poId}` : "N/A"}
                        </span>
                      </div>
                      <div className="table-cell amount" data-column="4">
                        <span className="amount-value">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </div>
                      <div className="table-cell" data-column="5">
                        {translateStatus(invoice.status)}
                      </div>
                      <div className="table-cell actions" data-column="6">
                        <button
                          className="action-btn view"
                          onClick={() => handleViewDetails(invoice)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3 className="empty-title">Không tìm thấy giao dịch</h3>
                  <p className="empty-description">
                    Không có hóa đơn nào phù hợp với bộ lọc hiện tại
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Hiển thị {startIndex + 1}-
                {Math.min(endIndex, filteredInvoices.length)} trong tổng số{" "}
                {filteredInvoices.length} bản ghi
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
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

                <div className="pagination-numbers">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          className={`pagination-number ${
                            currentPage === pageNum ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <span key={pageNum} className="pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  className="pagination-btn"
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
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="invoice-modal-overlay" onClick={handleCloseModal}>
          <div
            className="invoice-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="invoice-modal-header">
              <h2>Chi tiết hóa đơn</h2>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <div className="invoice-modal-body">
              <div className="invoice-detail-section">
                <h3>Thông tin cơ bản</h3>
                <div className="detail-info-grid">
                  <div className="detail-item">
                    <span className="detail-label">Mã hóa đơn:</span>
                    <span className="detail-value">
                      {selectedInvoice.invoiceNo}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Loại hóa đơn:</span>
                    <span className="detail-value">{selectedInvoice.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái:</span>
                    {translateStatus(selectedInvoice.status)}
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Số tiền:</span>
                    <span className="detail-value amount-highlight">
                      {formatCurrency(selectedInvoice.amount)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Tiền tệ:</span>
                    <span className="detail-value">
                      {selectedInvoice.currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="invoice-detail-section">
                <h3>Thông tin liên quan</h3>
                <div className="detail-info-grid">
                  <div className="detail-item">
                    <span className="detail-label">Mã đại lý:</span>
                    <span className="detail-value">
                      DL-{selectedInvoice.dealerId}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mã đơn hàng:</span>
                    <span className="detail-value">
                      {selectedInvoice.poId
                        ? `PO-${selectedInvoice.poId}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mã bán hàng:</span>
                    <span className="detail-value">
                      {selectedInvoice.saleDocId
                        ? `SD-${selectedInvoice.saleDocId}`
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="invoice-detail-section">
                <h3>Thông tin thời gian</h3>
                <div className="detail-info-grid">
                  <div className="detail-item">
                    <span className="detail-label">Ngày tạo:</span>
                    <span className="detail-value">
                      {new Date(selectedInvoice.issuedAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Hạn thanh toán:</span>
                    <span className="detail-value">
                      {new Date(selectedInvoice.dueAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Thời gian tạo:</span>
                    <span className="detail-value">
                      {new Date(selectedInvoice.issuedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {selectedInvoice.note && (
                <div className="invoice-detail-section">
                  <h3>Ghi chú</h3>
                  <div className="detail-info-grid">
                    <div className="detail-item full-width">
                      <span className="detail-label">Nội dung:</span>
                      <span className="detail-value">
                        {selectedInvoice.note}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="invoice-modal-footer">
              {selectedInvoice.status !== "Paid" && (
                <button
                  className="vnpay-button"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleVNPayPayment(selectedInvoice);
                  }}
                >
                  💳 Thanh toán VNPay
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VNPay Payment Modal */}
      {showVNPayModal && vnpayInvoice && (
        <VNPayPaymentModal
          invoice={vnpayInvoice}
          onClose={() => {
            setShowVNPayModal(false);
            setVNpayInvoice(null);
          }}
        />
      )}
    </div>
  );
};

export default PaymentManagement;
