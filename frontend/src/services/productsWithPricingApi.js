// Products with Pricing API Map
// Maps the relationship: products -> pricebooks -> pricebook_items
import apiClient from "./api";
import { handleApiResponse, handleApiError } from "./utils";

/**
 * Products with Pricing API Service
 * Handles the relationship mapping between products, pricebooks, and pricebook_items
 */
class ProductsWithPricingApiService {
  /**
   * Get all products with their pricing information
   * @param {boolean} onlyInPricebook - If true, only return products that exist in pricebook
   * @returns {Promise<Object>} - API response with products and pricing
   */
  async getAllProductsWithPricing(onlyInPricebook = false) {
    try {
      console.log(`🔄 Fetching all products with pricing...`);
      console.log(
        `📌 Parameter onlyInPricebook: ${onlyInPricebook} (type: ${typeof onlyInPricebook})`
      );

      // Step 1: Get all products from [dbo].[products]
      // If onlyInPricebook = true, only get products that exist in pricebook
      const productsResponse = await this.getProducts(onlyInPricebook);
      console.log(`📋 Products loaded:`, productsResponse?.data?.length || 0);

      // Step 2: Get all pricebooks from [dbo].[pricebooks]
      const pricebooksResponse = await this.getPricebooks();
      console.log(
        `📚 Pricebooks loaded:`,
        pricebooksResponse?.data?.length || 0
      );

      // Step 3: Get all pricebook_items from [dbo].[pricebook_items]
      const pricebookItemsResponse = await this.getPricebookItems();
      console.log(
        `💰 Pricebook items loaded:`,
        pricebookItemsResponse?.data?.length || 0
      );
      console.log(`🔍 Pricebook items response:`, pricebookItemsResponse);

      // Step 4: Map relationships
      const productsWithPricing = this.mapProductPricingRelationships(
        productsResponse?.data || [],
        pricebooksResponse?.data || [],
        pricebookItemsResponse?.data || []
      );

      console.log(
        `✅ Products with pricing mapped:`,
        productsWithPricing.length
      );

      return {
        products: productsWithPricing,
        metadata: {
          totalProducts: productsWithPricing.length,
          totalPricebooks: pricebooksResponse?.data?.length || 0,
          totalPricebookItems: pricebookItemsResponse?.data?.length || 0,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(`❌ Error fetching products with pricing:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Get all products with pricing for Purchase Orders (uses merged pricebook: dealer + global)
   * @param {boolean} onlyInPricebook - If true, only return products that exist in pricebook
   * @returns {Promise<Object>} - API response with products and pricing
   */
  async getAllProductsWithPricingForPo(onlyInPricebook = false) {
    try {
      console.log(
        `🔄 Fetching all products with pricing for PO (merged pricebook)...`
      );
      console.log(
        `📌 Parameter onlyInPricebook: ${onlyInPricebook} (type: ${typeof onlyInPricebook})`
      );

      // Step 1: Get all products from [dbo].[products]
      // If onlyInPricebook = true, only get products that exist in pricebook
      const productsResponse = await this.getProducts(onlyInPricebook);
      console.log(`📋 Products loaded:`, productsResponse?.data?.length || 0);

      // Step 2: Get all pricebooks from [dbo].[pricebooks] (for compatibility with mapping)
      const pricebooksResponse = await this.getPricebooks();
      console.log(
        `📚 Pricebooks loaded:`,
        pricebooksResponse?.data?.length || 0
      );

      // Step 3: Get merged pricebook items (dealer + global) for PO
      const pricebookItemsResponse = await this.getPoPricebookItems();
      console.log(
        `💰 PO Pricebook items (merged) loaded:`,
        pricebookItemsResponse?.data?.length || 0
      );
      console.log(`🔍 PO Pricebook items response:`, pricebookItemsResponse);

      // Step 4: Map relationships
      const productsWithPricing = this.mapProductPricingRelationships(
        productsResponse?.data || [],
        pricebooksResponse?.data || [],
        pricebookItemsResponse?.data || []
      );

      console.log(
        `✅ Products with pricing mapped (for PO):`,
        productsWithPricing.length
      );

      return {
        products: productsWithPricing,
        metadata: {
          totalProducts: productsWithPricing.length,
          totalPricebooks: pricebooksResponse?.data?.length || 0,
          totalPricebookItems: pricebookItemsResponse?.data?.length || 0,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error(`❌ Error fetching products with pricing for PO:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Get all products from [dbo].[products]
   * @param {boolean} onlyInPricebook - If true, only return products that exist in pricebook
   * @returns {Promise<Object>} - API response
   */
  async getProducts(onlyInPricebook = false) {
    try {
      const url = onlyInPricebook
        ? "/product/list?onlyInPricebook=true"
        : "/product/list";
      console.log(`🔄 Fetching products from: ${url}`);
      console.log(
        `📌 onlyInPricebook parameter: ${onlyInPricebook}, URL will be: ${url}`
      );
      const response = await apiClient.get(url);
      console.log(`✅ Products API response received:`, {
        url: url,
        onlyInPricebook: onlyInPricebook,
        productsCount:
          response?.data?.data?.length || response?.data?.length || 0,
      });
      return handleApiResponse(response);
    } catch (error) {
      console.error(`❌ Error fetching products:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Get active pricebook from [dbo].[pricebooks]
   * @returns {Promise<Object>} - API response
   */
  async getPricebooks() {
    try {
      const url = "/pricebooks/active";
      console.log(`🔄 Fetching active pricebook from: ${url}`);
      const response = await apiClient.get(url);
      return handleApiResponse(response);
    } catch (error) {
      console.error(`❌ Error fetching pricebooks:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Get all pricebook_items from [dbo].[pricebook_items]
   * @returns {Promise<Object>} - API response
   */
  async getPricebookItems() {
    try {
      const url = "/pricebooks/active";
      console.log(`🔄 Fetching pricebook items from: ${url}`);
      const response = await apiClient.get(url);
      const result = handleApiResponse(response);

      // Extract items array from the response - try both locations
      const items = result?.items || result?.data?.items || [];

      return {
        data: items,
        message: "Pricebook items extracted from active pricebook",
      };
    } catch (error) {
      console.error(`❌ Error fetching pricebook items:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Get merged pricebook items for Purchase Orders (includes both dealer-specific and global)
   * @returns {Promise<Object>} - API response with merged pricebook items
   */
  async getPoPricebookItems() {
    try {
      const url = "/purchase-orders/active-pricebook";
      console.log(`🔄 Fetching PO pricebook items (merged) from: ${url}`);
      const response = await apiClient.get(url);
      const result = handleApiResponse(response);

      // Extract items array from the response
      const items = result?.items || result?.data?.items || [];

      return {
        data: items,
        message: "Merged pricebook items (dealer + global) extracted for PO",
      };
    } catch (error) {
      console.error(`❌ Error fetching PO pricebook items:`, error);
      throw handleApiError(error);
    }
  }

  /**
   * Map product pricing relationships
   * @param {Array} products - Products array
   * @param {Array} pricebooks - Pricebooks array
   * @param {Array} pricebookItems - Pricebook items array
   * @returns {Array} - Mapped products with pricing
   */
  mapProductPricingRelationships(products, pricebooks, pricebookItems) {
    console.log(`🔄 Mapping product pricing relationships...`);
    console.log(`📊 Input data:`, {
      products: products.length,
      pricebook: pricebooks,
      pricebookItems: pricebookItems,
      pricebookItemsType: typeof pricebookItems,
      pricebookItemsIsArray: Array.isArray(pricebookItems),
    });

    return products.map((product) => {
      // Use the active pricebook (single object, not array)
      const pricebook = pricebooks;

      // Find pricebook items for this product
      const productPricebookItems = pricebookItems.filter(
        (item) => item.productId === product.productId
      );

      // Get the first pricebook item (assuming one price per product)
      const pricebookItem = productPricebookItems[0];

      console.log(`🔍 Product ${product.productId} (${product.name}):`, {
        foundPricebook: !!pricebook,
        foundPricebookItems: productPricebookItems.length,
        pricebookItem: pricebookItem,
      });

      // Map product with pricing information
      const productWithPricing = {
        ...product,
        // Pricing information from pricebook_items
        msrpPrice: pricebookItem?.msrpPrice || 0,
        floorPrice: pricebookItem?.floorPrice || null,
        oemDiscountAmount: pricebookItem?.oemDiscountAmount || 0,
        oemDiscountPercent: pricebookItem?.oemDiscountPercent || null,
        // Use floor price only for display
        effectivePrice: pricebookItem?.floorPrice || 0,
        // Formatted price for display - only floor price
        formattedPrice: this.formatPrice(pricebookItem?.floorPrice || 0),

        // Additional product info from pricebook_items
        productName: pricebookItem?.productName || product.name,
        modelCode: pricebookItem?.modelCode || product.modelCode,
        variantCode: pricebookItem?.variantCode || product.variantCode,
        // Flag to indicate if pricing data is from API or fallback
        hasApiPricing: !!pricebookItem,
        // Pricebook information
        pricebook: pricebook,
        pricebookItems: productPricebookItems,
      };

      return productWithPricing;
    });
  }

  /**
   * Format price for display
   * @param {number} price - Price to format
   * @returns {string} - Formatted price
   */
  formatPrice(price) {
    if (!price) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  }
}

// Create and export singleton instance
const productsWithPricingApiService = new ProductsWithPricingApiService();
export default productsWithPricingApiService;
