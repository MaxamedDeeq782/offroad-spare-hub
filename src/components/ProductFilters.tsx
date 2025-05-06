
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface ProductFiltersProps {
  selectedVehicle: string;
  searchTerm: string;
  handleVehicleChange: (vehicle: string) => void;
  handleSearchChange: (term: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  selectedVehicle,
  searchTerm,
  handleVehicleChange,
  handleSearchChange,
  hasActiveFilters,
  clearFilters
}) => {
  const vehicles = ['Toyota Hilux', 'Toyota Land Cruiser', 'Nissan Patrol', 'Mitsubishi L200'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="block font-medium mb-2">Search</label>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search products..."
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div className="mb-6">
          <label className="block font-medium mb-2">Vehicle</label>
          <select 
            value={selectedVehicle}
            onChange={(e) => handleVehicleChange(e.target.value)}
            className="w-full border rounded-md px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Vehicles</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle} value={vehicle}>
                {vehicle}
              </option>
            ))}
          </select>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="mt-4 text-primary hover:text-primary-dark"
          >
            Clear Filters
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductFilters;
