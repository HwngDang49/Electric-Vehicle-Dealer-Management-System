import React, { useState, useEffect } from "react";
import "./CreatePricebookModal.css";
import pricebookApiService from "../../services/pricebookApi";
import dealerApiService from "../../services/dealerApi";
import CustomDropdown from "./CustomDropdown";

const CreatePricebookModal = ({ onClose, onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    name: "",
    dealerId: "",
    effectiveFrom: "",
    effectiveTo: "",
    status: "Inactive" // Default: Inactive (must have all active products before activating)
  });
  
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "Active", label: "Hoạt động", class: "status-active", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", class: "status-inactive", icon: "⏸️" }
  ];

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    try {
      const response = await dealerApiService.getDealers();
      const paged = response?.data ?? response;
      const fetchedDealers = Array.isArray(paged) ? paged : (paged?.items ?? []);
      setDealers(fetchedDealers || []);
    } catch (err) {
      console.error("Error loading dealers:", err);
      setErrors({ submit: "Không thể tải danh sách dealer" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
    
    if (!formData.name.trim()) {
      newErrors.name = "Tên bảng giá là bắt buộc";
    }
    
    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = "Ngày bắt đầu là bắt buộc";
    }
    
    if (formData.effectiveTo && formData.effectiveFrom >= formData.effectiveTo) {
      newErrors.effectiveTo = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const pricebookData = {
        name: formData.name,
        dealerId: formData.dealerId ? parseInt(formData.dealerId) : null,
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
        status: formData.status,
        pricebookItems: []
      };
      
      console.log("Creating pricebook with data:", pricebookData);
      await pricebookApiService.createPricebook(pricebookData);
      
      // Close modal immediately, toast will be shown in PricebookManagement
      onSuccess(formData.name);
    } catch (error) {
      console.error("Error creating pricebook:", error);
      const errorMessage = 
        error.response?.data?.errors?.[0] ||
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo bảng giá. Vui lòng thử lại.";
      setErrors({ submit: errorMessage });
      // Show error toast locally and also notify parent
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDealerOptions = () => {
    const options = [
      { value: "", label: "Global - Áp dụng cho tất cả dealer", icon: "🌐" }
    ];
    
    (Array.isArray(dealers) ? dealers : []).forEach(dealer => {
      options.push({
        value: String(dealer.id || dealer.dealerId),
        label: `${dealer.name} (${dealer.code})`,
        icon: "🏢"
      });
    });
    
    return options;
  };

  return (
    <div className="admin-create-pricebook-app">
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Tạo Bảng Giá Mới</h2>
            <button className="close-btn" onClick={onClose} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            {errors.submit && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {errors.submit}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="name">Tên Bảng Giá *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="VD: Bảng giá Q1 2025"
                className={errors.name ? "error" : ""}
                disabled={loading}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dealerId">Dealer (Để trống cho Global)</label>
              <CustomDropdown
                value={formData.dealerId}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, dealerId: val }));
                  if (errors.dealerId) {
                    setErrors(prev => ({ ...prev, dealerId: "" }));
                  }
                }}
                options={getDealerOptions()}
                minWidth="100%"
                disabled={loading}
                compact={true}
              />
              {errors.dealerId && <span className="error-text">{errors.dealerId}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="effectiveFrom">Ngày Bắt Đầu *</label>
                <input
                  type="date"
                  id="effectiveFrom"
                  name="effectiveFrom"
                  value={formData.effectiveFrom}
                  onChange={handleInputChange}
                  className={errors.effectiveFrom ? "error" : ""}
                  disabled={loading}
                />
                {errors.effectiveFrom && (
                  <span className="error-text">{errors.effectiveFrom}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="effectiveTo">Ngày Kết Thúc</label>
                <input
                  type="date"
                  id="effectiveTo"
                  name="effectiveTo"
                  value={formData.effectiveTo}
                  onChange={handleInputChange}
                  className={errors.effectiveTo ? "error" : ""}
                  disabled={loading}
                />
                {errors.effectiveTo && (
                  <span className="error-text">{errors.effectiveTo}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng Thái *</label>
              <CustomDropdown
                value={formData.status}
                onChange={(val) => {
                  setFormData(prev => ({ ...prev, status: val }));
                  if (errors.status) {
                    setErrors(prev => ({ ...prev, status: "" }));
                  }
                }}
                options={statusOptions}
                minWidth="100%"
                disabled={loading}
                compact={true}
              />
              {errors.status && <span className="error-text">{errors.status}</span>}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Đang tạo...
                  </>
                ) : (
                  "Tạo Bảng Giá"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePricebookModal;
