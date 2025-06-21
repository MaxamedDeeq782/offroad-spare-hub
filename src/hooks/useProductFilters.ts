
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
    
    console.log('URL params:', { vehicleParam, partIdParam });
    
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
          console.log('Fetched products:', productsResponse.data);
          setDbProducts(productsResponse.data || []);
        }

        if (brandsResponse.error) {
          console.error('Error fetching brands:', brandsResponse.error);
        } else {
          console.log('Fetched brands:', brandsResponse.data);
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
      console.log('Available brands/vehicles:', availableBrands);
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
      console.log('Checking product name:', productName, 'lowercase:', lowercaseName);
      
      for (const [vehicle, keywords] of Object.entries(vehicleKeywords)) {
        if (keywords.some(keyword => lowercaseName.includes(keyword.toLowerCase()))) {
          console.log('Found vehicle match:', vehicle, 'for product:', productName);
          return vehicle;
        }
      }
      
      console.log('No vehicle match found for product:', productName);
      return '';
    };
  }, []);

  // Memoized helper function to determine vehicle from brand
  const getVehicleFromBrand = useMemo(() => {
    return (brandId: number | null): string => {
      if (!brandId) return '';
      
      const brand = brands.find(b => b.id === brandId);
      if (!brand) return '';
      
      console.log('Checking brand:', brand.name, 'for brand ID:', brandId);
      
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
      
      const result = brandVehicleMapping[brand.name] || '';
      console.log('Brand to vehicle mapping result:', result, 'for brand:', brand.name);
      return result;
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
      
      const result = Array.from(vehicleSet);
      console.log('Available vehicles from products:', result);
      return result;
    };
  }, [dbProducts, getVehicleCompatibility]);

  // Memoized filtered products for better performance
  const filteredDbProducts = useMemo(() => {
    console.log('Filtering products with:', { selectedVehicle, selectedPartId, searchTerm });
    
    const filtered = dbProducts.filter(product => {
      const productVehicle = getVehicleCompatibility(product);
      console.log('Product:', product.name, 'Vehicle:', productVehicle);
      
      if (selectedVehicle && productVehicle !== selectedVehicle) {
        console.log('Product filtered out - vehicle mismatch:', productVehicle, '!==', selectedVehicle);
        return false;
      }
      
      if (!productVehicle) {
        console.log('Product filtered out - no vehicle compatibility:', product.name);
        return false;
      }
      
      if (selectedPartId && product.name !== selectedPartId) {
        console.log('Product filtered out - part ID mismatch');
        return false;
      }
      
      if (!selectedPartId && searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        console.log('Product filtered out - search term mismatch');
        return false;
      }
      
      console.log('Product passed all filters:', product.name);
      return true;
    });
    
    console.log('Final filtered products:', filtered.length, 'out of', dbProducts.length);
    return filtered;
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
