import { useQuery } from '@tanstack/react-query';
import { productsApi, ProductFilterParams } from '../api/products';
import { Product } from '../types';

export const useProducts = (params?: ProductFilterParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useProductDetail = (productId: string) => {
  return useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: () => productsApi.getProductById(productId),
    enabled: !!productId,
  });
};
