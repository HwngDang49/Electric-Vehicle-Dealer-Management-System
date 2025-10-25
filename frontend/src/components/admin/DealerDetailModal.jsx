import React, { useState } from "react";
import "./DealerDetailModal.css";
import CustomDropdown from "./CustomDropdown";

const DealerDetailModal = ({
  dealer,
  onClose,
  onUpdate,
  onStatusChange,
  actionLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    code: dealer?.code || "",
    name: dealer?.name || "",
    legalName: dealer?.legalName || "",
    taxId: dealer?.taxId || "",
    creditLimit: dealer?.creditLimit || "",
    status: dealer?.status || "Onboarding",
  });
  const [errors, setErrors] = useState({});
  const [showActions, setShowActions] = useState(false);

  // Debug: Log dealer object when component mounts
  console.log("DealerDetailModal received dealer:", dealer);
  console.log("CreatedAt:", dealer?.createdAt);
  console.log("UpdatedAt:", dealer?.updatedAt);
  console.log("All date properties:", {
    createdAt: dealer?.createdAt,
    createdDate: dealer?.createdDate,
    dateCreated: dealer?.dateCreated,
    updatedAt: dealer?.updatedAt,
    updatedDate: dealer?.updatedDate,
    dateUpdated: dealer?.dateUpdated,
    lastModified: dealer?.lastModified,
  });

  // Update editData when dealer changes
  React.useEffect(() => {
    setEditData({
      code: dealer?.code || "",
      name: dealer?.name || "",
      legalName: dealer?.legalName || "",
      taxId: dealer?.taxId || "",
      creditLimit: dealer?.creditLimit || "",
      status: dealer?.status || "Onboarding",
    });
  }, [dealer]);

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
      newErrors.code = "Mã dealer là bắt buộc";
    }

    if (!editData.name.trim()) {
      newErrors.name = "Tên dealer là bắt buộc";
    }

    if (editData.creditLimit && isNaN(parseFloat(editData.creditLimit))) {
      newErrors.creditLimit = "Hạn mức tín dụng phải là số";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Check if dealer ID exists (try both id and dealerId)
    const dealerId = dealer?.id || dealer?.dealerId;
    if (!dealerId) {
      console.error("Dealer ID is missing:", dealer);
      setErrors({ submit: "Không tìm thấy ID của dealer. Vui lòng thử lại." });
      return;
    }

    try {
      const submitData = {
        ...editData,
        creditLimit: editData.creditLimit
          ? parseFloat(editData.creditLimit)
          : null,
      };

      console.log("Updating dealer with ID:", dealerId, "Data:", submitData);
      console.log("Status being sent:", submitData.status);
      await onUpdate(dealerId, submitData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating dealer:", error);
      setErrors({ submit: "Không thể cập nhật dealer. Vui lòng thử lại." });
    }
  };

  const handleCancel = () => {
    setEditData({
      code: dealer?.code || "",
      name: dealer?.name || "",
      legalName: dealer?.legalName || "",
      taxId: dealer?.taxId || "",
      creditLimit: dealer?.creditLimit || "",
      status: dealer?.status || "Onboarding",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleStatusAction = (action) => {
    const dealerId = dealer?.id || dealer?.dealerId;
    onStatusChange(dealerId, action);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Onboarding: { text: "Đang thiết lập", class: "status-onboarding" },
      Live: { text: "Hoạt động", class: "status-active" },
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
      value: "Onboarding",
      label: "Đang thiết lập",
      class: "status-onboarding",
      icon: "🔄",
    },
    { value: "Live", label: "Hoạt động", class: "status-active", icon: "✅" },
    {
      value: "Suspended",
      label: "Tạm dừng",
      class: "status-suspended",
      icon: "⏸️",
    },
    { value: "Closed", label: "Đã đóng", class: "status-closed", icon: "❌" },
  ];

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    try {
      // Thử parse date với nhiều format khác nhau
      let date;
      if (typeof dateString === "string") {
        date = new Date(dateString);
      } else if (typeof dateString === "number") {
        date = new Date(dateString);
      } else {
        date = dateString;
      }

      // Kiểm tra xem date có hợp lệ không
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
    <div className="admin-app">
      <div className="admin-dealer-modal-overlay">
        <div
          className={`admin-dealer-modal-container ${
            isEditing ? "edit-mode" : ""
          }`}
        >
          {/* Header */}
          <div className="admin-dealer-modal-header">
            <div className="admin-dealer-modal-header-left">
              <div className="admin-dealer-modal-icon">
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
                <h2 className="admin-dealer-modal-title">Chi Tiết Dealer</h2>
                <p className="admin-dealer-modal-subtitle">
                  Quản lý thông tin và trạng thái
                </p>
              </div>
            </div>
            <div className="admin-dealer-modal-header-actions">
              {!isEditing && (
                <button
                  className="admin-dealer-edit-btn"
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
              {/* <button className="admin-dealer-close-btn" onClick={onClose}>
                X
              </button> */}
              <button className="admin-dealer-secondary-btn" onClick={onClose}>
                Đóng
              </button>
            </div>
          </div>

          {/* Edit Mode Banner */}
          {isEditing && (
            <div className="admin-dealer-edit-banner">
              <div className="admin-dealer-edit-banner-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </div>
              <div className="admin-dealer-edit-banner-text">
                <p className="admin-dealer-edit-banner-title">
                  Chế độ chỉnh sửa
                </p>
                <p className="admin-dealer-edit-banner-subtitle">
                  Bạn đang chỉnh sửa thông tin dealer. Nhấn "Lưu thay đổi" để
                  hoàn tất.
                </p>
              </div>
            </div>
          )}

          {/* 2-Column Layout */}
          <div className="admin-dealer-content-grid">
            {/* Left Column - Main Info */}
            <div className="admin-dealer-content-col">
              <div className="admin-dealer-info-card">
                <div className="admin-dealer-card-header">
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
                <div className="admin-dealer-info-body">
                  <div className="admin-dealer-field">
                    <label className="admin-dealer-field-label">
                      Tên Dealer
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleInputChange}
                          className={`admin-dealer-field-input ${
                            errors.name ? "error" : ""
                          }`}
                          placeholder="Nhập tên dealer"
                        />
                        {errors.name && (
                          <span className="admin-dealer-field-error">
                            {errors.name}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="admin-dealer-field-value">
                        {dealer?.name || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-dealer-field">
                    <label className="admin-dealer-field-label">
                      Mã Dealer
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          name="code"
                          value={editData.code}
                          onChange={handleInputChange}
                          className={`admin-dealer-field-input ${
                            errors.code ? "error" : ""
                          }`}
                          placeholder="Nhập mã dealer"
                        />
                        {errors.code && (
                          <span className="admin-dealer-field-error">
                            {errors.code}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="admin-dealer-field-value">
                        {dealer?.code || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-dealer-field">
                    <label className="admin-dealer-field-label">
                      Tên Pháp Lý
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="legalName"
                        value={editData.legalName}
                        onChange={handleInputChange}
                        className="admin-dealer-field-input"
                        placeholder="Nhập tên pháp lý"
                      />
                    ) : (
                      <div className="admin-dealer-field-value">
                        {dealer?.legalName || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-dealer-field">
                    <label className="admin-dealer-field-label">
                      Mã Số Thuế
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="taxId"
                        value={editData.taxId}
                        onChange={handleInputChange}
                        className="admin-dealer-field-input"
                        placeholder="Nhập mã số thuế"
                      />
                    ) : (
                      <div className="admin-dealer-field-value">
                        {dealer?.taxId || "-"}
                      </div>
                    )}
                  </div>

                  <div className="admin-dealer-field">
                    <label className="admin-dealer-field-label">
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
                      <div className="admin-dealer-field-value">
                        {getStatusBadge(dealer?.status)}
                      </div>
                    )}
                  </div>

                  <div className="admin-dealer-field">
                    <label className="admin-dealer-field-label">
                      Hạn Mức Tín Dụng (VND)
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          name="creditLimit"
                          value={editData.creditLimit}
                          onChange={handleInputChange}
                          className={`admin-dealer-field-input ${
                            errors.creditLimit ? "error" : ""
                          }`}
                          placeholder="0"
                          min="0"
                          step="1000000"
                        />
                        {errors.creditLimit && (
                          <span className="admin-dealer-field-error">
                            {errors.creditLimit}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="admin-dealer-field-value">
                        {formatCurrency(dealer?.creditLimit)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - System Info & Stats */}
            <div className="admin-dealer-content-col">
              {/* System Info Card */}
              <div className="admin-dealer-info-card">
                <div className="admin-dealer-card-header">
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
                <div className="admin-dealer-info-body">
                  <div className="admin-dealer-field">
                    <label className="admin-dealer-field-label">
                      ID Dealer
                    </label>
                    <div className="admin-dealer-field-value">
                      {dealer?.id || dealer?.dealerId || "-"}
                    </div>
                  </div>

                  {(dealer?.createdAt ||
                    dealer?.createdDate ||
                    dealer?.dateCreated) && (
                    <div className="admin-dealer-field">
                      <label className="admin-dealer-field-label">
                        Ngày Tạo
                      </label>
                      <div className="admin-dealer-field-value admin-dealer-date-value">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                        </svg>
                        {formatDate(
                          dealer?.createdAt ||
                            dealer?.createdDate ||
                            dealer?.dateCreated
                        )}
                      </div>
                    </div>
                  )}

                  {(dealer?.updatedAt ||
                    dealer?.updatedDate ||
                    dealer?.dateUpdated ||
                    dealer?.lastModified) && (
                    <div className="admin-dealer-field">
                      <label className="admin-dealer-field-label">
                        Cập Nhật Lần Cuối
                      </label>
                      <div className="admin-dealer-field-value admin-dealer-date-value">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                        </svg>
                        {formatDate(
                          dealer?.updatedAt ||
                            dealer?.updatedDate ||
                            dealer?.dateUpdated ||
                            dealer?.lastModified
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              {dealer?.status === "Live" && (
                <div className="admin-dealer-stats-card">
                  <div className="admin-dealer-card-header">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                    </svg>
                    <h4>Thống Kê Hoạt Động</h4>
                  </div>
                  <div className="admin-dealer-stats-grid">
                    <div className="admin-dealer-stat-item">
                      <div className="admin-dealer-stat-icon admin-dealer-stat-customers">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                      </div>
                      <div className="admin-dealer-stat-content">
                        <div className="admin-dealer-stat-value">0</div>
                        <div className="admin-dealer-stat-label">
                          Khách hàng
                        </div>
                      </div>
                    </div>
                    <div className="admin-dealer-stat-item">
                      <div className="admin-dealer-stat-icon admin-dealer-stat-orders">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </div>
                      <div className="admin-dealer-stat-content">
                        <div className="admin-dealer-stat-value">0</div>
                        <div className="admin-dealer-stat-label">Đơn hàng</div>
                      </div>
                    </div>
                    <div className="admin-dealer-stat-item">
                      <div className="admin-dealer-stat-icon admin-dealer-stat-revenue">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                        </svg>
                      </div>
                      <div className="admin-dealer-stat-content">
                        <div className="admin-dealer-stat-value">0 đ</div>
                        <div className="admin-dealer-stat-label">Doanh thu</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="admin-dealer-modal-footer">
            {isEditing ? (
              <div className="admin-dealer-edit-actions">
                <button
                  className="admin-dealer-cancel-btn"
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
                <button className="admin-dealer-save-btn" onClick={handleSave}>
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
              <div className="admin-dealer-view-actions"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealerDetailModal;
