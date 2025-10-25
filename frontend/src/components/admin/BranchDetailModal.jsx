import React, { useState, useEffect } from "react";
import "./BranchDetailModal.css";
import CustomDropdown from "./CustomDropdown";
import dealerApiService from "../../services/dealerApi";

const BranchDetailModal = ({
  branch,
  onClose,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    code: branch?.code || "",
    name: branch?.name || "",
    address: branch?.address || "",
    status: branch?.status || "Active",
    dealerId: branch?.dealerId || "",
  });
  const [errors, setErrors] = useState({});
  const [dealerCode, setDealerCode] = useState("");

  // Load dealer code
  useEffect(() => {
    const loadDealerCode = async () => {
      try {
        const res = await dealerApiService.getDealerById(branch.dealerId);
        const data = res.data || res;
        setDealerCode(data?.code || "");
      } catch (e) {
        console.warn("Could not fetch dealer code for", branch.dealerId, e);
      }
    };
    if (branch?.dealerId) loadDealerCode();
  }, [branch?.dealerId]);

  // Update editData when branch changes
  React.useEffect(() => {
    setEditData({
      code: branch?.code || "",
      name: branch?.name || "",
      address: branch?.address || "",
      status: branch?.status || "Active",
      dealerId: branch?.dealerId || "",
    });
  }, [branch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editData.code.trim()) {
      newErrors.code = "Mã chi nhánh là bắt buộc";
    }

    if (!editData.name.trim()) {
      newErrors.name = "Tên chi nhánh là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const branchId = branch?.branchId || branch?.id;
    if (!branchId) {
      console.error("Branch ID is missing:", branch);
      setErrors({ submit: "Không tìm thấy ID của chi nhánh. Vui lòng thử lại." });
      return;
    }

    try {
      const submitData = {
        ...editData,
        branchId: branchId,
      };

      console.log("Updating branch with ID:", branchId, "Data:", submitData);
      await onUpdate(branchId, submitData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating branch:", error);
      setErrors({ submit: "Không thể cập nhật chi nhánh. Vui lòng thử lại." });
    }
  };

  const handleCancel = () => {
    setEditData({
      code: branch?.code || "",
      name: branch?.name || "",
      address: branch?.address || "",
      status: branch?.status || "Active",
      dealerId: branch?.dealerId || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { text: "Hoạt động", class: "status-active" },
      Inactive: { text: "Không hoạt động", class: "status-inactive" },
      Suspended: { text: "Tạm dừng", class: "status-suspended" },
      Closed: { text: "Đã đóng", class: "status-closed" },
    };

    const config = statusConfig[status] || {
      text: status,
      class: "status-default",
    };
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  const getStatusOptions = () => [
    {
      value: "Active",
      label: "Hoạt động",
      class: "status-active",
      icon: "✅",
    },
    {
      value: "Inactive",
      label: "Không hoạt động",
      class: "status-inactive",
      icon: "⏸️",
    },
    {
      value: "Suspended",
      label: "Tạm dừng",
      class: "status-suspended",
      icon: "🔒",
    },
    { value: "Closed", label: "Đã đóng", class: "status-closed", icon: "❌" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      let date;
      if (typeof dateString === "string") {
        date = new Date(dateString);
      } else if (typeof dateString === "number") {
        date = new Date(dateString);
      } else {
        date = dateString;
      }

      if (isNaN(date.getTime())) {
        return "-";
      }

      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  return (
    <div className="admin-branch-app">
      <div className="admin-branch-modal-overlay">
        <div
          className={`admin-branch-modal-container ${
            isEditing ? "edit-mode" : ""
          }`}
        >
          {/* Header */}
          <div className="admin-branch-modal-header">
            <div className="admin-branch-modal-header-left">
              <div className="admin-branch-modal-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h2 className="admin-branch-modal-title">Chi Tiết Chi Nhánh</h2>
                <p className="admin-branch-modal-subtitle">
                  Quản lý thông tin và trạng thái
                </p>
              </div>
            </div>
            <div className="admin-branch-modal-header-actions">
              {!isEditing && (
                <button
                  className="admin-branch-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                  Chỉnh sửa
                </button>
              )}
              <button className="admin-branch-secondary-btn" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>

          {/* Edit Mode Banner */}
          {isEditing && (
            <div className="admin-branch-edit-banner">
              <div className="admin-branch-edit-banner-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </div>
              <div className="admin-branch-edit-banner-text">
                <p className="admin-branch-edit-banner-title">
                  Chế độ chỉnh sửa
                </p>
                <p className="admin-branch-edit-banner-subtitle">
                  Bạn đang chỉnh sửa thông tin chi nhánh. Nhấn "Lưu thay đổi" để
                  hoàn tất.
                </p>
              </div>
            </div>
          )}

          {/* 2-Column Layout */}
          <div className="admin-branch-content-grid">
            {/* Left Column - Main Info */}
            <div className="admin-branch-content-col">
              <div className="admin-branch-info-card">
                <div className="admin-branch-card-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  <h4>Thông Tin Cơ Bản</h4>
                </div>
                <div className="admin-branch-info-body">
                  <div className="admin-branch-field">
                    <label className="admin-branch-field-label">
                      Tên Chi Nhánh
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleInputChange}
                          className={`admin-branch-field-input ${
                            errors.name ? "error" : ""
                          }`}
                          placeholder="Nhập tên chi nhánh"
                        />
                        {errors.name && (
                          <span className="admin-branch-field-error">
                            {errors.name}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="admin-branch-field-value">
                        {branch?.name || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-branch-field">
                    <label className="admin-branch-field-label">
                      Mã Chi Nhánh
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="code"
                          value={editData.code}
                          onChange={handleInputChange}
                          className={`admin-branch-field-input ${
                            errors.code ? "error" : ""
                          }`}
                          placeholder="Nhập mã chi nhánh"
                        />
                        {errors.code && (
                          <span className="admin-branch-field-error">
                            {errors.code}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="admin-branch-field-value">
                        {branch?.code || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-branch-field">
                    <label className="admin-branch-field-label">
                      Địa Chỉ
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        value={editData.address}
                        onChange={handleInputChange}
                        className="admin-branch-field-textarea"
                        placeholder="Nhập địa chỉ chi nhánh"
                        rows="3"
                      />
                    ) : (
                      <div className="admin-branch-field-value">
                        {branch?.address || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-branch-field">
                    <label className="admin-branch-field-label">
                      Trạng Thái
                    </label>
                    {isEditing ? (
                      <CustomDropdown
                        value={editData.status}
                        onChange={(val) => {
                          setEditData((prev) => ({ ...prev, status: val }));
                          if (errors.status) {
                            setErrors((prev) => ({ ...prev, status: "" }));
                          }
                        }}
                        options={getStatusOptions()}
                        minWidth="100%"
                        compact={true}
                      />
                    ) : (
                      <div className="admin-branch-field-value">
                        {getStatusBadge(branch?.status)}
                      </div>
                    )}
                  </div>

                  <div className="admin-branch-field">
                    <label className="admin-branch-field-label">
                      Mã Dealer
                    </label>
                    <div className="admin-branch-field-value">
                      <span className="admin-branch-dealer-badge">
                        {dealerCode || branch?.dealerId || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - System Info */}
            <div className="admin-branch-content-col">
              {/* System Info Card */}
              <div className="admin-branch-info-card">
                <div className="admin-branch-card-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                  </svg>
                  <h4>Thông Tin Hệ Thống</h4>
                </div>
                <div className="admin-branch-info-body">
                  <div className="admin-branch-field">
                    <label className="admin-branch-field-label">
                      ID Chi Nhánh
                    </label>
                    <div className="admin-branch-field-value">
                      {branch?.branchId || branch?.id || "-"}
                    </div>
                  </div>

                  {(branch?.createdAt ||
                    branch?.createdDate ||
                    branch?.dateCreated) && (
                    <div className="admin-branch-field">
                      <label className="admin-branch-field-label">
                        Ngày Tạo
                      </label>
                      <div className="admin-branch-field-value admin-branch-date-value">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                        </svg>
                        {formatDate(
                          branch?.createdAt ||
                            branch?.createdDate ||
                            branch?.dateCreated
                        )}
                      </div>
                    </div>
                  )}

                  {(branch?.updatedAt ||
                    branch?.updatedDate ||
                    branch?.dateUpdated ||
                    branch?.lastModified) && (
                    <div className="admin-branch-field">
                      <label className="admin-branch-field-label">
                        Cập Nhật Lần Cuối
                      </label>
                      <div className="admin-branch-field-value admin-branch-date-value">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                        </svg>
                        {formatDate(
                          branch?.updatedAt ||
                            branch?.updatedDate ||
                            branch?.dateUpdated ||
                            branch?.lastModified
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="admin-branch-modal-footer">
            {isEditing ? (
              <div className="admin-branch-edit-actions">
                <button
                  className="admin-branch-cancel-btn"
                  onClick={handleCancel}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                  Hủy
                </button>
                <button className="admin-branch-save-btn" onClick={handleSave}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Lưu thay đổi
                </button>
              </div>
            ) : (
              <div className="admin-branch-view-actions"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDetailModal;
