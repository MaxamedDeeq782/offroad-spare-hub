
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useUrlParams = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
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

  return {
    selectedVehicle,
    selectedPartId,
    searchTerm,
    setSelectedVehicle,
    setSelectedPartId,
    setSearchTerm
  };
};
