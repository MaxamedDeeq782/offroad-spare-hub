
import { Brand } from './productProcessing';

// Vehicle brand mapping - maps brand IDs to vehicle types
const BRAND_TO_VEHICLE_MAP: Record<number, string> = {
  1: "Toyota Hilux",
  2: "Toyota Land Cruiser", 
  3: "Nissan Patrol",
  4: "Mitsubishi L200"
};

// Enhanced function to get vehicle from product name
export const getVehicleFromProductName = (productName: string): string => {
  const nameLower = productName.toLowerCase();
  
  // Direct name matching for existing products
  if (nameLower.includes("toyota hilux") || nameLower.includes("hilux")) {
    return "Toyota Hilux";
  }
  
  if (nameLower.includes("land cruiser") || nameLower.includes("landcruiser")) {
    return "Toyota Land Cruiser";
  }
  
  if (nameLower.includes("nissan patrol") || nameLower.includes("patrol")) {
    return "Nissan Patrol";
  }
  
  if (nameLower.includes("mitsubishi l200") || nameLower.includes("l200")) {
    return "Mitsubishi L200";
  }
  
  // Fallback for brand mentions
  if (nameLower.includes("toyota")) {
    return "Toyota Hilux"; // Default Toyota to Hilux
  }
  
  if (nameLower.includes("nissan")) {
    return "Nissan Patrol";
  }
  
  if (nameLower.includes("mitsubishi")) {
    return "Mitsubishi L200";
  }
  
  return "";
};

// Enhanced function to get vehicle from brand ID
export const getVehicleFromBrand = (brandId: number | null, brands: Brand[]): string => {
  if (!brandId) return "";
  
  // First check our predefined mapping
  if (BRAND_TO_VEHICLE_MAP[brandId]) {
    return BRAND_TO_VEHICLE_MAP[brandId];
  }
  
  // Fallback to brand name matching
  const brand = brands.find(b => b.id === brandId);
  if (!brand) return "";
  
  const brandNameLower = brand.name.toLowerCase();
  
  if (brandNameLower.includes("toyota hilux") || brandNameLower.includes("hilux")) {
    return "Toyota Hilux";
  }
  
  if (brandNameLower.includes("land cruiser") || brandNameLower.includes("landcruiser")) {
    return "Toyota Land Cruiser";
  }
  
  if (brandNameLower.includes("nissan patrol") || brandNameLower.includes("patrol")) {
    return "Nissan Patrol";
  }
  
  if (brandNameLower.includes("mitsubishi l200") || brandNameLower.includes("l200")) {
    return "Mitsubishi L200";
  }
  
  // Generic brand matching
  if (brandNameLower.includes("toyota")) {
    return "Toyota Hilux"; // Default Toyota to Hilux
  }
  
  if (brandNameLower.includes("nissan")) {
    return "Nissan Patrol";
  }
  
  if (brandNameLower.includes("mitsubishi")) {
    return "Mitsubishi L200";
  }
  
  return "";
};

// Function to get specific part suggestions for a vehicle
export const getSpecificPartForVehicle = (vehicle: string): string => {
  const suggestions: Record<string, string[]> = {
    "Toyota Hilux": ["Air Filter", "Oil Filter", "Brake Pads", "Shock Absorber"],
    "Toyota Land Cruiser": ["Tie Rod End Kit", "Timing Belt", "Radiator"],
    "Nissan Patrol": ["Radiator", "Brake Pads", "Air Filter"],
    "Mitsubishi L200": ["Exhaust Pipe Kit", "Oil Filter", "Drive Belt"]
  };
  
  const parts = suggestions[vehicle];
  return parts ? parts[0] : "";
};
