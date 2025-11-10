import React, { useState, useEffect } from "react";
import "./PaymentManagement.css";
import PageHeader from "./PageHeader";
import invoiceApiService from "../../services/invoiceApi";
import authService from "../../services/AuthService";
import VNPayPaymentModal from "./VNPayPaymentModal";
import OtherPaymentModal from "./OtherPaymentModal";

const PaymentManagement = ({ onNavigateToHome }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentDealerId, setCurrentDealerId] = useState(null);

  // VNPay states
  const [showVNPayModal, setShowVNPayModal] = useState(false);
  const [vnpayInvoice, setVNpayInvoice] = useState(null);

  // Other Payment states
  const [showOtherPaymentModal, setShowOtherPaymentModal] = useState(false);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get current dealer ID from JWT token
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const dealerIdClaim = payload["dealer_id"];
        if (dealerIdClaim) {
          setCurrentDealerId(parseInt(dealerIdClaim));
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, []);

  // Load invoices function - wrapped in useCallback to avoid dependency warnings
  const loadInvoices = React.useCallback(
    async (dealerId = null) => {
      try {
        setLoading(true);
        const data = await invoiceApiService.getList();
        let invoiceList = Array.isArray(data) ? data : [];

        // Filter invoices by dealer ID (use parameter or state)
        const filterDealerId = dealerId !== null ? dealerId : currentDealerId;
        if (filterDealerId) {
          invoiceList = invoiceList.filter(
            (invoice) => invoice.dealerId === filterDealerId
          );
        }

        // Debug: Log invoice types to verify field names
        if (invoiceList.length > 0) {
          console.log(
            "📋 Sample invoice types:",
            invoiceList.slice(0, 3).map((inv) => ({
              invoiceId: inv.invoiceId,
              type: inv.type,
              Type: inv.Type,
              invoiceType: inv.invoiceType,
              InvoiceType: inv.InvoiceType,
            }))
          );
        }

        setInvoices(invoiceList);
        setError(null);
      } catch {
        setError("Không thể tải danh sách hóa đơn");
      } finally {
        setLoading(false);
      }
    },
    [currentDealerId]
  );

  // Load invoices from API on mount and when dealerId changes
  useEffect(() => {
    if (currentDealerId !== null) {
      loadInvoices(currentDealerId);
    }

    // Check if user just returned from VNPay return page
    // This helps ensure invoices are refreshed after successful payment
    const checkVNPayReturn = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hasVNPayParams = urlParams.has("vnp_ResponseCode");
      const vnpayReturnFlag = sessionStorage.getItem("vnpay_payment_initiated");

      // If we have VNPay params or the flag is set, reload invoices
      if (hasVNPayParams || vnpayReturnFlag) {
        // Clear the flag after use
        sessionStorage.removeItem("vnpay_payment_initiated");
        // Reload invoices to get updated status
        setTimeout(() => {
          loadInvoices(currentDealerId);
        }, 1000); // Small delay to ensure backend has processed the payment
      }
    };

    checkVNPayReturn();
  }, [currentDealerId, loadInvoices]);

  // Update selectedInvoice when invoices are reloaded (to reflect latest status)
  useEffect(() => {
    if (showDetailModal && selectedInvoice && invoices.length > 0) {
      const updatedInvoice = invoices.find(
        (inv) => inv.invoiceId === selectedInvoice.invoiceId
      );
      if (updatedInvoice && updatedInvoice.status !== selectedInvoice.status) {
        setSelectedInvoice(updatedInvoice);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices]);

  // Auto-refresh when window gains focus (user returns from VNPay)
  useEffect(() => {
    if (currentDealerId === null) return;

    const handleFocus = () => {
      // Reload invoices when window regains focus (user returns from VNPay)
      loadInvoices(currentDealerId);
    };

    const handleVisibilityChange = () => {
      // Also reload when tab becomes visible (more reliable than focus)
      if (document.visibilityState === "visible") {
        loadInvoices(currentDealerId);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentDealerId, loadInvoices]);

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
      Pending: "Chờ thanh toán", // chỉnh lại
      Processing: "Chờ xử lý", // sửa lại
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
  // Filter and sort invoices based on search and status
  const filteredInvoices = React.useMemo(() => {
    let filtered = invoices;

    // Filter chỉ hiển thị B2B invoices (Dealer Manager chỉ quản lý B2B invoices từ Purchase Orders)
    // Retail invoices được quản lý riêng ở trang khác (dùng endpoint /api/retail-invoices)
    filtered = filtered.filter((invoice) => {
      // Check multiple possible field names and formats
      // Backend returns Type (PascalCase) as enum, which may be serialized as string or number
      const invoiceType =
        invoice.type ||
        invoice.Type ||
        invoice.invoiceType ||
        invoice.InvoiceType;

      // Handle both string and number formats
      // Enum values: Retail = 0, B2B = 1
      // String format: "Retail" or "B2B"
      // Number format: 0 (Retail) or 1 (B2B)
      if (invoiceType === undefined || invoiceType === null) {
        // If type is missing, skip this invoice (shouldn't happen, but safety check)
        return false;
      }

      // Check if it's B2B (string "B2B" or number 1)
      const isB2B =
        invoiceType === "B2B" ||
        invoiceType === "b2b" ||
        invoiceType === 1 ||
        String(invoiceType).toUpperCase() === "B2B";

      return isB2B;
    });

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

  // Get visible page numbers (max 3 pages) - Fixed layout like EVM Staff
  const getVisiblePageNumbers = () => {
    const pages = [];

    // Always show page 1
    pages.push(1);

    // Show appropriate middle page
    if (totalPages > 1) {
      if (currentPage === 1) {
        // If on first page, show page 2
        if (totalPages > 1) pages.push(2);
      } else if (currentPage === totalPages) {
        // If on last page, show second to last page
        if (totalPages > 2) pages.push(totalPages - 1);
      } else {
        // Show current page
        pages.push(currentPage);
      }
    }

    // Show last page if totalPages > 1
    if (totalPages > 1) {
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Handle view invoice details
  const handleViewDetails = (invoice) => {
    // Reload invoices in background to update the list
    loadInvoices(currentDealerId);
    // Show modal with current invoice data
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
    setShowDetailModal(false); // Close detail modal
    setSelectedInvoice(null); // Clear selected invoice
    setShowVNPayModal(true); // Show VNPay payment modal
  };

  // Loading and error states will be shown in the list content area

  return (
    <div className="payment-management">
      <PageHeader
        title="Quản lý thanh toán"
        subtitle="Theo dõi và quản lý các giao dịch thanh toán"
        showBackButton={true}
        onBack={onNavigateToHome}
      />

      <div className="payment-management-content">
        {/* Search and Filter */}
        <div className="page-actions">
          <div className="search-filter-group">
            <div className="search-container-inline">
              <input
                type="text"
                placeholder="Tìm kiếm hóa đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-container-inline">
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
                    Mã hóa đơn
                  </div>
                  <div className="table-cell" data-column="2">
                    Mã đại lý
                  </div>
                  <div className="table-cell" data-column="3">
                    Mã đơn hàng
                  </div>
                  <div className="table-cell" data-column="4">
                    Số tiền
                  </div>
                  <div className="table-cell" data-column="5">
                    Trạng thái
                  </div>
                  <div className="table-cell" data-column="6">
                    Thao tác
                  </div>
                </div>

                {currentInvoices.length > 0 ? (
                  <div className="payment-table-rows">
                    {currentInvoices.map((invoice) => (
                      <div
                        key={invoice.invoiceId}
                        className="payment-table-row"
                      >
                        <div className="table-cell" data-column="1">
                          <span className="invoice-id">
                            {invoice.invoiceNo}
                          </span>
                        </div>
                        <div className="table-cell" data-column="2">
                          <span className="dealer-id">
                            DL-{invoice.dealerId}
                          </span>
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
                          <span
                            className={`status-badge ${
                              invoice.status?.toLowerCase() || "pending"
                            }`}
                          >
                            {translateStatus(invoice.status)}
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

                  {getVisiblePageNumbers().map((page) => (
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
          <div
            className="payment-detail-modal-overlay"
            onClick={handleCloseModal}
          >
            <div
              className="payment-detail-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="payment-detail-modal-header">
                <div className="payment-detail-modal-header-left">
                  <div className="payment-detail-modal-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <div>
                    <h2 className="payment-detail-modal-title">
                      Chi tiết hóa đơn
                    </h2>
                    <p className="payment-detail-modal-subtitle">
                      Thông tin chi tiết về hóa đơn thanh toán
                    </p>
                  </div>
                </div>
                <button
                  className="payment-detail-close-btn"
                  onClick={handleCloseModal}
                >
                  Đóng
                </button>
              </div>

              {/* Body */}
              <div className="payment-detail-modal-body">
                {/* 2-Column Grid Layout */}
                <div className="payment-detail-content-grid">
                  {/* Left Column */}
                  <div className="payment-detail-content-col">
                    {/* Invoice Info Card */}
                    <div className="payment-detail-info-card">
                      <div className="payment-detail-card-header">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <h4>Thông tin hóa đơn</h4>
                      </div>
                      <div className="payment-detail-grid">
                        <div className="payment-detail-item">
                          <span className="payment-detail-label">
                            Mã hóa đơn
                          </span>
                          <span className="payment-detail-value">
                            {selectedInvoice.invoiceNo}
                          </span>
                        </div>
                        <div className="payment-detail-item">
                          <span className="payment-detail-label">
                            Trạng thái
                          </span>
                          <span
                            className={`payment-status-badge ${selectedInvoice.status?.toLowerCase()}`}
                          >
                            {translateStatus(selectedInvoice.status)}
                          </span>
                        </div>
                        <div className="payment-detail-item full-width">
                          <span className="payment-detail-label">Số tiền</span>
                          <span className="payment-detail-value payment-amount">
                            {formatCurrency(selectedInvoice.amount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Basic Info Card */}
                    <div className="payment-detail-info-card">
                      <div className="payment-detail-card-header">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4"></path>
                          <path d="M12 8h.01"></path>
                        </svg>
                        <h4>Thông tin cơ bản</h4>
                      </div>
                      <div className="payment-detail-grid">
                        <div className="payment-detail-item">
                          <span className="payment-detail-label">
                            Loại hóa đơn
                          </span>
                          <span className="payment-detail-value">
                            {selectedInvoice.type || "N/A"}
                          </span>
                        </div>
                        <div className="payment-detail-item">
                          <span className="payment-detail-label">Tiền tệ</span>
                          <span className="payment-detail-value">
                            {selectedInvoice.currency || "VND"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Time Info Card */}
                    <div className="payment-detail-info-card">
                      <div className="payment-detail-card-header">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <h4>Thông tin thời gian</h4>
                      </div>
                      <div className="payment-detail-grid">
                        <div className="payment-detail-item">
                          <span className="payment-detail-label">Ngày tạo</span>
                          <span className="payment-detail-value">
                            {new Date(
                              selectedInvoice.issuedAt
                            ).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="payment-detail-item">
                          <span className="payment-detail-label">Giờ tạo</span>
                          <span className="payment-detail-value">
                            {new Date(
                              selectedInvoice.issuedAt
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="payment-detail-item full-width">
                          <span className="payment-detail-label">
                            Hạn thanh toán
                          </span>
                          <span className="payment-detail-value">
                            {new Date(selectedInvoice.dueAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="payment-detail-content-col">
                    {/* Related Info Card */}
                    <div className="payment-detail-info-card">
                      <div className="payment-detail-card-header">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <h4>Thông tin liên quan</h4>
                      </div>
                      <div className="payment-detail-grid">
                        <div className="payment-detail-item">
                          <span className="payment-detail-label">
                            Mã đại lý
                          </span>
                          <span className="payment-detail-value">
                            DL-{selectedInvoice.dealerId}
                          </span>
                        </div>
                        <div className="payment-detail-item">
                          <span className="payment-detail-label">
                            Mã đơn hàng
                          </span>
                          <span className="payment-detail-value">
                            {selectedInvoice.poId ? (
                              `PO-${selectedInvoice.poId}`
                            ) : (
                              <span className="payment-value-na">N/A</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Notes Card */}
                    {selectedInvoice.note && (
                      <div className="payment-detail-info-card">
                        <div className="payment-detail-card-header">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                          </svg>
                          <h4>Ghi chú</h4>
                        </div>
                        <div className="payment-detail-info-body">
                          <p className="payment-note-content">
                            {selectedInvoice.note}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Payment Actions Card */}
                    {selectedInvoice.status === "Pending" && (
                      <div className="payment-detail-actions-card">
                        <div className="payment-detail-actions-body">
                          <button
                            className="payment-action-btn primary"
                            onClick={() => {
                              setShowDetailModal(false); // Close detail modal
                              setShowOtherPaymentModal(true); // Show other payment modal
                            }}
                          >
                            Thanh toán khác
                          </button>
                          <button
                            className="payment-action-btn success"
                            onClick={() => handleVNPayPayment(selectedInvoice)}
                          >
                            Thanh toán VNPay
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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

        {/* Other Payment Modal */}
        {showOtherPaymentModal && selectedInvoice && (
          <OtherPaymentModal
            invoice={selectedInvoice}
            onClose={() => setShowOtherPaymentModal(false)}
            onSuccess={() => {
              setShowOtherPaymentModal(false);
              setShowDetailModal(false);
              // Reload lại hóa đơn sau khi thanh toán thành công
              loadInvoices(currentDealerId);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
