
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Brand {
  id: number;
  name: string;
}

interface BrandSelectorProps {
  selectedBrand: string;
  setSelectedBrand: (value: string) => void;
  isMobile: boolean;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({ selectedBrand, setSelectedBrand, isMobile }) => {
  const [brands, setBrands] = useState<Brand[]>([]);

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Fetch all brands from the database
  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase.from('brands').select('*');
      if (error) {
        console.error('Error fetching brands:', error);
        toast.error('Failed to load brands');
      } else {
        setBrands(data || []);
      }
    } catch (error) {
      console.error('Unexpected error fetching brands:', error);
      toast.error('An error occurred while loading brands');
    }
  };

  return (
    <div>
      <Label htmlFor="brand">Brand (Optional)</Label>
      <Select 
        value={selectedBrand} 
        onValueChange={setSelectedBrand}
      >
        <SelectTrigger id="brand">
          <SelectValue placeholder="Select a brand" />
        </SelectTrigger>
        <SelectContent position={isMobile ? "popper" : "item-aligned"}>
          {brands.map((brand) => (
            <SelectItem key={brand.id} value={brand.id.toString()}>
              {brand.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BrandSelector;
