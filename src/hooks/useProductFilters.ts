
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

interface DbProduct {
  id: number;
  name: string;
  price: number;
  image_url: string;
  brand_id: number | null;
}

interface Brand {
  id: number;
  name: string;
}

export const useProductFilters = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Check if a vehicle and specific part was selected from the homepage
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const vehicleParam = queryParams.get('vehicle');
    const partIdParam = queryParams.get('partId');
    
    if (vehicleParam) {
      setSelectedVehicle(vehicleParam);
    }
    
    if (partIdParam) {
      setSelectedPartId(partIdParam);
      setSearchTerm(partIdParam);
    }
  }, [location.search]);

  // Fetch products and brands from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');
        
        if (productsError) {
          console.error('Error fetching products:', productsError);
        } else {
          setDbProducts(productsData || []);
        }

        // Fetch brands
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('*');
        
        if (brandsError) {
          console.error('Error fetching brands:', brandsError);
        } else {
          setBrands(brandsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set default vehicle selection when products are loaded
  useEffect(() => {
    if (!loading && dbProducts.length > 0 && !selectedVehicle) {
      const availableBrands = getAvailableBrands();
      if (availableBrands.length > 0) {
        setSelectedVehicle(availableBrands[0]);
      }
    }
  }, [loading, dbProducts]);

  // Helper function to determine vehicle from product name for database products
  const getVehicleFromProductName = (productName: string): string => {
    const vehicleKeywords = {
      'Toyota Hilux': ['hilux', 'toyota hilux'],
      'Toyota Land Cruiser': ['land cruiser', 'toyota land cruiser', 'fj80', 'fzj80'],
      'Nissan Patrol': ['patrol', 'nissan patrol', 'y62', 'armada'],
      'Mitsubishi L200': ['l200', 'mitsubishi l200']
    };

    const lowercaseName = productName.toLowerCase();
    
    for (const [vehicle, keywords] of Object.entries(vehicleKeywords)) {
      if (keywords.some(keyword => lowercaseName.includes(keyword.toLowerCase()))) {
        return vehicle;
      }
    }
    
    return '';
  };

  // Helper function to determine vehicle from brand
  const getVehicleFromBrand = (brandId: number | null): string => {
    if (!brandId) return '';
    
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return '';
    
    const brandVehicleMapping: Record<string, string> = {
      'Toyota': 'Toyota Hilux', // Default to Hilux for Toyota
      'Nissan': 'Nissan Patrol',
      'Mitsubishi': 'Mitsubishi L200'
    };
    
    // Check if brand name contains specific vehicle indicators
    const brandName = brand.name.toLowerCase();
    if (brandName.includes('hilux')) return 'Toyota Hilux';
    if (brandName.includes('land cruiser')) return 'Toyota Land Cruiser';
    if (brandName.includes('patrol')) return 'Nissan Patrol';
    if (brandName.includes('l200')) return 'Mitsubishi L200';
    
    return brandVehicleMapping[brand.name] || '';
  };

  // Enhanced function to get vehicle compatibility
  const getVehicleCompatibility = (product: DbProduct): string => {
    // First try to get vehicle from product name
    const vehicleFromName = getVehicleFromProductName(product.name);
    if (vehicleFromName) return vehicleFromName;
    
    // If not found in name, try to get from brand
    return getVehicleFromBrand(product.brand_id);
  };

  // Map specific part IDs to their corresponding vehicles
  const getSpecificPartForVehicle = (vehicle: string): string => {
    const partMap: Record<string, string> = {
      'Toyota Hilux': 'Toyota Hilux Gearbox 5-Speed Manual',
      'Toyota Land Cruiser': 'Tie Rod End Kit for Toyota Land Cruiser FJ80 FzJ80 91-97 Lexus LX450',
      'Nissan Patrol': 'Fit Nissan Patrol Y62 & Armada 5.6L 8 Cyl AT 2010 - 2023 aluminum radiator',
      'Mitsubishi L200': 'Exhaust Pipe Kit Full System for MITSUBISHI L200 2.5L Diesel'
    };
    
    return partMap[vehicle] || '';
  };

  // Get available brands with products
  const getAvailableBrands = (): string[] => {
    const vehicleSet = new Set<string>();
    
    dbProducts.forEach(product => {
      const vehicleType = getVehicleCompatibility(product);
      if (vehicleType) {
        vehicleSet.add(vehicleType);
      }
    });
    
    return Array.from(vehicleSet);
  };

  // Filter database products based on selected vehicle and specific part or search term
  const filteredDbProducts = dbProducts.filter(product => {
    const productVehicle = getVehicleCompatibility(product);
    
    // Filter by selected vehicle (now required)
    if (selectedVehicle && productVehicle !== selectedVehicle) {
      return false;
    }
    
    // Only display products that have a recognized vehicle type
    if (!productVehicle) {
      return false;
    }
    
    // If a specific part ID is selected, check if the product name matches exactly
    if (selectedPartId && product.name !== selectedPartId) {
      return false;
    }
    
    // If no specific part ID is selected but search term exists, filter by search term
    if (!selectedPartId && searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const clearFilters = () => {
    // Instead of clearing vehicle to empty string, set it to the first available brand
    const availableBrands = getAvailableBrands();
    setSelectedVehicle(availableBrands.length > 0 ? availableBrands[0] : '');
    setSelectedPartId('');
    setSearchTerm('');
  };

  const handleVehicleChange = (newVehicle: string) => {
    setSelectedVehicle(newVehicle);
    
    // If a vehicle is selected, automatically set the part ID for that vehicle
    if (newVehicle) {
      const specificPart = getSpecificPartForVehicle(newVehicle);
      setSelectedPartId(specificPart);
      setSearchTerm(specificPart);
    } else {
      setSelectedPartId('');
      setSearchTerm('');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Clear selected part ID when search term is manually changed
    if (selectedPartId && value !== selectedPartId) {
      setSelectedPartId('');
    }
  };

  return {
    selectedVehicle,
    selectedPartId,
    searchTerm,
    loading,
    filteredDbProducts,
    getVehicleFromProductName: getVehicleCompatibility,
    getAvailableBrands,
    clearFilters,
    handleVehicleChange,
    handleSearchChange
  };
};
