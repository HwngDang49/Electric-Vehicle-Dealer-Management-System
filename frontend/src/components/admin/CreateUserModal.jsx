import React, { useState, useEffect } from "react";
import "./CreateUserModal.css";
import userApiService from "../../services/userApi";
import dealerApiService from "../../services/dealerApi";
import branchApiService from "../../services/branchApi";
import CustomDropdown from "./CustomDropdown";

const CreateUserModal = ({ onClose, onSuccess, onError }) => {
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
    // Chỉ load branches nếu có dealerId và role là DealerStaff (DealerManager không cần branch)
    if (formData.dealerId && formData.role === "DealerStaff") {
      loadBranches(formData.dealerId);
    } else {
      setBranches([]);
      // Clear branchId nếu không phải DealerStaff hoặc không có dealerId
      if (formData.role !== "DealerStaff" || !formData.dealerId) {
        setFormData((prev) => ({ ...prev, branchId: "" }));
      }
    }
  }, [formData.dealerId, formData.role]);

  const loadDealers = async () => {
    try {
      const response = await dealerApiService.getDealers();
      const paged = response?.data ?? response;
      const list = Array.isArray(paged) ? paged : (paged?.items ?? []);
      setDealers(list || []);
    } catch (err) {
      console.error("Error loading dealers:", err);
      setErrors({ submit: "Không thể tải danh sách dealer" });
    }
  };

  const loadBranches = async (dealerId) => {
    try {
      const response = await branchApiService.getBranches({ dealerId });
      const paged = response?.data ?? response;
      const list = Array.isArray(paged) ? paged : (paged?.items ?? []);
      setBranches(list || []);
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

    // Validation cho DealerManager và DealerStaff
    if (formData.role !== "Admin" && formData.role !== "EVMStaff") {
      if (!formData.dealerId) {
        newErrors.dealerId = "Dealer là bắt buộc";
      }
      // Chỉ yêu cầu branchId cho DealerStaff, không yêu cầu cho DealerManager
      if (formData.role === "DealerStaff" && !formData.branchId) {
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
        // Chỉ thêm branchId cho DealerStaff, DealerManager không có branchId
        if (formData.role === "DealerStaff" && formData.branchId) {
          payload.branchId = parseInt(formData.branchId);
        }
      }

      await userApiService.createUser(payload);
      // Close modal immediately, toast will be shown in UserManagement
      onSuccess(formData.fullName);
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo người dùng. Vui lòng thử lại.";
      setErrors({ submit: errorMessage });
      // Show error toast in parent
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getDealerOptions = () => {
    const list = Array.isArray(dealers) ? dealers : [];
    return list.map((dealer) => ({
      value: String(dealer.dealerId || dealer.id),
      label: `${dealer.name || dealer.dealerName} (${dealer.code})`,
      icon: "🏢",
    }));
  };

  const getBranchOptions = () => {
    const list = Array.isArray(branches) ? branches : [];
    return list.map((branch) => ({
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
                    // Nếu thay đổi role sang DealerManager, clear branchId (quản lý nhiều branch)
                    if (val === "DealerManager") {
                      newFormData.branchId = "";
                    }
                    setFormData(newFormData);
                    // Clear error when user selects (only if form has been submitted)
                    if (hasSubmitted) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.role;
                        delete newErrors.branchId; // Clear branch error when changing role
                        return newErrors;
                      });
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

                {/* Branch field - Chỉ hiển thị cho DealerStaff, ẩn cho DealerManager */}
                {formData.role === "DealerStaff" && (
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
                )}
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
