import { CONFIG } from '../../config/env';

export type CallStatus = 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled';

export interface CallSession {
  callId: string;
  phoneNumber: string;
  status: CallStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
}

export class TelephonyBridge {
  private activeCalls: Map<string, CallSession> = new Map();
  private callHistory: CallSession[] = [];

  validateDestination(phoneNumber: string): boolean {
    if (CONFIG.DEMO_MODE) {
      if (!CONFIG.DEMO_ALLOWLIST || !CONFIG.DEMO_ALLOWLIST.includes(phoneNumber)) {
        throw new Error(`CRITICAL: Phone number ${phoneNumber} is not in DEMO_ALLOWLIST during DEMO_MODE.`);
      }
    }
    return true;
  }

  async initiateCall(phoneNumber: string, webhookUrl: string): Promise<CallSession> {
    this.validateDestination(phoneNumber);
    
    // Rate limiting checks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyCalls = this.callHistory.filter(c => c.startTime >= today).length;
    
    if (dailyCalls >= (CONFIG.MAX_DAILY_DEMO_CALLS || 50)) {
      throw new Error('MAX_DAILY_DEMO_CALLS exceeded');
    }

    const recentCall = this.callHistory.find(c => 
      c.phoneNumber === phoneNumber && 
      (new Date().getTime() - c.startTime.getTime()) / 60000 < (CONFIG.CALL_COOLDOWN_MINUTES || 60)
    );

    if (recentCall) {
      throw new Error(`CALL_COOLDOWN active for ${phoneNumber}`);
    }

    const callId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const session: CallSession = {
      callId,
      phoneNumber,
      status: 'ringing',
      startTime: new Date()
    };
    
    this.activeCalls.set(callId, session);
    
    // In a real integration, we'd use Twilio API here.
    console.log(`Initiating call to ${phoneNumber} (Twilio REST simulated) via webhook ${webhookUrl}`);
    
    setTimeout(() => {
      const active = this.activeCalls.get(callId);
      if (active && active.status === 'ringing') {
        active.status = 'in-progress';
      }
    }, 2000);

    return session;
  }

  async endCall(callId: string): Promise<void> {
    const session = this.activeCalls.get(callId);
    if (!session) {
      throw new Error(`Call ${callId} not found`);
    }
    session.status = 'completed';
    session.endTime = new Date();
    session.duration = Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000);
    this.activeCalls.delete(callId);
    this.callHistory.push(session);
    console.log(`Ended call ${callId}. Duration: ${session.duration}s`);
  }

  getCallStatus(callId: string): CallStatus {
    const active = this.activeCalls.get(callId);
    if (active) return active.status;
    const past = this.callHistory.find(c => c.callId === callId);
    if (past) return past.status;
    throw new Error(`Call ${callId} not found`);
  }
}
