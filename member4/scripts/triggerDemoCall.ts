import { CONFIG } from '../config/env';
import { ReturnReminderWorkflow } from '../src/workflows/returnReminder';
import { OverdueCollectionWorkflow } from '../src/workflows/overdueCollection';
import { PickupConfirmationWorkflow } from '../src/workflows/pickupConfirmation';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function run() {
  const allowlist = CONFIG.DEMO_ALLOWLIST || [];
  if (allowlist.length === 0) {
    console.error('Error: DEMO_ALLOWLIST is empty in configuration.');
    process.exit(1);
  }

  const phone = allowlist[0];

  console.log('Select Scenario:');
  console.log('1. Return Reminder');
  console.log('2. Overdue Collection');
  console.log('3. Pickup Confirmation');
  
  rl.question('Choice (1-3): ', async (answer) => {
    try {
      let result;
      if (answer === '1') {
        const workflow = new ReturnReminderWorkflow();
        result = await workflow.execute('RLY-DEMO-001', phone);
      } else if (answer === '2') {
        const workflow = new OverdueCollectionWorkflow();
        result = await workflow.execute('RLY-DEMO-002', phone);
      } else if (answer === '3') {
        const workflow = new PickupConfirmationWorkflow();
        result = await workflow.execute('RLY-DEMO-003', phone);
      } else {
        console.log('Invalid choice.');
      }
      
      console.log('Workflow Result:', JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Error executing workflow:', err);
    } finally {
      rl.close();
    }
  });
}

run();
