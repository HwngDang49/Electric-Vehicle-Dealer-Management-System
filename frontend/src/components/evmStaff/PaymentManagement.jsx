import React, { useState, useEffect, useMemo } from "react";
import "./PaymentManagement.css";
import PageHeader from "./PageHeader";
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

  // Filter invoices by status
  const filteredInvoices = useMemo(() => {
    let list = invoices;
    if (statusFilter !== "All") {
      list = list.filter(
        (invoice) =>
          invoice.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

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

  // Get visible page numbers (max 3 pages)
  const getVisiblePages = () => {
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
        <div className="evm-staff-page-header-wrapper">
          <PageHeader
            title="Quản lý thanh toán"
            subtitle="Theo dõi và quản lý thanh toán"
            showBackButton={!!onBack}
            onBack={onBack}
          />
        </div>
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
        <div className="evm-staff-page-header-wrapper">
          <PageHeader
            title="Quản lý thanh toán"
            subtitle="Theo dõi và quản lý thanh toán"
            showBackButton={!!onBack}
            onBack={onBack}
          />
        </div>
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
      {/* Header Section */}
      <div className="evm-staff-page-header-wrapper">
        <PageHeader
          title="Quản lý thanh toán"
          subtitle="Theo dõi và quản lý thanh toán"
          showBackButton={!!onBack}
          onBack={onBack}
        />
      </div>

      {/* Body Section */}
      <div className="evm-staff-page-body">
        {/* Search and Filter Bar - Outside of list container */}
        <div className="evm-staff-page-actions">
          <div className="evm-staff-search-filter-group">
            <div className="evm-staff-search-container-inline">
              <input
                type="text"
                placeholder="Tìm kiếm hóa đơn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="evm-staff-search-input-inline"
              />
            </div>
            <div className="evm-staff-filter-container-inline">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="evm-staff-filter-select"
              >
                <option value="All">Tất cả trạng thái</option>
                <option value="Pending">Chờ thanh toán</option>
                <option value="Processing">Chờ xử lý</option>
                <option value="Paid">Đã thanh toán</option>
                <option value="Overdue">Quá hạn</option>
              </select>
            </div>
          </div>
        </div>

        {/* List Container - Dealer Manager Style */}
        <div className="evm-staff-list-container">
          <div className="evm-staff-list-content">
            <div className="evm-staff-table-container">
              <div className="evm-staff-table-header">
                <div className="evm-staff-table-cell" data-column="1">
                  Mã hóa đơn
                </div>
                <div className="evm-staff-table-cell" data-column="2">
                  Đại lý
                </div>
                <div className="evm-staff-table-cell" data-column="3">
                  Mã đơn hàng
                </div>
                <div className="evm-staff-table-cell" data-column="4">
                  Số tiền
                </div>
                <div className="evm-staff-table-cell" data-column="5">
                  Trạng thái
                </div>
                <div className="evm-staff-table-cell" data-column="6">
                  Thao tác
                </div>
              </div>

              {filteredInvoices.length === 0 ? (
                <div className="evm-staff-empty-state">
                  <div className="evm-staff-empty-icon">📋</div>
                  <h3 className="evm-staff-empty-title">
                    Không tìm thấy hóa đơn
                  </h3>
                  <p className="evm-staff-empty-description">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              ) : (
                <>
                  <div className="evm-staff-table-rows">
                    {currentInvoices.map((invoice) => (
                      <div
                        key={invoice.invoiceId}
                        className="evm-staff-table-row"
                      >
                        <div className="evm-staff-table-cell" data-column="1">
                          <span className="evm-staff-invoice-id">
                            {invoice.invoiceNo}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="2">
                          <span className="evm-staff-dealer-name">
                            {dealerNames[invoice.dealerId]
                              ? dealerNames[invoice.dealerId]
                              : `DL-${invoice.dealerId}`}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="3">
                          <span className="evm-staff-po-id">
                            PO-{invoice.poId || "N/A"}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="4">
                          <span className="evm-staff-amount">
                            {formatCurrency(invoice.amount)}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="5">
                          <span
                            className={`evm-staff-status-badge ${getStatusBadgeClass(
                              invoice.status
                            )}`}
                          >
                            {getStatusText(invoice.status)}
                          </span>
                        </div>
                        <div className="evm-staff-table-cell" data-column="6">
                          <button
                            className="evm-staff-action-btn evm-staff-view"
                            onClick={() => handleViewDetails(invoice)}
                          >
                            Xem chi tiết
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="evm-staff-pagination-container">
                      <div className="evm-staff-pagination-info">
                        Hiển thị {startIndex + 1}-
                        {Math.min(endIndex, filteredInvoices.length)} trong tổng
                        số {filteredInvoices.length} giao dịch
                      </div>
                      <div className="evm-staff-pagination-controls">
                        <button
                          className="evm-staff-pagination-btn"
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

                        <div className="evm-staff-pagination-numbers">
                          {getVisiblePages().map((page) => (
                            <button
                              key={page}
                              className={`evm-staff-pagination-number ${
                                currentPage === page ? "active" : ""
                              }`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          className="evm-staff-pagination-btn"
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
                </>
              )}
            </div>
          </div>
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
                      <div className="invoice-detail-item">
                        <span className="invoice-detail-label">
                          Mã bán hàng
                        </span>
                        <span className="invoice-detail-value">
                          {selectedInvoice.saleDocId
                            ? `SD-${selectedInvoice.saleDocId}`
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
