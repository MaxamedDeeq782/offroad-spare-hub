
import { useEffect, useMemo } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { useUrlParams } from './useUrlParams';
import { processProductsWithVehicleTypes, getAvailableVehicles, filterProducts, DbProduct } from '../utils/productProcessing';
import { getSpecificPartForVehicle } from '../utils/vehicleDetection';

export const useProductFilters = () => {
  const { dbProducts, brands, loading } = useSupabaseData();
  const {
    selectedVehicle,
    selectedPartId,
    searchTerm,
    setSelectedVehicle,
    setSelectedPartId,
    setSearchTerm
  } = useUrlParams();

  console.log('=== PRODUCT FILTERS DEBUG ===');
  console.log('Raw dbProducts from useSupabaseData:', dbProducts);
  console.log('Raw brands from useSupabaseData:', brands);
  console.log('Loading state:', loading);

  // Pre-process products with cached vehicle types
  const processedProducts = useMemo(() => {
    console.log('Processing products with vehicle types...');
    const processed = processProductsWithVehicleTypes(dbProducts, brands);
    console.log('Processed products:', processed);
    return processed;
  }, [dbProducts, brands]);

  // Set default vehicle selection when products are loaded (only if no search term)
  useEffect(() => {
    if (!loading && processedProducts.length > 0 && !selectedVehicle && !searchTerm) {
      const availableVehicles = getAvailableVehicles(processedProducts);
      console.log('Available vehicles:', availableVehicles);
      
      if (availableVehicles.length > 0) {
        console.log('Setting default vehicle to:', availableVehicles[0]);
        setSelectedVehicle(availableVehicles[0]);
      }
    }
  }, [loading, processedProducts, selectedVehicle, searchTerm, setSelectedVehicle]);

  // Optimized filtered products
  const filteredDbProducts = useMemo(() => {
    console.log('Filtering products...');
    console.log('Selected vehicle:', selectedVehicle);
    console.log('Selected part ID:', selectedPartId);
    console.log('Search term:', searchTerm);
    
    const filtered = filterProducts(processedProducts, selectedVehicle, selectedPartId, searchTerm);
    console.log('Filtered products result:', filtered);
    console.log('Number of filtered products:', filtered.length);
    return filtered;
  }, [processedProducts, selectedVehicle, selectedPartId, searchTerm]);

  // Memoized function to get available brands
  const getAvailableBrands = useMemo(() => {
    return (): string[] => {
      return getAvailableVehicles(processedProducts);
    };
  }, [processedProducts]);

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

  // Simple vehicle compatibility function for compatibility
  const getVehicleFromProductName = (product: DbProduct): string => {
    const processedProduct = processedProducts.find(p => p.id === product.id);
    return processedProduct?.vehicleType || '';
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
