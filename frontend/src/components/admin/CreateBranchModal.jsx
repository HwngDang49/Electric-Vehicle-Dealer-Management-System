import React, { useState, useEffect } from "react";
import "./CreateBranchModal.css";
import branchApiService from "../../services/branchApi";
import dealerApiService from "../../services/dealerApi";
import CustomDropdown from "./CustomDropdown";

const CreateBranchModal = ({ onClose, onSuccess, initialDealerId, lockDealer = false }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    address: "",
    status: "Active",
    dealerId: initialDealerId ? String(initialDealerId) : ""
  });
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "Active", label: "Hoạt động", class: "status-active", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", class: "status-inactive", icon: "⏸️" },
    { value: "Suspended", label: "Tạm dừng", class: "status-suspended", icon: "🔒" },
    { value: "Closed", label: "Đã đóng", class: "status-closed", icon: "❌" }
  ];

  useEffect(() => {
    loadDealers();
  }, []);

  const loadDealers = async () => {
    try {
      const response = await dealerApiService.getDealers();
      const fetchedDealers = response.data || response;
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
    
    if (!formData.code.trim()) {
      newErrors.code = "Mã chi nhánh là bắt buộc";
    } else if (formData.code.trim().length < 2) {
      newErrors.code = "Mã chi nhánh phải có ít nhất 2 ký tự";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Tên chi nhánh là bắt buộc";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên chi nhánh phải có ít nhất 2 ký tự";
    }
    
    if (!formData.dealerId) {
      newErrors.dealerId = "Vui lòng chọn dealer";
    }
    
    if (!formData.status) {
      newErrors.status = "Vui lòng chọn trạng thái";
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
      const branchData = {
        ...formData,
        dealerId: parseInt(formData.dealerId)
      };
      
      await branchApiService.createBranch(branchData);
      onSuccess();
    } catch (error) {
      console.error("Error creating branch:", error);
      if (error.response?.data?.errors) {
        setErrors({ submit: error.response.data.errors.join(", ") });
      } else if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: "Không thể tạo chi nhánh. Vui lòng thử lại." });
      }
    } finally {
      setLoading(false);
    }
  };

  const getDealerOptions = () => {
    const options = [
      { value: "", label: "Chọn dealer", icon: "📋", disabled: true }
    ];
    
    dealers.forEach(dealer => {
      options.push({
        value: String(dealer.id || dealer.dealerId),
        label: `${dealer.name} (${dealer.code})`,
        icon: "🏢"
      });
    });
    
    return options;
  };

  return (
    <div className="admin-create-branch-app">
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Tạo Chi Nhánh Mới</h2>
            <button className="close-btn" onClick={onClose} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="code">Mã Chi Nhánh *</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Nhập mã chi nhánh"
                  className={errors.code ? "error" : ""}
                  disabled={loading}
                />
                {errors.code && <span className="error-text">{errors.code}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="name">Tên Chi Nhánh *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập tên chi nhánh"
                  className={errors.name ? "error" : ""}
                  disabled={loading}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Địa Chỉ</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Nhập địa chỉ chi nhánh"
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dealerId">Dealer *</label>
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
                  disabled={lockDealer || loading}
                  compact={true}
                />
                {errors.dealerId && <span className="error-text">{errors.dealerId}</span>}
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
            </div>

            {errors.submit && (
              <div className="error-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
                {errors.submit}
              </div>
            )}

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
                {loading ? "Đang tạo..." : "Tạo Chi Nhánh"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBranchModal;
