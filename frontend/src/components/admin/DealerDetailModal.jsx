import React, { useState } from "react";
import "./DealerDetailModal.css";

const DealerDetailModal = ({ dealer, onClose, onUpdate, onStatusChange, actionLoading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    code: dealer?.code || "",
    name: dealer?.name || "",
    legalName: dealer?.legalName || "",
    taxId: dealer?.taxId || "",
    creditLimit: dealer?.creditLimit || "",
    status: dealer?.status || "Onboarding"
  });
  const [errors, setErrors] = useState({});

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
    lastModified: dealer?.lastModified
  });

  // Update editData when dealer changes
  React.useEffect(() => {
    setEditData({
      code: dealer?.code || "",
      name: dealer?.name || "",
      legalName: dealer?.legalName || "",
      taxId: dealer?.taxId || "",
      creditLimit: dealer?.creditLimit || "",
      status: dealer?.status || "Onboarding"
    });
  }, [dealer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
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
        creditLimit: editData.creditLimit ? parseFloat(editData.creditLimit) : null
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
      status: dealer?.status || "Onboarding"
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
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getStatusOptions = () => [
    { value: "Onboarding", label: "Đang thiết lập", class: "status-onboarding" },
    { value: "Live", label: "Hoạt động", class: "status-active" },
    { value: "Suspended", label: "Tạm dừng", class: "status-suspended" },
    { value: "Closed", label: "Đã đóng", class: "status-closed" },
  ];

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    try {
      // Thử parse date với nhiều format khác nhau
      let date;
      if (typeof dateString === 'string') {
        date = new Date(dateString);
      } else if (typeof dateString === 'number') {
        date = new Date(dateString);
      } else {
        date = dateString;
      }
      
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        return "-";
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "-";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi Tiết Dealer</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="dealer-header">
            <div className="dealer-avatar">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="dealer-info">
              <h3>{dealer?.name || "N/A"}</h3>
              <p className="dealer-code">Mã: {dealer?.code || "N/A"}</p>
              <div className="status-section">
                {getStatusBadge(dealer?.status)}
              </div>
            </div>
            <div className="header-actions">
              <button
                className="edit-toggle-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                    Hủy
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    Chỉnh sửa
                  </>
                )}
              </button>
              
            </div>
          </div>

          <div className="dealer-details">
            <div className="detail-section">
              <h4>Thông Tin Cơ Bản</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Tên Dealer:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editData.name}
                      onChange={handleInputChange}
                      className={`detail-input ${errors.name ? 'error' : ''}`}
                    />
                  ) : (
                    <span className="detail-value">{dealer?.name || "-"}</span>
                  )}
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mã Dealer:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="code"
                      value={editData.code}
                      onChange={handleInputChange}
                      className={`detail-input ${errors.code ? 'error' : ''}`}
                    />
                  ) : (
                    <span className="detail-value">{dealer?.code || "-"}</span>
                  )}
                  {errors.code && <span className="error-text">{errors.code}</span>}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tên Pháp Lý:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="legalName"
                      value={editData.legalName}
                      onChange={handleInputChange}
                      className="detail-input"
                    />
                  ) : (
                    <span className="detail-value">{dealer?.legalName || "-"}</span>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Mã Số Thuế:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="taxId"
                      value={editData.taxId}
                      onChange={handleInputChange}
                      className="detail-input"
                    />
                  ) : (
                    <span className="detail-value">{dealer?.taxId || "-"}</span>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Trạng Thái:</span>
                  {isEditing ? (
                    <select
                      name="status"
                      value={editData.status}
                      onChange={handleInputChange}
                      className="status-select"
                    >
                      {getStatusOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="status-display-readonly">
                      <select disabled className="status-select-readonly">
                        <option value={dealer?.status}>
                          {getStatusOptions().find(opt => opt.value === dealer?.status)?.label || dealer?.status}
                        </option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="detail-item">
                  <span className="detail-label">Hạn Mức Tín Dụng:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      name="creditLimit"
                      value={editData.creditLimit}
                      onChange={handleInputChange}
                      className={`detail-input ${errors.creditLimit ? 'error' : ''}`}
                      min="0"
                      step="1000000"
                    />
                  ) : (
                    <span className="detail-value">{formatCurrency(dealer?.creditLimit)}</span>
                  )}
                  {errors.creditLimit && <span className="error-text">{errors.creditLimit}</span>}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Thông Tin Hệ Thống</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">ID Dealer:</span>
                  <span className="detail-value">{dealer?.id || dealer?.dealerId || "-"}</span>
                </div>
                {(dealer?.createdAt || dealer?.createdDate || dealer?.dateCreated) && (
                  <div className="detail-item">
                    <span className="detail-label">Ngày Tạo:</span>
                    <span className="detail-value">
                      {formatDate(dealer?.createdAt || dealer?.createdDate || dealer?.dateCreated)}
                    </span>
                  </div>
                )}
                {(dealer?.updatedAt || dealer?.updatedDate || dealer?.dateUpdated || dealer?.lastModified) && (
                  <div className="detail-item">
                    <span className="detail-label">Cập Nhật Lần Cuối:</span>
                    <span className="detail-value">
                      {formatDate(dealer?.updatedAt || dealer?.updatedDate || dealer?.dateUpdated || dealer?.lastModified)}
                    </span>
                  </div>
                )}
                {!dealer?.createdAt && !dealer?.updatedAt && (
                  <div className="detail-item">
                    <span className="detail-label">Thông tin hệ thống:</span>
                    <span className="detail-value text-muted">Chưa có dữ liệu từ backend</span>
                  </div>
                )}
              </div>
            </div>

            {dealer?.status === "Live" && (
              <div className="detail-section">
                <h4>Thống Kê Hoạt Động</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.5-1.85 1.26L14 15h2v7h4zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9l-1.15-3.26A1.5 1.5 0 0 0 6.54 8H5.46c-.8 0-1.54.5-1.85 1.26L2.5 15H5v7h2.5z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">0</div>
                      <div className="stat-label">Khách hàng</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 4V2c0-.55-.45-1-1-1s-1 .45-1 1v2c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2H7zm12 3H5v9h14V7z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">0</div>
                      <div className="stat-label">Đơn hàng</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">0</div>
                      <div className="stat-label">Doanh thu</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {isEditing && (
            <div className="edit-actions">
              <button className="cancel-btn" onClick={handleCancel}>
                Hủy
              </button>
              <button className="save-btn" onClick={handleSave}>
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealerDetailModal;
