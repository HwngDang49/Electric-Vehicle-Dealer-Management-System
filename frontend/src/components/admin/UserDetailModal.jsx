import React from "react";
import "./UserDetailModal.css";

const UserDetailModal = ({ user, onClose, onUpdate }) => {
  if (!user) return null;

  const getRoleBadge = (role) => {
    const roleMap = {
      Admin: { class: "badge-admin", label: "👑 Admin" },
      Manufacturer: { class: "badge-manufacturer", label: "🏭 Manufacturer" },
      DealerManager: {
        class: "badge-dealer-manager",
        label: "👔 Dealer Manager",
      },
      DealerStaff: { class: "badge-dealer-staff", label: "👤 Dealer Staff" },
    };
    return roleMap[role] || { class: "badge-default", label: role };
  };

  const getStatusBadge = (status) => {
    return status === "Active"
      ? { class: "badge-active", label: "✅ Hoạt động" }
      : { class: "badge-inactive", label: "🔒 Vô hiệu hóa" };
  };

  const roleBadge = getRoleBadge(user.role);
  const statusBadge = getStatusBadge(user.status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="detail-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-modal-header">
          <h2>👤 Chi tiết Người dùng</h2>
          <button className="btn-close" onClick={onClose}>
            ✖
          </button>
        </div>

        <div className="detail-modal-body">
          <div className="single-section-layout">
            <div className="section-card">
              <h3 className="section-title">
                <span className="section-icon">👤</span>
                Thông Tin Người Dùng
              </h3>
              <div className="two-column-grid">
                {/* Left Column */}
                <div>
                  <div className="info-item">
                    <label>Họ và tên</label>
                    <div className="info-value">{user.fullName}</div>
                  </div>

                  <div className="info-item">
                    <label>Email</label>
                    <div className="info-value">{user.email}</div>
                  </div>

                  <div className="info-item">
                    <label>Vai trò</label>
                    <div className="info-value">{user.role}</div>
                  </div>

                  <div className="info-item">
                    <label>Dealer</label>
                    <div className="info-value">{user.dealerId || "-"}</div>
                  </div>

                  <div className="info-item">
                    <label>Branch</label>
                    <div className="info-value">{user.branchId || "-"}</div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="info-item">
                    <label>Trạng thái</label>
                    <div className="info-value">
                      <span className={`badge ${statusBadge.class}`}>
                        {user.status === "Active" ? "Hoạt động" : "Vô hiệu hóa"}
                      </span>
                    </div>
                  </div>

                  <div className="info-item">
                    <label>ID người dùng</label>
                    <div className="info-value">{user.userId}</div>
                  </div>

                  <div className="info-item">
                    <label>Ngày tạo</label>
                    <div className="info-value">
                      <span className="date-icon">📅</span>
                      {new Date(user.createAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  <div className="info-item">
                    <label>Cập nhật lần cuối</label>
                    <div className="info-value">
                      <span className="date-icon">🔄</span>
                      {new Date(user.updateAt).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3 className="section-title">
                <span className="section-icon">📊</span>
                Thống Kê Hoạt Động
              </h3>
              <div>
                <div className="stats-placeholder">
                  <p>Chưa có dữ liệu thống kê</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-modal-footer">
          <button className="btn-close-modal" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
