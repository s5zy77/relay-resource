import toolRegistry from '../src/tools/registry';

describe('ToolRegistry - Permission Classification & Confirmation Enforcer', () => {
  test('WRITE tools must require confirmation before execution', async () => {
    const extendTool = toolRegistry.getTool('extend_rental');
    if (extendTool) {
      expect(extendTool.permission).toBe('WRITE');
      expect(extendTool.requiresConfirmation).toBe(true);

      // Attempting execution without confirmationReceived flag should fail
      await expect(
        toolRegistry.executeTool({
          tool: 'extend_rental',
          arguments: { rentalId: 'RLY-DEMO-001', newEndDate: '2026-08-10' },
          conversationId: 'conv_123',
          source: 'AI_AGENT',
          timestamp: new Date().toISOString(),
          confirmationReceived: false,
        })
      ).rejects.toThrow(/requires confirmation/);
    }
  });

  test('READ tools should execute without confirmation requirement', () => {
    const getRentalTool = toolRegistry.getTool('get_rental');
    if (getRentalTool) {
      expect(getRentalTool.permission).toBe('READ');
      expect(getRentalTool.requiresConfirmation).toBe(false);
    }
  });
});
