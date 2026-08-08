import * as dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  DEMO_MODE: process.env.DEMO_MODE !== 'false',
  DEMO_ALLOWLIST: process.env.DEMO_ALLOWLIST ? process.env.DEMO_ALLOWLIST.split(',') : [],
  MAX_DAILY_DEMO_CALLS: process.env.MAX_DAILY_DEMO_CALLS ? parseInt(process.env.MAX_DAILY_DEMO_CALLS, 10) : 5,
  CALL_COOLDOWN_MINUTES: process.env.CALL_COOLDOWN_MINUTES ? parseInt(process.env.CALL_COOLDOWN_MINUTES, 10) : 10,
  MAX_CALL_DURATION_SECONDS: process.env.MAX_CALL_DURATION_SECONDS ? parseInt(process.env.MAX_CALL_DURATION_SECONDS, 10) : 300,
  
  LLM_PROVIDER: (process.env.LLM_PROVIDER as 'ollama' | 'openai') || 'openai',
  
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3',
  
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o',
  
  STT_PROVIDER: process.env.STT_PROVIDER || 'openai',
  TTS_PROVIDER: process.env.TTS_PROVIDER || 'openai',
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || '',
  TELEPHONY_PROVIDER: process.env.TELEPHONY_PROVIDER || 'twilio',
  
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
  
  MEMBER3_API_BASE_URL: process.env.MEMBER3_API_BASE_URL || 'http://localhost:5000/api',
  
  AI_SERVER_PORT: process.env.AI_SERVER_PORT ? parseInt(process.env.AI_SERVER_PORT, 10) : 4000,
  AI_WS_PORT: process.env.AI_WS_PORT ? parseInt(process.env.AI_WS_PORT, 10) : 4001,
  
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};
