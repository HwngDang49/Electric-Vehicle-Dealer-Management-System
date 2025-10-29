import { useState, useEffect, useMemo } from "react";

/**
 * Normalize model code to a consistent format for matching
 */
export const normalizeModelCode = (code) => {
  if (!code) return "";
  return String(code)
    .toLowerCase()
    .replace(/\s+/g, "") // Remove all spaces
    .replace(/[-_]/g, "") // Remove hyphens and underscores
    .replace(/[^\w]/g, ""); // Remove special characters, keep only alphanumeric
};

/**
 * Hook to get product image path dynamically
 * Loads mapping from JSON and generates image paths based on modelCode
 */
export const useProductImageMapping = () => {
  const [imageMapping, setImageMapping] = useState({});

  useEffect(() => {
    // Try to load mapping from vinfast-models.json
    const loadImageMapping = async () => {
      try {
        const response = await fetch("/vinfast-models.json");
        if (response.ok) {
          const data = await response.json();
          const mapping = {};

          // Build mapping from JSON: { normalizedModelCode: imagePath }
          if (data.vinfastModels && Array.isArray(data.vinfastModels)) {
            data.vinfastModels.forEach((model) => {
              if (model.id && model.image) {
                const normalizedId = normalizeModelCode(model.id);
                mapping[normalizedId] = model.image;
              }
            });
          }

          setImageMapping(mapping);
        }
      } catch {
        setImageMapping({});
      }
    };

    loadImageMapping();
  }, []);

  return useMemo(() => {
    const getProductImagePath = (product) => {
      // First, check if product has direct image property
      if (product?.image || product?.imageUrl) {
        return product.image || product.imageUrl;
      }

      // Get modelCode from product
      // Priority: explicitly passed modelCode > product.modelCode > productModelCode > extract from productName
      let modelCode =
        product?.modelCode || product?.ModelCode || product?.productModelCode;

      // If no modelCode found, try to extract from productName
      if (!modelCode && product?.productName) {
        // Try to match "VF" followed by space/hyphen and number or identifier
        const match = product.productName.match(/vf\s*[-\s]?\s*[\w\d]+/i);
        if (match) {
          modelCode = match[0].trim();
        }
      }

      if (!modelCode) return null;

      // Normalize modelCode for matching
      const normalizedCode = normalizeModelCode(modelCode);

      // Try to find in JSON mapping first
      if (imageMapping[normalizedCode]) {
        return imageMapping[normalizedCode];
      }

      // Dynamic generation: extract model identifier
      // Pattern 1: "VF e34", "VFE34", "VF-e34" -> vinfast-vf-e34.jpg (must check first)
      const ePatternMatch = modelCode.match(/vf\s*[-\s]?[eE]\s*(\d+)/i);
      if (ePatternMatch) {
        return `/images/vinfast-vf-e${ePatternMatch[1]}.jpg`;
      }

      // Pattern 2: "VF-8", "VF 8" -> vinfast-vf8.jpg (with separator, must NOT have "e")
      const regularPatternMatch = modelCode.match(/vf\s*[-\s]\s*(\d+)/i);
      if (regularPatternMatch && !/[eE]/.test(modelCode)) {
        return `/images/vinfast-vf${regularPatternMatch[1]}.jpg`;
      }

      // Pattern 2b: "VF8" (no hyphen/space separator) -> vinfast-vf8.jpg
      const noSeparatorMatch = modelCode.match(/vf(\d+)/i);
      if (noSeparatorMatch && !/[eE]/.test(modelCode)) {
        return `/images/vinfast-vf${noSeparatorMatch[1]}.jpg`;
      }

      // Pattern 2c: "VF 7" (space between VF and number) -> vinfast-vf7.jpg
      const spaceSeparatorMatch = modelCode.match(/vf\s+(\d+)/i);
      if (spaceSeparatorMatch && !/[eE]/.test(modelCode)) {
        return `/images/vinfast-vf${spaceSeparatorMatch[1]}.jpg`;
      }

      // Pattern 3: Generic match for "vf" + any alphanumeric suffix
      const genericMatch = modelCode.match(/vf\s*([\d\w]+)/i);
      if (genericMatch) {
        const suffix = genericMatch[1].toLowerCase();
        // If suffix starts with "e" followed by numbers
        if (/^e\d+/.test(suffix)) {
          const number = suffix.replace(/^e/, "");
          return `/images/vinfast-vf-e${number}.jpg`;
        }
        // Otherwise regular format
        return `/images/vinfast-vf${suffix}.jpg`;
      }

      // Fallback: try to extract pattern with "e" + number (e.g., "e34")
      const ePatternMatchFallback = modelCode.match(/[eE]\s*(\d+)/i);
      if (ePatternMatchFallback) {
        return `/images/vinfast-vf-e${ePatternMatchFallback[1]}.jpg`;
      }

      // Fallback: try to extract any number from modelCode
      const numberMatch = modelCode.match(/(\d+)/);
      if (numberMatch) {
        return `/images/vinfast-vf${numberMatch[1]}.jpg`;
      }

      // Last resort: try direct path with normalized code
      const tryPath = `/images/vinfast-${normalizedCode}.jpg`;
      return tryPath;
    };

    return getProductImagePath;
  }, [imageMapping]);
};
