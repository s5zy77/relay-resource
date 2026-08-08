import OpenAI from 'openai';
import { CONFIG } from '../../config/env';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/index';

export interface ToolCallRecord {
  id: string;
  name: string;
  arguments: string;
  result: string;
}

export class LLMClient {
  private client: OpenAI;

  constructor() {
    if (CONFIG.LLM_PROVIDER === 'ollama') {
      this.client = new OpenAI({
        baseURL: `${CONFIG.OLLAMA_BASE_URL}/v1`,
        apiKey: 'ollama', // apiKey is required by the sdk, but ignored by ollama
      });
    } else {
      this.client = new OpenAI({
        apiKey: CONFIG.OPENAI_API_KEY,
      });
    }
  }

  private getModel(): string {
    return CONFIG.LLM_PROVIDER === 'ollama' ? CONFIG.OLLAMA_MODEL : CONFIG.OPENAI_MODEL;
  }

  async chat(
    messages: ChatCompletionMessageParam[],
    tools?: ChatCompletionTool[],
    toolChoice?: 'auto' | 'none'
  ) {
    const response = await this.client.chat.completions.create({
      model: this.getModel(),
      messages,
      tools: tools?.length ? tools : undefined,
      tool_choice: toolChoice,
    });

    return response.choices[0].message;
  }

  async chatWithToolExecution(
    messages: ChatCompletionMessageParam[],
    tools: ChatCompletionTool[],
    toolExecutor: (name: string, args: string) => Promise<string>,
    maxIterations: number = 10
  ): Promise<{ response: string; toolCallsExecuted: ToolCallRecord[]; iterations: number }> {
    let iterations = 0;
    const currentMessages = [...messages];
    const toolCallsExecuted: ToolCallRecord[] = [];

    while (iterations < maxIterations) {
      iterations++;
      const message = await this.chat(currentMessages, tools, 'auto');
      
      // Append assistant's message back to the thread
      currentMessages.push(message as ChatCompletionMessageParam);

      if (!message.tool_calls || message.tool_calls.length === 0) {
        return {
          response: message.content || '',
          toolCallsExecuted,
          iterations,
        };
      }

      // Execute tools
      for (const toolCall of message.tool_calls) {
        let result = '';
        try {
          result = await toolExecutor(toolCall.function.name, toolCall.function.arguments);
        } catch (error: any) {
          result = `Error executing tool: ${error.message}`;
        }
        
        toolCallsExecuted.push({
          id: toolCall.id,
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
          result
        });

        currentMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        } as ChatCompletionMessageParam);
      }
    }

    return {
      response: "Max iterations reached without a final answer.",
      toolCallsExecuted,
      iterations,
    };
  }
}
