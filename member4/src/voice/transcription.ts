export type TranscriptType = 'utterance' | 'tool_call' | 'event';

export interface TranscriptEntry {
  timestamp: Date;
  speaker?: 'AI' | 'CUSTOMER' | 'SYSTEM';
  type: TranscriptType;
  content: string;
  metadata?: any;
}

export class TranscriptLogger {
  private entries: TranscriptEntry[] = [];

  logUtterance(speaker: 'AI' | 'CUSTOMER', text: string, timestamp: Date = new Date()) {
    this.entries.push({
      timestamp,
      speaker,
      type: 'utterance',
      content: text,
    });
  }

  logToolCall(toolName: string, args: any, result: any, timestamp: Date = new Date()) {
    this.entries.push({
      timestamp,
      speaker: 'SYSTEM',
      type: 'tool_call',
      content: `Tool: ${toolName}`,
      metadata: { args, result },
    });
  }

  logEvent(event: string, details?: any, timestamp: Date = new Date()) {
    this.entries.push({
      timestamp,
      speaker: 'SYSTEM',
      type: 'event',
      content: event,
      metadata: details,
    });
  }

  getTranscript(): TranscriptEntry[] {
    return [...this.entries];
  }

  getFormattedTranscript(): string {
    return this.entries.map(entry => {
      const time = entry.timestamp.toISOString().split('T')[1].substring(0, 8);
      if (entry.type === 'utterance') {
        return `[${time}] ${entry.speaker}: ${entry.content}`;
      } else if (entry.type === 'tool_call') {
        return `[${time}] [TOOL CALL] ${entry.content} | Args: ${JSON.stringify(entry.metadata?.args)}`;
      } else {
        return `[${time}] [EVENT] ${entry.content}`;
      }
    }).join('\n');
  }

  toJSON(): object {
    return {
      entries: this.entries
    };
  }
}
