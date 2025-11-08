import React, { useState, useEffect } from "react";
import "./DebtManagement.css";
import PageHeader from "./PageHeader";
import rebateApiService from "../../services/rebateApi";
import dealerApiService from "../../services/dealerApi";
import CustomDropdown from "../admin/CustomDropdown";

const DebtManagement = ({ onBack }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [dealers, setDealers] = useState({}); // Map dealerId -> dealerName

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");
  const [dealerFilter, setDealerFilter] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadDealers();
    loadClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, dealerFilter]);

  const loadDealers = async () => {
    try {
      const result = await dealerApiService.getDealers();
      const dealersList = result?.data || result || [];
      const namesMap = {};
      dealersList.forEach((dealer) => {
        const id = dealer.dealerId || dealer.DealerId;
        const name = dealer.name || dealer.Name;
        if (id && name) {
          namesMap[id] = name;
        }
      });
      setDealers(namesMap);
    } catch (err) {
      console.error("Error loading dealers:", err);
    }
  };

  const loadClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {
        page: currentPage,
        pageSize: itemsPerPage,
      };

      if (statusFilter) {
        filters.status = statusFilter;
      }

      if (dealerFilter) {
        filters.dealerId = parseInt(dealerFilter);
      }

      const result = await rebateApiService.getClaims(filters);

      const claimsList = result.items || [];
      setClaims(claimsList);
      setTotalPages(result.totalPages || 1);
      setTotalItems(result.total || 0);
    } catch (err) {
      console.error("Error loading claims:", err);
      setError("Không thể tải danh sách công nợ");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadClaims();
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDealerFilterChange = (dealerId) => {
    setDealerFilter(dealerId);
    setCurrentPage(1);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // Get status text in Vietnamese
  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Chờ xử lý";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "settled":
        return "Đã thanh toán";
      default:
        return status || "N/A";
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "settled":
        return "status-settled";
      default:
        return "status-default";
    }
  };

  // Handle view detail
  const handleViewDetail = async (claimId) => {
    try {
      const response = await rebateApiService.getClaimDetail(claimId);
      setSelectedClaim(response);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error loading claim detail:", err);
      setError("Không thể tải chi tiết claim");
    }
  };

  // Close modals
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedClaim(null);
    loadClaims();
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Get visible page numbers
  const getVisiblePages = () => {
    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages.filter((p) => p !== 1 || pages.length === 1);
  };

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Pending", label: "Chờ xử lý", icon: "⏳" },
    { value: "Approved", label: "Đã duyệt", icon: "✅" },
    { value: "Rejected", label: "Từ chối", icon: "❌" },
    { value: "Settled", label: "Đã thanh toán", icon: "💰" },
  ];

  const dealerOptions = [
    { value: "", label: "Tất cả đại lý", icon: "🏢" },
    ...Object.entries(dealers).map(([id, name]) => ({
      value: id,
      label: name,
      icon: "🏪",
    })),
  ];

  // Filter claims by search term
  const filteredClaims = claims.filter((claim) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      claim.claimId?.toString().includes(searchLower) ||
      dealers[claim.dealerId]?.toLowerCase().includes(searchLower) ||
      claim.period?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="evm-staff-debt-management-app">
      {/* Header Section */}
      <div className="evm-staff-page-header-wrapper">
        <PageHeader
          title="Quản lý công nợ"
          subtitle="Quản lý và theo dõi công nợ từ đại lý"
          showBackButton={!!onBack}
          onBack={onBack}
        />
      </div>

      {/* Body Section */}
      <div className="evm-staff-page-body">
        <div className="debt-management">
          <div className="management-toolbar">
            <div className="search-section">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã claim, đại lý, kỳ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <button className="search-btn" onClick={handleSearch}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                  </svg>
                </button>
              </div>
              <CustomDropdown
                value={statusFilter}
                onChange={handleStatusFilterChange}
                options={statusOptions}
                minWidth="220px"
              />
              <CustomDropdown
                value={dealerFilter}
                onChange={handleDealerFilterChange}
                options={dealerOptions}
                minWidth="220px"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {error}
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          <div className="claims-table-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách công nợ...</p>
              </div>
            ) : (
              <table className="claims-table">
                <colgroup>
                  <col className="debt-table-col" />
                  <col className="debt-table-col" />
                  <col className="debt-table-col" />
                  <col className="debt-table-col" />
                  <col className="debt-table-col" />
                  <col className="debt-table-col" />
                  <col className="debt-table-col" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Mã Claim</th>
                    <th>Đại lý</th>
                    <th>Kỳ</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-data">
                        {searchTerm || statusFilter || dealerFilter
                          ? "Không tìm thấy công nợ nào"
                          : "Chưa có công nợ nào"}
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((claim) => (
                      <tr key={claim.claimId}>
                        <td>
                          <span className="claim-id">#{claim.claimId}</span>
                        </td>
                        <td>
                          <span className="dealer-name">
                            {dealers[claim.dealerId] ||
                              `Dealer #${claim.dealerId}`}
                          </span>
                        </td>
                        <td>
                          <span className="period-value">
                            {claim.period || "-"}
                          </span>
                        </td>
                        <td>
                          <span className="amount-value">
                            {formatCurrency(claim.amount)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(
                              claim.status
                            )}`}
                          >
                            {getStatusText(claim.status)}
                          </span>
                        </td>
                        <td>
                          <span className="date-value">
                            {formatDate(claim.createdAt)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="view-detail-btn"
                            onClick={() => handleViewDetail(claim.claimId)}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                            </svg>
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && filteredClaims.length > 0 && totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Hiển thị {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số{" "}
                {totalItems} công nợ
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹ Trước
                </button>
                {getVisiblePages().map((page, idx) => (
                  <button
                    key={idx}
                    className={`pagination-btn ${
                      page === currentPage ? "active" : ""
                    }`}
                    onClick={() =>
                      typeof page === "number" && handlePageChange(page)
                    }
                    disabled={page === "..."}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau ›
                </button>
              </div>
            </div>
          )}

          {/* Claim Detail Modal */}
          {showDetailModal && selectedClaim && (
            <ClaimDetailModal
              claim={selectedClaim}
              onClose={handleCloseDetailModal}
              onRefresh={loadClaims}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Claim Detail Modal Component
const ClaimDetailModal = ({ claim, onClose, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Chờ xử lý";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      case "settled":
        return "Đã thanh toán";
      default:
        return status || "N/A";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "settled":
        return "status-settled";
      default:
        return "status-default";
    }
  };

  const handleApprove = async () => {
    try {
      setApproving(true);
      setError(null);
      await rebateApiService.approveClaim(claim.claimId);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Error approving claim:", err);
      const errorMsg =
        err.response?.data?.errors?.FirstOrDefault?.FirstOrDefault ||
        err.response?.data?.detail ||
        err.message ||
        "Không thể duyệt claim";
      setError(errorMsg);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối claim này?")) {
      return;
    }
    try {
      setRejecting(true);
      setError(null);
      await rebateApiService.rejectClaim(claim.claimId);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Error rejecting claim:", err);
      const errorMsg =
        err.response?.data?.errors?.FirstOrDefault?.FirstOrDefault ||
        err.response?.data?.detail ||
        err.message ||
        "Không thể từ chối claim";
      setError(errorMsg);
    } finally {
      setRejecting(false);
    }
  };

  const handleConfirmPayment = async () => {
    const remainingAmount = claim.remainingAmount || claim.amount || 0;

    if (remainingAmount <= 0) {
      setError("Không có số tiền để thanh toán");
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xác nhận thanh toán ${formatCurrency(
          remainingAmount
        )} cho claim này?`
      )
    ) {
      return;
    }

    setError(null);

    try {
      setLoading(true);
      await rebateApiService.createSettlement({
        ClaimId: claim.claimId,
        PaidAmount: remainingAmount,
        ReferenceNo: `MANUAL-${Date.now()}`, // Generate reference number
      });

      // Refresh data and close modal
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error("Error confirming payment:", err);
      const errorMsg =
        err.response?.data?.errors?.FirstOrDefault?.FirstOrDefault ||
        err.response?.data?.detail ||
        err.message ||
        "Không thể xác nhận thanh toán";
      setError(errorMsg);
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    return (
      <span
        className={`claim-status-badge ${getStatusBadgeClass(claim.status)}`}
      >
        {getStatusText(claim.status)}
      </span>
    );
  };

  return (
    <div className="evm-staff-debt-management-detail-app">
      <div className="claim-modal-overlay" onClick={onClose}>
        <div
          className="claim-modal-container"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="claim-modal-header">
            <div className="claim-modal-header-left">
              <div className="claim-modal-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
              <div>
                <h2 className="claim-modal-title">Chi Tiết Rebate Claim</h2>
                <p className="claim-modal-subtitle">#{claim.claimId}</p>
              </div>
            </div>
            <div className="claim-modal-header-actions">
              {getStatusBadge()}
              <button className="claim-secondary-btn" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>

          {/* 2-Column Layout */}
          <div className="claim-content-grid">
            {/* Left Column - Main Info */}
            <div className="claim-content-col">
              {/* General Information Card */}
              <div className="claim-info-card">
                <div className="claim-card-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                  </svg>
                  <h4>Thông Tin Chung</h4>
                </div>
                <div className="claim-info-body">
                  <div className="claim-field">
                    <label className="claim-field-label">Mã Claim</label>
                    <div className="claim-field-value">#{claim.claimId}</div>
                  </div>

                  <div className="claim-field">
                    <label className="claim-field-label">Đại lý</label>
                    <div className="claim-field-value">
                      {claim.dealerName || `Dealer #${claim.dealerId}`}
                    </div>
                  </div>

                  <div className="claim-field">
                    <label className="claim-field-label">Mã thỏa thuận</label>
                    <div className="claim-field-value">
                      {claim.agreementCode || "N/A"}
                    </div>
                  </div>

                  <div className="claim-field">
                    <label className="claim-field-label">Kỳ</label>
                    <div className="claim-field-value">
                      {claim.period || "N/A"}
                    </div>
                  </div>

                  <div className="claim-field">
                    <label className="claim-field-label">Ngày tạo</label>
                    <div className="claim-field-value claim-date-value">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                      </svg>
                      {formatDate(claim.createdAt)}
                    </div>
                  </div>

                  {claim.resolvedAt && (
                    <div className="claim-field">
                      <label className="claim-field-label">
                        Ngày giải quyết
                      </label>
                      <div className="claim-field-value claim-date-value">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                        </svg>
                        {formatDate(claim.resolvedAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment History Card */}
              {claim.settlements && claim.settlements.length > 0 && (
                <div className="claim-info-card">
                  <div className="claim-card-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                    </svg>
                    <h4>Lịch Sử Thanh Toán</h4>
                  </div>
                  <div className="claim-settlements-body">
                    <div className="claim-settlements-table">
                      <div className="claim-settlements-header">
                        <div className="claim-settlement-cell">Số tiền</div>
                        <div className="claim-settlement-cell">
                          Ngày thanh toán
                        </div>
                        <div className="claim-settlement-cell">
                          Mã tham chiếu
                        </div>
                      </div>
                      {claim.settlements.map((settlement) => (
                        <div
                          key={settlement.settlementId}
                          className="claim-settlement-row"
                        >
                          <div className="claim-settlement-cell">
                            {formatCurrency(settlement.paidAmount)}
                          </div>
                          <div className="claim-settlement-cell">
                            {formatDate(settlement.paidAt)}
                          </div>
                          <div className="claim-settlement-cell">
                            {settlement.referenceNo || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Payment Info & Actions */}
            <div className="claim-content-col">
              {/* Payment Information Card */}
              <div className="claim-info-card claim-price-card">
                <div className="claim-card-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                  </svg>
                  <h4>Thông Tin Thanh Toán</h4>
                </div>
                <div className="claim-price-body">
                  <div className="claim-price-row">
                    <span>Tổng số tiền</span>
                    <span className="claim-price-value">
                      {formatCurrency(claim.amount)}
                    </span>
                  </div>
                  <div className="claim-price-row">
                    <span>Đã thanh toán</span>
                    <span className="claim-price-value claim-price-paid">
                      {formatCurrency(claim.totalPaid || 0)}
                    </span>
                  </div>
                  <div className="claim-price-divider"></div>
                  <div className="claim-price-row claim-price-total">
                    <span>Còn lại</span>
                    <span className="claim-price-value claim-price-remaining">
                      {formatCurrency(claim.remainingAmount || claim.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="claim-error-message">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Actions Card */}
              <div className="claim-actions-card">
                <div className="claim-card-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" />
                  </svg>
                  <h4>Thao Tác</h4>
                </div>
                <div className="claim-actions-body">
                  {/* Approve/Reject buttons for Pending status */}
                  {claim.status?.toLowerCase() === "pending" && (
                    <>
                      <button
                        className="claim-action-btn claim-approve-btn"
                        onClick={handleApprove}
                        disabled={approving || rejecting}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                        <div className="action-content">
                          <div className="action-title">
                            {approving ? "Đang duyệt..." : "Duyệt Claim"}
                          </div>
                          <div className="action-subtitle">
                            Xác nhận và duyệt claim này
                          </div>
                        </div>
                      </button>
                      <button
                        className="claim-action-btn claim-reject-btn"
                        onClick={handleReject}
                        disabled={approving || rejecting}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                        <div className="action-content">
                          <div className="action-title">
                            {rejecting ? "Đang từ chối..." : "Từ chối Claim"}
                          </div>
                          <div className="action-subtitle">
                            Từ chối claim này
                          </div>
                        </div>
                      </button>
                    </>
                  )}

                  {/* Payment button for Approved status */}
                  {claim.status?.toLowerCase() === "approved" &&
                    claim.remainingAmount > 0 && (
                      <button
                        className="claim-action-btn claim-payment-btn"
                        onClick={handleConfirmPayment}
                        disabled={loading || approving || rejecting}
                      >
                        {loading ? (
                          <div className="claim-spinner"></div>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                          </svg>
                        )}
                        <div className="action-content">
                          <div className="action-title">
                            {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
                          </div>
                          <div className="action-subtitle">
                            Xác nhận thanh toán{" "}
                            {formatCurrency(claim.remainingAmount)}
                          </div>
                        </div>
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="claim-modal-footer">
            <div className="claim-view-actions"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtManagement;
