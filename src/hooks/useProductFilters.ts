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

export const useProductFilters = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
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
      setSearchTerm(partIdParam); // Also set the search term to the part ID for filtering
    }
  }, [location.search]);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) {
          console.error('Error fetching products:', error);
        } else {
          setDbProducts(data || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Set default vehicle selection when products are loaded
  useEffect(() => {
    if (!loading && dbProducts.length > 0 && !selectedVehicle) {
      const brands = getAvailableBrands();
      if (brands.length > 0) {
        setSelectedVehicle(brands[0]);
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
    const brands = new Set<string>();
    
    dbProducts.forEach(product => {
      const vehicleType = getVehicleFromProductName(product.name);
      if (vehicleType) {
        brands.add(vehicleType);
      }
    });
    
    return Array.from(brands);
  };

  // Filter database products based on selected vehicle and specific part or search term
  const filteredDbProducts = dbProducts.filter(product => {
    const productVehicle = getVehicleFromProductName(product.name);
    
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
    const brands = getAvailableBrands();
    setSelectedVehicle(brands.length > 0 ? brands[0] : '');
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
    getVehicleFromProductName,
    getAvailableBrands,
    clearFilters,
    handleVehicleChange,
    handleSearchChange
  };
};
