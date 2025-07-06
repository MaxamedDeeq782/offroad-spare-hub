
import { getVehicleFromProductName, getVehicleFromBrand } from './vehicleDetection';

export interface DbProduct {
  id: number;
  name: string;
  price: number;
  image_url: string;
  brand_id: number | null;
  vehicleType?: string;
}

export interface Brand {
  id: number;
  name: string;
}

export const processProductsWithVehicleTypes = (
  products: DbProduct[], 
  brands: Brand[]
): DbProduct[] => {
  console.log('Processing products with vehicle types...');
  console.log('Products:', products);
  console.log('Brands:', brands);
  
  return products.map(product => {
    // First try to get vehicle from product name
    let vehicleFromName = getVehicleFromProductName(product.name);
    
    // If not found in name, use brand ID mapping (this is crucial for new products)
    let vehicleFromBrand = "";
    if (!vehicleFromName && product.brand_id) {
      vehicleFromBrand = getVehicleFromBrand(product.brand_id, brands);
    }
    
    // Use the best match
    const finalVehicleType = vehicleFromName || vehicleFromBrand;
    
    console.log(`Product ${product.id} (${product.name}) - Brand ID: ${product.brand_id}, Vehicle: ${finalVehicleType}`);
    
    return {
      ...product,
      vehicleType: finalVehicleType
    };
  });
};

export const getAvailableVehicles = (processedProducts: DbProduct[]): string[] => {
  const vehicleSet = new Set<string>();
  
  processedProducts.forEach(product => {
    if (product.vehicleType) {
      vehicleSet.add(product.vehicleType);
    }
  });
  
  const vehicles = Array.from(vehicleSet).sort();
  console.log('Available vehicles:', vehicles);
  return vehicles;
};

export const filterProducts = (
  processedProducts: DbProduct[],
  selectedVehicle: string,
  selectedPartId: string,
  searchTerm: string
): DbProduct[] => {
  console.log('Filtering products...');
  console.log('Selected vehicle:', selectedVehicle);
  console.log('Search term:', searchTerm);
  
  const filtered = processedProducts.filter(product => {
    // For global search (when no specific vehicle is selected)
    if (searchTerm && !selectedVehicle && !selectedPartId) {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.vehicleType && product.vehicleType.toLowerCase().includes(searchLower))
      );
    }
    
    // Filter by vehicle type when vehicle is selected
    if (selectedVehicle && product.vehicleType !== selectedVehicle) {
      console.log(`Product ${product.name} filtered out: ${product.vehicleType} !== ${selectedVehicle}`);
      return false;
    }
    
    // Filter by specific part ID
    if (selectedPartId && product.name !== selectedPartId) {
      return false;
    }
    
    // Filter by search term within selected vehicle
    if (!selectedPartId && searchTerm && selectedVehicle && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  console.log(`Filtered ${filtered.length} products from ${processedProducts.length} total`);
  return filtered;
};
