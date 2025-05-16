
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VehicleSelectorProps {
  selectedVehicle: string;
  setSelectedVehicle: (value: string) => void;
  vehicleTypes: string[];
  isMobile: boolean;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({ 
  selectedVehicle, 
  setSelectedVehicle, 
  vehicleTypes,
  isMobile 
}) => {
  return (
    <div>
      <Label htmlFor="vehicle-type">Vehicle Type</Label>
      <Select 
        value={selectedVehicle} 
        onValueChange={setSelectedVehicle}
      >
        <SelectTrigger id="vehicle-type">
          <SelectValue placeholder="Select vehicle type" />
        </SelectTrigger>
        <SelectContent position={isMobile ? "popper" : "item-aligned"}>
          {vehicleTypes.map((vehicle) => (
            <SelectItem key={vehicle} value={vehicle}>
              {vehicle}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VehicleSelector;
