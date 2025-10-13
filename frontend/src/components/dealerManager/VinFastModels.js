// VinFast Models Data
export const vinfastModels = [
  {
    id: "vf5",
    name: "VinFast VF5",
    category: "SUV",
    price: "₫600,000,000",
    description: "SUV cỡ nhỏ, phù hợp cho gia đình",
    image: "/images/vinfast-vf5.jpg",
    specs: {
      engine: "Electric",
      range: "300km",
      seats: "5",
      battery: "42.3 kWh",
    },
  },
  {
    id: "vf6",
    name: "VinFast VF6",
    category: "SUV",
    price: "₫800,000,000",
    description: "SUV cỡ trung, thiết kế hiện đại",
    image: "/images/vinfast-vf6.jpg",
    specs: {
      engine: "Electric",
      range: "400km",
      seats: "5",
      battery: "56.3 kWh",
    },
  },
  {
    id: "vf7",
    name: "VinFast VF7",
    category: "SUV",
    price: "₫1,500,000,000",
    description: "SUV cỡ lớn, sang trọng và tiện nghi",
    image: "/images/vinfast-vf7.jpg",
    specs: {
      engine: "Electric",
      range: "500km",
      seats: "7",
      battery: "70.2 kWh",
    },
  },
  {
    id: "vf8",
    name: "VinFast VF8",
    category: "SUV",
    price: "₫1,200,000,000",
    description: "SUV cao cấp, công nghệ tiên tiến",
    image: "/images/vinfast-vf8.jpg",
    specs: {
      engine: "Electric",
      range: "450km",
      seats: "5",
      battery: "63.2 kWh",
    },
  },
  {
    id: "vf9",
    name: "VinFast VF9",
    category: "SUV",
    price: "₫1,800,000,000",
    description: "SUV flagship, đẳng cấp cao nhất",
    image: "/images/vinfast-vf9.jpg",
    specs: {
      engine: "Electric",
      range: "600km",
      seats: "7",
      battery: "90.0 kWh",
    },
  },
  {
    id: "vf3",
    name: "VinFast VF3",
    category: "Hatchback",
    price: "₫400,000,000",
    description: "Xe hatchback nhỏ gọn, tiết kiệm",
    image: "/images/vinfast-vf3.jpg",
    specs: {
      engine: "Electric",
      range: "250km",
      seats: "4",
      battery: "32.0 kWh",
    },
  },
];

// Helper functions
export const getModelById = (id) => {
  return vinfastModels.find((model) => model.id === id);
};

export const getModelsByCategory = (category) => {
  return vinfastModels.filter((model) => model.category === category);
};

export const getAllCategories = () => {
  return [...new Set(vinfastModels.map((model) => model.category))];
};
