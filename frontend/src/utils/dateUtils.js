/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Format a date to dd/mm/yyyy format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Format a date to dd/mm/yyyy hh:mm format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format a date for HTML date input (yyyy-mm-dd)
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string for input
 */
export const formatDateForInput = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - The date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now - d) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

  return formatDate(d);
};

/**
 * Check if a date is today
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is today
 */
export const isToday = (date) => {
  if (!date) return false;

  const d = new Date(date);
  if (isNaN(d.getTime())) return false;

  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is yesterday
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if the date is yesterday
 */
export const isYesterday = (date) => {
  if (!date) return false;

  const d = new Date(date);
  if (isNaN(d.getTime())) return false;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
};
