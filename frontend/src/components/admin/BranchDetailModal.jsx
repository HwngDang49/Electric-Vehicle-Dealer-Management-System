import React, { useEffect, useState } from "react";
import "./BranchDetailModal.css";
import dealerApiService from "../../services/dealerApi";

const BranchDetailModal = ({ branch, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    code: branch.code || "",
    name: branch.name || "",
    address: branch.address || "",
    status: branch.status || "Active",
    dealerId: branch.dealerId || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [dealerCode, setDealerCode] = useState("");

  useEffect(() => {
    const loadDealerCode = async () => {
      try {
        const res = await dealerApiService.getDealerById(branch.dealerId);
        const data = res.data || res;
        setDealerCode(data?.code || "");
      } catch (e) {
        // ignore; fallback to dealerId
        console.warn("Could not fetch dealer code for", branch.dealerId, e);
      }
    };
    if (branch?.dealerId) loadDealerCode();
  }, [branch?.dealerId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.code.trim()) errors.code = "Mã chi nhánh là bắt buộc";
    if (!formData.name.trim()) errors.name = "Tên chi nhánh là bắt buộc";
    if (!formData.status) errors.status = "Vui lòng chọn trạng thái";
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      await onUpdate(branch.branchId, { ...formData, branchId: branch.branchId });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating branch:", err);
      setError("Không thể cập nhật chi nhánh. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      code: branch.code || "",
      name: branch.name || "",
      address: branch.address || "",
      status: branch.status || "Active",
      dealerId: branch.dealerId || "",
    });
    setValidationErrors({});
    setError(null);
    setIsEditing(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết Chi nhánh</h2>
          <button className="close-btn" onClick={onClose}>X</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {error}
            </div>
          )}

          <div className="dealer-header">
            <div className="dealer-info">
              <h3>{branch.name}</h3>
              <div className="dealer-code">{branch.code}</div>
              <div className="status-section">
                {isEditing ? (
                  <div className="status-edit-container">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="status-select"
                      disabled={loading}
                    >
                      <option value="Active">Hoạt động</option>
                      <option value="Inactive">Không hoạt động</option>
                      <option value="Suspended">Tạm dừng</option>
                      <option value="Closed">Đã đóng</option>
                    </select>
                    {validationErrors.status && (
                      <span className="error-text">{validationErrors.status}</span>
                    )}
                  </div>
                ) : (
                  <div className="status-display">{getStatusBadge(branch.status)}</div>
                )}
              </div>
            </div>
            <div className="header-actions">
              {!isEditing && (
                <button className="edit-toggle-btn" onClick={() => setIsEditing(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          <div className="dealer-details">
            <div className="detail-section">
              <h4>Thông tin cơ bản</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Mã Chi nhánh</div>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        className={`detail-input ${validationErrors.code ? "error" : ""}`}
                        disabled={loading}
                      />
                      {validationErrors.code && (
                        <span className="error-text">{validationErrors.code}</span>
                      )}
                    </div>
                  ) : (
                    <div className="detail-value">{branch.code}</div>
                  )}
                </div>

                <div className="detail-item">
                  <div className="detail-label">Tên Chi nhánh</div>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`detail-input ${validationErrors.name ? "error" : ""}`}
                        disabled={loading}
                      />
                      {validationErrors.name && (
                        <span className="error-text">{validationErrors.name}</span>
                      )}
                    </div>
                  ) : (
                    <div className="detail-value">{branch.name}</div>
                  )}
                </div>

                <div className="detail-item">
                  <div className="detail-label">Địa chỉ</div>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="detail-input"
                      disabled={loading}
                    />
                  ) : (
                    <div className="detail-value">{branch.address || "-"}</div>
                  )}
                </div>

                <div className="detail-item">
                  <div className="detail-label">Mã Dealer</div>
                  <div className="detail-value">
                    <span className="dealer-code">{dealerCode || branch.dealerId}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">Ngày tạo</div>
                  <div className="detail-value">{formatDate(branch.createdAt)}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-label">Ngày cập nhật</div>
                  <div className="detail-value">{formatDate(branch.updatedAt)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="modal-footer">
            <div className="edit-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel} disabled={loading}>
                Hủy
              </button>
              <button type="button" className="save-btn" onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchDetailModal;


