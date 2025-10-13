// Custom Hooks Index
// Central export file for all custom hooks

import useDeliveryApi from "./useDeliveryApi";
import useOrderApi from "./useOrderApi";
import useVinAllocationApi from "./useVinAllocationApi";

// Export all hooks
export { useDeliveryApi, useOrderApi, useVinAllocationApi };

// Default export for convenience
export default {
  useDeliveryApi,
  useOrderApi,
  useVinAllocationApi,
};
