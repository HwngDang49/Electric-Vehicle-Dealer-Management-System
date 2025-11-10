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
  const itemsPerPage = 5;

  useEffect(() => {
    loadClaims();
  }, [statusFilter]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};

      if (statusFilter) {
        filters.status = statusFilter;
      }

      // Load all claims (no server-side pagination) for client-side filtering and pagination
      const result = await rebateApiService.getMyClaims(filters);

      const claimsList = result.items || [];
      setClaims(claimsList);
    } catch (err) {
      setError("Không thể tải danh sách công nợ");
    } finally {
      setLoading(false);
    }
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
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Get visible page numbers (max 3 pages) - Fixed layout like POManagement
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

  // Pagination logic - Client-side like POManagement
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClaims = filteredClaims.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="debt-management">
      <PageHeader
        title="Quản lý công nợ"
        subtitle="Theo dõi và quản lý các khoản công nợ của đại lý"
        showBackButton={true}
        onBack={onNavigateToHome}
      />

      <div className="debt-management-content">
        <div className="page-actions">
          <div className="search-filter-group">
            <div className="search-container-inline">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã claim, thỏa thuận..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-container-inline">
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

        <div className="debt-list-container">
          <div className="debt-list-content">
            {loading && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách công nợ...</p>
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
              <div className="debt-table-container">
                <div className="debt-table-header">
                  <div className="table-cell" data-column="1">
                    Mã Claim
                  </div>
                  <div className="table-cell" data-column="2">
                    Mã thỏa thuận
                  </div>
                  <div className="table-cell" data-column="3">
                    Kỳ
                  </div>
                  <div className="table-cell" data-column="4">
                    Số tiền
                  </div>
                  <div className="table-cell" data-column="5">
                    Trạng thái
                  </div>
                  <div className="table-cell" data-column="6">
                    Ngày tạo
                  </div>
                  <div className="table-cell" data-column="7">
                    Thao tác
                  </div>
                </div>

                {filteredClaims.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3 className="empty-title">Không tìm thấy công nợ</h3>
                    <p className="empty-description">
                      Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="debt-table-rows">
                      {currentClaims.map((claim) => (
                        <div key={claim.claimId} className="debt-table-row">
                          <div className="table-cell" data-column="1">
                            <span className="claim-id">{claim.claimId}</span>
                          </div>
                          <div className="table-cell" data-column="2">
                            <span className="agreement-code">
                              {claim.agreementCode || "-"}
                            </span>
                          </div>
                          <div className="table-cell" data-column="3">
                            <span className="period-value">
                              {claim.period || "-"}
                            </span>
                          </div>
                          <div className="table-cell amount" data-column="4">
                            {formatCurrency(claim.amount)}
                          </div>
                          <div className="table-cell" data-column="5">
                            <span
                              className={`status-badge ${getStatusBadgeClass(
                                claim.status
                              )}`}
                            >
                              {getStatusText(claim.status)}
                            </span>
                          </div>
                          <div className="table-cell" data-column="6">
                            <span className="date-value">
                              {formatDate(claim.createdAt)}
                            </span>
                          </div>
                          <div className="table-cell actions" data-column="7">
                            <button
                              className="action-btn view"
                              onClick={() => handleViewDetail(claim.claimId)}
                            >
                              Xem chi tiết
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="pagination-container">
                        <div className="pagination-info">
                          Hiển thị {startIndex + 1}-
                          {Math.min(endIndex, filteredClaims.length)} trong tổng
                          số {filteredClaims.length} bản ghi
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
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Claim Detail Modal */}
        {showDetailModal && selectedClaim && (
          <ClaimDetailModal
            claim={selectedClaim}
            onClose={handleCloseDetailModal}
          />
        )}
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
                  Claim {claim.claimId}
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
                        {claim.claimId}
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
