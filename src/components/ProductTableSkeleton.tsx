
import React from 'react';
import { Skeleton } from './ui/skeleton';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';

const ProductTableSkeleton: React.FC = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Image</TableHead>
          <TableHead>Product Name</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="w-24 h-24 md:w-32 md:h-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-32" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-4 w-16 ml-auto" />
            </TableCell>
            <TableCell className="text-right">
              <Skeleton className="h-10 w-28 ml-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProductTableSkeleton;
