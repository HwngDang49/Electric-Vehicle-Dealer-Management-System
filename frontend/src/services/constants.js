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

  // Product Management
  PRODUCTS: {
    LIST: "/product/list",
    CREATE: "/product",
    GET_BY_ID: (id) => `/product/${id}`,
    UPDATE: (id) => `/product/${id}`,
    DELETE: (id) => `/product/${id}`,
  },

  // Dealer Management
  DEALERS: {
    LIST: "/dealers",
    CREATE: "/dealers",
    GET_BY_ID: (id) => `/dealers/${id}`,
    UPDATE: (id) => `/dealers/${id}`,
    DELETE: (id) => `/dealers/${id}`,
    ACTIVATE: (id) => `/dealers/${id}/activate`,
    SUSPEND: (id) => `/dealers/${id}/suspend`,
    REACTIVATE: (id) => `/dealers/${id}/reactivate`,
    CLOSE: (id) => `/dealers/${id}/close`,
  },

  // Branch Management
  BRANCHES: {
    LIST: "/branches",
    CREATE: "/branches",
    GET_BY_ID: (id) => `/branches/${id}`,
    UPDATE: (id) => `/branches/${id}`,
    DELETE: (id) => `/branches/${id}`,
  },

  // Invoice Management
  INVOICES: {
    LIST: "/invoices",
    CREATE: "/invoices",
    GET_BY_ID: (id) => `/invoices/${id}`,
    UPDATE: (id) => `/invoices/${id}`,
    DELETE: (id) => `/invoices/${id}`,
    GET_BY_ORDER: (orderId) => `/invoices/order/${orderId}`,
  },

  // Pricebook Management
  PRICEBOOKS: {
    LIST: "/pricebooks",
    CREATE: "/pricebooks",
    GET_BY_ID: (id) => `/pricebooks/${id}`,
    UPDATE: (id) => `/pricebooks/${id}`,
    DELETE: (id) => `/pricebooks/${id}`,
  },

  // Purchase Order Management
  PURCHASE_ORDERS: {
    LIST: "/purchase-orders",
    CREATE: "/purchase-orders",
    GET_BY_ID: (id) => `/purchase-orders/${id}`,
    UPDATE: (id) => `/purchase-orders/${id}`,
    DELETE: (id) => `/purchase-orders/${id}`,
    SUBMIT: (id) => `/purchase-orders/${id}/submit`,
    APPROVE: (id) => `/purchase-orders/${id}/approve`,
    CONFIRM: (id) => `/purchase-orders/${id}/confirm`,
  },

  // User Management
  USERS: {
    LIST: "/users",
    CREATE: "/users",
    GET_BY_ID: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    CURRENT: "/users/current",
  },

  // Quotation Management
  QUOTATIONS: {
    LIST: "/quotes",
    CREATE: "/quotes",
    GET_BY_ID: (id) => `/quotes/${id}`,
    UPDATE: (id) => `/quotes/${id}`,
    DELETE: (id) => `/quotes/${id}`,
    CONVERT_TO_ORDER: (id) => `/quotes/${id}/convert`,
    FINALIZE: (id) => `/quotes/${id}/finalize`,
    CANCEL: (id) => `/quotes/${id}/cancel`,
  },

  // Order Management
  ORDERS: {
    LIST: "/orders",
    CREATE: "/orders",
    GET_BY_ID: (id) => `/orders/${id}`,
    UPDATE: (id) => `/orders/${id}`,
    DELETE: (id) => `/orders/${id}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    CONFIRM: (id) => `/orders/${id}/confirm`,
    CREATE_CONTRACT: (id) => `/orders/${id}/contract`,
    ADD_DEPOSIT: (id) => `/orders/${id}/deposit`,
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
