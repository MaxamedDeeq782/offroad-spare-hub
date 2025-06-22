
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

  // Pre-process products with cached vehicle types
  const processedProducts = useMemo(() => {
    return processProductsWithVehicleTypes(dbProducts, brands);
  }, [dbProducts, brands]);

  // Set default vehicle selection when products are loaded
  useEffect(() => {
    if (!loading && processedProducts.length > 0 && !selectedVehicle) {
      const availableVehicles = getAvailableVehicles(processedProducts);
      
      if (availableVehicles.length > 0) {
        setSelectedVehicle(availableVehicles[0]);
      }
    }
  }, [loading, processedProducts, selectedVehicle, setSelectedVehicle]);

  // Optimized filtered products
  const filteredDbProducts = useMemo(() => {
    return filterProducts(processedProducts, selectedVehicle, selectedPartId, searchTerm);
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
