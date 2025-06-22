
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
  return products.map(product => {
    const vehicleFromName = getVehicleFromProductName(product.name);
    const vehicleFromBrand = vehicleFromName || getVehicleFromBrand(product.brand_id, brands);
    
    return {
      ...product,
      vehicleType: vehicleFromBrand
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
  
  return Array.from(vehicleSet);
};

export const filterProducts = (
  processedProducts: DbProduct[],
  selectedVehicle: string,
  selectedPartId: string,
  searchTerm: string
): DbProduct[] => {
  return processedProducts.filter(product => {
    // Filter by vehicle type
    if (selectedVehicle && product.vehicleType !== selectedVehicle) {
      return false;
    }
    
    // Filter by vehicle type exists
    if (!product.vehicleType) {
      return false;
    }
    
    // Filter by specific part ID
    if (selectedPartId && product.name !== selectedPartId) {
      return false;
    }
    
    // Filter by search term
    if (!selectedPartId && searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
};
