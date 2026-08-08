export function RETURN_REMINDER_CONTEXT(rental: any): string {
  return `This is a return reminder call.
The customer rented a ${rental.productName}.
It is due back on ${rental.dueDate}.
Your goal is to gently remind them of the upcoming return date and offer an extension if they need more time.`;
}

export function OVERDUE_COLLECTION_CONTEXT(rental: any, lateFee: number): string {
  return `This is an overdue collection call.
The customer rented a ${rental.productName} which was due on ${rental.dueDate}.
It is currently overdue.
The accumulated late fee is ₹${lateFee}.
Your goal is to ask when they plan to return the item and inform them of the late fee politely.`;
}

export function PICKUP_CONFIRMATION_CONTEXT(rental: any): string {
  return `This is a pickup confirmation call.
The customer has a reservation for a ${rental.productName}.
The scheduled pickup is on ${rental.pickupDate}.
Your goal is to confirm they are still coming to pick up the item and see if they have any questions.`;
}

export function EXTENSION_OFFER_CONTEXT(rental: any): string {
  return `This is an extension offer call.
The customer rented a ${rental.productName}, due on ${rental.dueDate}.
Your goal is to offer them a special rate if they choose to extend the rental for another week or month.`;
}
