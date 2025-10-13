// API Endpoints Constants
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
  },

  // Customer Management
  CUSTOMERS: {
    LIST: "/customers",
    CREATE: "/customers",
    GET_BY_ID: (id) => `/customers/${id}`,
    UPDATE: (id) => `/customers/${id}`,
    DELETE: (id) => `/customers/${id}`,
  },

  // Quotation Management
  QUOTATIONS: {
    LIST: "/quotations",
    CREATE: "/quotations",
    GET_BY_ID: (id) => `/quotations/${id}`,
    UPDATE: (id) => `/quotations/${id}`,
    DELETE: (id) => `/quotations/${id}`,
    CONVERT_TO_ORDER: (id) => `/quotations/${id}/convert`,
  },

  // Order Management
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders",
    GET_BY_ID: (id) => `/orders/${id}`,
    UPDATE: (id) => `/orders/${id}`,
    DELETE: (id) => `/orders/${id}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
  },

  // VIN Allocation
  VIN_ALLOCATION: {
    LIST: "/vin-allocations",
    CREATE: "/vin-allocations",
    GET_BY_ID: (id) => `/vin-allocations/${id}`,
    UPDATE: (id) => `/vin-allocations/${id}`,
    ALLOCATE_VIN: (orderId) => `/orders/${orderId}/allocate-vin`,
    AVAILABLE_VINS: "/vin-allocations/available",
  },

  // Delivery Schedule Management
  DELIVERY_SCHEDULES: {
    LIST: "/delivery-schedules",
    CREATE: "/delivery-schedules",
    GET_BY_ID: (id) => `/delivery-schedules/${id}`,
    UPDATE: (id) => `/delivery-schedules/${id}`,
    DELETE: (id) => `/delivery-schedules/${id}`,
    GET_BY_ORDER: (orderId) => `/delivery-schedules/order/${orderId}`,
    UPDATE_STATUS: (id) => `/delivery-schedules/${id}/status`,
    SCHEDULE_DELIVERY: (id) => `/delivery-schedules/${id}/schedule`,
    MARK_DELIVERED: (id) => `/delivery-schedules/${id}/delivered`,
  },

  // Payment Management
  PAYMENTS: {
    LIST: "/payments",
    CREATE: "/payments",
    GET_BY_ID: (id) => `/payments/${id}`,
    UPDATE: (id) => `/payments/${id}`,
    DELETE: (id) => `/payments/${id}`,
    GET_BY_ORDER: (orderId) => `/payments/order/${orderId}`,
    PROCESS_PAYMENT: (id) => `/payments/${id}/process`,
  },

  // Reports and Analytics
  REPORTS: {
    DELIVERY_SUMMARY: "/reports/delivery-summary",
    ORDER_ANALYTICS: "/reports/order-analytics",
    CUSTOMER_ANALYTICS: "/reports/customer-analytics",
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// API Response Status
export const API_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  LOADING: "loading",
};

// Delivery Status Constants
export const DELIVERY_STATUS = {
  PENDING: "pending",
  SCHEDULED: "scheduled",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

// Order Status Constants
export const ORDER_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ALLOCATED: "allocated",
  IN_PRODUCTION: "in_production",
  READY_FOR_DELIVERY: "ready_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};
