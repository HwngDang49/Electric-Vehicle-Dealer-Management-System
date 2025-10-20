import React, { useState, useEffect } from "react";
import "./DealerManagement.css";

// Demo data for testing
const DEMO_DEALERS = [
  {
    id: 1,
    code: "DL001",
    name: "VinFast Hà Nội",
    legalName: "Công ty TNHH VinFast Hà Nội",
    taxId: "0123456789",
    creditLimit: 5000000000,
    status: "Active",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-01-20T00:00:00Z"
  },
  {
    id: 2,
    code: "DL002",
    name: "VinFast TP.HCM",
    legalName: "Công ty TNHH VinFast TP.HCM",
    taxId: "0987654321",
    creditLimit: 8000000000,
    status: "Active",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-18T00:00:00Z"
  },
  {
    id: 3,
    code: "DL003",
    name: "VinFast Đà Nẵng",
    legalName: "Công ty TNHH VinFast Đà Nẵng",
    taxId: "0123987654",
    creditLimit: 3000000000,
    status: "Onboarding",
    createdAt: "2024-01-25T00:00:00Z",
    updatedAt: "2024-01-25T00:00:00Z"
  },
  {
    id: 4,
    code: "DL004",
    name: "VinFast Cần Thơ",
    legalName: "Công ty TNHH VinFast Cần Thơ",
    taxId: "0567891234",
    creditLimit: 2000000000,
    status: "Suspended",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-22T00:00:00Z"
  },
  {
    id: 5,
    code: "DL005",
    name: "VinFast Hải Phòng",
    legalName: "Công ty TNHH VinFast Hải Phòng",
    taxId: "0789123456",
    creditLimit: 4000000000,
    status: "Closed",
    createdAt: "2023-12-20T00:00:00Z",
    updatedAt: "2024-01-10T00:00:00Z"
  }
];

const DealerManagementDemo = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Load demo data on component mount
  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDealers([...DEMO_DEALERS]);
    } catch (err) {
      setError("Không thể tải danh sách dealer");
      console.error("Error loading dealers:", err);
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const filtered = DEMO_DEALERS.filter(dealer =>
        dealer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dealer.legalName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setDealers(filtered);
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update dealer status based on action
      const statusMap = {
        activate: "Active",
        suspend: "Suspended", 
        reactivate: "Active",
        close: "Closed"
      };
      
      setDealers(prev => prev.map(dealer => 
        dealer.id === dealerId 
          ? { ...dealer, status: statusMap[action], updatedAt: new Date().toISOString() }
          : dealer
      ));
    } catch (err) {
      setError(`Không thể ${action} dealer`);
      console.error(`Error ${action} dealer:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditDealer = (dealer) => {
    setSelectedDealer(dealer);
    setShowEditModal(true);
  };

  const handleViewDetails = (dealer) => {
    setSelectedDealer(dealer);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Onboarding: { text: "Đang thiết lập", class: "status-onboarding" },
      Active: { text: "Hoạt động", class: "status-active" },
      Suspended: { text: "Tạm dừng", class: "status-suspended" },
      Closed: { text: "Đã đóng", class: "status-closed" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getActionButtons = (dealer) => {
    const buttons = [];
    
    switch (dealer.status) {
      case "Onboarding":
        buttons.push(
          <button
            key="activate"
            className="action-btn activate-btn"
            onClick={() => handleDealerAction(dealer.id, "activate")}
            disabled={actionLoading === `activate-${dealer.id}`}
          >
            {actionLoading === `activate-${dealer.id}` ? "Đang xử lý..." : "Kích hoạt"}
          </button>
        );
        break;
      case "Active":
        buttons.push(
          <button
            key="suspend"
            className="action-btn suspend-btn"
            onClick={() => handleDealerAction(dealer.id, "suspend")}
            disabled={actionLoading === `suspend-${dealer.id}`}
          >
            {actionLoading === `suspend-${dealer.id}` ? "Đang xử lý..." : "Tạm dừng"}
          </button>
        );
        buttons.push(
          <button
            key="close"
            className="action-btn close-btn"
            onClick={() => handleDealerAction(dealer.id, "close")}
            disabled={actionLoading === `close-${dealer.id}`}
          >
            {actionLoading === `close-${dealer.id}` ? "Đang xử lý..." : "Đóng"}
          </button>
        );
        break;
      case "Suspended":
        buttons.push(
          <button
            key="reactivate"
            className="action-btn reactivate-btn"
            onClick={() => handleDealerAction(dealer.id, "reactivate")}
            disabled={actionLoading === `reactivate-${dealer.id}`}
          >
            {actionLoading === `reactivate-${dealer.id}` ? "Đang xử lý..." : "Kích hoạt lại"}
          </button>
        );
        buttons.push(
          <button
            key="close"
            className="action-btn close-btn"
            onClick={() => handleDealerAction(dealer.id, "close")}
            disabled={actionLoading === `close-${dealer.id}`}
          >
            {actionLoading === `close-${dealer.id}` ? "Đang xử lý..." : "Đóng"}
          </button>
        );
        break;
    }
    
    return buttons;
  };

  const filteredDealers = dealers.filter(dealer =>
    dealer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.legalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dealer-management">
      <div className="page-header">
        <h1>Quản lý Dealer (Demo)</h1>
        <p>Demo chức năng quản lý dealer với dữ liệu mẫu</p>
      </div>

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
                    {searchTerm ? "Không tìm thấy dealer nào" : "Chưa có dealer nào"}
                  </td>
                </tr>
              ) : (
                filteredDealers.map((dealer) => (
                  <tr key={dealer.id}>
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
                      <div className="action-buttons">
                        <button
                          className="action-btn view-btn"
                          onClick={() => handleViewDetails(dealer)}
                        >
                          Xem chi tiết
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditDealer(dealer)}
                        >
                          Chỉnh sửa
                        </button>
                        {getActionButtons(dealer)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Demo modals would go here - simplified for demo */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Demo: Tạo Dealer</h2>
            <p>Modal tạo dealer sẽ hiển thị ở đây</p>
            <button onClick={() => setShowCreateModal(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealerManagementDemo;
