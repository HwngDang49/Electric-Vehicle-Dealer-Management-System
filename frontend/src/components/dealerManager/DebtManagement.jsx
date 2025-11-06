import React, { useState, useEffect } from "react";
import "./DebtManagement.css";
import PageHeader from "./PageHeader";
import rebateApiService from "../../services/rebateApi";

const DebtManagement = ({ onNavigateToHome }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadClaims();
  }, [currentPage, statusFilter]);

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

      const result = await rebateApiService.getMyClaims(filters);

      const claimsList = result.items || [];
      setClaims(claimsList);
      setTotalPages(result.totalPages || 1);
      setTotalItems(result.total || 0);
    } catch (err) {
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
      const claimDetail = await rebateApiService.getMyClaimDetail(claimId);
      setSelectedClaim(claimDetail);
      setShowDetailModal(true);
    } catch (err) {
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

  // Filter claims by search term
  const filteredClaims = claims.filter((claim) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      claim.claimId?.toString().includes(searchLower) ||
      claim.agreementCode?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="dealer-manager-app debt-management-app">
      <div className="debt-management">
        <PageHeader
          title="Quản lý công nợ"
          subtitle="Theo dõi và quản lý các khoản công nợ của đại lý"
          showBackButton={true}
          onBack={onNavigateToHome}
        />

        <div className="debt-management-content">
          <div className="search-filter-section">
            <div className="search-filter-left">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã claim, thỏa thuận..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="search-input"
                />
              </div>
              <div className="filter-container">
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="filter-select"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
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
                    <th>Mã thỏa thuận</th>
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
                        {searchTerm || statusFilter
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
                          <span className="agreement-code">
                            {claim.agreementCode || "-"}
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
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Claim Detail Modal Component (Read-only for Dealer Manager)
const ClaimDetailModal = ({ claim, onClose }) => {
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

  return (
    <div className="dealer-manager-app debt-management-detail-app">
      <div className="debt-claim-modal-overlay" onClick={onClose}>
        <div
          className="debt-claim-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="debt-claim-modal-header">
            <div className="debt-claim-modal-header-left">
              <div className="debt-claim-modal-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h2 className="debt-claim-modal-title">
                  Chi tiết Rebate Claim
                </h2>
                <p className="debt-claim-modal-subtitle">
                  Claim #{claim.claimId}
                </p>
              </div>
            </div>
            <div className="debt-claim-modal-header-actions">
              <button className="debt-claim-close-btn" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="debt-claim-modal-body">
            {/* Details */}
            <div className="debt-claim-details">
              {/* Left Column - General Info */}
              <div className="debt-claim-info-column">
                {/* General Information */}
                <div className="debt-claim-detail-section">
                  <div className="debt-claim-detail-card-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                    <h4>Thông tin chung</h4>
                  </div>
                  <div className="debt-claim-detail-grid">
                    <div className="debt-claim-detail-item">
                      <span className="debt-claim-detail-label">Mã Claim</span>
                      <span className="debt-claim-detail-value">
                        #{claim.claimId}
                      </span>
                    </div>
                    <div className="debt-claim-detail-item">
                      <span className="debt-claim-detail-label">
                        Mã thỏa thuận
                      </span>
                      <span className="debt-claim-detail-value">
                        {claim.agreementCode || "N/A"}
                      </span>
                    </div>
                    <div className="debt-claim-detail-item">
                      <span className="debt-claim-detail-label">Kỳ</span>
                      <span className="debt-claim-detail-value">
                        {claim.period || "N/A"}
                      </span>
                    </div>
                    <div className="debt-claim-detail-item">
                      <span className="debt-claim-detail-label">
                        Trạng thái
                      </span>
                      <span
                        className={`debt-claim-status-badge ${getStatusBadgeClass(
                          claim.status
                        )}`}
                      >
                        {getStatusText(claim.status)}
                      </span>
                    </div>
                    <div className="debt-claim-detail-item">
                      <span className="debt-claim-detail-label">Ngày tạo</span>
                      <span className="debt-claim-detail-value">
                        {formatDate(claim.createdAt)}
                      </span>
                    </div>
                    {claim.resolvedAt && (
                      <div className="debt-claim-detail-item">
                        <span className="debt-claim-detail-label">
                          Ngày giải quyết
                        </span>
                        <span className="debt-claim-detail-value">
                          {formatDate(claim.resolvedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Payment Info */}
              <div className="debt-claim-actions-column">
                {/* Payment Information */}
                <div className="debt-claim-action-card">
                  <div className="debt-claim-action-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10,9 9,9 8,9" />
                    </svg>
                    <h4>Thông tin thanh toán</h4>
                  </div>
                  <div className="debt-claim-payment-summary">
                    <div className="debt-claim-payment-item">
                      <div className="debt-claim-item-info">
                        <span className="debt-claim-item-label">
                          Tổng số tiền
                        </span>
                      </div>
                      <span className="debt-claim-item-amount debt-claim-amount-total">
                        {formatCurrency(claim.amount)}
                      </span>
                    </div>
                    <div className="debt-claim-payment-item">
                      <div className="debt-claim-item-info">
                        <span className="debt-claim-item-label">
                          Đã thanh toán
                        </span>
                      </div>
                      <span className="debt-claim-item-amount debt-claim-amount-paid">
                        {formatCurrency(claim.totalPaid || 0)}
                      </span>
                    </div>
                    <div className="debt-claim-payment-item debt-claim-payment-item-highlight">
                      <div className="debt-claim-item-info">
                        <span className="debt-claim-item-label">Còn lại</span>
                      </div>
                      <span className="debt-claim-item-amount debt-claim-amount-remaining">
                        {formatCurrency(claim.remainingAmount || claim.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Settlement History */}
                {claim.settlements && claim.settlements.length > 0 && (
                  <div className="debt-claim-action-card">
                    <div className="debt-claim-action-header">
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
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <h4>Lịch sử thanh toán</h4>
                    </div>
                    <div className="debt-claim-settlements-table">
                      <div className="debt-claim-settlements-header">
                        <div className="debt-claim-settlement-cell">
                          Số tiền
                        </div>
                        <div className="debt-claim-settlement-cell">
                          Ngày thanh toán
                        </div>
                        <div className="debt-claim-settlement-cell">
                          Mã tham chiếu
                        </div>
                      </div>
                      {claim.settlements.map((settlement) => (
                        <div
                          key={settlement.settlementId}
                          className="debt-claim-settlement-row"
                        >
                          <div className="debt-claim-settlement-cell">
                            {formatCurrency(settlement.paidAmount)}
                          </div>
                          <div className="debt-claim-settlement-cell">
                            {formatDate(settlement.paidAt)}
                          </div>
                          <div className="debt-claim-settlement-cell">
                            {settlement.referenceNo || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtManagement;
