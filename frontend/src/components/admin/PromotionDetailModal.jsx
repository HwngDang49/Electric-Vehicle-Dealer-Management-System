import React, { useState, useEffect } from "react";
import "./ProductDetailModal.css";
import promotionService from "../../services/promotionService";
import dealerApiService from "../../services/dealerApi";
import CustomDropdown from "./CustomDropdown";

const PromotionDetailModal = ({ promotionId, onClose, onUpdate }) => {
  const [promotion, setPromotion] = useState(null);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dealerId: "",
    fundedBy: "",
    stackingRule: "",
    amountOff: "",
    effectiveFrom: "",
    effectiveTo: ""
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadData();
  }, [promotionId]);

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || "",
        description: promotion.description || "",
        dealerId: promotion.dealerId || "",
        fundedBy: promotion.fundedBy || "",
        stackingRule: promotion.stackingRule || "",
        amountOff: promotion.amountOff || "",
        effectiveFrom: promotion.effectiveFrom || "",
        effectiveTo: promotion.effectiveTo || ""
      });
    }
  }, [promotion]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [promotionRes, dealersRes] = await Promise.all([
        promotionService.getPromotionById(promotionId),
        dealerApiService.getDealers()
      ]);

      // Promotion API returns { data: { data: {...} } } due to backend wrapping
      const promotionData = promotionRes.data?.data || promotionRes.data || promotionRes;
      setPromotion(promotionData);
      setDealers(dealersRes.data || dealersRes || []);
    } catch (err) {
      console.error("Error loading promotion details:", err);
      setError("Lỗi khi tải thông tin khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { text: "Nháp", class: "status-inactive" },
      Active: { text: "Hoạt động", class: "status-active" },
      Expired: { text: "Hết hạn", class: "status-discontinued" },
      Cancelled: { text: "Đã hủy", class: "status-discontinued" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const statusOptions = [
    { value: "Draft", label: "Nháp", icon: "📝" },
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Expired", label: "Hết hạn", icon: "⏱️" },
    { value: "Cancelled", label: "Đã hủy", icon: "❌" }
  ];

  const fundedByOptions = [
    { value: "OEM", label: "OEM", icon: "🏭" },
    { value: "Dealer", label: "Dealer", icon: "🏢" },
    { value: "Shared", label: "Shared", icon: "🤝" }
  ];

  const stackingRuleOptions = [
    { value: "Stackable", label: "Stackable - Có thể kết hợp", icon: "📚" },
    { value: "Exclusive", label: "Exclusive - Độc quyền", icon: "⚡" }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Tên khuyến mãi là bắt buộc";
    }
    
    if (!formData.amountOff || parseFloat(formData.amountOff) <= 0) {
      errors.amountOff = "Số tiền giảm phải lớn hơn 0";
    }
    
    if (!formData.effectiveFrom) {
      errors.effectiveFrom = "Ngày bắt đầu là bắt buộc";
    }
    
    if (formData.effectiveTo && formData.effectiveFrom >= formData.effectiveTo) {
      errors.effectiveTo = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (formData.dealerId === "" && formData.fundedBy !== "OEM") {
      errors.fundedBy = "Global promotion phải do OEM tài trợ";
    }

    if (formData.dealerId !== "" && formData.fundedBy === "OEM") {
      errors.fundedBy = "Dealer-specific promotion không thể do OEM tài trợ";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        description: formData.description || null,
        dealerId: formData.dealerId ? parseInt(formData.dealerId) : null,
        fundedBy: formData.fundedBy,
        stackingRule: formData.stackingRule,
        amountOff: parseFloat(formData.amountOff),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null
      };

      await promotionService.updatePromotion(promotionId, updateData);
      await loadData();
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error updating promotion:", err);
      setError(err.message || "Lỗi khi cập nhật khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: promotion?.name || "",
      description: promotion?.description || "",
      dealerId: promotion?.dealerId || "",
      fundedBy: promotion?.fundedBy || "",
      stackingRule: promotion?.stackingRule || "",
      amountOff: promotion?.amountOff || "",
      effectiveFrom: promotion?.effectiveFrom || "",
      effectiveTo: promotion?.effectiveTo || ""
    });
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Bạn có chắc muốn chuyển trạng thái sang "${statusOptions.find(s => s.value === newStatus)?.label}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await promotionService.updatePromotionStatus(promotionId, newStatus);
      await loadData();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableStatusTransitions = () => {
    if (!promotion) return [];
    
    switch (promotion.status) {
      case "Draft":
        return ["Active", "Cancelled"];
      case "Active":
        return ["Expired", "Cancelled"];
      case "Expired":
      case "Cancelled":
        return [];
      default:
        return [];
    }
  };

  const getAvailableFundedByOptions = () => {
    if (formData.dealerId === "") {
      return fundedByOptions.filter(opt => opt.value === "OEM");
    } else {
      return fundedByOptions.filter(opt => opt.value !== "OEM");
    }
  };

  const getDealerName = (dealerId) => {
    if (!dealerId) return "Global";
    const dealer = dealers.find(d => (d.id || d.dealerId) === dealerId);
    return dealer ? `${dealer.name} (${dealer.code})` : `#${dealerId}`;
  };

  if (loading && !promotion) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Chi Tiết Khuyến mãi</h2>
          </div>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin khuyến mãi...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !promotion) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Chi Tiết Khuyến mãi</h2>
          </div>
          <div className="error-container">
            <div className="error-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <p>{error}</p>
            <button className="retry-btn" onClick={loadData}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!promotion) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '2px solid #e9ecef'
        }}>
          <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>
            Chi Tiết Khuyến mãi
          </h2>
          {!isEditing && promotion.status === "Draft" && (
            <button
              className="edit-toggle-btn"
              onClick={() => setIsEditing(true)}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #dee2e6',
                backgroundColor: '#fff',
                color: '#495057',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
                e.currentTarget.style.borderColor = '#adb5bd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              Chỉnh sửa
            </button>
          )}
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

          {/* Promotion Header */}
          <div className="dealer-header">
            <div className="dealer-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0 }}>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={validationErrors.name ? "error" : ""}
                      style={{ 
                        fontSize: '20px', 
                        fontWeight: '600',
                        padding: '6px 10px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        width: '100%'
                      }}
                    />
                  ) : (
                    promotion.name
                  )}
                </h3>
                <div className="status-section">
                  {getStatusBadge(promotion.status)}
                </div>
              </div>
              {validationErrors.name && (
                <span className="error-text">{validationErrors.name}</span>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="dealer-details">
            <div className="detail-section">
              <h4>Thông tin cơ bản</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Mô tả:</span>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      style={{ 
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        width: '100%',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <span className="detail-value">{promotion.description || "-"}</span>
                  )}
                </div>

                <div className="detail-item">
                  <span className="detail-label">Phạm vi áp dụng:</span>
                  {isEditing ? (
                    <CustomDropdown
                      value={formData.dealerId}
                      onChange={(val) => setFormData(prev => ({ ...prev, dealerId: val }))}
                      options={[
                        { value: "", label: "Global - Áp dụng cho tất cả dealer", icon: "🌐" },
                        ...dealers.map(dealer => ({
                          value: String(dealer.id || dealer.dealerId),
                          label: `${dealer.name} (${dealer.code})`,
                          icon: "🏢"
                        }))
                      ]}
                      minWidth="100%"
                    />
                  ) : (
                    <span className="detail-value">{getDealerName(promotion.dealerId)}</span>
                  )}
                </div>

                <div className="detail-item">
                  <span className="detail-label">Nguồn tài trợ:</span>
                  {isEditing ? (
                    <div>
                      <CustomDropdown
                        value={formData.fundedBy}
                        onChange={(val) => setFormData(prev => ({ ...prev, fundedBy: val }))}
                        options={getAvailableFundedByOptions()}
                        minWidth="100%"
                      />
                      {validationErrors.fundedBy && (
                        <span className="error-text">{validationErrors.fundedBy}</span>
                      )}
                    </div>
                  ) : (
                    <span className="detail-value">
                      {promotion.fundedBy === "OEM" && "🏭 OEM"}
                      {promotion.fundedBy === "Dealer" && "🏢 Dealer"}
                      {promotion.fundedBy === "Shared" && "🤝 Shared"}
                    </span>
                  )}
                </div>

                <div className="detail-item">
                  <span className="detail-label">Quy tắc kết hợp:</span>
                  {isEditing ? (
                    <CustomDropdown
                      value={formData.stackingRule}
                      onChange={(val) => setFormData(prev => ({ ...prev, stackingRule: val }))}
                      options={stackingRuleOptions}
                      minWidth="100%"
                    />
                  ) : (
                    <span className="detail-value">
                      {promotion.stackingRule === "Stackable" && "📚 Stackable - Có thể kết hợp"}
                      {promotion.stackingRule === "Exclusive" && "⚡ Exclusive - Độc quyền"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Thông tin giá trị & thời gian</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Số tiền giảm:</span>
                  {isEditing ? (
                    <div>
                      <input
                        type="number"
                        name="amountOff"
                        value={formData.amountOff}
                        onChange={handleInputChange}
                        min="0"
                        step="1000"
                        className={validationErrors.amountOff ? "error" : ""}
                        style={{ 
                          padding: '8px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          width: '100%'
                        }}
                      />
                      {validationErrors.amountOff && (
                        <span className="error-text">{validationErrors.amountOff}</span>
                      )}
                    </div>
                  ) : (
                    <span className="detail-value" style={{ color: '#dc3545', fontWeight: '600' }}>
                      -{formatCurrency(promotion.amountOff)} VND
                    </span>
                  )}
                </div>

                <div className="detail-item">
                  <span className="detail-label">Ngày bắt đầu:</span>
                  {isEditing ? (
                    <div>
                      <input
                        type="date"
                        name="effectiveFrom"
                        value={formData.effectiveFrom}
                        onChange={handleInputChange}
                        className={validationErrors.effectiveFrom ? "error" : ""}
                        style={{ 
                          padding: '8px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          width: '100%'
                        }}
                      />
                      {validationErrors.effectiveFrom && (
                        <span className="error-text">{validationErrors.effectiveFrom}</span>
                      )}
                    </div>
                  ) : (
                    <span className="detail-value">{formatDate(promotion.effectiveFrom)}</span>
                  )}
                </div>

                <div className="detail-item">
                  <span className="detail-label">Ngày kết thúc:</span>
                  {isEditing ? (
                    <div>
                      <input
                        type="date"
                        name="effectiveTo"
                        value={formData.effectiveTo}
                        onChange={handleInputChange}
                        className={validationErrors.effectiveTo ? "error" : ""}
                        style={{ 
                          padding: '8px',
                          border: '1px solid #ced4da',
                          borderRadius: '4px',
                          width: '100%'
                        }}
                      />
                      {validationErrors.effectiveTo && (
                        <span className="error-text">{validationErrors.effectiveTo}</span>
                      )}
                    </div>
                  ) : (
                    <span className="detail-value">{formatDate(promotion.effectiveTo)}</span>
                  )}
                </div>

                <div className="detail-item">
                  <span className="detail-label">Ngày tạo:</span>
                  <span className="detail-value">{formatDate(promotion.createdAt)}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Người tạo:</span>
                  <span className="detail-value">{promotion.createdBy || "-"}</span>
                </div>
              </div>
            </div>

            {/* Scopes Section */}
            {promotion.scopes && promotion.scopes.length > 0 && (
              <div className="detail-section">
                <h4>Phạm vi áp dụng chi tiết</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {promotion.scopes.map((scope, index) => (
                    <div key={index} style={{
                      padding: '6px 12px',
                      backgroundColor: '#f0f0f0',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}>
                      {scope.productId && scope.productName && `📦 ${scope.productName}`}
                      {scope.branchId && scope.branchName && `🏢 ${scope.branchName}`}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="modal-footer">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="cancel-btn"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </>
            ) : (
              <>
                <button onClick={onClose} className="cancel-btn">
                  Đóng
                </button>
                {getAvailableStatusTransitions().map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className="submit-btn"
                    disabled={loading}
                    style={{
                      backgroundColor: status === "Cancelled" ? "#dc3545" : undefined
                    }}
                  >
                    Chuyển sang {statusOptions.find(s => s.value === status)?.label}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetailModal;
