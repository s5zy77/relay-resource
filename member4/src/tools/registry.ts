export interface ToolDefinition {
  name: string;
  description: string;
  parameters: object; // JSON Schema
  permission: 'READ' | 'WRITE';
  requiresConfirmation: boolean;
  handler: (args: any) => Promise<any>;
}

export interface ToolCallPayload {
  tool: string;
  arguments: any;
  conversationId: string;
  customerId?: string;
  rentalId?: string;
  source: 'AI_AGENT';
  timestamp: string;
  confirmationReceived?: boolean;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  registerTool(tool: ToolDefinition) {
    if (this.tools.has(tool.name)) {
      return;
    }
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  isWriteTool(name: string): boolean {
    const tool = this.tools.get(name);
    return tool ? tool.permission === 'WRITE' : false;
  }

  getToolsForOpenAI(): any[] {
    return Array.from(this.tools.values()).map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      },
    }));
  }

  async executeTool(payload: ToolCallPayload | string, rawArgs?: string): Promise<any> {
    if (typeof payload === 'string') {
      const toolName = payload;
      const tool = this.tools.get(toolName);
      if (!tool) throw new Error(`Tool ${toolName} not found.`);
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(rawArgs || '{}');
      } catch {}
      return await tool.handler(parsedArgs);
    }

    const tool = this.tools.get(payload.tool);
    if (!tool) {
      throw new Error(`Tool ${payload.tool} not found.`);
    }

    if (tool.permission === 'WRITE' && tool.requiresConfirmation && !payload.confirmationReceived) {
      throw new Error(`Execution of tool ${payload.tool} requires confirmation.`);
    }

    try {
      const result = await tool.handler(payload.arguments);
      return result;
    } catch (error) {
      console.error(`Error executing tool ${payload.tool}:`, error);
      throw error;
    }
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }
}

export default new ToolRegistry();
