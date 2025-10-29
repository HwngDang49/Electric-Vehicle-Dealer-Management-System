import React, { useState, useEffect } from "react";
import "./DeliveryScheduleManagement.css";
import DeliveryDetailView from "./DeliveryDetailView";
import CustomDropdown from "./CustomDropdown";
import deliveryApiService from "../../services/deliveryApiService";

const DeliveryScheduleManagement = ({
  onNavigateToPayment,
  selectedOrderForDelivery = null,
  onScheduleSuccess: onScheduleSuccessCallback,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(7);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    if (searchQuery !== debouncedSearchTerm) {
      setIsSearching(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, activeFilter]);

  // Auto-open modal if selectedOrderForDelivery is provided
  useEffect(() => {
    if (selectedOrderForDelivery) {
      console.log(
        "Auto-opening Delivery modal for order:",
        selectedOrderForDelivery.id
      );

      // Transform order data to delivery format
      const deliveryData = {
        id: `DLV-${selectedOrderForDelivery.backendId}`,
        orderId: selectedOrderForDelivery.backendId,
        status:
          selectedOrderForDelivery.statusType ||
          selectedOrderForDelivery.status,
        statusType:
          selectedOrderForDelivery.statusType ||
          selectedOrderForDelivery.status,
        customer: selectedOrderForDelivery.customer,
        vehicle: selectedOrderForDelivery.vehicle,
        vin: selectedOrderForDelivery.vin,
        scheduledDate: selectedOrderForDelivery.scheduledDeliveryDate || null,
        deliveryAddress: selectedOrderForDelivery.deliveryAddress || "",
        contactPhone:
          selectedOrderForDelivery.deliveryContactPhone ||
          selectedOrderForDelivery.customer?.phone ||
          "",
        receiverName:
          selectedOrderForDelivery.receiverName ||
          selectedOrderForDelivery.customer?.name ||
          "",
      };

      setSelectedDelivery(deliveryData);
    }
  }, [selectedOrderForDelivery]);

  // Fetch deliveries from API
  useEffect(() => {
    fetchDeliveries();
  }, [currentPage, activeFilter]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const statusMap = {
        "Tất cả": null,
        Allocated: "allocated",
        Ready: "ready",
        Delivered: "delivered",
      };

      const result = await deliveryApiService.getDeliveryList({
        status: statusMap[activeFilter],
        pageNumber: currentPage,
        pageSize: pageSize,
      });

      if (result.success) {
        const transformedDeliveries = result.data.items.map((item) => ({
          id: `DLV-${item.orderId}`,
          orderId: item.orderId,
          backendId: item.orderId,
          customer: {
            name: item.customerName,
            phone: item.customerPhone,
          },
          vehicle: {
            name: item.vehicleName,
            color: item.vehicleColor,
          },
          vin: item.vin || "N/A",
          status: item.status,
          statusType: item.status.toLowerCase(),
          scheduledDate: item.scheduledDeliveryDate,
          deliveryAddress: item.deliveryAddress,
          contactPhone: item.deliveryContactPhone,
          receiverName: item.receiverName,
          totalAmount: item.totalAmount,
          createdAt: item.createdAt,
        }));

        setDeliveries(transformedDeliveries);
        setTotalCount(result.data.totalCount);
      } else {
        console.error("Failed to fetch deliveries:", result.error);
        setDeliveries([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      setDeliveries([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Status options for dropdown
  const statusOptions = [
    { value: "Tất cả", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Ready", label: "Sẵn sàng giao", icon: "📦" },
    { value: "Delivered", label: "Đã giao xe", icon: "✅" },
  ];

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      Ready: { text: "Sẵn sàng giao", class: "status-ready" },
      Delivered: { text: "Đã giao xe", class: "status-delivered" },
    };

    const config = statusConfig[status] || {
      text: status,
      class: "status-default",
    };
    return (
      <span className={`status-badge ${config.class}`}>{config.text}</span>
    );
  };

  // Filter deliveries based on search
  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      debouncedSearchTerm.trim() === "" ||
      delivery.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      delivery.customer?.name
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      delivery.customer?.phone
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      delivery.vehicle?.name
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      delivery.vin?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (status) => {
    setActiveFilter(status);
  };

  const handleViewDetails = (deliveryId) => {
    const delivery = deliveries.find((d) => d.id === deliveryId);
    if (delivery) {
      setSelectedDelivery(delivery);
    }
  };

  const handleCloseDetailView = () => {
    setSelectedDelivery(null);
    // Refresh list after closing detail view
    fetchDeliveries();
  };

  const handleScheduleSuccess = () => {
    setSelectedDelivery(null);
    fetchDeliveries();

    // Notify parent to refresh orders
    if (onScheduleSuccessCallback) {
      onScheduleSuccessCallback();
    }
  };

  return (
    <div className="delivery-schedule-management-app">
      <div className="delivery-schedule-management">
        <div className="management-toolbar">
          <div className="search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Tìm kiếm theo mã, khách hàng, VIN..."
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              {isSearching && (
                <div className="search-loading-spinner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="#20c997"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="32"
                      strokeDashoffset="32"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="32;0"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 12 12"
                        to="360 12 12"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </div>
              )}
              <button className="search-btn" onClick={handleSearch}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </div>

            <CustomDropdown
              value={activeFilter}
              onChange={handleStatusFilterChange}
              options={statusOptions}
              minWidth="220px"
            />
          </div>
        </div>

        <div
          className="deliveries-table-container"
          key={`page-${currentPage}-search-${debouncedSearchTerm}`}
        >
          <table className="deliveries-table">
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Order ID</th>
                <th>Khách hàng</th>
                <th>Địa điểm</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading-data">
                    <div className="loading-spinner"></div>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    📋{" "}
                    {debouncedSearchTerm
                      ? "Không tìm thấy lịch giao xe phù hợp với từ khóa tìm kiếm"
                      : "Chưa có lịch giao xe nào trong hệ thống"}
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>
                      <span className="delivery-id">#{delivery.id}</span>
                    </td>
                    <td>
                      <span className="order-id">ORD-{delivery.orderId}</span>
                    </td>
                    <td>
                      <div className="delivery-customer-name">
                        {delivery.customer?.name || "N/A"}
                      </div>
                      <div className="delivery-customer-phone">
                        {delivery.customer?.phone || "N/A"}
                      </div>
                    </td>
                    <td>
                      <div className="delivery-address">
                        {delivery.deliveryAddress || "Chưa cập nhật"}
                      </div>
                    </td>
                    <td>
                      <span className="scheduled-date">
                        {formatDate(delivery.scheduledDate)}
                      </span>
                    </td>
                    <td>{getStatusBadge(delivery.status)}</td>
                    <td>
                      <button
                        className="view-detail-btn"
                        onClick={() => handleViewDetails(delivery.id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
                Trước
              </button>

              <div className="pagination-numbers">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        className={`pagination-number ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 2 ||
                    pageNum === currentPage + 2
                  ) {
                    return (
                      <span key={pageNum} className="pagination-ellipsis">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                Sau
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Detail View */}
      {selectedDelivery && (
        <DeliveryDetailView
          delivery={selectedDelivery}
          onClose={handleCloseDetailView}
          onScheduleSuccess={handleScheduleSuccess}
          onNavigateToPayment={onNavigateToPayment}
        />
      )}
    </div>
  );
};

export default DeliveryScheduleManagement;
