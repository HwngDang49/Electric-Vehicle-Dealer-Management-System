import React, { useState, useEffect } from "react";
import "./PaymentManagement.css";
import PageHeader from "./PageHeader";
import CustomDropdown from "../admin/CustomDropdown";
import invoiceApiService from "../../services/invoiceApi";
import dealerApiService from "../../services/dealerApi";
import authService from "../../services/AuthService";
import api from "../../services/api";
import VNPayPaymentModal from "./VNPayPaymentModal";
import OtherPaymentModal from "./OtherPaymentModal";

const PaymentManagement = ({ onNavigateToHome }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentDealerId, setCurrentDealerId] = useState(null);
  const [dealerName, setDealerName] = useState(null);

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

  // Get current dealer ID from JWT token and load dealer name
  useEffect(() => {
    const token = authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const dealerIdClaim = payload["dealer_id"];
        if (dealerIdClaim) {
          const dealerId = parseInt(dealerIdClaim);
          setCurrentDealerId(dealerId);
          
          // Load dealer name
          const loadDealerName = async () => {
            try {
              const dealerInfo = await dealerApiService.getDealerById(dealerId);
              const dealerData = dealerInfo?.data || dealerInfo;
              const name = dealerData?.name || dealerData?.Name || null;
              setDealerName(name);
            } catch (error) {
              console.error("Error loading dealer name:", error);
            }
          };
          loadDealerName();
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

  // Status filter options
  const statusFilterOptions = [
    { value: "All", label: "Tất cả trạng thái" },
    { value: "Pending", label: "Chờ thanh toán" },
    { value: "Processing", label: "Đang xử lý" },
    { value: "Paid", label: "Đã thanh toán" },
    { value: "Overdue", label: "Quá hạn" },
  ];

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

  // Handle VNPay payment - chuyển thẳng đến trang thanh toán VNPay
  const handleVNPayPayment = async (invoice) => {
    if (!invoice || !invoice.invoiceId) return;

    try {
      // Đóng detail modal
      setShowDetailModal(false);
      setSelectedInvoice(null);

      // Gọi API để tạo VNPay payment URL
      const response = await api.post("/vnpay/create", {
        invoiceId: invoice.invoiceId,
      });

      if (response.data && response.data.paymentUrl) {
        // Set flag để detect return từ VNPay
        sessionStorage.setItem("vnpay_payment_initiated", "true");

        // Chuyển thẳng đến trang thanh toán VNPay
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error("Không nhận được link thanh toán");
      }
    } catch (error) {
      console.error("VNPay payment error:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo thanh toán VNPay. Vui lòng thử lại.";
      alert("Lỗi: " + errorMessage);
    }
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
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm hóa đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </div>
            <div className="filter-container-inline">
              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusFilterOptions}
                placeholder="Chọn trạng thái"
                compact={true}
                minWidth="100%"
              />
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
                <table className="payment-table" style={{ opacity: loading ? 0.5 : 1 }}>
                  <thead>
                    <tr>
                      <th>Mã hóa đơn</th>
                      <th>Tên đại lý</th>
                      <th>Mã đơn hàng</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentInvoices.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="no-data">
                          📋 {searchTerm
                            ? "Không tìm thấy hóa đơn phù hợp với từ khóa tìm kiếm"
                            : "Chưa có hóa đơn nào trong hệ thống"}
                        </td>
                      </tr>
                    ) : (
                      currentInvoices.map((invoice) => (
                        <tr key={invoice.invoiceId}>
                          <td>
                            <span className="invoice-id">
                              {invoice.invoiceNo}
                            </span>
                          </td>
                          <td>
                            <span className="dealer-name">
                              {dealerName || `DL-${invoice.dealerId}`}
                            </span>
                          </td>
                          <td>
                            <span className="po-id">
                              {invoice.poId ? `PO-${invoice.poId}` : "N/A"}
                            </span>
                          </td>
                          <td>
                            <span className="amount-value">
                              {formatCurrency(invoice.amount)}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                invoice.status?.toLowerCase() || "pending"
                              }`}
                            >
                              {translateStatus(invoice.status)}
                            </span>
                          </td>
                          <td>
                            <span className="date-value">
                              {invoice.issuedAt
                                ? new Date(invoice.issuedAt).toLocaleDateString("vi-VN", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                  })
                                : "-"}
                            </span>
                          </td>
                          <td>
                            <button
                              className="view-detail-btn"
                              onClick={() => handleViewDetails(invoice)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                              </svg>
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
                            Tên đại lý
                          </span>
                          <span className="payment-detail-value">
                            {dealerName || `DL-${selectedInvoice.dealerId}`}
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
