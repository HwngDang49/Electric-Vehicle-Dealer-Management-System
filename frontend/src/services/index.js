// API Services Index
// Central export file for all API services

import apiClient from "./api";
import {
  API_ENDPOINTS,
  API_STATUS,
  HTTP_STATUS,
  DELIVERY_STATUS,
  ORDER_STATUS,
} from "./constants";
import {
  handleApiResponse,
  handleApiError,
  createApiResponse,
  validateRequiredFields,
  formatDateForApi,
  parseDateFromApi,
  createQueryString,
  debounce,
  retryApiCall,
} from "./utils";

// API Services
import deliveryApiService from "./deliveryApi";
import orderApiService from "./orderApi";
import vinAllocationApiService from "./vinAllocationApi";
import customerApiService from "./customerApi";

// Export all services
export {
  // Main API client
  apiClient,

  // Constants
  API_ENDPOINTS,
  API_STATUS,
  HTTP_STATUS,
  DELIVERY_STATUS,
  ORDER_STATUS,

  // Utility functions
  handleApiResponse,
  handleApiError,
  createApiResponse,
  validateRequiredFields,
  formatDateForApi,
  parseDateFromApi,
  createQueryString,
  debounce,
  retryApiCall,

  // API Services
  deliveryApiService,
  orderApiService,
  vinAllocationApiService,
  customerApiService,
};

// Default export for convenience
export default {
  apiClient,
  deliveryApiService,
  orderApiService,
  vinAllocationApiService,
  customerApiService,
};
