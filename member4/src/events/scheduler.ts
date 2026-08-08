import cron from 'node-cron';
import member3Client from '../integrations/member3Client';
import { DecisionEngine } from '../workflows/decisionEngine';
import taskQueue from './taskQueue';

export class EventScheduler {
  private cronTask: cron.ScheduledTask | null = null;
  private decisionEngine = new DecisionEngine();

  start(cronExpression: string = '*/5 * * * *') {
    if (this.cronTask) return;

    this.cronTask = cron.schedule(cronExpression, async () => {
      console.log('[EventScheduler] Running scheduled scan for overdue and due-today rentals...');
      await this.scanNow();
    });

    console.log(`[EventScheduler] Started background scanner with cron: ${cronExpression}`);
  }

  stop() {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
      console.log('[EventScheduler] Stopped background scanner.');
    }
  }

  async scanNow() {
    try {
      const overdue: any = await member3Client.getOverdueRentals();
      const dueToday: any = await member3Client.getDueTodayRentals();

      const events: any[] = [];

      if (Array.isArray(overdue)) {
        overdue.forEach((item: any) => {
          events.push({
            eventId: `evt_overdue_${item._id || item.id}`,
            rentalId: item._id || item.id,
            type: 'overdue',
            status: item.status,
            customerContext: { phone: item.customerPhone || item.phone },
            urgency: 9,
          });
        });
      }

      if (Array.isArray(dueToday)) {
        dueToday.forEach((item: any) => {
          events.push({
            eventId: `evt_duetoday_${item._id || item.id}`,
            rentalId: item._id || item.id,
            type: 'due_soon',
            status: item.status,
            customerContext: { phone: item.customerPhone || item.phone },
            urgency: 6,
          });
        });
      }

      for (const event of events) {
        const decision = this.decisionEngine.evaluate(event);
        if (decision.shouldCall && event.customerContext?.phone) {
          taskQueue.enqueue({
            rentalId: event.rentalId,
            customerId: event.customerContext.customerId || 'cust_demo',
            phoneNumber: event.customerContext.phone,
            scenario: decision.scenario,
            priority: decision.priority,
          });
          console.log(`[EventScheduler] Queued call job for rental ${event.rentalId}`);
        }
      }
    } catch (error) {
      console.error('[EventScheduler] Error scanning rentals:', error);
    }
  }
}

export default new EventScheduler();
