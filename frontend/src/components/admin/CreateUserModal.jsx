import React, { useState, useEffect } from "react";
import "./CreateUserModal.css";
import userApiService from "../../services/userApi";
import dealerApiService from "../../services/dealerApi";
import branchApiService from "../../services/branchApi";

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
  const [error, setError] = useState("");

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Nếu thay đổi role sang Admin hoặc EVMStaff, clear dealerId và branchId
    if (name === "role" && (value === "Admin" || value === "EVMStaff")) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        dealerId: "",
        branchId: "",
      }));
      setBranches([]); // Clear branches
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validate = () => {
    if (!formData.fullName.trim()) {
      setError("Vui lòng nhập họ tên");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Vui lòng nhập email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Email không hợp lệ");
      return false;
    }

    if (!formData.password) {
      setError("Vui lòng nhập mật khẩu");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return false;
    }

    if (formData.role !== "Admin" && formData.role !== "EVMStaff") {
      if (!formData.dealerId) {
        setError("Vui lòng chọn Dealer");
        return false;
      }
      if (!formData.branchId) {
        setError("Vui lòng chọn Branch");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
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
      alert("Tạo người dùng thành công!");
      onSuccess();
    } catch (err) {
      console.error("Error creating user:", err);
      setError(err.response?.data?.message || "Không thể tạo người dùng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Tạo Người dùng mới</h2>
          <button className="btn-close" onClick={onClose}>
            ✖
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-alert">⚠️ {error}</div>}

            <div className="form-columns">
              {/* Cột trái: Thông tin cá nhân */}
              <div className="form-column-left">
                <div className="form-section">
                  <h3>👤 Thông tin cá nhân</h3>

                  <div className="form-group">
                    <label>Họ và tên *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Mật khẩu *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Ít nhất 6 ký tự"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Xác nhận mật khẩu *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Cột phải: Phân quyền + Thông tin tổ chức */}
              <div className="form-column-right">
                {/* Phân quyền */}
                <div className="form-section">
                  <div className="form-group">
                    <label>Vai trò *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="Admin">Admin</option>
                      <option value="EVMStaff">EVM Staff</option>
                      <option value="DealerManager">Dealer Manager</option>
                      <option value="DealerStaff">Dealer Staff</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Trạng thái *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="Active">Hoạt động</option>
                      <option value="Inactive">Vô hiệu hóa</option>
                    </select>
                  </div>
                </div>

                {/* Thông tin tổ chức - Chỉ hiển thị cho DealerManager và DealerStaff */}
                {formData.role !== "Admin" && formData.role !== "EVMStaff" && (
                  <div className="form-section">
                    <h3>🏢 Thông tin tổ chức</h3>

                    <div className="form-group">
                      <label>Dealer *</label>
                      <select
                        name="dealerId"
                        value={formData.dealerId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Chọn Dealer --</option>
                        {dealers.map((dealer) => (
                          <option
                            key={dealer.dealerId || dealer.id}
                            value={dealer.dealerId || dealer.id}
                          >
                            {dealer.name} ({dealer.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Branch *</label>
                      <select
                        name="branchId"
                        value={formData.branchId}
                        onChange={handleChange}
                        required
                        disabled={!formData.dealerId}
                      >
                        <option value="">-- Chọn Branch --</option>
                        {branches.map((branch) => (
                          <option
                            key={branch.branchId || branch.id}
                            value={branch.branchId || branch.id}
                          >
                            {branch.name} ({branch.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo người dùng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
