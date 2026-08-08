import { rentalsApi } from '../api/rentals';
import { Rental } from '../types';

export const handleRentalExtensionRequest = async (
  rentalId: string,
  newEndDate: string
): Promise<{ success: boolean; rental: Rental; additionalCost: number }> => {
  const result = await rentalsApi.requestExtension(rentalId, newEndDate);
  return {
    success: result.success,
    rental: result.rental,
    additionalCost: result.additionalAmount
  };
};
