import React from "react";
import "./ActionMenu.css";

const ActionMenu = ({ 
  dealer, 
  isOpen, 
  onToggle, 
  onActionClick, 
  actionLoading 
}) => {
  const getActionMenuItems = (dealer) => {
    const items = [
      {
        id: 'view',
        label: 'Xem chi tiết',
        icon: '👁️',
        className: 'view-action'
      },
      {
        id: 'edit',
        label: 'Chỉnh sửa',
        icon: '✏️',
        className: 'edit-action'
      }
    ];

    // Add status-specific actions
    switch (dealer.status) {
      case "Onboarding":
        items.push({
          id: 'activate',
          label: 'Kích hoạt',
          icon: '✅',
          className: 'activate-action',
          loading: actionLoading === `activate-${dealer.id}`
        });
        break;
      case "Active":
        items.push(
          {
            id: 'suspend',
            label: 'Tạm dừng',
            icon: '⏸️',
            className: 'suspend-action',
            loading: actionLoading === `suspend-${dealer.id}`
          },
          {
            id: 'close',
            label: 'Đóng',
            icon: '❌',
            className: 'close-action',
            loading: actionLoading === `close-${dealer.id}`
          }
        );
        break;
      case "Suspended":
        items.push(
          {
            id: 'reactivate',
            label: 'Kích hoạt lại',
            icon: '🔄',
            className: 'reactivate-action',
            loading: actionLoading === `reactivate-${dealer.id}`
          },
          {
            id: 'close',
            label: 'Đóng',
            icon: '❌',
            className: 'close-action',
            loading: actionLoading === `close-${dealer.id}`
          }
        );
        break;
    }
    
    return items;
  };

  const handleMenuToggle = (event) => {
    event.stopPropagation();
    onToggle();
  };

  const handleActionClick = (item) => {
    onActionClick(item, dealer);
  };

  const menuItems = getActionMenuItems(dealer);

  return (
    <div className="action-menu-container">
      <button
        className="action-menu-trigger"
        onClick={handleMenuToggle}
        title="Thao tác"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
      
      {isOpen && (
        <div className="action-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`action-menu-item ${item.className}`}
              onClick={() => handleActionClick(item)}
              disabled={item.loading}
            >
              <span className="action-icon">{item.icon}</span>
              <span className="action-label">
                {item.loading ? "Đang xử lý..." : item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
