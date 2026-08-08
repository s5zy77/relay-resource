export const calculateLateFee = (
  dueDate: Date,
  actualReturnDate: Date,
  basePricePerDay: number,
  gracePeriodHours: number = 2
): number => {
  const diffTime = actualReturnDate.getTime() - dueDate.getTime();
  
  // If returned before due date or within grace period, no late fee
  if (diffTime <= gracePeriodHours * 3600000) {
    return 0;
  }

  // Calculate hours late beyond the grace period
  const hoursLate = diffTime / 3600000;
  
  // Example rule: 10% of base price per day for every hour late, capped at 100% of base price per day
  const hourlyRate = basePricePerDay * 0.10;
  let lateFee = hoursLate * hourlyRate;
  
  // Cap at 2x base price for extreme cases, just an example rule
  if (lateFee > basePricePerDay * 2) {
    lateFee = basePricePerDay * 2;
  }

  return Math.round(lateFee * 100) / 100; // Round to 2 decimal places
};

export const calculateDepositSettlement = (
  originalDeposit: number,
  lateFee: number,
  damageDeduction: number,
  otherDeductions: number
): { refundAmount: number; requiresApproval: boolean } => {
  const totalDeductions = lateFee + damageDeduction + otherDeductions;
  let refundAmount = originalDeposit - totalDeductions;
  
  if (refundAmount < 0) refundAmount = 0; // Or handle negative as balance due

  // If deductions are more than 50% of the deposit, flag for manager approval
  const requiresApproval = totalDeductions > (originalDeposit * 0.5);

  return { refundAmount, requiresApproval };
};
