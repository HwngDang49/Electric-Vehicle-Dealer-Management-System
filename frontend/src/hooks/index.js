// Custom Hooks Index
// Central export file for all custom hooks

import useDeliveryApi from "./useDeliveryApi";
import useOrderApi from "./useOrderApi";
import useVinAllocationApi from "./useVinAllocationApi";
import usePaymentApi from "./usePaymentApi";
import useQuoteApi from "./useQuoteApi";
import useContractApi from "./useContractApi";
import useDepositApi from "./useDepositApi";
import useTestDriveApi from "./useTestDriveApi";

// Export all hooks
export {
  useDeliveryApi,
  useOrderApi,
  useVinAllocationApi,
  usePaymentApi,
  useQuoteApi,
  useContractApi,
  useDepositApi,
  useTestDriveApi,
};

// Default export for convenience
export default {
  useDeliveryApi,
  useOrderApi,
  useVinAllocationApi,
  usePaymentApi,
  useQuoteApi,
  useContractApi,
  useDepositApi,
  useTestDriveApi,
};
