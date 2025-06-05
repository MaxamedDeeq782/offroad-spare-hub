
import { useState, useEffect, useMemo } from 'react';
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

  // Fetch products and brands from Supabase with optimization
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch both products and brands in parallel for better performance
        const [productsResponse, brandsResponse] = await Promise.all([
          supabase
            .from('products')
            .select('id, name, price, image_url, brand_id')
            .order('name'),
          supabase
            .from('brands')
            .select('id, name')
            .order('name')
        ]);
        
        if (productsResponse.error) {
          console.error('Error fetching products:', productsResponse.error);
        } else {
          setDbProducts(productsResponse.data || []);
        }

        if (brandsResponse.error) {
          console.error('Error fetching brands:', brandsResponse.error);
        } else {
          setBrands(brandsResponse.data || []);
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

  // Memoized helper function to determine vehicle from product name
  const getVehicleFromProductName = useMemo(() => {
    return (productName: string): string => {
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
  }, []);

  // Memoized helper function to determine vehicle from brand
  const getVehicleFromBrand = useMemo(() => {
    return (brandId: number | null): string => {
      if (!brandId) return '';
      
      const brand = brands.find(b => b.id === brandId);
      if (!brand) return '';
      
      const brandVehicleMapping: Record<string, string> = {
        'Toyota': 'Toyota Hilux',
        'Nissan': 'Nissan Patrol',
        'Mitsubishi': 'Mitsubishi L200'
      };
      
      const brandName = brand.name.toLowerCase();
      if (brandName.includes('hilux')) return 'Toyota Hilux';
      if (brandName.includes('land cruiser')) return 'Toyota Land Cruiser';
      if (brandName.includes('patrol')) return 'Nissan Patrol';
      if (brandName.includes('l200')) return 'Mitsubishi L200';
      
      return brandVehicleMapping[brand.name] || '';
    };
  }, [brands]);

  // Memoized enhanced function to get vehicle compatibility
  const getVehicleCompatibility = useMemo(() => {
    return (product: DbProduct): string => {
      const vehicleFromName = getVehicleFromProductName(product.name);
      if (vehicleFromName) return vehicleFromName;
      
      return getVehicleFromBrand(product.brand_id);
    };
  }, [getVehicleFromProductName, getVehicleFromBrand]);

  // Memoized function to map specific part IDs to their corresponding vehicles
  const getSpecificPartForVehicle = useMemo(() => {
    return (vehicle: string): string => {
      const partMap: Record<string, string> = {
        'Toyota Hilux': 'Toyota Hilux Gearbox 5-Speed Manual',
        'Toyota Land Cruiser': 'Tie Rod End Kit for Toyota Land Cruiser FJ80 FzJ80 91-97 Lexus LX450',
        'Nissan Patrol': 'Fit Nissan Patrol Y62 & Armada 5.6L 8 Cyl AT 2010 - 2023 aluminum radiator',
        'Mitsubishi L200': 'Exhaust Pipe Kit Full System for MITSUBISHI L200 2.5L Diesel'
      };
      
      return partMap[vehicle] || '';
    };
  }, []);

  // Memoized available brands calculation
  const getAvailableBrands = useMemo(() => {
    return (): string[] => {
      const vehicleSet = new Set<string>();
      
      dbProducts.forEach(product => {
        const vehicleType = getVehicleCompatibility(product);
        if (vehicleType) {
          vehicleSet.add(vehicleType);
        }
      });
      
      return Array.from(vehicleSet);
    };
  }, [dbProducts, getVehicleCompatibility]);

  // Memoized filtered products for better performance
  const filteredDbProducts = useMemo(() => {
    return dbProducts.filter(product => {
      const productVehicle = getVehicleCompatibility(product);
      
      if (selectedVehicle && productVehicle !== selectedVehicle) {
        return false;
      }
      
      if (!productVehicle) {
        return false;
      }
      
      if (selectedPartId && product.name !== selectedPartId) {
        return false;
      }
      
      if (!selectedPartId && searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [dbProducts, selectedVehicle, selectedPartId, searchTerm, getVehicleCompatibility]);

  const clearFilters = () => {
    const availableBrands = getAvailableBrands();
    setSelectedVehicle(availableBrands.length > 0 ? availableBrands[0] : '');
    setSelectedPartId('');
    setSearchTerm('');
  };

  const handleVehicleChange = (newVehicle: string) => {
    setSelectedVehicle(newVehicle);
    
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
