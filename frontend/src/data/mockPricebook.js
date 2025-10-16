// Mock Pricebook Data
// This file contains mock vehicle data that simulates a pricebook

export const mockPricebook = {
  // VinFast VF3 Series
  VF3: {
    id: "VF3",
    name: "VinFast VF3",
    category: "SUV",
    basePrice: 350000000,
    versions: [
      {
        id: "VF3_STANDARD",
        name: "VF3 Standard",
        code: "VF3-STD",
        price: 350000000,
        features: ["Basic Interior", "Standard Battery", "Basic Audio"],
        range: 300,
        acceleration: "0-100km/h in 8.5s",
        topSpeed: 150,
      },
      {
        id: "VF3_PREMIUM",
        name: "VF3 Premium",
        code: "VF3-PRM",
        price: 420000000,
        features: [
          "Premium Interior",
          "Extended Battery",
          "Premium Audio",
          "Sunroof",
        ],
        range: 400,
        acceleration: "0-100km/h in 7.2s",
        topSpeed: 160,
      },
      {
        id: "VF3_LUXURY",
        name: "VF3 Luxury",
        code: "VF3-LUX",
        price: 500000000,
        features: [
          "Luxury Interior",
          "Max Battery",
          "Premium Audio",
          "Panoramic Sunroof",
          "Leather Seats",
        ],
        range: 500,
        acceleration: "0-100km/h in 6.8s",
        topSpeed: 170,
      },
    ],
    colors: [
      {
        id: "VF3_WHITE",
        name: "Trắng Ngọc Trai",
        code: "PEARL_WHITE",
        price: 0,
      },
      {
        id: "VF3_BLACK",
        name: "Đen Huyền Bí",
        code: "MYSTERY_BLACK",
        price: 0,
      },
      { id: "VF3_BLUE", name: "Xanh Đại Dương", code: "OCEAN_BLUE", price: 0 },
      { id: "VF3_RED", name: "Đỏ Ruby", code: "RUBY_RED", price: 0 },
      { id: "VF3_GRAY", name: "Xám Titan", code: "TITAN_GRAY", price: 0 },
    ],
  },

  // VinFast VF5 Series
  VF5: {
    id: "VF5",
    name: "VinFast VF5",
    category: "Sedan",
    basePrice: 458000000,
    versions: [
      {
        id: "VF5_PLUS",
        name: "VF5 Plus",
        code: "VF5-PLS",
        price: 458000000,
        features: ["Standard Interior", "Standard Battery", "Basic Audio"],
        range: 350,
        acceleration: "0-100km/h in 7.8s",
        topSpeed: 155,
      },
      {
        id: "VF5_PREMIUM",
        name: "VF5 Premium",
        code: "VF5-PRM",
        price: 520000000,
        features: [
          "Premium Interior",
          "Extended Battery",
          "Premium Audio",
          "Heated Seats",
        ],
        range: 450,
        acceleration: "0-100km/h in 6.9s",
        topSpeed: 165,
      },
    ],
    colors: [
      {
        id: "VF5_WHITE",
        name: "Trắng Ngọc Trai",
        code: "PEARL_WHITE",
        price: 0,
      },
      {
        id: "VF5_BLACK",
        name: "Đen Huyền Bí",
        code: "MYSTERY_BLACK",
        price: 0,
      },
      { id: "VF5_BLUE", name: "Xanh Đại Dương", code: "OCEAN_BLUE", price: 0 },
      { id: "VF5_RED", name: "Đỏ Ruby", code: "RUBY_RED", price: 0 },
    ],
  },

  // VinFast VF6 Series
  VF6: {
    id: "VF6",
    name: "VinFast VF6",
    category: "Crossover",
    basePrice: 700000000,
    versions: [
      {
        id: "VF6_ECO",
        name: "VF6 Eco",
        code: "VF6-ECO",
        price: 700000000,
        features: ["Eco Interior", "Standard Battery", "Basic Audio"],
        range: 400,
        acceleration: "0-100km/h in 8.2s",
        topSpeed: 160,
      },
      {
        id: "VF6_PLUS",
        name: "VF6 Plus",
        code: "VF6-PLS",
        price: 850000000,
        features: [
          "Premium Interior",
          "Extended Battery",
          "Premium Audio",
          "All-wheel Drive",
        ],
        range: 500,
        acceleration: "0-100km/h in 7.5s",
        topSpeed: 170,
      },
      {
        id: "VF6_PREMIUM",
        name: "VF6 Premium",
        code: "VF6-PRM",
        price: 950000000,
        features: [
          "Luxury Interior",
          "Max Battery",
          "Premium Audio",
          "All-wheel Drive",
          "Sunroof",
        ],
        range: 600,
        acceleration: "0-100km/h in 6.9s",
        topSpeed: 180,
      },
    ],
    colors: [
      {
        id: "VF6_WHITE",
        name: "Trắng Ngọc Trai",
        code: "PEARL_WHITE",
        price: 0,
      },
      {
        id: "VF6_BLACK",
        name: "Đen Huyền Bí",
        code: "MYSTERY_BLACK",
        price: 0,
      },
      { id: "VF6_BLUE", name: "Xanh Đại Dương", code: "OCEAN_BLUE", price: 0 },
      { id: "VF6_RED", name: "Đỏ Ruby", code: "RUBY_RED", price: 0 },
      { id: "VF6_SILVER", name: "Bạc Kim", code: "PLATINUM_SILVER", price: 0 },
    ],
  },

  // VinFast VF8 Series
  VF8: {
    id: "VF8",
    name: "VinFast VF8",
    category: "SUV",
    basePrice: 765000000,
    versions: [
      {
        id: "VF8_ECO",
        name: "VF8 Eco",
        code: "VF8-ECO",
        price: 765000000,
        features: ["Standard Interior", "Standard Battery", "Basic Audio"],
        range: 450,
        acceleration: "0-100km/h in 7.8s",
        topSpeed: 170,
      },
      {
        id: "VF8_PLUS",
        name: "VF8 Plus",
        code: "VF8-PLS",
        price: 1130000000,
        features: [
          "Premium Interior",
          "Extended Battery",
          "Premium Audio",
          "All-wheel Drive",
        ],
        range: 550,
        acceleration: "0-100km/h in 6.5s",
        topSpeed: 180,
      },
      {
        id: "VF8_PREMIUM",
        name: "VF8 Premium",
        code: "VF8-PRM",
        price: 1350000000,
        features: [
          "Luxury Interior",
          "Max Battery",
          "Premium Audio",
          "All-wheel Drive",
          "Panoramic Sunroof",
        ],
        range: 650,
        acceleration: "0-100km/h in 5.9s",
        topSpeed: 190,
      },
    ],
    colors: [
      {
        id: "VF8_WHITE",
        name: "Trắng Ngọc Trai",
        code: "PEARL_WHITE",
        price: 0,
      },
      {
        id: "VF8_BLACK",
        name: "Đen Huyền Bí",
        code: "MYSTERY_BLACK",
        price: 0,
      },
      { id: "VF8_BLUE", name: "Xanh Đại Dương", code: "OCEAN_BLUE", price: 0 },
      { id: "VF8_RED", name: "Đỏ Ruby", code: "RUBY_RED", price: 0 },
      { id: "VF8_GRAY", name: "Xám Titan", code: "TITAN_GRAY", price: 0 },
    ],
  },

  // VinFast VF9 Series
  VF9: {
    id: "VF9",
    name: "VinFast VF9",
    category: "SUV",
    basePrice: 1400000000,
    versions: [
      {
        id: "VF9_PLUS",
        name: "VF9 Plus",
        code: "VF9-PLS",
        price: 1400000000,
        features: [
          "Premium Interior",
          "Extended Battery",
          "Premium Audio",
          "All-wheel Drive",
        ],
        range: 600,
        acceleration: "0-100km/h in 6.2s",
        topSpeed: 180,
      },
      {
        id: "VF9_PREMIUM",
        name: "VF9 Premium",
        code: "VF9-PRM",
        price: 1650000000,
        features: [
          "Luxury Interior",
          "Max Battery",
          "Premium Audio",
          "All-wheel Drive",
          "Panoramic Sunroof",
        ],
        range: 700,
        acceleration: "0-100km/h in 5.5s",
        topSpeed: 190,
      },
      {
        id: "VF9_LUXURY",
        name: "VF9 Luxury",
        code: "VF9-LUX",
        price: 1850000000,
        features: [
          "Ultra Luxury Interior",
          "Max Battery",
          "Premium Audio",
          "All-wheel Drive",
          "Panoramic Sunroof",
          "Massage Seats",
        ],
        range: 800,
        acceleration: "0-100km/h in 5.0s",
        topSpeed: 200,
      },
    ],
    colors: [
      {
        id: "VF9_WHITE",
        name: "Trắng Ngọc Trai",
        code: "PEARL_WHITE",
        price: 0,
      },
      {
        id: "VF9_BLACK",
        name: "Đen Huyền Bí",
        code: "MYSTERY_BLACK",
        price: 0,
      },
      { id: "VF9_BLUE", name: "Xanh Đại Dương", code: "OCEAN_BLUE", price: 0 },
      { id: "VF9_RED", name: "Đỏ Ruby", code: "RUBY_RED", price: 0 },
      { id: "VF9_GRAY", name: "Xám Titan", code: "TITAN_GRAY", price: 0 },
      { id: "VF9_SILVER", name: "Bạc Kim", code: "PLATINUM_SILVER", price: 0 },
    ],
  },
};

