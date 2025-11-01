import React, { useState, useEffect } from "react";
import "./DebtManagement.css";
import rebateApiService from "../../services/rebateApi";
import dealerApiService from "../../services/dealerApi";
import CustomDropdown from "../admin/CustomDropdown";

const DebtManagement = () => {
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
      <div className="debt-management">
        <div className="page-header">
          <h1>Quản lý công nợ</h1>
          <p>Theo dõi và quản lý công nợ với các đại lý</p>
        </div>

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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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

  const handleVNPayPayment = async () => {
    const remainingAmount = claim.remainingAmount || claim.amount || 0;

    if (remainingAmount <= 0) {
      setError("Không có số tiền để thanh toán");
      return;
    }

    setError(null);

    try {
      setLoading(true);
      const response = await rebateApiService.createSettlementPaymentUrl({
        ClaimId: claim.claimId,
        PaidAmount: remainingAmount,
      });

      const paymentUrl = response?.paymentUrl || response?.PaymentUrl;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error("Không nhận được link thanh toán");
      }
    } catch (err) {
      console.error("Error creating VNPay payment:", err);
      const errorMsg =
        err.response?.data?.errors?.FirstOrDefault?.FirstOrDefault ||
        err.response?.data?.detail ||
        err.message ||
        "Không thể tạo thanh toán VNPay";
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="evm-staff-debt-management-detail-app">
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="claim-detail-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chi tiết Rebate Claim</h2>
              <button className="close-btn" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3 className="detail-section-title">Thông tin chung</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Mã Claim:</span>
                    <span className="detail-value">#{claim.claimId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Đại lý:</span>
                    <span className="detail-value">
                      {claim.dealerName || `Dealer #${claim.dealerId}`}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mã thỏa thuận:</span>
                    <span className="detail-value">
                      {claim.agreementCode || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Kỳ:</span>
                    <span className="detail-value">
                      {claim.period || "N/A"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Trạng thái:</span>
                    <span
                      className={`status-badge ${getStatusBadgeClass(
                        claim.status
                      )}`}
                    >
                      {getStatusText(claim.status)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ngày tạo:</span>
                    <span className="detail-value">
                      {formatDate(claim.createdAt)}
                    </span>
                  </div>
                  {claim.resolvedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Ngày giải quyết:</span>
                      <span className="detail-value">
                        {formatDate(claim.resolvedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <h3 className="detail-section-title">Thông tin thanh toán</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Tổng số tiền:</span>
                    <span className="detail-value amount">
                      {formatCurrency(claim.amount)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Đã thanh toán:</span>
                    <span className="detail-value amount-paid">
                      {formatCurrency(claim.totalPaid || 0)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Còn lại:</span>
                    <span className="detail-value amount-remaining">
                      {formatCurrency(claim.remainingAmount || claim.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {claim.settlements && claim.settlements.length > 0 && (
                <div className="detail-section">
                  <h3 className="detail-section-title">Lịch sử thanh toán</h3>
                  <div className="settlements-table">
                    <div className="settlements-header">
                      <div className="settlement-cell">Số tiền</div>
                      <div className="settlement-cell">Ngày thanh toán</div>
                      <div className="settlement-cell">Mã tham chiếu</div>
                    </div>
                    {claim.settlements.map((settlement) => (
                      <div
                        key={settlement.settlementId}
                        className="settlement-row"
                      >
                        <div className="settlement-cell">
                          {formatCurrency(settlement.paidAmount)}
                        </div>
                        <div className="settlement-cell">
                          {formatDate(settlement.paidAt)}
                        </div>
                        <div className="settlement-cell">
                          {settlement.referenceNo || "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-footer">
              {/* Nút Approve/Reject chỉ hiển thị khi status = Pending */}
              {claim.status?.toLowerCase() === "pending" && (
                <>
                  <button
                    className="approve-btn"
                    onClick={handleApprove}
                    disabled={approving || rejecting}
                  >
                    {approving ? "Đang duyệt..." : "Duyệt"}
                  </button>
                  <button
                    className="reject-btn"
                    onClick={handleReject}
                    disabled={approving || rejecting}
                  >
                    {rejecting ? "Đang từ chối..." : "Từ chối"}
                  </button>
                </>
              )}

              {/* Nút thanh toán chỉ hiển thị khi status = Approved và chưa thanh toán đủ */}
              {claim.status?.toLowerCase() === "approved" &&
                claim.remainingAmount > 0 && (
                  <button
                    className="payment-btn"
                    onClick={handleVNPayPayment}
                    disabled={loading || approving || rejecting}
                  >
                    {loading ? (
                      <>
                        <div className="vnpay-spinner"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      "Thanh toán VNPay"
                    )}
                  </button>
                )}

              <button className="close-btn" onClick={onClose}>
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtManagement;
