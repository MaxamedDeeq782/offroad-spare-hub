
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { DbProduct, Brand } from '../utils/productProcessing';

export const useSupabaseData = () => {
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('=== FETCHING DATA FOR FRONTEND ===');
        
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
        
        console.log('Raw products response:', productsResponse);
        console.log('Raw brands response:', brandsResponse);
        
        if (productsResponse.error) {
          console.error('Error fetching products:', productsResponse.error);
        } else {
          console.log('Products fetched successfully:', productsResponse.data);
          console.log('Number of products:', productsResponse.data?.length || 0);
          setDbProducts(productsResponse.data || []);
        }

        if (brandsResponse.error) {
          console.error('Error fetching brands:', brandsResponse.error);
        } else {
          console.log('Brands fetched successfully:', brandsResponse.data);
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

  return { dbProducts, brands, loading };
};
