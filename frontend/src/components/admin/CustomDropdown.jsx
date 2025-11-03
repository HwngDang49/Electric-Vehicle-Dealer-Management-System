import React, { useState } from "react";

const CustomDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Chọn...",
  icon = "📋",
  minWidth = "220px",
  compact = false,
  disabled = false
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = (optionValue) => {
    if (disabled) return;
    onChange(optionValue);
    setShowDropdown(false);
  };

  const getSelectedOption = () => {
    return options.find(opt => opt.value === value) || options[0];
  };

  const selectedOption = getSelectedOption();

  return (
    <div style={{ position: 'relative', minWidth }}>
      <button
        type="button"
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: compact ? '10px 32px 10px 12px' : '12px 40px 12px 16px',
          border: '1px solid #ced4da',
          borderRadius: compact ? '4px' : '8px',
          fontSize: compact ? '14px' : '14px',
          backgroundColor: disabled ? '#f5f5f5' : '#ffffff',
          color: disabled ? '#999999' : '#495057',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease',
          fontWeight: '400',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: compact ? '6px' : '8px',
          height: compact ? '42px' : '44px',
          minHeight: compact ? '42px' : '44px',
          opacity: disabled ? 0.7 : 1,
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: compact ? '14px' : '16px', flexShrink: 0 }}>
          {selectedOption?.icon || icon}
        </span>
        <span style={{ 
          flex: 1, 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0
        }}>{selectedOption?.label || placeholder}</span>
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          style={{
            color: '#888888',
            transition: 'transform 0.2s ease',
            transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        >
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
      
      {showDropdown && !disabled && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          zIndex: 99999,
          overflow: 'hidden',
          maxHeight: '250px',
          overflowY: 'auto'
        }}>
          {options.map((option, index) => {
            const isSelected = value === option.value;
            return (
              <div
                key={option.value}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent button blur
                  handleChange(option.value);
                }}
                style={{
                  padding: compact ? '8px 12px' : '12px 16px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#e3f2fd' : '#ffffff',
                  borderBottom: index < options.length - 1 ? '1px solid #f0f0f0' : 'none',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: compact ? '8px' : '10px',
                  fontSize: compact ? '13px' : '14px',
                  color: '#333333'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }
                }}
              >
                {option.icon && <span style={{ fontSize: compact ? '14px' : '16px', pointerEvents: 'none' }}>{option.icon}</span>}
                <span style={{ 
                  flex: 1,
                  fontWeight: isSelected ? '600' : '400',
                  pointerEvents: 'none'
                }}>
                  {option.label}
                </span>
                {isSelected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#2196f3', pointerEvents: 'none' }}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;

