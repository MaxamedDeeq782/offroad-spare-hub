
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
  required?: boolean;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({ 
  selectedBrand, 
  setSelectedBrand, 
  isMobile, 
  required = false 
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Fetch all brands from the database
  const fetchBrands = async () => {
    console.log('=== FETCHING BRANDS ===');
    setLoading(true);
    
    try {
      // Check authentication first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Current user for brands fetch:', user?.email || 'Not authenticated');
      
      if (authError) {
        console.error('Auth error when fetching brands:', authError);
      }

      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('name');
        
      console.log('Brands fetch response:', { data, error });
      
      if (error) {
        console.error('Error fetching brands:', error);
        console.error('Error details:', error.message, error.code);
        toast.error(`Failed to load brands: ${error.message}`);
      } else {
        console.log(`Successfully fetched ${data?.length || 0} brands:`, data);
        setBrands(data || []);
        
        if (!data || data.length === 0) {
          console.warn('No brands found in database');
          toast.error('No brands available. Please add some brands first.');
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching brands:', error);
      toast.error('An error occurred while loading brands');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandChange = (value: string) => {
    console.log('=== BRAND SELECTION ===');
    console.log('Brand selected value:', value);
    console.log('Brand selected type:', typeof value);
    const selectedBrandData = brands.find(brand => brand.id.toString() === value);
    console.log('Selected brand data:', selectedBrandData);
    console.log('Setting selectedBrand to:', value);
    setSelectedBrand(value);
  };

  if (loading) {
    return (
      <div>
        <Label htmlFor="brand">Brand {required && '*'}</Label>
        <Select disabled>
          <SelectTrigger id="brand">
            <SelectValue placeholder="Loading brands..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor="brand">Brand {required && '*'}</Label>
      <Select 
        value={selectedBrand} 
        onValueChange={handleBrandChange}
        required={required}
      >
        <SelectTrigger id="brand">
          <SelectValue placeholder={brands.length > 0 ? "Select a brand" : "No brands available"} />
        </SelectTrigger>
        <SelectContent position={isMobile ? "popper" : "item-aligned"}>
          {brands.length > 0 ? (
            brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="" disabled>
              No brands available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {brands.length === 0 && (
        <p className="text-sm text-red-500 mt-1">
          No brands found. Please contact admin to add brands.
        </p>
      )}
      {selectedBrand && brands.length > 0 && (
        <p className="text-sm text-green-600 mt-1">
          Selected: {brands.find(b => b.id.toString() === selectedBrand)?.name}
        </p>
      )}
      <div className="text-xs text-gray-500 mt-1">
        Debug: Selected brand value = "{selectedBrand}" (type: {typeof selectedBrand})
      </div>
    </div>
  );
};

export default BrandSelector;
