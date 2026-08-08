export interface RentalEvent {
  eventId: string;
  rentalId: string;
  type: string;
  status: string;
  customerContext?: any;
  urgency?: number;
  timeOfDay?: Date;
  previousAttempts?: number;
}

export interface CallDecision {
  shouldCall: boolean;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  scenario: string;
  delay?: number;
}

export class DecisionEngine {
  evaluate(event: RentalEvent): CallDecision {
    if (event.type === 'overdue') {
      return {
        shouldCall: true,
        reason: 'Rental is overdue',
        priority: 'high',
        scenario: 'overdue_collection'
      };
    }
    
    if (event.type === 'due_soon') {
      return {
        shouldCall: true,
        reason: 'Rental is due soon',
        priority: 'medium',
        scenario: 'return_reminder'
      };
    }

    if (event.type === 'pickup_ready') {
      return {
        shouldCall: true,
        reason: 'Ready for pickup',
        priority: 'medium',
        scenario: 'pickup_confirmation'
      };
    }

    return {
      shouldCall: false,
      reason: 'No actionable condition met',
      priority: 'low',
      scenario: 'none'
    };
  }

  processEvents(events: RentalEvent[]): CallDecision[] {
    return events.map(event => this.evaluate(event));
  }
}
