
import React from 'react';
import { useProductFilters } from '../hooks/useProductFilters';
import ProductFilters from '../components/ProductFilters';
import ProductList from '../components/ProductList';

const ProductsPage: React.FC = () => {
  const {
    selectedVehicle,
    selectedPartId,
    searchTerm,
    loading,
    filteredDbProducts,
    getVehicleFromProductName,
    clearFilters,
    handleVehicleChange,
    handleSearchChange
  } = useProductFilters();

  const hasActiveFilters = !!(selectedVehicle || searchTerm || selectedPartId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {selectedVehicle ? `${selectedVehicle} Parts` : 'All Products'}
      </h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <div className="lg:w-1/4">
          <ProductFilters
            selectedVehicle={selectedVehicle}
            searchTerm={searchTerm}
            handleVehicleChange={handleVehicleChange}
            handleSearchChange={handleSearchChange}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
          />
        </div>
        
        {/* Product List */}
        <div className="lg:w-3/4">
          <ProductList
            products={filteredDbProducts}
            loading={loading}
            selectedVehicle={selectedVehicle}
            getVehicleFromProductName={getVehicleFromProductName}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
