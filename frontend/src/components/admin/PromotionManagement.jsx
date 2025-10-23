import React, { useState, useEffect } from "react";
import "./DealerManagement.css";
import promotionService from "../../services/promotionService";
import dealerApiService from "../../services/dealerApi";
import CreatePromotionModal from "./CreatePromotionModal";
import PromotionDetailModal from "./PromotionDetailModal";
import CustomDropdown from "./CustomDropdown";

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [fundedByFilter, setFundedByFilter] = useState("");
  const [dealerIdToCode, setDealerIdToCode] = useState({});

  useEffect(() => {
    loadPromotions();
    loadDealerCodes();
  }, []);

  const loadDealerCodes = async () => {
    try {
      const res = await dealerApiService.getDealers();
      const list = res.data || res || [];
      const map = {};
      list.forEach((d) => {
        const id = d.id || d.dealerId;
        if (id != null) {
          map[id] = d.code;
        }
      });
      setDealerIdToCode(map);
    } catch (e) {
      console.error("Error loading dealer codes", e);
    }
  };

  const loadPromotions = async (status = "", fundedBy = "") => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (status) filters.status = status;
      if (fundedBy) filters.fundedBy = fundedBy;
      
      const response = await promotionService.getPromotions(filters);
      
      
      const fetchedPromotions = response.data?.data || response.data || response || [];
      const promotionsArray = Array.isArray(fetchedPromotions) ? fetchedPromotions : [];
      
      const sortedPromotions = promotionsArray.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      
      setPromotions(sortedPromotions);
      return sortedPromotions;
    } catch (err) {
      setError("Không thể tải danh sách khuyến mãi");
      console.error("Error loading promotions:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim() && !statusFilter && !fundedByFilter) {
      loadPromotions();
      return;
    }
    
    setLoading(true);
    try {
      const filtered = promotions.filter(promo =>
        promo.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const sortedFiltered = filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB - dateA;
      });
      
      setPromotions(sortedFiltered);
    } catch (err) {
      setError("Không thể tìm kiếm khuyến mãi");
      console.error("Error searching promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    loadPromotions(status, fundedByFilter);
  };

  const handleFundedByFilterChange = (fundedBy) => {
    setFundedByFilter(fundedBy);
    loadPromotions(statusFilter, fundedBy);
  };

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái", icon: "📋" },
    { value: "Draft", label: "Nháp", icon: "📝" },
    { value: "Active", label: "Hoạt động", icon: "✅" },
    { value: "Expired", label: "Hết hạn", icon: "⏱️" },
    { value: "Cancelled", label: "Đã hủy", icon: "❌" }
  ];

  const fundedByOptions = [
    { value: "", label: "Tất cả nguồn tài trợ", icon: "💰" },
    { value: "OEM", label: "OEM", icon: "🏭" },
    { value: "Dealer", label: "Dealer", icon: "🏢" },
    { value: "Shared", label: "Shared", icon: "🤝" }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      Draft: { text: "Nháp", class: "status-inactive" },
      Active: { text: "Hoạt động", class: "status-active" },
      Expired: { text: "Hết hạn", class: "status-closed" },
      Cancelled: { text: "Đã hủy", class: "status-closed" },
    };
    
    const config = statusConfig[status] || { text: status, class: "status-default" };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getFundedByBadge = (fundedBy) => {
    const fundedByConfig = {
      OEM: { text: "OEM", icon: "🏭" },
      Dealer: { text: "Dealer", icon: "🏢" },
      Shared: { text: "Shared", icon: "🤝" },
    };
    
    const config = fundedByConfig[fundedBy] || { text: fundedBy, icon: "💰" };
    return (
      <span className="dealer-code" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <span>{config.icon}</span>
        <span>{config.text}</span>
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString('vi-VN');
    } catch {
      return "-";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const filteredPromotions = promotions.filter(promo =>
    promo.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dealer-management">
      <div className="page-header">
        <h1>Quản lý Khuyến mãi</h1>
        <p>Quản lý thông tin và trạng thái các chương trình khuyến mãi trong hệ thống</p>
      </div>

      <div className="management-toolbar">
        <div className="search-section" style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1, maxWidth: '900px' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: '300px' }}>
            <input
              type="text"
              placeholder="Tìm kiếm khuyến mãi theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="search-btn" onClick={handleSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>
          <CustomDropdown
            value={statusFilter}
            onChange={handleStatusFilterChange}
            options={statusOptions}
            minWidth="200px"
          />
          <CustomDropdown
            value={fundedByFilter}
            onChange={handleFundedByFilterChange}
            options={fundedByOptions}
            minWidth="200px"
          />
        </div>
        <button
          className="create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Thêm Khuyến mãi
        </button>
      </div>

      {error && (
        <div className="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <div className="dealers-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải danh sách khuyến mãi...</p>
          </div>
        ) : (
          <table className="dealers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên Khuyến mãi</th>
                <th>Dealer</th>
                <th>Tài trợ</th>
                <th>Số tiền giảm</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    {searchTerm ? "Không tìm thấy khuyến mãi nào" : "Chưa có khuyến mãi nào"}
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promotion, index) => (
                  <tr key={promotion.promotionId || `promotion-${index}`}>
                    <td>
                      <span className="dealer-code">{promotion.promotionId}</span>
                    </td>
                    <td>
                      <span className="dealer-name">{promotion.name}</span>
                    </td>
                    <td>
                      <span className="legal-name">
                        {promotion.dealerId 
                          ? (dealerIdToCode[promotion.dealerId] || `#${promotion.dealerId}`)
                          : "Global"}
                      </span>
                    </td>
                    <td>
                      {getFundedByBadge(promotion.fundedBy)}
                    </td>
                    <td>
                      <span className="dealer-code" style={{ color: '#dc3545', fontWeight: '600' }}>
                        -{formatCurrency(promotion.amountOff)} VND
                      </span>
                    </td>
                    <td>
                      <span className="created-date">{formatDate(promotion.effectiveFrom)}</span>
                    </td>
                    <td>
                      <span className="created-date">{formatDate(promotion.effectiveTo)}</span>
                    </td>
                    <td>{getStatusBadge(promotion.status)}</td>
                    <td>
                      <button
                        className="view-detail-btn"
                        onClick={() => setSelectedPromotionId(promotion.promotionId)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showCreateModal && (
        <CreatePromotionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadPromotions();
          }}
        />
      )}

      {selectedPromotionId && (
        <PromotionDetailModal
          promotionId={selectedPromotionId}
          onClose={() => setSelectedPromotionId(null)}
          onUpdate={() => loadPromotions()}
        />
      )}
    </div>
  );
};

export default PromotionManagement;

