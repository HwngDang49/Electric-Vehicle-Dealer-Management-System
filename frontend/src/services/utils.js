// // API Utility Functions
// import { API_STATUS, HTTP_STATUS } from "./constants";

// /**
//  * Handle API response and extract data
//  * @param {Object} response - Axios response object
//  * @returns {Object} - Standardized response object
//  */
// export const handleApiResponse = (response) => {
//   const { data, status } = response;

//   return {
//     status: API_STATUS.SUCCESS,
//     data: data?.data || data,
//     message: data?.message || "Success",
//     statusCode: status,
//     timestamp: new Date().toISOString(),
//   };
// };

// /**
//  * Handle API error and extract error information
//  * @param {Object} error - Axios error object
//  * @returns {Object} - Standardized error object
//  */
// export const handleApiError = (error) => {
//   const { response } = error;

//   if (response) {
//     // Server responded with error status
//     const { data, status } = response;
//     return {
//       status: API_STATUS.ERROR,
//       message: data?.message || "Server error occurred",
//       statusCode: status,
//       data: data?.data || null,
//       timestamp: new Date().toISOString(),
//     };
//   } else if (error.request) {
//     // Request was made but no response received
//     return {
//       status: API_STATUS.ERROR,
//       message: "Network error - no response from server",
//       statusCode: 0,
//       data: null,
//       timestamp: new Date().toISOString(),
//     };
//   } else {
//     // Something else happened
//     return {
//       status: API_STATUS.ERROR,
//       message: error.message || "Unknown error occurred",
//       statusCode: 0,
//       data: null,
//       timestamp: new Date().toISOString(),
//     };
//   }
// };

// /**
//  * Create standardized API response
//  * @param {string} status - API status
//  * @param {*} data - Response data
//  * @param {string} message - Response message
//  * @param {number} statusCode - HTTP status code
//  * @returns {Object} - Standardized response
//  */
// export const createApiResponse = (
//   status,
//   data = null,
//   message = "",
//   statusCode = 200
// ) => {
//   return {
//     status,
//     data,
//     message,
//     statusCode,
//     timestamp: new Date().toISOString(),
//   };
// };

// /**
//  * Validate required fields in request data
//  * @param {Object} data - Request data
//  * @param {Array} requiredFields - Array of required field names
//  * @returns {Object} - Validation result
//  */
// export const validateRequiredFields = (data, requiredFields) => {
//   const missingFields = requiredFields.filter(
//     (field) =>
//       data[field] === undefined || data[field] === null || data[field] === ""
//   );

//   if (missingFields.length > 0) {
//     return {
//       isValid: false,
//       missingFields,
//       message: `Missing required fields: ${missingFields.join(", ")}`,
//     };
//   }

//   return {
//     isValid: true,
//     missingFields: [],
//     message: "All required fields are present",
//   };
// };

// /**
//  * Format date for API requests
//  * @param {Date|string} date - Date to format
//  * @returns {string} - Formatted date string
//  */
// export const formatDateForApi = (date) => {
//   if (!date) return null;

//   const dateObj = new Date(date);
//   return dateObj.toISOString();
// };

// /**
//  * Parse date from API response
//  * @param {string} dateString - Date string from API
//  * @returns {Date} - Parsed date object
//  */
// export const parseDateFromApi = (dateString) => {
//   if (!dateString) return null;
//   return new Date(dateString);
// };

// /**
//  * Create query string from object
//  * @param {Object} params - Query parameters
//  * @returns {string} - Query string
//  */
// export const createQueryString = (params) => {
//   const searchParams = new URLSearchParams();

//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== "") {
//       searchParams.append(key, value);
//     }
//   });

//   return searchParams.toString();
// };

// /**
//  * Debounce function for API calls
//  * @param {Function} func - Function to debounce
//  * @param {number} delay - Delay in milliseconds
//  * @returns {Function} - Debounced function
//  */
// export const debounce = (func, delay) => {
//   let timeoutId;
//   return (...args) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func.apply(null, args), delay);
//   };
// };

// /**
//  * Retry function for failed API calls
//  * @param {Function} apiCall - API function to retry
//  * @param {number} maxRetries - Maximum number of retries
//  * @param {number} delay - Delay between retries in milliseconds
//  * @returns {Promise} - Promise that resolves with API response
//  */
// export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
//   let lastError;

//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       return await apiCall();
//     } catch (error) {
//       lastError = error;

//       if (attempt === maxRetries) {
//         throw lastError;
//       }

//       // Wait before retrying
//       await new Promise((resolve) => setTimeout(resolve, delay * attempt));
//     }
//   }

//   throw lastError;
// };

// ==============================================
// 🧩 API Utility Functions (EV-DMS Compatible)
// ==============================================
import { API_STATUS, HTTP_STATUS } from "./constants";

/**
 * Handle API success responses (unwrap Ardalis.Result)
 * @param {Object} response - Axios response
 * @returns {Object} - Standardized response object
 */
