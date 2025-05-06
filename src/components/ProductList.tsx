
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import ProductTable from './ProductTable';

interface DbProduct {
  id: number;
  name: string;
  price: number;
  image_url: string;
  brand_id: number | null;
}

interface ProductListProps {
  products: DbProduct[];
  loading: boolean;
  selectedVehicle: string;
  getVehicleFromProductName: (name: string) => string;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  selectedVehicle,
  getVehicleFromProductName
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductTable
          products={products}
          loading={loading}
          selectedVehicle={selectedVehicle}
          getVehicleFromProductName={getVehicleFromProductName}
        />
      </CardContent>
    </Card>
  );
};

export default ProductList;
