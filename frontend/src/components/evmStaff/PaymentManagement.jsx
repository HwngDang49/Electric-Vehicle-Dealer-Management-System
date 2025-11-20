import React, { useState, useEffect, useMemo } from "react";
import "./PaymentManagement.css";
import CustomDropdown from "../admin/CustomDropdown";
import invoiceApiService from "../../services/invoiceApi";
import apiClient from "../../services/api";
import dealerApiService from "../../services/dealerApi";
import { useToast } from "../../contexts/useToast";

const PaymentManagement = ({ onBack }) => {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [dealerNames, setDealerNames] = useState({});

  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");
  // EVM Staff chỉ quản lý B2B invoices, không cần filter theo type (đã filter khi load)
  const [searchTerm, setSearchTerm] = useState("");

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
      let invoiceList = Array.isArray(data) ? data : [];

      // Debug: Log invoice types to verify field names and values
      if (invoiceList.length > 0) {
        console.log(
          "📋 EVM Staff - Sample invoice types:",
          invoiceList.slice(0, 5).map((inv) => ({
            invoiceId: inv.invoiceId,
            invoiceNo: inv.invoiceNo,
            type: inv.type,
            Type: inv.Type,
            invoiceType: inv.invoiceType,
            InvoiceType: inv.InvoiceType,
            allKeys: Object.keys(inv),
          }))
        );
      }

      // EVM Staff chỉ quản lý B2B invoices - loại bỏ Retail invoices ngay từ đầu
      invoiceList = invoiceList.filter((invoice) => {
        const invoiceType =
          invoice.type ||
          invoice.Type ||
          invoice.invoiceType ||
          invoice.InvoiceType;
        
        if (invoiceType === undefined || invoiceType === null) {
          return false; // Bỏ qua invoice không có type
        }
        
        // Convert to string for comparison
        const typeStr = String(invoiceType).trim();
        const typeUpper = typeStr.toUpperCase();
        
        // Chỉ giữ lại B2B invoices (string "B2B" hoặc number 1)
        const isB2B =
          typeStr === "B2B" ||
          typeUpper === "B2B" ||
          invoiceType === 1;
        
        return isB2B;
      });

      // Sort by issuedAt descending (newest first)
      invoiceList.sort((a, b) => {
        const dateA = new Date(a.issuedAt || a.createdAt || 0);
        const dateB = new Date(b.issuedAt || b.createdAt || 0);
        return dateB - dateA; // Descending order
      });

      setInvoices(invoiceList);

      // Load dealer names map
      const uniqueDealerIds = [
        ...new Set(
          invoiceList.map((i) => i.dealerId).filter((id) => id != null)
        ),
      ];
      const namesMap = {};
      await Promise.all(
        uniqueDealerIds.map(async (dealerId) => {
          try {
            const res = await dealerApiService.getDealerById(dealerId);
            const dealer = res?.data || res;
            if (dealer?.name || dealer?.Name) {
              namesMap[dealerId] = dealer.name || dealer.Name;
            }
          } catch {
            namesMap[dealerId] = null;
          }
        })
      );
      setDealerNames(namesMap);
      setError(null);
    } catch {
      setError("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
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

  // Get status text in Vietnamese
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Chờ thanh toán";
      case "processing":
        return "Chờ xử lý";
      case "paid":
        return "Đã thanh toán";
      case "overdue":
        return "Quá hạn";
      default:
        return status || "N/A";
    }
  };

  // Dropdown options
  const statusFilterOptions = [
    { value: "All", label: "Tất cả trạng thái" },
    { value: "Pending", label: "Chờ thanh toán" },
    { value: "Processing", label: "Chờ xử lý" },
    { value: "Paid", label: "Đã thanh toán" },
    { value: "Overdue", label: "Quá hạn" },
  ];

  // Filter invoices by status
  // Lưu ý: invoices đã được filter để chỉ chứa B2B invoices khi load từ API
  const filteredInvoices = useMemo(() => {
    let list = invoices;
    
    // EVM Staff chỉ quản lý B2B invoices - đã filter khi load từ API
    // Không cần filter theo type nữa
    
    // Filter by status
    if (statusFilter !== "All") {
      list = list.filter(
        (invoice) =>
          invoice.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Filter by search term
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      list = list.filter((invoice) => {
        const invoiceNo = String(invoice.invoiceNo || "").toLowerCase();
        const poStr = `po-${invoice.poId ?? ""}`.toLowerCase();
        const dealerStr = String(
          dealerNames[invoice.dealerId] || invoice.dealerId || ""
        ).toLowerCase();
        return (
          invoiceNo.includes(term) ||
          poStr.includes(term) ||
          dealerStr.includes(term)
        );
      });
    }
    return list;
  }, [invoices, statusFilter, searchTerm, dealerNames]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get visible page numbers - Match Admin logic
  const getVisiblePages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("ellipsis");
      }
    }
    return pages;
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

      await apiClient.post(`/confirm-payment/${selectedInvoice.invoiceId}`);

      // Create notification for successful payment confirmation
      const notificationId = `payment-confirmed-${selectedInvoice.invoiceId}-${Date.now()}`;
      const paymentNotification = {
        id: notificationId,
        type: "payment_confirmed",
        title: "Xác nhận thanh toán thành công",
        message: `Đã xác nhận thanh toán thành công cho hóa đơn ${selectedInvoice.invoiceNo || `HD${selectedInvoice.invoiceId}`}. Số tiền: ${formatCurrency(selectedInvoice.amount)}`,
        invoiceId: selectedInvoice.invoiceId,
        invoiceNo: selectedInvoice.invoiceNo || `HD${selectedInvoice.invoiceId}`,
        amount: selectedInvoice.amount,
        createdAt: new Date().toISOString(),
        read: false,
      };

      // Save notification to localStorage
      const existingNotifications = JSON.parse(
        localStorage.getItem("evmStaffPaymentNotifications") || "[]"
      );
      existingNotifications.unshift(paymentNotification); // Add to beginning
      // Keep only last 100 notifications
      const limitedNotifications = existingNotifications.slice(0, 100);
      localStorage.setItem(
        "evmStaffPaymentNotifications",
        JSON.stringify(limitedNotifications)
      );

      await loadInvoices();
      handleCloseModal();

      toast.success("Thành công", {
        message: "Đã xác nhận thanh toán thành công! Tiền đã được trừ.",
      });
    } catch (error) {
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      toast.error("Lỗi", {
        message: "Lỗi khi xác nhận thanh toán: " + errorMsg,
      });
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="evm-staff-payment-management">
        <div className="evm-staff-loading">
          <div className="evm-staff-spinner"></div>
          <p>Đang tải danh sách hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="evm-staff-payment-management">
        <div className="evm-staff-error-container">
          <div className="evm-staff-error-icon">⚠️</div>
          <h3>Lỗi tải dữ liệu</h3>
          <p>{error}</p>
          <button
            className="evm-staff-retry-btn"
            onClick={() => loadInvoices()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="evm-staff-payment-management">
      {/* Body Section */}
      <div className="evm-staff-page-body">
        <div className="payment-management">
          {/* Search and Filter Bar */}
          <div className="management-toolbar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm hóa đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </div>
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusFilterOptions}
              placeholder="Chọn trạng thái"
              compact={true}
              minWidth="180px"
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="payments-table-container" key={`page-${currentPage}-search-${searchTerm}`}>
          {loading && (
            <div className="table-loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          <table className="payments-table" style={{ opacity: loading ? 0.5 : 1 }}>
            <thead>
              <tr>
                <th>Mã hóa đơn</th>
                <th>Đại lý</th>
                <th>Mã đơn hàng</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    📋 Không tìm thấy hóa đơn. Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </td>
                </tr>
              ) : (
                currentInvoices.map((invoice) => (
                  <tr key={invoice.invoiceId}>
                    <td>
                      <span className="evm-staff-invoice-id">
                        {invoice.invoiceNo}
                      </span>
                    </td>
                    <td>
                      <span className="evm-staff-dealer-name">
                        {dealerNames[invoice.dealerId]
                          ? dealerNames[invoice.dealerId]
                          : `DL-${invoice.dealerId}`}
                      </span>
                    </td>
                    <td>
                      <span className="evm-staff-po-id">
                        PO-{invoice.poId || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="evm-staff-amount">
                        {formatCurrency(invoice.amount)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`evm-staff-status evm-staff-status-${(
                          invoice.status || ""
                        ).toLowerCase()}`}
                      >
                        {getStatusText(invoice.status)}
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

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                  </svg>
                  Trước
                </button>

                <div className="pagination-numbers">
                  {getVisiblePages().map((page, index) => {
                    if (page === "ellipsis") {
                      return (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        className={`pagination-number ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
          className="invoice-detail-modal-overlay"
          onClick={handleCloseModal}
        >
          <div
            className="invoice-detail-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="invoice-detail-modal-header">
              <div className="invoice-detail-modal-header-left">
                <div className="invoice-detail-modal-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <h2 className="invoice-detail-modal-title">
                    Chi tiết hóa đơn
                  </h2>
                  <p className="invoice-detail-modal-subtitle">
                    {selectedInvoice.invoiceNo}
                  </p>
                </div>
              </div>
              <div className="invoice-detail-modal-header-actions">
                <span
                  className={`invoice-status-badge ${getStatusBadgeClass(
                    selectedInvoice.status
                  )}`}
                >
                  {getStatusText(selectedInvoice.status)}
                </span>
                <button
                  className="invoice-detail-close-btn"
                  onClick={handleCloseModal}
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="invoice-detail-modal-body">
              <div className="invoice-details">
                {/* Left Column - Invoice Info */}
                <div className="invoice-info-column">
                  {/* Basic Information */}
                  <div className="invoice-detail-section">
                    <div className="invoice-detail-card-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                      <h4>Thông tin cơ bản</h4>
                    </div>
                    <div className="invoice-detail-grid">
                      <div className="invoice-detail-item">
                        <span className="invoice-detail-label">
                          Loại hóa đơn
                        </span>
                        <span className="invoice-detail-value">
                          {selectedInvoice.type || "N/A"}
                        </span>
                      </div>
                      <div className="invoice-detail-item">
                        <span className="invoice-detail-label">Tiền tệ</span>
                        <span className="invoice-detail-value">
                          {selectedInvoice.currency || "VND"}
                        </span>
                      </div>
                      <div className="invoice-detail-item full-width">
                        <span className="invoice-detail-label">Số tiền</span>
                        <span className="invoice-detail-value order-amount">
                          {formatCurrency(selectedInvoice.amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Related Information */}
                  <div className="invoice-detail-section">
                    <div className="invoice-detail-card-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                      <h4>Thông tin liên quan</h4>
                    </div>
                    <div className="invoice-detail-grid">
                      <div className="invoice-detail-item">
                        <span className="invoice-detail-label">Mã đại lý</span>
                        <span className="invoice-detail-value">
                          {dealerNames[selectedInvoice.dealerId]
                            ? dealerNames[selectedInvoice.dealerId]
                            : `DL-${selectedInvoice.dealerId}`}
                        </span>
                      </div>
                      <div className="invoice-detail-item">
                        <span className="invoice-detail-label">
                          Mã đơn hàng
                        </span>
                        <span className="invoice-detail-value">
                          {selectedInvoice.poId
                            ? `PO-${selectedInvoice.poId}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time Information */}
                  <div className="invoice-detail-section">
                    <div className="invoice-detail-card-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="16"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <h4>Thông tin thời gian</h4>
                    </div>
                    <div className="invoice-detail-grid">
                      <div className="invoice-detail-item">
                        <span className="invoice-detail-label">Ngày tạo</span>
                        <span className="invoice-detail-value">
                          {new Date(
                            selectedInvoice.issuedAt
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="invoice-detail-item">
                        <span className="invoice-detail-label">
                          Hạn thanh toán
                        </span>
                        <span className="invoice-detail-value">
                          {new Date(selectedInvoice.dueAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <div className="invoice-detail-item full-width">
                        <span className="invoice-detail-label">
                          Thời gian tạo
                        </span>
                        <span className="invoice-detail-value">
                          {new Date(selectedInvoice.issuedAt).toLocaleString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Note Section */}
                  {selectedInvoice.note && (
                    <div className="invoice-detail-section">
                      <div className="invoice-detail-card-header">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        <h4>Ghi chú</h4>
                      </div>
                      <div className="invoice-detail-grid">
                        <div className="invoice-detail-item full-width">
                          <span className="invoice-detail-label">Nội dung</span>
                          <span className="invoice-detail-value">
                            {selectedInvoice.note}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Actions */}
                <div className="invoice-actions-column">
                  {/* Payment Status Card */}
                  <div className="invoice-action-card">
                    <div className="invoice-action-header">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="1"
                          y="4"
                          width="22"
                          height="16"
                          rx="2"
                          ry="2"
                        />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                      <h4>Trạng thái thanh toán</h4>
                    </div>
                    <p className="invoice-action-description">
                      {selectedInvoice.status === "Processing"
                        ? "Hóa đơn đang chờ xác nhận thanh toán"
                        : selectedInvoice.status === "Paid"
                        ? "Hóa đơn đã được thanh toán thành công"
                        : selectedInvoice.status === "Pending"
                        ? "Hóa đơn đang chờ thanh toán"
                        : selectedInvoice.status === "Overdue"
                        ? "Hóa đơn đã quá hạn thanh toán"
                        : "Quản lý trạng thái thanh toán của hóa đơn"}
                    </p>

                    {selectedInvoice.status === "Processing" && (
                      <button
                        className="invoice-action-btn primary"
                        onClick={handleConfirmPayment}
                        disabled={confirmingPayment}
                      >
                        {confirmingPayment ? (
                          <>
                            <div className="invoice-loading-spinner small"></div>
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

                    {(selectedInvoice.status === "Paid" ||
                      selectedInvoice.status === "paid") && (
                      <div className="invoice-payment-success">
                        <div className="invoice-success-icon">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22,4 12,14.01 9,11.01" />
                          </svg>
                        </div>
                        <h5>Đã thanh toán thành công!</h5>
                        <p>
                          Hóa đơn đã được thanh toán vào ngày{" "}
                          {new Date(
                            selectedInvoice.paidAt || selectedInvoice.issuedAt
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
