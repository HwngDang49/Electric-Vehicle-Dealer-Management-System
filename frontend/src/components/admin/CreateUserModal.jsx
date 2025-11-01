import React, { useState, useEffect } from "react";
import "./CreateUserModal.css";
import userApiService from "../../services/userApi";
import dealerApiService from "../../services/dealerApi";
import branchApiService from "../../services/branchApi";
import CustomDropdown from "./CustomDropdown";

const CreateUserModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "DealerStaff",
    status: "Active",
    dealerId: "",
    branchId: "",
  });

  const [dealers, setDealers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    loadDealers();
  }, []);

  useEffect(() => {
    if (formData.dealerId) {
      loadBranches(formData.dealerId);
    } else {
      setBranches([]);
      setFormData((prev) => ({ ...prev, branchId: "" }));
    }
  }, [formData.dealerId]);

  const loadDealers = async () => {
    try {
      const response = await dealerApiService.getDealers();
      setDealers(response.data || response || []);
    } catch (err) {
      console.error("Error loading dealers:", err);
      setErrors({ submit: "Không thể tải danh sách dealer" });
    }
  };

  const loadBranches = async (dealerId) => {
    try {
      const response = await branchApiService.getBranches({ dealerId });
      setBranches(response.data || response || []);
    } catch (err) {
      console.error("Error loading branches:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing (only if form has been submitted)
    if (hasSubmitted && errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (formData.role !== "Admin" && formData.role !== "EVMStaff") {
      if (!formData.dealerId) {
        newErrors.dealerId = "Dealer là bắt buộc";
      }
      if (!formData.branchId) {
        newErrors.branchId = "Branch là bắt buộc";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark form as submitted so errors will be displayed
    setHasSubmitted(true);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        status: formData.status,
      };

      // Chỉ thêm dealerId và branchId nếu không phải Admin/EVMStaff
      if (formData.role !== "Admin" && formData.role !== "EVMStaff") {
        payload.dealerId = parseInt(formData.dealerId);
        payload.branchId = parseInt(formData.branchId);
      }

      await userApiService.createUser(payload);
      onSuccess();
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.join(", ") ||
        error.message ||
        "Không thể tạo người dùng";
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getDealerOptions = () => {
    return dealers.map((dealer) => ({
      value: String(dealer.dealerId || dealer.id),
      label: `${dealer.name || dealer.dealerName} (${dealer.code})`,
      icon: "🏢",
    }));
  };

  const getBranchOptions = () => {
    return branches.map((branch) => ({
      value: String(branch.branchId || branch.id),
      label: `${branch.name || branch.branchName} (${branch.code})`,
      icon: "📍",
    }));
  };

  const roleOptions = [
    { value: "Admin", label: "Admin", icon: "👑" },
    { value: "EVMStaff", label: "EVM Staff", icon: "👨‍💼" },
    { value: "DealerManager", label: "Dealer Manager", icon: "👔" },
    { value: "DealerStaff", label: "Dealer Staff", icon: "👤" },
  ];

  const statusOptions = [
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Inactive", label: "Vô hiệu hóa", icon: "❌" },
  ];

  return (
    <div className="admin-create-user-app">
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Tạo Người dùng mới</h2>
            <button
              className="close-btn"
              onClick={onClose}
              disabled={loading}
            >
              ✕
            </button>
          </div>

          <form className="modal-form" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="fullName">
                  Họ và tên <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="VD: Nguyễn Văn A"
                  className={hasSubmitted && errors.fullName ? "error" : ""}
                  disabled={loading}
                />
                {hasSubmitted && errors.fullName && (
                  <span className="error-text">{errors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="VD: user@example.com"
                  className={hasSubmitted && errors.email ? "error" : ""}
                  disabled={loading}
                />
                {hasSubmitted && errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  Mật khẩu <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Ít nhất 6 ký tự"
                  className={hasSubmitted && errors.password ? "error" : ""}
                  disabled={loading}
                />
                {hasSubmitted && errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  Xác nhận mật khẩu <span className="required">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu"
                  className={
                    hasSubmitted && errors.confirmPassword ? "error" : ""
                  }
                  disabled={loading}
                />
                {hasSubmitted && errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">
                  Vai trò <span className="required">*</span>
                </label>
                <CustomDropdown
                  value={formData.role}
                  onChange={(val) => {
                    const newFormData = {
                      ...formData,
                      role: val,
                    };
                    // Nếu thay đổi role sang Admin hoặc EVMStaff, clear dealerId và branchId
                    if (val === "Admin" || val === "EVMStaff") {
                      newFormData.dealerId = "";
                      newFormData.branchId = "";
                    }
                    setFormData(newFormData);
                    // Clear error when user selects (only if form has been submitted)
                    if (hasSubmitted && errors.role) {
                      setErrors((prev) => ({ ...prev, role: "" }));
                    }
                  }}
                  options={roleOptions}
                  minWidth="100%"
                  placeholder="-- Chọn Vai trò --"
                  disabled={loading}
                  compact={true}
                />
                {hasSubmitted && errors.role && (
                  <span className="error-text">{errors.role}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="status">
                  Trạng thái <span className="required">*</span>
                </label>
                <CustomDropdown
                  value={formData.status}
                  onChange={(val) => {
                    setFormData((prev) => ({ ...prev, status: val }));
                    // Clear error when user selects (only if form has been submitted)
                    if (hasSubmitted && errors.status) {
                      setErrors((prev) => ({ ...prev, status: "" }));
                    }
                  }}
                  options={statusOptions}
                  minWidth="100%"
                  placeholder="-- Chọn Trạng thái --"
                  disabled={loading}
                  compact={true}
                />
                {hasSubmitted && errors.status && (
                  <span className="error-text">{errors.status}</span>
                )}
              </div>
            </div>

            {/* Thông tin tổ chức - Chỉ hiển thị cho DealerManager và DealerStaff */}
            {formData.role !== "Admin" && formData.role !== "EVMStaff" && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dealerId">
                    Dealer <span className="required">*</span>
                  </label>
                  <CustomDropdown
                    value={formData.dealerId}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, dealerId: val }));
                      // Clear error when user selects (only if form has been submitted)
                      if (hasSubmitted && errors.dealerId) {
                        setErrors((prev) => ({ ...prev, dealerId: "" }));
                      }
                    }}
                    options={getDealerOptions()}
                    minWidth="100%"
                    placeholder="-- Chọn Dealer --"
                    disabled={loading}
                    compact={true}
                  />
                  {hasSubmitted && errors.dealerId && (
                    <span className="error-text">{errors.dealerId}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="branchId">
                    Branch <span className="required">*</span>
                  </label>
                  <CustomDropdown
                    value={formData.branchId}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, branchId: val }));
                      // Clear error when user selects (only if form has been submitted)
                      if (hasSubmitted && errors.branchId) {
                        setErrors((prev) => ({ ...prev, branchId: "" }));
                      }
                    }}
                    options={getBranchOptions()}
                    minWidth="100%"
                    placeholder="-- Chọn Branch --"
                    disabled={loading || !formData.dealerId}
                    compact={true}
                  />
                  {hasSubmitted && errors.branchId && (
                    <span className="error-text">{errors.branchId}</span>
                  )}
                </div>
              </div>
            )}

            <div className="form-actions">
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
                {loading ? "Đang tạo..." : "Tạo người dùng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
