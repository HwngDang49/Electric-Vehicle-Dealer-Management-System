import React, { useState, useEffect } from "react";
import "./UserDetailModal.css";
import CustomDropdown from "./CustomDropdown";
import dealerApiService from "../../services/dealerApi";
import branchApiService from "../../services/branchApi";
import userApiService from "../../services/userApi";

// Helper function to normalize role (case-insensitive)
const normalizeRole = (role) => {
  if (!role) return "";
  const trimmedRole = role.trim();
  const roleMap = {
    admin: "Admin",
    evmstaff: "EVMStaff",
    dealermanager: "DealerManager",
    dealerstaff: "DealerStaff",
  };
  const lowerRole = trimmedRole.toLowerCase();
  const validRoles = ["Admin", "EVMStaff", "DealerManager", "DealerStaff"];
  return (
    roleMap[lowerRole] || (validRoles.includes(trimmedRole) ? trimmedRole : "")
  );
};

const UserDetailModal = ({
  user,
  onClose,
  onUpdate,
  onSaveSuccess,
  onSaveError,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: normalizeRole(user?.role),
    status: user?.status || "Active",
    dealerId: user?.dealerId || "",
    branchId: user?.branchId || "",
  });
  const [errors, setErrors] = useState({});
  const [dealers, setDealers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dealerName, setDealerName] = useState("");
  const [branchName, setBranchName] = useState("");

  // Load dealers
  useEffect(() => {
    const loadDealers = async () => {
      try {
        const response = await dealerApiService.getDealers();
        const paged = response?.data ?? response;
        const list = Array.isArray(paged) ? paged : paged?.items ?? [];
        setDealers(list || []);
      } catch (err) {
        console.error("Error loading dealers:", err);
        setDealers([]); // Set empty array on error
      }
    };
    loadDealers();
  }, []);

  // Load branches when dealerId changes - chỉ load khi role là DealerStaff
  useEffect(() => {
    const loadBranches = async () => {
      // Chỉ load branches nếu có dealerId và role là DealerStaff (DealerManager không cần branch)
      if (editData.dealerId && editData.role === "DealerStaff") {
        try {
          const response = await branchApiService.getBranches({
            dealerId: editData.dealerId,
          });
          const paged = response?.data ?? response;
          const list = Array.isArray(paged) ? paged : paged?.items ?? [];
          setBranches(list || []);
        } catch (err) {
          console.error("Error loading branches:", err);
          setBranches([]); // Set empty array on error
        }
      } else {
        setBranches([]);
        // Clear branchId nếu không phải DealerStaff
        if (editData.role !== "DealerStaff") {
          setEditData((prev) => ({ ...prev, branchId: "" }));
        }
      }
    };
    loadBranches();
  }, [editData.dealerId, editData.role]);

  // Load dealer and branch names
  useEffect(() => {
    const loadNames = async () => {
      if (user?.dealerId) {
        try {
          const dealerRes = await dealerApiService.getDealerById(user.dealerId);
          const dealerData = dealerRes.data || dealerRes;
          setDealerName(dealerData?.name || "");
        } catch (err) {
          console.error("Error loading dealer name:", err);
        }
      }

      if (user?.branchId) {
        try {
          const branchRes = await branchApiService.getBranchById(user.branchId);
          const branchData = branchRes.data || branchRes;
          setBranchName(branchData?.name || "");
        } catch (err) {
          console.error("Error loading branch name:", err);
        }
      }
    };
    loadNames();
  }, [user?.dealerId, user?.branchId]);

  // Update editData when user changes
  useEffect(() => {
    setEditData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      role: normalizeRole(user?.role),
      status: user?.status || "Active",
      dealerId: user?.dealerId ? String(user.dealerId) : "",
      branchId: user?.branchId ? String(user.branchId) : "",
    });
  }, [user]);

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

    if (!editData.fullName.trim()) {
      newErrors.fullName = "Họ và tên là bắt buộc";
    }

    if (!editData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editData.email)) {
        newErrors.email = "Email không hợp lệ";
      }
    }

    // Validation cho DealerManager và DealerStaff
    if (editData.role !== "Admin" && editData.role !== "EVMStaff") {
      if (!editData.dealerId) {
        newErrors.dealerId = "Dealer là bắt buộc";
      }
      // Chỉ yêu cầu branchId cho DealerStaff, không yêu cầu cho DealerManager
      if (editData.role === "DealerStaff" && !editData.branchId) {
        newErrors.branchId = "Branch là bắt buộc";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if there are any changes
  const hasChanges = () => {
    if (!user) return false;

    const original = {
      fullName: user?.fullName || "",
      email: user?.email || "",
      role: user?.role || "",
      status: user?.status || "Active",
      dealerId: user?.dealerId || "",
      branchId: user?.branchId || "",
    };

    const current = {
      fullName: editData.fullName || "",
      email: editData.email || "",
      role: editData.role || "",
      status: editData.status || "Active",
      dealerId: editData.dealerId || "",
      branchId: editData.branchId || "",
    };

    return (
      original.fullName !== current.fullName ||
      original.email !== current.email ||
      original.role !== current.role ||
      original.status !== current.status ||
      String(original.dealerId || "") !== String(current.dealerId || "") ||
      String(original.branchId || "") !== String(current.branchId || "")
    );
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    // Check if there are any changes
    if (!hasChanges()) {
      setIsEditing(false);
      return; // No changes, just exit edit mode
    }

    const userId = user?.userId || user?.id;
    if (!userId) {
      console.error("User ID is missing:", user);
      setErrors({
        submit: "Không tìm thấy ID của người dùng. Vui lòng thử lại.",
      });
      return;
    }

    try {
      const submitData = {
        fullName: editData.fullName.trim(),
        email: editData.email.trim(),
        role: editData.role,
        status: editData.status,
      };

      // Chỉ thêm dealerId và branchId nếu không phải Admin/EVMStaff
      if (editData.role !== "Admin" && editData.role !== "EVMStaff") {
        submitData.dealerId = parseInt(editData.dealerId);
        // Chỉ thêm branchId cho DealerStaff, DealerManager không có branchId
        if (editData.role === "DealerStaff" && editData.branchId) {
          submitData.branchId = parseInt(editData.branchId);
        }
      } else {
        submitData.dealerId = null;
        submitData.branchId = null;
      }

      console.log("Updating user with ID:", userId, "Data:", submitData);
      await userApiService.updateUser(userId, submitData);

      // Notify parent to refresh the list and update selectedUser
      // Parent component (UserManagement) will fetch updated user and update selectedUser
      // This will trigger useEffect in UserDetailModal to update editData with new user data
      if (onUpdate) {
        await onUpdate();
      }

      setIsEditing(false);

      // Show success toast
      if (onSaveSuccess) {
        onSaveSuccess(
          `Đã cập nhật thông tin người dùng "${editData.fullName}" thành công!`
        );
      }
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.errors?.join(", ") ||
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật người dùng. Vui lòng thử lại.";
      setErrors({ submit: errorMessage });

      // Show error toast
      if (onSaveError) {
        onSaveError(errorMessage);
      }
    }
  };

  const handleCancel = () => {
    setEditData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      role: normalizeRole(user?.role),
      status: user?.status || "Active",
      dealerId: user?.dealerId || "",
      branchId: user?.branchId || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Active: { text: "Hoạt động", class: "status-active" },
      Inactive: { text: "Không hoạt động", class: "status-inactive" },
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
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Inactive", label: "Không hoạt động", icon: "❌" },
  ];

  const getRoleOptions = () => {
    // When editing, exclude Admin role - Admin role should only be assigned during user creation
    // This prevents accidentally changing a user's role to Admin
    // However, if current user is Admin, include it so the dropdown can display it
    const options = [
      { value: "EVMStaff", label: "EVM Staff", icon: "👨‍💼" },
      { value: "DealerManager", label: "Dealer Manager", icon: "👔" },
      { value: "DealerStaff", label: "Dealer Staff", icon: "👤" },
    ];

    // If current user is Admin, add Admin option so it can be displayed (but won't be changeable)
    const currentRole = normalizeRole(user?.role);
    if (currentRole === "Admin") {
      options.unshift({ value: "Admin", label: "Admin", icon: "👑" });
    }

    return options;
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

  if (!user) return null;

  return (
    <div className="admin-user-detail-app">
      <div className="admin-user-detail-modal-overlay">
        <div
          className={`admin-user-detail-modal-container ${
            isEditing ? "edit-mode" : ""
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="admin-user-detail-modal-header">
            <div className="admin-user-detail-modal-header-left">
              <div className="admin-user-detail-modal-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div>
                <h2 className="admin-user-detail-modal-title">
                  Chi Tiết Người Dùng
                </h2>
                <p className="admin-user-detail-modal-subtitle">
                  Quản lý thông tin và quyền truy cập
                </p>
              </div>
            </div>
            <div className="admin-user-detail-modal-header-actions">
              {!isEditing && (
                <button
                  className="admin-user-detail-edit-btn"
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
                  <span>Chỉnh sửa</span>
                </button>
              )}
              <button
                className="admin-user-detail-secondary-btn"
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
          </div>

          {/* Edit Mode Banner */}
          {isEditing && (
            <div className="admin-user-detail-edit-banner">
              <div className="admin-user-detail-edit-banner-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </div>
              <div className="admin-user-detail-edit-banner-text">
                <p className="admin-user-detail-edit-banner-title">
                  Chế độ chỉnh sửa
                </p>
                <p className="admin-user-detail-edit-banner-subtitle">
                  Bạn đang chỉnh sửa thông tin người dùng. Nhấn "Lưu thay đổi"
                  để hoàn tất.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.submit && (
            <div className="admin-user-detail-error-message">
              {errors.submit}
            </div>
          )}

          {/* 2-Column Layout */}
          <div className="admin-user-detail-content-grid">
            {/* Left Column - Main Info */}
            <div className="admin-user-detail-content-col">
              <div className="admin-user-detail-info-card">
                <div className="admin-user-detail-card-header">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                  <h4>Thông Tin Cơ Bản</h4>
                </div>
                <div className="admin-user-detail-info-body">
                  <div className="admin-user-detail-info-body-grid">
                    {/* Left Column */}
                    <div className="admin-user-detail-info-body-col">
                      <div className="admin-user-detail-field">
                        <label className="admin-user-detail-field-label">
                          Họ và Tên
                        </label>
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              name="fullName"
                              value={editData.fullName}
                              onChange={handleInputChange}
                              className={`admin-user-detail-field-input ${
                                errors.fullName ? "error" : ""
                              }`}
                              placeholder="Nhập họ và tên"
                            />
                            {errors.fullName && (
                              <span className="admin-user-detail-field-error">
                                {errors.fullName}
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="admin-user-detail-field-value">
                            {user?.fullName || "-"}
                          </div>
                        )}
                      </div>

                      <div className="admin-user-detail-field">
                        <label className="admin-user-detail-field-label">
                          Email
                        </label>
                        {isEditing ? (
                          <>
                            <input
                              type="email"
                              name="email"
                              value={editData.email}
                              onChange={handleInputChange}
                              className={`admin-user-detail-field-input ${
                                errors.email ? "error" : ""
                              }`}
                              placeholder="Nhập email"
                            />
                            {errors.email && (
                              <span className="admin-user-detail-field-error">
                                {errors.email}
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="admin-user-detail-field-value">
                            {user?.email || "-"}
                          </div>
                        )}
                      </div>

                      <div className="admin-user-detail-field">
                        <label className="admin-user-detail-field-label">
                          Vai Trò
                        </label>
                        {isEditing ? (
                          <>
                            <CustomDropdown
                              key="role-dropdown"
                              value={String(editData.role || "")}
                              onChange={(val) => {
                                // Prevent changing role to Admin when editing
                                // Admin role should only be assigned during user creation
                                const currentRole = normalizeRole(user?.role);
                                if (
                                  val === "Admin" &&
                                  currentRole !== "Admin"
                                ) {
                                  console.warn(
                                    "Cannot change role to Admin. Admin role can only be assigned during user creation."
                                  );
                                  return; // Don't allow changing to Admin
                                }

                                // Ensure val is a valid role string
                                const validRoles = [
                                  "Admin",
                                  "EVMStaff",
                                  "DealerManager",
                                  "DealerStaff",
                                ];
                                if (!validRoles.includes(val)) {
                                  console.warn("Invalid role value:", val);
                                  return; // Don't update if invalid
                                }

                                const newEditData = {
                                  ...editData,
                                  role: val,
                                };
                                // Nếu thay đổi role sang Admin hoặc EVMStaff, clear dealerId và branchId
                                if (val === "Admin" || val === "EVMStaff") {
                                  newEditData.dealerId = "";
                                  newEditData.branchId = "";
                                }
                                // Nếu thay đổi role sang DealerManager, clear branchId (quản lý nhiều branch)
                                if (val === "DealerManager") {
                                  newEditData.branchId = "";
                                }
                                setEditData(newEditData);
                                // Clear errors when changing role
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.role;
                                  delete newErrors.branchId; // Clear branch error when changing role
                                  return newErrors;
                                });
                              }}
                              options={getRoleOptions()}
                              placeholder="-- Chọn Vai trò --"
                              minWidth="100%"
                              compact={true}
                            />
                            {errors.role && (
                              <span className="admin-user-detail-field-error">
                                {errors.role}
                              </span>
                            )}
                          </>
                        ) : (
                          <div className="admin-user-detail-field-value">
                            {user?.role || "-"}
                          </div>
                        )}
                      </div>

                      {/* Dealer - Only show for DealerManager and DealerStaff */}
                      {(isEditing ? editData.role : user?.role) !== "Admin" &&
                        (isEditing ? editData.role : user?.role) !==
                          "EVMStaff" && (
                          <div className="admin-user-detail-field">
                            <label className="admin-user-detail-field-label">
                              Tên Dealer
                            </label>
                            {isEditing ? (
                              <>
                                <CustomDropdown
                                  key="dealer-dropdown"
                                  value={String(editData.dealerId || "")}
                                  onChange={(val) => {
                                    setEditData((prev) => ({
                                      ...prev,
                                      dealerId: val,
                                      branchId: "",
                                    }));
                                    if (errors.dealerId) {
                                      setErrors((prev) => ({
                                        ...prev,
                                        dealerId: "",
                                      }));
                                    }
                                  }}
                                  options={getDealerOptions()}
                                  minWidth="100%"
                                  placeholder="-- Chọn Dealer --"
                                  compact={true}
                                  disabled={
                                    editData.role === "Admin" ||
                                    editData.role === "EVMStaff"
                                  }
                                />
                                {errors.dealerId && (
                                  <span className="admin-user-detail-field-error">
                                    {errors.dealerId}
                                  </span>
                                )}
                              </>
                            ) : (
                              <div className="admin-user-detail-field-value">
                                {dealerName || user?.dealerId || "-"}
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="admin-user-detail-info-body-col">
                      <div className="admin-user-detail-field">
                        <label className="admin-user-detail-field-label">
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
                          <div className="admin-user-detail-field-value">
                            {getStatusBadge(user?.status)}
                          </div>
                        )}
                      </div>

                      {/* Branch - Chỉ hiển thị cho DealerStaff, ẩn cho DealerManager */}
                      {(isEditing ? editData.role : user?.role) ===
                        "DealerStaff" && (
                        <div className="admin-user-detail-field">
                          <label className="admin-user-detail-field-label">
                            Chi Nhánh
                          </label>
                          {isEditing ? (
                            <>
                              <CustomDropdown
                                key="branch-dropdown"
                                value={String(editData.branchId || "")}
                                onChange={(val) => {
                                  setEditData((prev) => ({
                                    ...prev,
                                    branchId: val,
                                  }));
                                  if (errors.branchId) {
                                    setErrors((prev) => ({
                                      ...prev,
                                      branchId: "",
                                    }));
                                  }
                                }}
                                options={getBranchOptions()}
                                minWidth="100%"
                                placeholder="-- Chọn Branch --"
                                compact={true}
                                disabled={
                                  !editData.dealerId ||
                                  editData.role === "Admin" ||
                                  editData.role === "EVMStaff"
                                }
                              />
                              {errors.branchId && (
                                <span className="admin-user-detail-field-error">
                                  {errors.branchId}
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="admin-user-detail-field-value">
                              {branchName || user?.branchId || "-"}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - System Info */}
            <div className="admin-user-detail-content-col">
              <div className="admin-user-detail-info-card">
                <div className="admin-user-detail-card-header">
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
                <div className="admin-user-detail-info-body">
                  <div className="admin-user-detail-field">
                    <label className="admin-user-detail-field-label">
                      ID Người Dùng
                    </label>
                    <div className="admin-user-detail-field-value">
                      {user?.userId || user?.id || "-"}
                    </div>
                  </div>

                  {(user?.createAt ||
                    user?.createdAt ||
                    user?.createdDate ||
                    user?.dateCreated) && (
                    <div className="admin-user-detail-field">
                      <label className="admin-user-detail-field-label">
                        Ngày Tạo
                      </label>
                      <div className="admin-user-detail-field-value admin-user-detail-date-value">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                        </svg>
                        {formatDate(
                          user?.createAt ||
                            user?.createdAt ||
                            user?.createdDate ||
                            user?.dateCreated
                        )}
                      </div>
                    </div>
                  )}

                  {(user?.updateAt ||
                    user?.updatedAt ||
                    user?.updatedDate ||
                    user?.dateUpdated ||
                    user?.lastModified) && (
                    <div className="admin-user-detail-field">
                      <label className="admin-user-detail-field-label">
                        Cập Nhật Lần Cuối
                      </label>
                      <div className="admin-user-detail-field-value admin-user-detail-date-value">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" />
                        </svg>
                        {formatDate(
                          user?.updateAt ||
                            user?.updatedAt ||
                            user?.updatedDate ||
                            user?.dateUpdated ||
                            user?.lastModified
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="admin-user-detail-modal-footer">
            {isEditing ? (
              <div className="admin-user-detail-edit-actions">
                <button
                  className="admin-user-detail-cancel-btn"
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
                <button
                  className="admin-user-detail-save-btn"
                  onClick={handleSave}
                >
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
              <div className="admin-user-detail-view-actions"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
