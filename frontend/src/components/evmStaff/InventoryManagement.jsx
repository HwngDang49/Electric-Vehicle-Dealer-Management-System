import React, { useState, useEffect } from "react";
import "./InventoryManagement.css";
import CustomDropdown from "../admin/CustomDropdown";
import manufacturerInventoryApi from "../../services/manufacturerInventoryApi";

const InventoryManagement = ({ onBack }) => {
  const [inventoryData, setInventoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [vinList, setVinList] = useState([]);

  // Filter states
  const [quantityTypeFilter, setQuantityTypeFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    pageNumber: 1,
    pageSize: 5,
    totalPages: 0,
  });

  // Load data khi component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading manufacturer inventory data from API...");
      const response =
        await manufacturerInventoryApi.getManufacturerInventoryList({});

      console.log("✅ API Response:", response);
      console.log(
        "✅ API Response Type:",
        Array.isArray(response) ? "Array" : typeof response
      );
      console.log("✅ API Response Length:", response?.length);

      // Backend trả về array trực tiếp
      const data = Array.isArray(response) ? response : response?.data || [];

      console.log("📊 Manufacturer inventory data:", data);
      console.log("📊 Total products:", data.length);

      // Log chi tiết từng product
      data.forEach((product, index) => {
        console.log(`📦 Product ${index + 1}:`, {
          productId: product.ProductId || product.productId,
          productCode: product.ProductCode || product.productCode,
          productName: product.ProductName || product.productName,
          totalVins:
            product.QuantityInfo?.TotalQuantity ||
            product.quantityInfo?.totalQuantity ||
            0,
          inStock:
            product.QuantityInfo?.InStockQuantity ||
            product.quantityInfo?.inStockQuantity ||
            0,
        });
      });

      // Sort by ProductCode ascending (alphabetical order)
      data.sort((a, b) => {
        const codeA = (a.ProductCode || a.productCode || "").toLowerCase();
        const codeB = (b.ProductCode || b.productCode || "").toLowerCase();
        return codeA.localeCompare(codeB);
      });

      setInventoryData(data);
    } catch (err) {
      console.error("❌ Error loading manufacturer inventory data:", err);
      setInventoryData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (product) => {
    try {
      setSelectedProduct(product);
      setLoadingDetail(true);
      setShowDetailModal(true);

      console.log("🔍 Viewing details for product:", product.productName);
    } catch (err) {
      console.error("❌ Error loading product details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedProduct(null);
    setSelectedStatus(null);
    setVinList([]);
  };

  const handleStatusClick = async (status) => {
    try {
      setSelectedStatus(status);
      setVinList([]);
      console.log(
        `🔍 Loading VINs for status: ${status}, product: ${selectedProduct.productId}`
      );

      // Gọi API để lấy VIN chi tiết thực từ database
      const response = await manufacturerInventoryApi.getManufacturerDetailVins(
        {
          productId: selectedProduct.productId,
          status: status,
        }
      );

      console.log(`✅ Detail VINs response for ${status}:`, response);

      // Map response to vinList format
      if (response && Array.isArray(response)) {
        const vins = response.map((item) => ({
          vin: item.Vin || item.vin,
          productName: item.ProductName || item.productName,
          colorName: item.ColorName || item.colorName,
          vinNumber: item.Vin || item.vin,
          status: item.Status || item.status,
          orderId: item.OrderId || item.orderId,
          poId: item.PoId || item.poId,
          receivedAt: item.ReceivedAt || item.receivedAt,
        }));
        setVinList(vins);

        console.log(`📋 Total VINs for ${status}:`, vins.length);
      } else {
        console.log("⚠️ No VIN data found");
        setVinList([]);
      }
    } catch (err) {
      console.error(`❌ Error loading VINs for ${status}:`, err);
      setVinList([]);
    }
  };

  // Filter options
  const quantityTypeOptions = [
    { value: "", label: "Tất cả loại" },
    { value: "has_instock", label: "InStock" },
    { value: "has_allocated", label: "Allocated" },
    { value: "has_intransit", label: "InTransit" },
  ];

  // Filter function
  const getFilteredInventory = () => {
    return inventoryData.filter((item) => {
      // Search filter
      const name = (item.ProductName || item.productName || "").toLowerCase();
      const code = (item.ProductCode || item.productCode || "").toLowerCase();
      const term = searchTerm.trim().toLowerCase();
      if (term && !name.includes(term) && !code.includes(term)) {
        return false;
      }

      // Get quantity info
      const quantityInfo = {
        totalQuantity:
          item.QuantityInfo?.TotalQuantity ??
          item.quantityInfo?.totalQuantity ??
          0,
        inStockQuantity:
          item.QuantityInfo?.InStockQuantity ??
          item.quantityInfo?.inStockQuantity ??
          0,
        allocatedQuantity:
          item.QuantityInfo?.AllocatedQuantity ??
          item.quantityInfo?.allocatedQuantity ??
          0,
        inTransitQuantity:
          item.QuantityInfo?.InTransitQuantity ??
          item.quantityInfo?.inTransitQuantity ??
          0,
      };

      // Quantity type filter
      if (
        quantityTypeFilter === "has_instock" &&
        quantityInfo.inStockQuantity === 0
      ) {
        return false;
      }
      if (
        quantityTypeFilter === "has_allocated" &&
        quantityInfo.allocatedQuantity === 0
      ) {
        return false;
      }
      if (
        quantityTypeFilter === "has_intransit" &&
        quantityInfo.inTransitQuantity === 0
      ) {
        return false;
      }

      return true;
    });
  };

  const filteredInventory = getFilteredInventory();

  // Update pagination when filtered inventory changes
  useEffect(() => {
    const totalCount = filteredInventory.length;
    const pageSize = 5;
    const totalPages = Math.ceil(totalCount / pageSize);
    setPagination({
      totalCount: totalCount,
      pageNumber: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
    });
  }, [filteredInventory.length, currentPage]);

  // Pagination logic
  const startIndex = (currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedInventory = filteredInventory.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, quantityTypeFilter]);

  // Pagination handlers
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get visible page numbers - Match Admin logic
  const getVisiblePages = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("ellipsis");
      }
    }
    return pages;
  };

  return (
    <div className="evm-staff-inventory-management">
      <div className="inventory-management">
        <div className="management-toolbar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sản phẩm, mã sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </div>
            <CustomDropdown
              value={quantityTypeFilter}
              onChange={setQuantityTypeFilter}
              options={quantityTypeOptions}
              placeholder="Chọn loại"
              compact={true}
              minWidth="180px"
            />
          </div>
        </div>

        <div className="inventory-table-container" key={`page-${currentPage}-search-${searchTerm}`}>
          {loading && (
            <div className="table-loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
          <table className="inventory-table" style={{ opacity: loading ? 0.5 : 1 }}>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Địa chỉ</th>
                <th>Số lượng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    📋 {searchTerm || quantityTypeFilter
                      ? "Không có sản phẩm nào phù hợp với bộ lọc."
                      : "Không có sản phẩm nào trong kho hãng."}
                  </td>
                </tr>
              ) : (
                paginatedInventory.map((item) => {
                  // Map PascalCase từ backend sang camelCase
                  const product = {
                    productId: item.ProductId || item.productId,
                    productName: item.ProductName || item.productName,
                    productCode: item.ProductCode || item.productCode,
                    quantityInfo: {
                      totalQuantity:
                        item.QuantityInfo?.TotalQuantity ??
                        item.quantityInfo?.totalQuantity ??
                        0,
                      inStockQuantity:
                        item.QuantityInfo?.InStockQuantity ??
                        item.quantityInfo?.inStockQuantity ??
                        0,
                      allocatedQuantity:
                        item.QuantityInfo?.AllocatedQuantity ??
                        item.quantityInfo?.allocatedQuantity ??
                        0,
                      inTransitQuantity:
                        item.QuantityInfo?.InTransitQuantity ??
                        item.quantityInfo?.inTransitQuantity ??
                        0,
                      deliveredQuantity:
                        item.QuantityInfo?.DeliveredQuantity ??
                        item.quantityInfo?.deliveredQuantity ??
                        0,
                    },
                    lastUpdated: item.LastUpdated || item.lastUpdated,
                  };

                  return (
                    <tr key={product.productId}>
                      <td>
                        <div className="branch-info">
                          <div className="branch-name">
                            {product.productName}
                          </div>
                          <div className="branch-code">
                            {product.productCode}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="warehouse-location-info">
                          <div className="branch-address">Manufacturer</div>
                        </div>
                      </td>
                      <td>
                        <div className="quantity-info">
                          <div className="total-quantity">
                            {product.quantityInfo.totalQuantity} xe
                          </div>
                          <div className="quantity-details">
                            InStock: {product.quantityInfo.inStockQuantity} |
                            Allocated:{" "}
                            {product.quantityInfo.allocatedQuantity} |
                            InTransit:{" "}
                            {product.quantityInfo.inTransitQuantity}
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          className="view-detail-btn"
                          onClick={() => handleViewDetails(product)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
                Trước
              </button>

              <div className="pagination-numbers">
                {getVisiblePages().map((page, index) => {
                  if (page === "ellipsis") {
                    return (
                      <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      className={`pagination-number ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
              >
                Sau
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Chi tiết kho */}
      {showDetailModal && (
            <div className="modal-overlay" onClick={handleCloseModal}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h2>Chi tiết kho - {selectedProduct?.productName}</h2>
                  <button className="btn-secondary" onClick={handleCloseModal}>
                    Đóng
                  </button>
                </div>

                <div className="modal-body">
                  {loadingDetail ? (
                    <div className="loading-state">
                      <p>Đang tải dữ liệu...</p>
                    </div>
                  ) : (
                    <div className="inventory-detail">
                      <div className="detail-summary">
                        <div className="summary-item">
                          <span className="label">Product ID:</span>
                          <span className="value">
                            {selectedProduct?.productId}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="label">Mã sản phẩm:</span>
                          <span className="value">
                            {selectedProduct?.productCode}
                          </span>
                        </div>
                        <div className="summary-item">
                          <span className="label">Quyền sở hữu:</span>
                          <span className="value">Manufacturer</span>
                        </div>
                        <div className="summary-item">
                          <span className="label">Tổng số xe:</span>
                          <span className="value highlight">
                            {selectedProduct?.quantityInfo.totalQuantity} xe
                          </span>
                        </div>
                      </div>

                      <div className="status-breakdown">
                        <h3>Phân loại theo trạng thái (Click để xem VIN)</h3>
                        <div className="status-grid">
                          <div
                            className={`status-card ${
                              selectedStatus === "InStock" ? "active" : ""
                            }`}
                            onClick={() => handleStatusClick("InStock")}
                            style={{ cursor: "pointer" }}
                          >
                            <span className="status-label">InStock</span>
                            <span className="status-count">
                              {selectedProduct?.quantityInfo.inStockQuantity}
                            </span>
                          </div>
                          <div
                            className={`status-card ${
                              selectedStatus === "Allocated" ? "active" : ""
                            }`}
                            onClick={() => handleStatusClick("Allocated")}
                            style={{ cursor: "pointer" }}
                          >
                            <span className="status-label">Allocated</span>
                            <span className="status-count">
                              {selectedProduct?.quantityInfo.allocatedQuantity}
                            </span>
                          </div>
                          <div
                            className={`status-card ${
                              selectedStatus === "InTransit" ? "active" : ""
                            }`}
                            onClick={() => handleStatusClick("InTransit")}
                            style={{ cursor: "pointer" }}
                          >
                            <span className="status-label">InTransit</span>
                            <span className="status-count">
                              {selectedProduct?.quantityInfo.inTransitQuantity}
                            </span>
                          </div>
                        </div>

                        {/* Danh sách VIN */}
                        {selectedStatus && (
                          <div className="vin-list-section">
                            <h4>
                              Danh sách VIN - {selectedStatus} ({vinList.length}
                              )
                            </h4>
                            {vinList.length > 0 ? (
                              <div className="vin-table-container">
                                <table className="vin-table">
                                  <thead>
                                    <tr>
                                      <th>STT</th>
                                      <th>VIN</th>
                                      <th>Sản phẩm</th>
                                      <th>Màu sắc</th>
                                      <th>Trạng thái</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {vinList.map((vin, index) => (
                                      <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td className="vin-code">
                                          {vin.vinNumber}
                                        </td>
                                        <td>{vin.productName}</td>
                                        <td>{vin.colorName || "N/A"}</td>
                                        <td>
                                          <span
                                            className={`vin-status ${vin.status.toLowerCase()}`}
                                          >
                                            {vin.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="no-vins">
                                Không có VIN nào trong trạng thái này.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default InventoryManagement;
