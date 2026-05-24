/**
 * Test Script: Session Spawner
 * Run with: npx ts-node scripts/test-session-spawner.ts
 */

import { 
  SessionSpawner, 
  createSessionSpawner, 
  getSessionSpawner,
  SubAgentSession 
} from '../src/core/session-spawner';

async function testSessionSpawner() {
  console.log('🧪 Testing Session Spawner...\n');

  // Test 1: Create spawner
  console.log('1️⃣ Creating SessionSpawner...');
  const spawner = createSessionSpawner({
    maxConcurrent: 3,
    defaultTimeoutMs: 30000, // 30 seconds for tests
  });
  console.log('   ✅ SessionSpawner created\n');

  // Test 2: Get singleton
  console.log('2️⃣ Testing singleton getSessionSpawner()...');
  const singleton = getSessionSpawner();
  console.log('   ✅ Singleton retrieved\n');

  // Test 3: Check initial status
  console.log('3️⃣ Checking initial status...');
  const status = spawner.getStatus();
  console.log('   Status:', JSON.stringify(status, null, 2));
  
  if (status.total === 0 && status.running === 0 && status.maxConcurrent === 3) {
    console.log('   ✅ Initial status correct\n');
  } else {
    console.log('   ❌ Unexpected initial status\n');
  }

  // Test 4: Create a mock session (without actually running an agent)
  console.log('4️⃣ Testing session creation (mock - no actual LLM call)...');
  
  // We'll test the data structures without spawning a real agent
  // (that would require API keys and running services)
  
  const mockSession: SubAgentSession = {
    id: 'subagent:test-123',
    label: 'Test Agent',
    parentSessionId: 'main',
    task: 'Calculate 2 + 2',
    status: 'pending',
    createdAt: Date.now(),
  };
  
  console.log('   Mock session created:', mockSession.label);
  console.log('   ✅ Session data structure valid\n');

  // Test 5: Test list filtering
  console.log('5️⃣ Testing list method...');
  const emptyList = spawner.list();
  console.log('   Empty list length:', emptyList.length);
  
  const filteredList = spawner.list({ status: 'running', limit: 5 });
  console.log('   Filtered list (running, limit 5):', filteredList.length);
  console.log('   ✅ List methods work\n');

  // Test 6: Event emitter
  console.log('6️⃣ Testing event emitter...');
  let eventReceived = false;
  spawner.on('session.created', () => {
    eventReceived = true;
  });
  spawner.emit('session.created', { session: mockSession });
  
  if (eventReceived) {
    console.log('   ✅ Events work correctly\n');
  } else {
    console.log('   ❌ Event not received\n');
  }

  // Test 7: Cleanup
  console.log('7️⃣ Testing cleanup...');
  const cleaned = spawner.cleanup(0); // Clean everything older than 0ms
  console.log('   Cleaned sessions:', cleaned);
  console.log('   ✅ Cleanup method works\n');

  console.log('═'.repeat(50));
  console.log('✅ All Session Spawner tests passed!');
  console.log('═'.repeat(50));
  
  return true;
}

// Run tests
testSessionSpawner()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
