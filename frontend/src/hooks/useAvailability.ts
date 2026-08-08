import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/products';

export const useAvailability = (productId: string, variantId?: string) => {
  const defaultStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const durationDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return 0;
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const isValidRange = durationDays > 0;

  const availabilityQuery = useQuery({
    queryKey: ['availability', productId, startDate, endDate, variantId],
    queryFn: () => productsApi.checkAvailability(productId, startDate, endDate, variantId),
    enabled: !!productId && isValidRange,
  });

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    durationDays,
    isValidRange,
    isAvailable: availabilityQuery.data?.isAvailable ?? true,
    availableStock: availabilityQuery.data?.availableStock ?? 1,
    estimatedRentalPrice: availabilityQuery.data?.estimatedRentalPrice ?? 0,
    securityDeposit: availabilityQuery.data?.securityDeposit ?? 0,
    isLoading: availabilityQuery.isLoading
  };
};
