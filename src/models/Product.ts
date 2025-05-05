
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  vehicleCompatibility: string[];
  stock: number;
  featured?: boolean;
}

// Sample product data
export const products: Product[] = [
  {
    id: "p1",
    name: "Air Filter - Premium",
    description: "High-performance air filter for improved engine breathing and protection",
    price: 29.99,
    imageUrl: "/images/air-filter.jpg",
    category: "Filters",
    vehicleCompatibility: ["Toyota Hilux", "Toyota Land Cruiser"],
    stock: 45,
    featured: true
  },
  {
    id: "p2",
    name: "Brake Pads - Heavy Duty",
    description: "Durable brake pads designed for off-road conditions and heavy loads",
    price: 49.99,
    imageUrl: "/images/brake-pads.jpg",
    category: "Brakes",
    vehicleCompatibility: ["Toyota Hilux", "Nissan Patrol", "Mitsubishi L200"],
    stock: 30,
    featured: true
  },
  {
    id: "p3",
    name: "Oil Filter Kit",
    description: "Complete oil filter kit with gaskets and O-rings",
    price: 19.99,
    imageUrl: "/images/oil-filter.jpg",
    category: "Filters",
    vehicleCompatibility: ["Toyota Land Cruiser", "Nissan Patrol"],
    stock: 50
  },
  {
    id: "p4",
    name: "Shock Absorber - Front",
    description: "Heavy-duty front shock absorber for rough terrain",
    price: 89.99,
    imageUrl: "/images/shock-absorber.jpg",
    category: "Suspension",
    vehicleCompatibility: ["Toyota Hilux", "Mitsubishi L200"],
    stock: 20,
    featured: true
  },
  {
    id: "p5",
    name: "Timing Belt Kit",
    description: "Complete timing belt kit with tensioners",
    price: 129.99,
    imageUrl: "/images/timing-belt.jpg",
    category: "Engine",
    vehicleCompatibility: ["Toyota Land Cruiser", "Nissan Patrol"],
    stock: 15
  },
  {
    id: "p6",
    name: "Fuel Filter",
    description: "OEM quality fuel filter",
    price: 24.99,
    imageUrl: "/images/fuel-filter.jpg",
    category: "Filters",
    vehicleCompatibility: ["Toyota Hilux", "Toyota Land Cruiser", "Nissan Patrol", "Mitsubishi L200"],
    stock: 40
  },
  {
    id: "p7",
    name: "Drive Belt",
    description: "Premium quality drive belt",
    price: 34.99,
    imageUrl: "/images/drive-belt.jpg",
    category: "Engine",
    vehicleCompatibility: ["Toyota Hilux", "Mitsubishi L200"],
    stock: 25
  },
  {
    id: "p8",
    name: "Radiator Cap",
    description: "Pressure tested radiator cap",
    price: 12.99,
    imageUrl: "/images/radiator-cap.jpg",
    category: "Cooling",
    vehicleCompatibility: ["Toyota Hilux", "Toyota Land Cruiser", "Nissan Patrol", "Mitsubishi L200"],
    stock: 60
  }
];
