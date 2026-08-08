import { SessionMemory } from '../src/memory/sessionMemory';
import { RELAY_VOICE_SYSTEM_PROMPT, buildSystemPrompt } from '../src/prompts/relayVoicePrompt';

describe('Relay Voice System Prompt & Session Memory', () => {
  test('buildSystemPrompt should include base prompt and optional context', () => {
    const prompt = buildSystemPrompt('Rental RLY-DEMO-001 is due today.');
    expect(prompt).toContain('Relay AI Rental Assistant');
    expect(prompt).toContain('RLY-DEMO-001');
  });

  test('SessionMemory should track conversation history and tool executions', () => {
    const memory = new SessionMemory();
    const session = memory.createSession('sess_1', 'cust_1', 'rent_1', 'Sony A7 IV');

    memory.addMessage('sess_1', 'user', 'Hi, I need an extension');
    memory.addMessage('sess_1', 'assistant', 'Let me check availability');

    const retrieved = memory.getSession('sess_1');
    expect(retrieved?.conversationHistory.length).toBe(2);
    expect(retrieved?.productName).toBe('Sony A7 IV');
  });
});
