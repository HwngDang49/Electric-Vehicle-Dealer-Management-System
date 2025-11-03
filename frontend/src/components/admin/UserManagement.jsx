import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./UserManagement.css";
import userApiService from "../../services/userApi";
import dealerApiService from "../../services/dealerApi";
import branchApiService from "../../services/branchApi";
import CreateUserModal from "./CreateUserModal";
import UserDetailModal from "./UserDetailModal";
import CustomDropdown from "./CustomDropdown";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Filters
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dealerFilter, setDealerFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  // Dealer & Branch data
  const [dealers, setDealers] = useState([]);
  const [branches, setBranches] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    loadUsers();
    loadDealers();
    loadBranches();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApiService.getUsers();
      setUsers(response.data || response || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const loadDealers = async () => {
    try {
      const response = await dealerApiService.getDealers();
      setDealers(response.data || response || []);
    } catch (err) {
      console.error("Error loading dealers:", err);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await branchApiService.getBranches();
      setBranches(response.data || response || []);
    } catch (err) {
      console.error("Error loading branches:", err);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadUsers();
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      return;
    }

    try {
      await userApiService.deleteUser(userId);
      alert("Xóa người dùng thành công!");
      loadUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Không thể xóa người dùng");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : "Active";
    try {
      await userApiService.updateUserStatus(user.userId, newStatus);
      loadUsers();
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Không thể cập nhật trạng thái");
    }
  };

  // Filter & Search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.status === statusFilter;
    const matchesDealer =
      !dealerFilter || user.dealerId === parseInt(dealerFilter);
    const matchesBranch =
      !branchFilter || user.branchId === parseInt(branchFilter);

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus &&
      matchesDealer &&
      matchesBranch
    );
  });

  const formatRoleName = (role) => {
    const roleNameMap = {
      Admin: "Admin",
      Manufacturer: "Manufacturer",
      DealerManager: "Dealer Manager",
      DealerStaff: "Dealer Staff",
      EVMStaff: "EVM Staff",
    };
    return roleNameMap[role] || role;
  };

  const getRoleBadgeClass = (role) => {
    const roleMap = {
      Admin: "badge-admin",
      Manufacturer: "badge-manufacturer",
      DealerManager: "badge-dealer-manager",
      DealerStaff: "badge-dealer-staff",
      EVMStaff: "badge-manufacturer",
    };
    return roleMap[role] || "badge-default";
  };

  const getStatusBadgeClass = (status) => {
    return status === "Active" ? "badge-active" : "badge-inactive";
  };

  const getDealerName = (dealerId) => {
    const dealer = dealers.find(
      (d) => d.dealerId === dealerId || d.id === dealerId
    );
    return dealer ? `${dealer.name} (${dealer.code})` : dealerId || "-";
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(
      (b) => b.branchId === branchId || b.id === branchId
    );
    return branch ? `${branch.name} (${branch.code})` : branchId || "-";
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, dealerFilter, branchFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  return (
    <div className="admin-user-management-app">
      {toast && ReactDOM.createPortal(
        <div className={`admin-user-management-toast ${toast.type === 'error' ? 'admin-user-management-toast-error' : ''}`} style={{ zIndex: 99999 }}>
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
      
      <div className="user-management">
        <div className="management-toolbar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email..."
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
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              options={[
                { value: "", label: "Tất cả vai trò", icon: "📋" },
                { value: "Admin", label: "Admin", icon: "👑" },
                { value: "EVMStaff", label: "EVM Staff", icon: "🏭" },
                { value: "DealerManager", label: "Dealer Manager", icon: "👔" },
                { value: "DealerStaff", label: "Dealer Staff", icon: "👤" },
              ]}
              minWidth="200px"
            />
            <CustomDropdown
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { value: "", label: "Tất cả trạng thái", icon: "📋" },
                { value: "Active", label: "Hoạt động", icon: "✅" },
                { value: "Inactive", label: "Vô hiệu hóa", icon: "❌" },
              ]}
              minWidth="200px"
            />
            <CustomDropdown
              value={dealerFilter}
              onChange={(val) => setDealerFilter(val)}
              options={[
                { value: "", label: "Tất cả Dealer", icon: "🏢" },
                ...dealers.map((dealer) => ({
                  value: String(dealer.dealerId || dealer.id),
                  label: `${dealer.name} (${dealer.code})`,
                  icon: "🏢",
                })),
              ]}
              minWidth="200px"
            />
            <CustomDropdown
              value={branchFilter}
              onChange={(val) => setBranchFilter(val)}
              options={[
                { value: "", label: "Tất cả Branch", icon: "🏪" },
                ...branches.map((branch) => ({
                  value: String(branch.branchId || branch.id),
                  label: `${branch.name} (${branch.code})`,
                  icon: "🏪",
                })),
              ]}
              minWidth="200px"
            />
          </div>
          <button
            className="create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Thêm Người dùng
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

        <div className="users-table-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Đang tải danh sách người dùng...</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên nhân viên</th>
                  <th>Vai trò</th>
                  <th>Tên Dealer</th>
                  <th>Chi Nhánh</th>
                  <th>Trạng Thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      {searchTerm ||
                      roleFilter ||
                      statusFilter ||
                      dealerFilter ||
                      branchFilter
                        ? "Không tìm thấy người dùng nào"
                        : "Chưa có người dùng nào"}
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.userId || `user-${user.userId}`}>
                      <td>
                        <span className="user-id-text">{user.userId}</span>
                      </td>
                      <td>
                        <span className="user-name">{user.fullName}</span>
                      </td>
                      <td>
                        <span className="user-role">
                          {formatRoleName(user.role)}
                        </span>
                      </td>
                      <td>
                        <span className="user-dealer">
                          {getDealerName(user.dealerId)}
                        </span>
                      </td>
                      <td>
                        <span className="user-branch">
                          {getBranchName(user.branchId)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            user.status
                          )}`}
                        >
                          {user.status === "Active"
                            ? "Hoạt động"
                            : "Vô hiệu hóa"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="view-detail-btn"
                          onClick={() => handleViewDetails(user)}
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
                        onClick={() => handlePageChange(pageNum)}
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

        {/* Modals */}
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={(userName) => {
              setShowCreateModal(false);
              loadUsers();
              if (userName) {
                showToast("success", `Người dùng "${userName}" đã được tạo thành công!`);
              } else {
                showToast("success", "Người dùng đã được tạo thành công!");
              }
            }}
            onError={(errorMessage) => {
              if (errorMessage) {
                showToast("error", errorMessage);
              }
            }}
          />
        )}

        {showDetailModal && selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedUser(null);
            }}
            onUpdate={loadUsers}
            onSaveSuccess={(message) => {
              showToast("success", message);
            }}
            onSaveError={(errorMessage) => {
              if (errorMessage) {
                showToast("error", errorMessage);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UserManagement;
