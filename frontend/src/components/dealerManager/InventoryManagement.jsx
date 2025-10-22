import React, { useState } from "react";
import "./InventoryManagement.css";

const InventoryManagement = () => {
  const [filters, setFilters] = useState({
    branch: "",
    status: "",
    warehouseType: "",
    searchTerm: "",
  });

  // Configuration for warehouse data
  const WAREHOUSE_CONFIG = {
    statuses: {
      ACTIVE: "Hoạt động",
      MAINTENANCE: "Bảo trì",
      CLOSED: "Tạm đóng",
    },
    statusColors: {
      ACTIVE: "status-active",
      MAINTENANCE: "status-maintenance",
      CLOSED: "status-closed",
    },
  };

  // Mock data for warehouses - should be replaced with API call
  const warehouseData = [
    {
      id: 1,
      branchName: "Chi nhánh Hà Nội",
      branchCode: "HN001",
      warehouseName: "Kho A - Hà Nội",
      warehouseCode: "WH-HN-A",
      location: "123 Đường ABC, Quận XYZ, Hà Nội",
      totalProducts: 8,
      totalQuantity: 156,
      availableQuantity: 142,
      reservedQuantity: 14,
      status: WAREHOUSE_CONFIG.statuses.ACTIVE,
      manager: "Nguyễn Văn A",
      phone: "0123-456-789",
      lastUpdated: "2024-01-15",
      capacity: "500 xe",
      utilization: "31%",
    },
    {
      id: 2,
      branchName: "Chi nhánh TP.HCM",
      branchCode: "HCM001",
      warehouseName: "Kho B - TP.HCM",
      warehouseCode: "WH-HCM-B",
      location: "456 Đường DEF, Quận 1, TP.HCM",
      totalProducts: 12,
      totalQuantity: 289,
      availableQuantity: 267,
      reservedQuantity: 22,
      status: WAREHOUSE_CONFIG.statuses.ACTIVE,
      manager: "Trần Thị B",
      phone: "0987-654-321",
      lastUpdated: "2024-01-16",
      capacity: "800 xe",
      utilization: "36%",
    },
    {
      id: 3,
      branchName: "Chi nhánh Đà Nẵng",
      branchCode: "DN001",
      warehouseName: "Kho C - Đà Nẵng",
      warehouseCode: "WH-DN-C",
      location: "789 Đường GHI, Quận Hải Châu, Đà Nẵng",
      totalProducts: 6,
      totalQuantity: 98,
      availableQuantity: 89,
      reservedQuantity: 9,
      status: WAREHOUSE_CONFIG.statuses.ACTIVE,
      manager: "Lê Văn C",
      phone: "0555-123-456",
      lastUpdated: "2024-01-14",
      capacity: "300 xe",
      utilization: "33%",
    },
    {
      id: 4,
      branchName: "Chi nhánh Hà Nội",
      branchCode: "HN001",
      warehouseName: "Kho D - Hà Nội",
      warehouseCode: "WH-HN-D",
      location: "321 Đường JKL, Quận ABC, Hà Nội",
      totalProducts: 5,
      totalQuantity: 45,
      availableQuantity: 42,
      reservedQuantity: 3,
      status: WAREHOUSE_CONFIG.statuses.MAINTENANCE,
      manager: "Phạm Thị D",
      phone: "0111-222-333",
      lastUpdated: "2024-01-10",
      capacity: "200 xe",
      utilization: "23%",
    },
  ];

  // Filter options - should be fetched from API
  const FILTER_OPTIONS = {
    branches: [
      { value: "", label: "Tất cả chi nhánh" },
      { value: "HN001", label: "Chi nhánh Hà Nội" },
      { value: "HCM001", label: "Chi nhánh TP.HCM" },
      { value: "DN001", label: "Chi nhánh Đà Nẵng" },
    ],
    statuses: [
      { value: "", label: "Tất cả trạng thái" },
      {
        value: WAREHOUSE_CONFIG.statuses.ACTIVE,
        label: WAREHOUSE_CONFIG.statuses.ACTIVE,
      },
      {
        value: WAREHOUSE_CONFIG.statuses.MAINTENANCE,
        label: WAREHOUSE_CONFIG.statuses.MAINTENANCE,
      },
      {
        value: WAREHOUSE_CONFIG.statuses.CLOSED,
        label: WAREHOUSE_CONFIG.statuses.CLOSED,
      },
    ],
    warehouseTypes: [
      { value: "", label: "Tất cả loại kho" },
      { value: "Kho chính", label: "Kho chính" },
      { value: "Kho phụ", label: "Kho phụ" },
      { value: "Kho trung chuyển", label: "Kho trung chuyển" },
    ],
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const filteredData = warehouseData.filter((item) => {
    const matchesBranch = !filters.branch || item.branchCode === filters.branch;
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesWarehouseType =
      !filters.warehouseType || item.warehouseType === filters.warehouseType;
    const matchesSearch =
      !filters.searchTerm ||
      item.warehouseName
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      item.warehouseCode
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      item.branchName
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      item.manager.toLowerCase().includes(filters.searchTerm.toLowerCase());

    return (
      matchesBranch && matchesStatus && matchesWarehouseType && matchesSearch
    );
  });

  // Utility functions
  const getStatusClass = (status) => {
    const statusKey = Object.keys(WAREHOUSE_CONFIG.statuses).find(
      (key) => WAREHOUSE_CONFIG.statuses[key] === status
    );
    return WAREHOUSE_CONFIG.statusColors[statusKey] || "status-default";
  };

  const getUtilizationClass = (utilization) => {
    const percent = parseInt(utilization);
    if (percent >= 80) return "utilization-high";
    if (percent >= 60) return "utilization-medium";
    return "utilization-low";
  };

  const resetFilters = () => {
    setFilters({
      branch: "",
      status: "",
      warehouseType: "",
      searchTerm: "",
    });
  };

  return (
    <div className="inventory-management">
      <div className="page-header">
        <h1 className="page-title">Quản lý kho</h1>
        <p className="page-subtitle">
          Quản lý và theo dõi các kho của đại lý tại các chi nhánh
        </p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <h3 className="filters-title">Bộ lọc</h3>
          <button className="clear-filters-btn" onClick={resetFilters}>
            Xóa bộ lọc
          </button>
        </div>

        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Tìm kiếm</label>
            <input
              type="text"
              className="filter-input"
              placeholder="Tìm theo tên kho, mã kho, chi nhánh, quản lý..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">Chi nhánh</label>
            <select
              className="filter-select"
              value={filters.branch}
              onChange={(e) => handleFilterChange("branch", e.target.value)}
            >
              {FILTER_OPTIONS.branches.map((branch) => (
                <option key={branch.value} value={branch.value}>
                  {branch.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Trạng thái</label>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              {FILTER_OPTIONS.statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Loại kho</label>
            <select
              className="filter-select"
              value={filters.warehouseType}
              onChange={(e) =>
                handleFilterChange("warehouseType", e.target.value)
              }
            >
              {FILTER_OPTIONS.warehouseTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-section">
        <div className="table-header">
          <h3 className="table-title">Danh sách kho đại lý</h3>
        </div>

        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Chi nhánh</th>
                <th>Địa chỉ</th>
                <th>Số lượng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="branch-info">
                      <div className="branch-name">{item.branchName}</div>
                      <div className="branch-code">{item.branchCode}</div>
                    </div>
                  </td>
                  <td>
                    <div className="warehouse-location-info">
                      <div className="warehouse-name">{item.warehouseName}</div>
                      <div className="warehouse-location">{item.location}</div>
                    </div>
                  </td>
                  <td>
                    <div className="quantity-info">
                      <div className="total-quantity">
                        {item.totalQuantity} xe
                      </div>
                      <div className="quantity-details">
                        Có sẵn: {item.availableQuantity} | Đã đặt:{" "}
                        {item.reservedQuantity}
                      </div>
                    </div>
                  </td>
                  <td>
                    <button className="action-btn">Tổng quan kho</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="no-data">
            <div className="no-data-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20 6H16L14 4H10L8 6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6ZM20 19H4V8H6.83L8.83 6H15.17L17.17 8H20V19ZM12 17C10.9 17 10 16.1 10 15S10.9 13 12 13S14 13.9 14 15S13.1 17 12 17Z" />
              </svg>
            </div>
            <h3>Không tìm thấy dữ liệu</h3>
            <p>Không có sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
