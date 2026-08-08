import { EventEmitter } from 'eventemitter3';
import { ConversationLoop } from './conversationLoop';
import { SpeechToText } from './stt';
import { TextToSpeech } from './tts';
import { AgentOrchestrator } from '../agent/orchestrator';
import { LLMClient } from '../agent/llmClient';
import toolRegistry from '../tools/registry';
import { SessionMemory } from '../memory/sessionMemory';

export interface SimulationSession {
  sessionId: string;
  scenarioId: string;
  startTime: Date;
}

export interface SimulationResult {
  sessionId: string;
  durationSeconds: number;
}

export class WebSimulatedClient {
  private activeSimulations: Map<string, { session: SimulationSession; loop: ConversationLoop }> = new Map();

  startSimulation(scenarioId: string, customLoop?: ConversationLoop): SimulationSession {
    const sessionId = `sim_${Date.now()}`;
    const session: SimulationSession = {
      sessionId,
      scenarioId,
      startTime: new Date()
    };

    let loop = customLoop;
    if (!loop) {
      const stt = new SpeechToText();
      const tts = new TextToSpeech();
      const llmClient = new LLMClient();
      const memory = new SessionMemory();
      const orchestrator = new AgentOrchestrator(llmClient, toolRegistry as any, memory);
      loop = new ConversationLoop(stt, tts, orchestrator, sessionId);
      loop.start();
    }

    this.activeSimulations.set(sessionId, { session, loop });
    return session;
  }

  async sendMessage(sessionId: string, text: string): Promise<string> {
    const sim = this.activeSimulations.get(sessionId);
    if (!sim) {
      throw new Error(`Simulation ${sessionId} not found`);
    }
    return await sim.loop.processTextInput(text);
  }

  endSimulation(sessionId: string): SimulationResult {
    const sim = this.activeSimulations.get(sessionId);
    if (!sim) {
      throw new Error(`Simulation ${sessionId} not found`);
    }
    sim.loop.stop();
    const endTime = new Date();
    const durationSeconds = Math.round((endTime.getTime() - sim.session.startTime.getTime()) / 1000);
    this.activeSimulations.delete(sessionId);
    return {
      sessionId,
      durationSeconds
    };
  }
}
