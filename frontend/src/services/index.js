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
import productApiService from "./productApi";
import dealerApiService from "./dealerApi";
import branchApiService from "./branchApi";
import quoteApiService from "./quoteApi";
import invoiceApiService from "./invoiceApi";
import pricebookApiService from "./pricebookApi";
import purchaseOrderApiService from "./purchaseOrderApi";
import userApiService from "./userApi";

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
  productApiService,
  dealerApiService,
  branchApiService,
  quoteApiService,
  invoiceApiService,
  pricebookApiService,
  purchaseOrderApiService,
  userApiService,
};

// Default export for convenience
export default {
  apiClient,
  deliveryApiService,
  orderApiService,
  vinAllocationApiService,
  customerApiService,
  productApiService,
  dealerApiService,
  branchApiService,
  quoteApiService,
  invoiceApiService,
  pricebookApiService,
  purchaseOrderApiService,
  userApiService,
};
