import { CONFIG } from '../../config/env';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'canceled';

export interface CallJob {
  jobId: string;
  rentalId: string;
  customerId: string;
  phoneNumber: string;
  scenario: string;
  priority: 'high' | 'medium' | 'low';
  status: JobStatus;
  createdAt: Date;
  executedAt?: Date;
  result?: any;
}

export class TaskQueue {
  private queue: CallJob[] = [];
  private history: CallJob[] = [];
  
  enqueue(jobData: Omit<CallJob, 'jobId' | 'status' | 'createdAt'>): string {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const job: CallJob = {
      ...jobData,
      jobId,
      status: 'queued',
      createdAt: new Date()
    };
    this.queue.push(job);
    this.queue.sort((a, b) => {
      const pmap = { high: 3, medium: 2, low: 1 };
      return pmap[b.priority] - pmap[a.priority];
    });
    return jobId;
  }

  dequeue(): CallJob | null {
    if (this.queue.length === 0) return null;
    
    // Check global rate limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyCalls = this.history.filter(j => j.executedAt && j.executedAt >= today).length;
    
    if (dailyCalls >= (CONFIG.MAX_DAILY_DEMO_CALLS || 50)) {
      console.warn('MAX_DAILY_DEMO_CALLS reached. Cannot dequeue.');
      return null;
    }

    // Find next eligible job (cooldown check)
    const now = new Date();
    const cooldownMs = (CONFIG.CALL_COOLDOWN_MINUTES || 60) * 60000;
    
    const index = this.queue.findIndex(job => {
      const recent = this.history.find(h => h.phoneNumber === job.phoneNumber && (now.getTime() - (h.executedAt?.getTime() || 0)) < cooldownMs);
      return !recent;
    });

    if (index === -1) return null; // No jobs eligible yet

    const job = this.queue.splice(index, 1)[0];
    job.status = 'processing';
    job.executedAt = new Date();
    this.history.push(job);
    return job;
  }

  getStatus(jobId: string): JobStatus {
    const job = this.queue.find(j => j.jobId === jobId) || this.history.find(j => j.jobId === jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    return job.status;
  }

  async processNext(): Promise<void> {
    const job = this.dequeue();
    if (job) {
      // Typically, an external runner executes the workflow. Here we just mark as processing.
      console.log(`Dequeued job ${job.jobId} for ${job.phoneNumber}`);
    }
  }

  getQueuedJobs(): CallJob[] {
    return [...this.queue];
  }
}

export default new TaskQueue();
