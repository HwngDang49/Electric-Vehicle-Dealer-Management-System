import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./DealerManagement.css";
import dealerApiService from "../../services/dealerApi";
import CreateDealerModal from "./CreateDealerModal";
import DealerDetailModal from "./DealerDetailModal";

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

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };


  // Load dealers on component mount
  useEffect(() => {
    loadDealers();
  }, []);


  const loadDealers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealerApiService.getDealers();
      console.log("Dealers API response:", response);
      console.log("First dealer sample:", response.data?.[0] || response?.[0]);
      const fetchedDealers = response.data || response;
      setDealers(fetchedDealers);
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
    if (!searchTerm.trim()) {
      loadDealers();
      return;
    }
    
    setLoading(true);
    try {
      const response = await dealerApiService.searchDealers(searchTerm);
      setDealers(response.data || response);
    } catch (err) {
      setError("Không thể tìm kiếm dealer");
      console.error("Error searching dealers:", err);
    } finally {
      setLoading(false);
    }
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


  const filteredDealers = dealers.filter(dealer =>
    dealer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.legalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button className="search-btn" onClick={handleSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
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

      <div className="dealers-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách dealer...</p>
          </div>
        ) : (
          <table className="dealers-table">
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
              {filteredDealers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    📋 {searchTerm 
                      ? "Không tìm thấy dealer phù hợp với từ khóa tìm kiếm" 
                      : "Chưa có dealer nào trong hệ thống"}
                  </td>
                </tr>
              ) : (
                filteredDealers.map((dealer, index) => (
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
        )}
      </div>

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
