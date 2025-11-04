import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./DealerManagement.css";
import dealerApiService from "../../services/dealerApi";
import CreateDealerModal from "./CreateDealerModal";
import DealerDetailModal from "./DealerDetailModal";
import CustomDropdown from "./CustomDropdown";

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  // Pagination & Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Debounce search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };


  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedStatus]);

  // Load dealers when filters change
  useEffect(() => {
    loadDealers();
  }, [currentPage, pageSize, selectedStatus, debouncedSearchTerm]);


  const loadDealers = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        Page: currentPage,
        PageSize: pageSize,
      };

      if (selectedStatus) {
        filters.Status = selectedStatus;
      }

      if (debouncedSearchTerm.trim()) {
        filters.SearchTerm = debouncedSearchTerm.trim();
      }

      const response = await dealerApiService.getDealers(filters);
      console.log("Dealers API response:", response);
      
      // Handle PagedResult format
      const pagedData = response.data || response;
      const fetchedDealers = pagedData.items || pagedData || [];
      
      setDealers(fetchedDealers);
      setTotalPages(pagedData.totalPages || 0);
      setTotalItems(pagedData.total || 0);
      
      return fetchedDealers; // Trả về danh sách dealer để có thể sử dụng
    } catch (err) {
      setError("Không thể tải danh sách dealer");
      console.error("Error loading dealers:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    loadDealers();
  };

  const handleDealerAction = async (dealerId, action) => {
    setActionLoading(`${action}-${dealerId}`);
    try {
      let response;
      switch (action) {
        case "activate":
          response = await dealerApiService.activateDealer(dealerId);
          break;
        case "suspend":
          response = await dealerApiService.suspendDealer(dealerId);
          break;
        case "reactivate":
          response = await dealerApiService.reactivateDealer(dealerId);
          break;
        case "close":
          response = await dealerApiService.closeDealer(dealerId);
          break;
        default:
          throw new Error("Unknown action");
      }
      
      // Reload dealers after successful action
      const updatedDealers = await loadDealers();
      
      // Cập nhật selectedDealer nếu đang xem dealer này
      if (selectedDealer && (selectedDealer.id || selectedDealer.dealerId) == dealerId) {
        const updatedDealer = updatedDealers.find(d => (d.id || d.dealerId) == dealerId);
        if (updatedDealer) {
          setSelectedDealer(updatedDealer);
        }
      }
    } catch (err) {
      setError(`Không thể ${action} dealer`);
      console.error(`Error ${action} dealer:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (dealer) => {
    console.log("Opening dealer details for:", dealer);
    setSelectedDealer(dealer);
    setShowDetailModal(true);
  };

  const handleStatusFilterChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Onboarding", label: "Đang thiết lập", icon: "🔄" },
    { value: "Live", label: "Hoạt động", icon: "✅" },
    { value: "Suspended", label: "Tạm dừng", icon: "⏸️" },
    { value: "Closed", label: "Đã đóng", icon: "❌" },
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      Onboarding: { text: "Đang thiết lập", class: "status-onboarding" },
      Live: { text: "Hoạt động", class: "status-active" },
      Suspended: { text: "Tạm dừng", class: "status-suspended" },
      Closed: { text: "Đã đóng", class: "status-closed" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };



  return (
    <div className="admin-dealer-management-app">
      {toast && ReactDOM.createPortal(
        <div className={`admin-dealer-management-toast ${toast.type === 'error' ? 'admin-dealer-management-toast-error' : ''}`} style={{ zIndex: 99999 }}>
          <div className="toast-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {toast.type === 'error' ? (<path d="M18 6L6 18M6 6l12 12" />) : (<path d="M20 6L9 17l-5-5" />)}
            </svg>
          </div>
          <div className="toast-content">
            <div className="toast-title">{toast.type === 'error' ? 'Thất bại' : 'Thành công'}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => setToast(null)} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <div className="toast-progress"></div>
        </div>, document.body)}

      <div className="dealer-management">
      <div className="management-toolbar">
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm dealer theo tên, mã, tên pháp lý..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            {isSearching && (
              <div className="search-loading-spinner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#20c997" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="stroke-dashoffset" values="32;0" dur="1s" repeatCount="indefinite" />
                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            )}
            <button className="search-btn" onClick={handleSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
          <CustomDropdown
            value={selectedStatus}
            onChange={handleStatusFilterChange}
            options={statusOptions}
            minWidth="220px"
          />
        </div>
        <button
          className="create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Thêm Dealer
        </button>
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

      <div className="dealers-table-container" key={`page-${currentPage}-search-${debouncedSearchTerm}`}>
        {loading && (
          <div className="table-loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        <table className="dealers-table" style={{ opacity: loading ? 0.5 : 1 }}>
          <thead>
            <tr>
              <th>Mã Dealer</th>
              <th>Tên Dealer</th>
              <th>Tên pháp lý</th>
              <th>Mã số thuế</th>
              <th>Hạn mức tín dụng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {dealers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  📋 {debouncedSearchTerm 
                    ? "Không tìm thấy dealer phù hợp với từ khóa tìm kiếm" 
                    : "Chưa có dealer nào trong hệ thống"}
                </td>
              </tr>
            ) : (
              dealers.map((dealer, index) => (
                  <tr key={dealer.id || dealer.dealerId || `dealer-${index}`}>
                    <td>
                      <span className="dealer-code">{dealer.code}</span>
                    </td>
                    <td>
                      <span className="dealer-name">{dealer.name}</span>
                    </td>
                    <td>
                      <span className="legal-name">{dealer.legalName || "-"}</span>
                    </td>
                    <td>
                      <span className="tax-id">{dealer.taxId || "-"}</span>
                    </td>
                    <td>
                      <span className="credit-limit">
                        {dealer.creditLimit ? 
                          new Intl.NumberFormat('vi-VN').format(dealer.creditLimit) + ' VND' : 
                          '-'
                        }
                      </span>
                    </td>
                    <td>{getStatusBadge(dealer.status)}</td>
                    <td>
                      <button
                        className="view-detail-btn"
                        onClick={() => handleViewDetails(dealer)}
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
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
                      onClick={() => setCurrentPage(pageNum)}
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

      {/* Create Modal */}
      {showCreateModal && (
        <CreateDealerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(dealerName) => {
            setShowCreateModal(false);
            loadDealers();
            // Show toast after modal closes
            if (dealerName) {
              showToast("success", `Dealer "${dealerName}" đã được tạo thành công!`);
            } else {
              showToast("success", "Dealer đã được tạo thành công!");
            }
          }}
          onError={(errorMessage) => {
            // Show error toast if provided
            if (errorMessage) {
              showToast("error", errorMessage);
            }
          }}
        />
      )}


      {/* Detail Modal */}
      {showDetailModal && selectedDealer && (
        <DealerDetailModal
          dealer={selectedDealer}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDealer(null);
          }}
          onUpdate={async (dealerId, updateData) => {
            console.log("DealerManagement onUpdate called with:", { dealerId, updateData });
            const response = await dealerApiService.updateDealer(dealerId, updateData);
            console.log("Update API response:", response);
            
            const updatedDealers = await loadDealers();
            
            // Tìm dealer vừa được cập nhật trong danh sách mới
            const newlyUpdatedDealer = updatedDealers.find(d => (d.id || d.dealerId) == dealerId);
            if (newlyUpdatedDealer) {
              console.log("Updated dealer found:", newlyUpdatedDealer);
              setSelectedDealer(newlyUpdatedDealer); // Cập nhật selectedDealer với dữ liệu mới
            }
          }}
          onStatusChange={handleDealerAction}
          actionLoading={actionLoading}
          onSaveSuccess={(message) => {
            // Show success toast
            showToast("success", message);
          }}
          onSaveError={(errorMessage) => {
            // Show error toast
            if (errorMessage) {
              showToast("error", errorMessage);
            }
          }}
          onCreateBranch={(dealerId) => {
            // Open Branch create modal with preselected dealer
            setShowDetailModal(false);
            setTimeout(() => {
              setShowCreateModal(true);
            }, 0);
            // Slight delay then set initial dealer in CreateBranchModal via prop
            // We'll pass through when rendering below
          }}
        />
      )}
    </div>
    </div>
  );
};

export default DealerManagement;
