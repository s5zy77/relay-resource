import { LLMClient } from './llmClient';
import { SessionMemory } from '../memory/sessionMemory';
import { CONFIG } from '../../config/env';
import { buildSystemPrompt } from '../prompts/relayVoicePrompt';
import { ChatCompletionMessageParam } from 'openai/resources/index';

export interface ToolRegistry {
  getToolsForOpenAI(): any[];
  isWriteTool(name: string): boolean;
  executeTool(name: string, args: string): Promise<string>;
}

export class AgentOrchestrator {
  private llmClient: LLMClient;
  private toolRegistry: ToolRegistry;
  private sessionMemory: SessionMemory;

  constructor(llmClient: LLMClient, toolRegistry: ToolRegistry, sessionMemory: SessionMemory) {
    this.llmClient = llmClient;
    this.toolRegistry = toolRegistry;
    this.sessionMemory = sessionMemory;
  }

  async processUserMessage(sessionId: string, userMessage: string) {
    const session = this.sessionMemory.getSession(sessionId) || this.sessionMemory.createSession(sessionId, 'unknown', 'unknown', 'unknown');
    
    this.sessionMemory.addMessage(sessionId, 'user', userMessage);

    const systemPrompt = buildSystemPrompt();
    const history = session.conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    } as ChatCompletionMessageParam));

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history
    ];

    const tools = this.toolRegistry.getToolsForOpenAI();

    const toolExecutor = async (name: string, args: string): Promise<string> => {
      const isWrite = this.toolRegistry.isWriteTool(name);
      
      if (isWrite) {
        const currentSession = this.sessionMemory.getSession(sessionId);
        if (currentSession?.pendingAction?.name === name && currentSession.confirmationStatus === 'confirmed') {
          this.sessionMemory.confirmAction(sessionId); 
          return await this.toolRegistry.executeTool(name, args);
        } else {
          this.sessionMemory.setPendingAction(sessionId, name, args);
          return `SYSTEM: Action requires user confirmation. Ask the user: "Would you like me to confirm this?"`;
        }
      }
      
      return await this.toolRegistry.executeTool(name, args);
    };

    const result = await this.llmClient.chatWithToolExecution(messages, tools, toolExecutor);
    
    this.sessionMemory.addMessage(sessionId, 'assistant', result.response);
    for (const tc of result.toolCallsExecuted) {
       this.sessionMemory.addToolCall(sessionId, tc);
    }

    return {
      response: result.response,
      toolCalls: result.toolCallsExecuted,
      sessionId,
    };
  }

  async processToolConfirmation(sessionId: string, toolName: string, confirmed: boolean) {
    if (confirmed) {
      this.sessionMemory.confirmAction(sessionId);
    } else {
      this.sessionMemory.declineAction(sessionId);
    }
  }
}
