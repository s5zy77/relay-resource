import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rentalsApi } from '../api/rentals';
import { Rental } from '../types';

export const useRentals = (statusFilter?: string) => {
  const queryClient = useQueryClient();

  const rentalsQuery = useQuery<Rental[]>({
    queryKey: ['rentals', statusFilter],
    queryFn: () => rentalsApi.getMyRentals(statusFilter),
    staleTime: 1000 * 30, // 30s cache
  });

  const extendMutation = useMutation({
    mutationFn: ({ rentalId, newEndDate }: { rentalId: string; newEndDate: string }) =>
      rentalsApi.requestExtension(rentalId, newEndDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    }
  });

  const pickupMutation = useMutation({
    mutationFn: (rentalId: string) => rentalsApi.confirmPickup(rentalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    }
  });

  const returnMutation = useMutation({
    mutationFn: (rentalId: string) => rentalsApi.confirmReturn(rentalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
    }
  });

  return {
    rentals: rentalsQuery.data || [],
    isLoading: rentalsQuery.isLoading,
    isError: rentalsQuery.isError,
    refetch: rentalsQuery.refetch,
    extendRental: extendMutation.mutateAsync,
    confirmPickup: pickupMutation.mutateAsync,
    confirmReturn: returnMutation.mutateAsync,
    isExtending: extendMutation.isPending
  };
};

export const useRentalDetail = (rentalId: string) => {
  return useQuery<Rental>({
    queryKey: ['rental', rentalId],
    queryFn: () => rentalsApi.getRentalById(rentalId),
    enabled: !!rentalId
  });
};
