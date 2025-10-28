import React, { useState, useEffect } from "react";
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

  return (
    <div className="user-management">
      {/* Filters */}
      <div className="filters-section">
        {/* Top Row: Search + Add Button */}
        <div className="top-bar">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            className="btn-create"
            onClick={() => setShowCreateModal(true)}
          >
            + Thêm Người dùng
          </button>
        </div>

        {/* Bottom Row: Filters */}
        <div className="filters-row">
          <CustomDropdown
            label="📋 Tất cả vai trò"
            options={[
              { value: "", label: "Tất cả vai trò" },
              { value: "Admin", label: "Admin" },
              { value: "EVMStaff", label: "EVM Staff" },
              { value: "DealerManager", label: "Dealer Manager" },
              { value: "DealerStaff", label: "Dealer Staff" },
            ]}
            selectedValue={roleFilter}
            onChange={(value) => setRoleFilter(value)}
          />

          <CustomDropdown
            label="🔥 Tất cả trạng thái"
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: "Active", label: "Hoạt động" },
              { value: "Inactive", label: "Vô hiệu hóa" },
            ]}
            selectedValue={statusFilter}
            onChange={(value) => setStatusFilter(value)}
          />

          <CustomDropdown
            label="🏢 Tất cả Dealer"
            options={[
              { value: "", label: "Tất cả Dealer" },
              ...dealers.map((dealer) => ({
                value: String(dealer.dealerId || dealer.id),
                label: `${dealer.name} (${dealer.code})`,
              })),
            ]}
            selectedValue={dealerFilter}
            onChange={(value) => setDealerFilter(value)}
          />

          <CustomDropdown
            label="🏪 Tất cả Branch"
            options={[
              { value: "", label: "Tất cả Branch" },
              ...branches.map((branch) => ({
                value: String(branch.branchId || branch.id),
                label: `${branch.name} (${branch.code})`,
              })),
            ]}
            selectedValue={branchFilter}
            onChange={(value) => setBranchFilter(value)}
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={loadUsers}>Thử lại</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th className="center-align">ID</th>
                <th>HỌ VÀ TÊN</th>
                <th className="center-align">VAI TRÒ</th>
                <th className="center-align">DEALER</th>
                <th className="center-align">BRANCH</th>
                <th className="center-align">TRẠNG THÁI</th>
                <th className="center-align">THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    Không có người dùng nào
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.userId}>
                    <td className="user-id">{user.userId}</td>
                    <td className="user-name">{user.fullName}</td>
                    <td className="center-align">
                      <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                        {formatRoleName(user.role)}
                      </span>
                    </td>
                    <td className="center-align">
                      {getDealerName(user.dealerId)}
                    </td>
                    <td className="center-align">
                      {getBranchName(user.branchId)}
                    </td>
                    <td className="center-align">
                      <span
                        className={`badge ${getStatusBadgeClass(user.status)}`}
                      >
                        {user.status === "Active" ? "Hoạt động" : "Vô hiệu hóa"}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-detail"
                        onClick={() => handleViewDetails(user)}
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Hiển thị <strong>{startIndex + 1}</strong> -{" "}
            <strong>{Math.min(endIndex, filteredUsers.length)}</strong> /{" "}
            <strong>{filteredUsers.length}</strong> người dùng
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ‹ Trước
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return (
                    <span key={page} className="pagination-dots">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau ›
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
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
        />
      )}
    </div>
  );
};

export default UserManagement;
