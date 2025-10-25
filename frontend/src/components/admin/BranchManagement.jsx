import React, { useState, useEffect } from "react";
import "./BranchManagement.css";
import branchApiService from "../../services/branchApi";
import dealerApiService from "../../services/dealerApi";
import CreateBranchModal from "./CreateBranchModal";
import BranchDetailModal from "./BranchDetailModal";

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [dealerIdToCode, setDealerIdToCode] = useState({});

  // Load branches on component mount
  useEffect(() => {
    loadBranches();
    loadDealerCodes();
  }, []);

  const loadDealerCodes = async () => {
    try {
      const res = await dealerApiService.getDealers();
      const list = res.data || res || [];
      const map = {};
      list.forEach((d) => {
        const id = d.id || d.dealerId;
        if (id != null) {
          map[id] = d.code;
        }
      });
      setDealerIdToCode(map);
    } catch (e) {
      // ignore, fallback to showing id
      console.error("Error loading dealer codes", e);
    }
  };

  const loadBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await branchApiService.getBranches();
      console.log("Branches API response:", response);
      console.log("First branch sample:", response.data?.[0]);
      const fetchedBranches = response.data || response;
      
      // Sắp xếp theo ngày tạo mới nhất (đảm bảo luôn đúng)
      const sortedBranches = (fetchedBranches || []).sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt);
        const dateB = new Date(b.createdAt || b.updatedAt);
        return dateB - dateA; // Mới nhất trước
      });
      
      setBranches(sortedBranches);
      return sortedBranches;
    } catch (err) {
      setError("Không thể tải danh sách chi nhánh");
      console.error("Error loading branches:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadBranches();
      return;
    }
    
    setLoading(true);
    try {
      // Tìm kiếm local vì API chưa có search endpoint
      const filteredBranches = branches.filter(branch =>
        branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Sắp xếp kết quả tìm kiếm theo ngày tạo mới nhất
      const sortedFilteredBranches = filteredBranches.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt);
        const dateB = new Date(b.createdAt || b.updatedAt);
        return dateB - dateA; // Mới nhất trước
      });
      
      setBranches(sortedFilteredBranches);
    } catch (err) {
      setError("Không thể tìm kiếm chi nhánh");
      console.error("Error searching branches:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (branch) => {
    console.log("Opening branch details for:", branch);
    setSelectedBranch(branch);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { text: "Hoạt động", class: "status-active" },
      Inactive: { text: "Không hoạt động", class: "status-inactive" },
      Suspended: { text: "Tạm dừng", class: "status-suspended" },
      Closed: { text: "Đã đóng", class: "status-closed" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  // Sắp xếp branches theo ngày tạo mới nhất trước khi filter
  const sortedBranches = [...branches].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt);
    const dateB = new Date(b.createdAt || b.updatedAt);
    return dateB - dateA; // Mới nhất trước
  });

  const filteredBranches = sortedBranches.filter(branch =>
    branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-branch-management-app">
      <div className="branch-management">
        <div className="page-header">
          <h1>Quản lý Chi nhánh</h1>
          <p>Quản lý thông tin và trạng thái các chi nhánh trong hệ thống</p>
        </div>

      <div className="management-toolbar">
        <div className="search-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm chi nhánh theo tên, mã, địa chỉ..."
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
          Thêm Chi nhánh
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

      <div className="branches-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách chi nhánh...</p>
          </div>
        ) : (
          <table className="branches-table">
            <thead>
              <tr>
                <th>Mã Chi nhánh</th>
                <th>Tên Chi nhánh</th>
                <th>Địa chỉ</th>
                <th>Mã Dealer</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    {searchTerm ? "Không tìm thấy chi nhánh nào" : "Chưa có chi nhánh nào"}
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch, index) => (
                  <tr key={branch.branchId || `branch-${index}`}>
                    <td>
                      <span className="branch-code">{branch.code}</span>
                    </td>
                    <td>
                      <span className="branch-name">{branch.name}</span>
                    </td>
                    <td>
                      <span className="branch-address">{branch.address || "-"}</span>
                    </td>
                    <td>
                      <span className="dealer-code">{dealerIdToCode[branch.dealerId] || branch.dealerId}</span>
                    </td>
                    <td>{getStatusBadge(branch.status)}</td>
                    <td>
                      <span className="created-date">
                        {branch.createdAt ? new Date(branch.createdAt).toLocaleDateString('vi-VN') : "-"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="view-detail-btn"
                        onClick={() => handleViewDetails(branch)}
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
        <CreateBranchModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadBranches();
          }}
        />
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBranch && (
        <BranchDetailModal
          branch={selectedBranch}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedBranch(null);
          }}
          onUpdate={async (branchId, updateData) => {
            console.log("BranchManagement onUpdate called with:", { branchId, updateData });
            try {
              const response = await branchApiService.updateBranch(branchId, updateData);
              console.log("Update API response:", response);
              
              const updatedBranches = await loadBranches();
              
              // Tìm branch vừa được cập nhật trong danh sách mới
              const newlyUpdatedBranch = updatedBranches.find(b => b.branchId == branchId);
              if (newlyUpdatedBranch) {
                console.log("Updated branch found:", newlyUpdatedBranch);
                setSelectedBranch(newlyUpdatedBranch);
              }
            } catch (error) {
              console.error("Error updating branch:", error);
              setError("Không thể cập nhật chi nhánh");
            }
          }}
        />
      )}
      </div>
    </div>
  );
};

export default BranchManagement;