export const handleApiResponse = (response) => {
  const { data, status } = response;

  // ✅ Check if it's Ardalis.Result pattern or direct response
  const unwrappedData = data?.value !== undefined ? data.value : data;

  return {
    status: API_STATUS.SUCCESS,
    data: unwrappedData,
    message: data?.message || "Success",
    statusCode: status,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Handle API error and extract useful info
 * @param {Object} error - Axios error
 * @returns {Object} - Standardized error object
 */
export const handleApiError = (error) => {
  const { response } = error;

  if (response) {
    const { data, status } = response;

    let message;

    // ✅ Handle case when data is an array directly (from BadRequest(result.Errors))
    if (Array.isArray(data)) {
      message = data[0] || "Server error occurred";
    }
    // ✅ Handle case when data is an object
    else if (data && typeof data === 'object') {
      // Extract validation errors - handle both array and object dictionary formats
      let validationMessage = null;
      if (data?.errors) {
        if (Array.isArray(data.errors)) {
          // errors is an array: ["error1", "error2"]
          validationMessage = data.errors[0];
        } else if (typeof data.errors === 'object') {
          // errors is an object dictionary: { "code": ["msg1"], "name": ["msg2"] }
          // Flatten all error messages into array and take first one
          const allMessages = Object.values(data.errors).flat();
          validationMessage = allMessages[0];
        }
      }
      
      message =
        data?.message ||
        validationMessage ||
        data?.title ||
        data?.error ||
        "Server error occurred";
    }
    // ✅ Fallback for other types
    else {
      message = "Server error occurred";
    }

    // Preserve original response for validation errors access
    const errorObj = {
      status: API_STATUS.ERROR,
      message,
      statusCode: status,
      data: Array.isArray(data)
        ? data  // Keep array as-is
        : (
            data?.value ||
            data?.data ||
            data?.errors ||  // ValidationProblemDetails has errors at root level
            data?.validationErrors ||
            null
          ),
      timestamp: new Date().toISOString(),
      // Preserve original axios error response for detailed error parsing
      originalResponse: response,
    };

    return errorObj;
  } else if (error.request) {
    // Request made but no response
    return {
      status: API_STATUS.ERROR,
      message: "Network error - no response from server",
      statusCode: 0,
      data: null,
      timestamp: new Date().toISOString(),
    };
  } else {
    // Other client-side errors
    return {
      status: API_STATUS.ERROR,
      message: error.message || "Unknown error occurred",
      statusCode: 0,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Create standardized API response manually
 */
export const createApiResponse = (
  status,
  data = null,
  message = "",
  statusCode = 200
) => ({
  status,
  data,
  message,
  statusCode,
  timestamp: new Date().toISOString(),
});

/**
 * Validate required fields
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(
    (field) =>
      data[field] === undefined || data[field] === null || data[field] === ""
  );

  if (missingFields.length > 0) {
    return {
      isValid: false,
      missingFields,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    };
  }

  return {
    isValid: true,
    missingFields: [],
    message: "All required fields are present",
  };
};

/**
 * Format date for API requests
 */
export const formatDateForApi = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

/**
 * Parse date from API response
 */
export const parseDateFromApi = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};

/**
 * Create query string from object
 */
export const createQueryString = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

/**
 * Debounce function for API calls
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

/**
 * Retry wrapper for failed API calls
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) throw lastError;
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  throw lastError;
};

// ==============================================
// 🧩 Validation Patterns (Vietnamese)
// ==============================================

/**
 * Vietnamese phone number validation pattern
 * Supports formats: 0123456789, +84123456789, 84123456789
 */
export const VIETNAMESE_PHONE_REGEX = /^(\+84|84|0)(3|5|7|8|9)[0-9]{8}$/;

/**
 * Validate Vietnamese phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid Vietnamese phone number
 */
export const isValidVietnamesePhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  return VIETNAMESE_PHONE_REGEX.test(phone.replace(/\s/g, ""));
};

/**
 * Format Vietnamese phone number to standard format
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number (0xxxxxxxxx)
 */
export const formatVietnamesePhone = (phone) => {
  if (!phone) return "";

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Convert to standard format (0xxxxxxxxx)
  if (cleaned.startsWith("84")) {
    return "0" + cleaned.substring(2);
  } else if (cleaned.startsWith("+84")) {
    return "0" + cleaned.substring(3);
  } else if (cleaned.startsWith("0")) {
    return cleaned;
  }

  return phone; // Return original if can't format
};

/**
 * Email validation pattern
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Vietnamese ID number validation (9-12 digits)
 */
export const VIETNAMESE_ID_REGEX = /^[0-9]{9,12}$/;

/**
 * Validate Vietnamese ID number
 * @param {string} idNumber - ID number to validate
 * @returns {boolean} - True if valid Vietnamese ID
 */
export const isValidVietnameseId = (idNumber) => {
  if (!idNumber || typeof idNumber !== "string") return false;
  return VIETNAMESE_ID_REGEX.test(idNumber.replace(/\s/g, ""));
};
