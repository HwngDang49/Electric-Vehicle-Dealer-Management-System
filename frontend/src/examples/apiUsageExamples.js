// API Usage Examples
// This file contains examples of how to use the API services
// These are for reference only and won't affect the current system

import {
  deliveryApiService,
  orderApiService,
  vinAllocationApiService,
  customerApiService,
} from "../services";
import { useDeliveryApi, useOrderApi, useVinAllocationApi } from "../hooks";

/**
 * Example 1: Using API Services directly
 */
export const directApiUsageExamples = {
  // Delivery Schedule Examples
  async getDeliverySchedulesExample() {
    try {
      const response = await deliveryApiService.getDeliverySchedules({
        status: "scheduled",
        limit: 10,
      });
      console.log("Delivery schedules:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching delivery schedules:", error);
      throw error;
    }
  },

  async createDeliveryScheduleExample() {
    try {
      const deliveryData = {
        orderId: "ORD-001",
        deliveryPlace: "123 Main St, Ho Chi Minh City",
        deliveryTime: "2025-01-20T10:00:00Z",
        deliveryStaff: "John Doe",
        notes: "Please call customer before delivery",
      };

      const response = await deliveryApiService.createDeliverySchedule(
        deliveryData
      );
      console.log("Created delivery schedule:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating delivery schedule:", error);
      throw error;
    }
  },

  async updateDeliveryStatusExample() {
    try {
      const response = await deliveryApiService.updateDeliveryStatus(
        "DEL-001",
        "delivered",
        { deliveredAt: new Date().toISOString() }
      );
      console.log("Updated delivery status:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating delivery status:", error);
      throw error;
    }
  },

  // Order Management Examples
  async getOrdersExample() {
    try {
      const response = await orderApiService.getOrders({
        status: "allocated",
        customerId: "CUST-001",
      });
      console.log("Orders:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  async updateOrderStatusExample() {
    try {
      const response = await orderApiService.updateOrderStatus(
        "ORD-001",
        "allocated",
        { vin: "VFX-001", allocatedAt: new Date().toISOString() }
      );
      console.log("Updated order status:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  // VIN Allocation Examples
  async getAvailableVinsExample() {
    try {
      const response = await vinAllocationApiService.getAvailableVins({
        vehicleType: "VF8",
        color: "Red",
      });
      console.log("Available VINs:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching available VINs:", error);
      throw error;
    }
  },

  async allocateVinExample() {
    try {
      const allocationData = {
        vin: "VFX-001",
        vehicleId: "VEH-001",
      };

      const response = await vinAllocationApiService.allocateVinToOrder(
        "ORD-001",
        allocationData
      );
      console.log("VIN allocated:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error allocating VIN:", error);
      throw error;
    }
  },
};

/**
 * Example 2: Using Custom Hooks in React Components
 */
export const hookUsageExamples = {
  // Example component using useDeliveryApi
  DeliveryScheduleComponent: () => {
    const {
      loading,
      error,
      data,
      getDeliverySchedules,
      createDeliverySchedule,
      updateDeliveryStatus,
      clearError,
    } = useDeliveryApi();

    const handleGetSchedules = async () => {
      try {
        await getDeliverySchedules({ status: "scheduled" });
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
      }
    };

    const handleCreateSchedule = async (scheduleData) => {
      try {
        await createDeliverySchedule(scheduleData);
        console.log("Schedule created successfully");
      } catch (err) {
        console.error("Failed to create schedule:", err);
      }
    };

    const handleUpdateStatus = async (scheduleId, status) => {
      try {
        await updateDeliveryStatus(scheduleId, status);
        console.log("Status updated successfully");
      } catch (err) {
        console.error("Failed to update status:", err);
      }
    };

    return {
      loading,
      error,
      data,
      handleGetSchedules,
      handleCreateSchedule,
      handleUpdateStatus,
      clearError,
    };
  },

  // Example component using useOrderApi
  OrderManagementComponent: () => {
    const {
      loading,
      error,
      data,
      getOrders,
      updateOrderStatus,
      searchOrders,
      clearError,
    } = useOrderApi();

    const handleGetOrders = async (filters = {}) => {
      try {
        await getOrders(filters);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    };

    const handleUpdateOrderStatus = async (
      orderId,
      status,
      additionalData = {}
    ) => {
      try {
        await updateOrderStatus(orderId, status, additionalData);
        console.log("Order status updated successfully");
      } catch (err) {
        console.error("Failed to update order status:", err);
      }
    };

    const handleSearchOrders = async (searchTerm, filters = {}) => {
      try {
        await searchOrders(searchTerm, filters);
      } catch (err) {
        console.error("Failed to search orders:", err);
      }
    };

    return {
      loading,
      error,
      data,
      handleGetOrders,
      handleUpdateOrderStatus,
      handleSearchOrders,
      clearError,
    };
  },

  // Example component using useVinAllocationApi
  VinAllocationComponent: () => {
    const {
      loading,
      error,
      data,
      getAvailableVins,
      allocateVinToOrder,
      getVinAllocationByOrder,
      clearError,
    } = useVinAllocationApi();

    const handleGetAvailableVins = async (filters = {}) => {
      try {
        await getAvailableVins(filters);
      } catch (err) {
        console.error("Failed to fetch available VINs:", err);
      }
    };

    const handleAllocateVin = async (orderId, allocationData) => {
      try {
        await allocateVinToOrder(orderId, allocationData);
        console.log("VIN allocated successfully");
      } catch (err) {
        console.error("Failed to allocate VIN:", err);
      }
    };

    const handleGetAllocationByOrder = async (orderId) => {
      try {
        await getVinAllocationByOrder(orderId);
      } catch (err) {
        console.error("Failed to fetch VIN allocation:", err);
      }
    };

    return {
      loading,
      error,
      data,
      handleGetAvailableVins,
      handleAllocateVin,
      handleGetAllocationByOrder,
      clearError,
    };
  },
};

/**
 * Example 3: Complete workflow examples
 */
export const workflowExamples = {
  // Complete order to delivery workflow
  async completeOrderToDeliveryWorkflow() {
    try {
      // Step 1: Get orders that need VIN allocation
      const ordersResponse = await orderApiService.getOrders({
        status: "pending",
      });
      console.log("Orders needing VIN allocation:", ordersResponse.data);

      // Step 2: Get available VINs
      const vinsResponse = await vinAllocationApiService.getAvailableVins({
        vehicleType: "VF8",
      });
      console.log("Available VINs:", vinsResponse.data);

      // Step 3: Allocate VIN to order
      const allocationResponse =
        await vinAllocationApiService.allocateVinToOrder("ORD-001", {
          vin: "VFX-001",
          vehicleId: "VEH-001",
        });
      console.log("VIN allocated:", allocationResponse.data);

      // Step 4: Update order status
      const orderUpdateResponse = await orderApiService.updateOrderStatus(
        "ORD-001",
        "allocated",
        { vin: "VFX-001" }
      );
      console.log("Order status updated:", orderUpdateResponse.data);

      // Step 5: Create delivery schedule
      const deliveryResponse = await deliveryApiService.createDeliverySchedule({
        orderId: "ORD-001",
        deliveryPlace: "123 Main St, Ho Chi Minh City",
        deliveryTime: "2025-01-20T10:00:00Z",
        deliveryStaff: "John Doe",
      });
      console.log("Delivery schedule created:", deliveryResponse.data);

      return {
        order: orderUpdateResponse.data,
        allocation: allocationResponse.data,
        delivery: deliveryResponse.data,
      };
    } catch (error) {
      console.error("Workflow failed:", error);
      throw error;
    }
  },

  // Search and filter workflow
  async searchAndFilterWorkflow() {
    try {
      // Search orders
      const ordersResponse = await orderApiService.searchOrders("John Doe", {
        status: "allocated",
      });
      console.log("Found orders:", ordersResponse.data);

      // Get delivery schedules for those orders
      const orderIds = ordersResponse.data.map((order) => order.id);
      const deliveryResponse = await deliveryApiService.getDeliverySchedules({
        orderIds: orderIds.join(","),
      });
      console.log("Delivery schedules:", deliveryResponse.data);

      return {
        orders: ordersResponse.data,
        deliveries: deliveryResponse.data,
      };
    } catch (error) {
      console.error("Search workflow failed:", error);
      throw error;
    }
  },
};

// Export all examples
export default {
  directApiUsageExamples,
  hookUsageExamples,
  workflowExamples,
};
