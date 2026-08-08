import { AgentOrchestrator } from './orchestrator';

export interface ActionObservation {
  id: string;
  type: string;
  data: any;
}

export class ActionLoop {
  private orchestrator: AgentOrchestrator;
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(orchestrator: AgentOrchestrator) {
    this.orchestrator = orchestrator;
  }

  async observe(): Promise<ActionObservation[]> {
    // Poll Member 3 API for overdue/due-today rentals
    console.log("ActionLoop: Observing...");
    return [];
  }

  understand(observations: ActionObservation[]): any[] {
    console.log("ActionLoop: Understanding...");
    return observations.map(obs => ({
      ...obs,
      priority: 'routine'
    }));
  }

  reason(classified: any[]): any[] {
    console.log("ActionLoop: Reasoning...");
    return classified.map(item => ({
      ...item,
      decision: 'skip'
    }));
  }

  recommend(decisions: any[]): any[] {
    console.log("ActionLoop: Recommending...");
    return decisions.map(d => ({
      ...d,
      recommendation: `Recommended action for ${d.id}`
    }));
  }

  async execute(approved: any[]): Promise<any[]> {
    console.log("ActionLoop: Executing...");
    const results = [];
    for (const item of approved) {
      results.push({ ...item, status: 'executed' });
    }
    return results;
  }

  log(results: any[]) {
    console.log("ActionLoop: Logging results:", results);
  }

  async runOnce() {
    try {
      const observations = await this.observe();
      const classified = this.understand(observations);
      const decisions = this.reason(classified);
      const recommendations = this.recommend(decisions);
      const results = await this.execute(recommendations);
      this.log(results);
    } catch (error) {
      console.error("Error in ActionLoop runOnce:", error);
    }
  }

  start(intervalMs: number) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timer = setInterval(() => this.runOnce(), intervalMs);
    console.log(`ActionLoop started with interval ${intervalMs}ms`);
  }
  
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.isRunning = false;
    console.log("ActionLoop stopped.");
  }
}
