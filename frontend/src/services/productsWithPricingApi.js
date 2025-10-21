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
   * @returns {Promise<Object>} - API response with products and pricing
   */
  async getAllProductsWithPricing() {
    try {
      console.log(`🔄 Fetching all products with pricing...`);

      // Step 1: Get all products from [dbo].[products]
      const productsResponse = await this.getProducts();
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
   * Get all products from [dbo].[products]
   * @returns {Promise<Object>} - API response
   */
  async getProducts() {
    try {
      const url = "/product/list";
      console.log(`🔄 Fetching products from: ${url}`);
      const response = await apiClient.get(url);
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