// Helper function to get vehicle info by product ID
export const getVehicleInfoByProductId = (productId) => {
  // Map product IDs to vehicle models (this would come from your backend)
  const productIdToVehicleMap = {
    1: { model: "VF3", version: "VF3_STANDARD", color: "VF3_WHITE" },
    2: { model: "VF3", version: "VF3_PREMIUM", color: "VF3_BLACK" },
    3: { model: "VF3", version: "VF3_LUXURY", color: "VF3_BLUE" },
    4: { model: "VF5", version: "VF5_PLUS", color: "VF5_WHITE" },
    5: { model: "VF5", version: "VF5_PREMIUM", color: "VF5_BLACK" },
    6: { model: "VF6", version: "VF6_ECO", color: "VF6_WHITE" },
    7: { model: "VF6", version: "VF6_PLUS", color: "VF6_BLACK" },
    8: { model: "VF6", version: "VF6_PREMIUM", color: "VF6_BLUE" },
    9: { model: "VF8", version: "VF8_ECO", color: "VF8_WHITE" },
    10: { model: "VF8", version: "VF8_PLUS", color: "VF8_BLACK" },
    11: { model: "VF8", version: "VF8_PREMIUM", color: "VF8_BLUE" },
    12: { model: "VF9", version: "VF9_PLUS", color: "VF9_WHITE" },
    13: { model: "VF9", version: "VF9_PREMIUM", color: "VF9_BLACK" },
    14: { model: "VF9", version: "VF9_LUXURY", color: "VF9_BLUE" },
  };

  const vehicleMapping = productIdToVehicleMap[productId];
  if (!vehicleMapping) {
    return {
      modelName: "Unknown Model",
      versionName: "Unknown Version",
      colorName: "Unknown Color",
      fullName: "Unknown Vehicle",
      price: 0,
    };
  }

  const model = mockPricebook[vehicleMapping.model];
  const version = model.versions.find((v) => v.id === vehicleMapping.version);
  const color = model.colors.find((c) => c.id === vehicleMapping.color);

  return {
    modelName: model.name,
    versionName: version.name,
    colorName: color.name,
    fullName: `${model.name} ${version.name}`,
    price: version.price,
    model: model,
    version: version,
    color: color,
  };
};

// Helper function to get random vehicle for mock data
export const getRandomVehicle = () => {
  const models = Object.keys(mockPricebook);
  const randomModel = models[Math.floor(Math.random() * models.length)];
  const model = mockPricebook[randomModel];
  const randomVersion =
    model.versions[Math.floor(Math.random() * model.versions.length)];
  const randomColor =
    model.colors[Math.floor(Math.random() * model.colors.length)];

  return {
    modelName: model.name,
    versionName: randomVersion.name,
    colorName: randomColor.name,
    fullName: `${model.name} ${randomVersion.name}`,
    price: randomVersion.price,
    model: model,
    version: randomVersion,
    color: randomColor,
  };
};

export default mockPricebook;
