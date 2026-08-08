import { ToolCallRecord } from '../agent/llmClient';

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
}

export interface Session {
  sessionId: string;
  customerId: string;
  rentalId: string;
  productName: string;
  conversationHistory: Message[];
  factsProvided: Set<string>;
  pendingAction: { name: string; args: string } | null;
  confirmationStatus: 'none' | 'pending' | 'confirmed' | 'declined';
  customerIntent: string;
  customerCommitment: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | 'unknown';
  callStartTime: Date;
  callEndTime: Date | null;
  toolCallsExecuted: ToolCallRecord[];
  escalationRequested: boolean;
}

export class SessionMemory {
  private sessions: Map<string, Session> = new Map();

  createSession(sessionId: string, customerId: string, rentalId: string, productName: string): Session {
    const session: Session = {
      sessionId,
      customerId,
      rentalId,
      productName,
      conversationHistory: [],
      factsProvided: new Set(),
      pendingAction: null,
      confirmationStatus: 'none',
      customerIntent: '',
      customerCommitment: null,
      sentiment: 'unknown',
      callStartTime: new Date(),
      callEndTime: null,
      toolCallsExecuted: [],
      escalationRequested: false
    };
    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, updates: Partial<Session>) {
    const session = this.getSession(sessionId);
    if (session) {
      Object.assign(session, updates);
    }
  }

  addMessage(sessionId: string, role: Message['role'], content: string) {
    const session = this.getSession(sessionId);
    if (session) {
      session.conversationHistory.push({ role, content, timestamp: new Date() });
    }
  }

  setPendingAction(sessionId: string, name: string, args: string) {
    const session = this.getSession(sessionId);
    if (session) {
      session.pendingAction = { name, args };
      session.confirmationStatus = 'pending';
    }
  }

  confirmAction(sessionId: string) {
    const session = this.getSession(sessionId);
    if (session) {
      session.confirmationStatus = 'confirmed';
    }
  }

  declineAction(sessionId: string) {
    const session = this.getSession(sessionId);
    if (session) {
      session.confirmationStatus = 'declined';
      session.pendingAction = null;
    }
  }

  addToolCall(sessionId: string, toolCall: ToolCallRecord) {
    const session = this.getSession(sessionId);
    if (session) {
      session.toolCallsExecuted.push(toolCall);
    }
  }

  setCommitment(sessionId: string, commitment: string) {
    const session = this.getSession(sessionId);
    if (session) {
      session.customerCommitment = commitment;
    }
  }

  setSentiment(sessionId: string, sentiment: Session['sentiment']) {
    const session = this.getSession(sessionId);
    if (session) {
      session.sentiment = sentiment;
    }
  }

  endSession(sessionId: string) {
    const session = this.getSession(sessionId);
    if (session) {
      session.callEndTime = new Date();
    }
  }

  getTranscript(sessionId: string): string {
    const session = this.getSession(sessionId);
    if (!session) return '';
    return session.conversationHistory
      .map(msg => `[${msg.timestamp.toISOString()}] ${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');
  }

  getSummary(sessionId: string): any {
    const session = this.getSession(sessionId);
    if (!session) return null;
    return {
      duration: session.callEndTime ? (session.callEndTime.getTime() - session.callStartTime.getTime()) / 1000 : null,
      messages: session.conversationHistory.length,
      sentiment: session.sentiment,
      intent: session.customerIntent,
      escalated: session.escalationRequested
    };
  }
}
