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

  // Filter invoices based on search and status
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

    return filtered;
  }, [invoices, statusFilter, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset to page 1 when search, filter or invoices change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, invoices.length]);

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

  if (loading) {
    return (
      <div className="dealer-manager-app">
        <div className="payment-management">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách hóa đơn...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dealer-manager-app">
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
      </div>
    );
  }

  return (
    <div className="dealer-manager-app">
      <div className="payment-management">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Danh sách giao dịch</h1>
          <p className="page-subtitle">
            Theo dõi và quản lý các giao dịch thanh toán
          </p>
        </div>

        <div className="search-filter-section">
          <div className="search-filter-left">
            <div className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm giao dịch..."
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
                    {invoice.invoiceNo}
                  </div>
                  <div className="table-cell" data-column="2">
                    DL-{invoice.dealerId}
                  </div>
                  <div className="table-cell" data-column="3">
                    PO-{invoice.poId || "N/A"}
                  </div>
                  <div className="table-cell amount" data-column="4">
                    {formatCurrency(invoice.amount)}
                  </div>
                  <div className="table-cell" data-column="5">
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
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
              <p className="empty-description">Không có hóa đơn nào phù hợp</p>
            </div>
          )}

          {/* Pagination Controls - Inside table container */}
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
                      <span className="detail-value">
                        {selectedInvoice.type}
                      </span>
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
                {selectedInvoice.status !== "Paid" && (
                  <button
                    className="modal-btn vnpay-btn"
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
    </div>
  );
};

export default PaymentManagement;
