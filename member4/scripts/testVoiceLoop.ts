import { SpeechToText } from '../src/voice/stt';
import { TextToSpeech } from '../src/voice/tts';
import { AgentOrchestrator } from '../src/agent/orchestrator';
import { LLMClient } from '../src/agent/llmClient';
import toolRegistry from '../src/tools/registry';
import { SessionMemory } from '../src/memory/sessionMemory';
import { ConversationLoop } from '../src/voice/conversationLoop';

async function runTest() {
  console.log('=== Member 4: Voice Loop Offline Test ===');
  
  const stt = new SpeechToText();
  const tts = new TextToSpeech();
  const llmClient = new LLMClient();
  const memory = new SessionMemory();
  const orchestrator = new AgentOrchestrator(llmClient, toolRegistry as any, memory);
  const sessionId = `test_session_${Date.now()}`;

  const loop = new ConversationLoop(stt, tts, orchestrator, sessionId);

  loop.on('ai_response', (resp) => console.log(`[AI Response Event]: ${resp}`));
  loop.on('transcription', (text) => console.log(`[Customer Text Event]: ${text}`));

  await loop.start('The customer rented a Sony A7 IV, due today at 6 PM. Greet them and ask if they will return it on time.');

  console.log('\n--- Turn 1: Customer asks for extension ---');
  const r1 = await loop.processTextInput('I actually need to extend it until tomorrow. Can I do that?');
  console.log(`Agent replied: "${r1}"`);

  console.log('\n--- Turn 2: Customer confirms extension ---');
  const r2 = await loop.processTextInput('Yes, please confirm the extension for tomorrow.');
  console.log(`Agent replied: "${r2}"`);

  loop.stop();
  console.log('\n=== Transcript Output ===');
  console.log(loop.getTranscriptLogger().getFormattedTranscript());
  console.log('=== Test Complete ===');
}

runTest().catch(console.error);
