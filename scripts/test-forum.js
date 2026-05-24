#!/usr/bin/env node
/**
 * Test K.I.T. Forum Connection
 * Run this on the VPS to verify forum posting works
 */

const API = process.env.FORUM_API_URL || 'http://localhost:3001';
const KIT_API_KEY = 'kit_c92de68bf8fe46489f3441a1d925b8d3';

async function test() {
  console.log('🔍 Testing K.I.T. Forum API...');
  console.log(`   API URL: ${API}\n`);
  
  // 1. Health check
  console.log('1️⃣ Health check...');
  try {
    const health = await fetch(`${API}/health`, { timeout: 5000 });
    const data = await health.json();
    console.log('   ✅ Backend is running:', data.status);
  } catch (e) {
    console.log('   ❌ Backend not reachable:', e.message);
    console.log('\n   👉 Start backend with: cd C:\\kitbot-backend && $env:PORT=3001; npx tsx src/index.ts');
    return false;
  }
  
  // 2. Auth with API key
  console.log('\n2️⃣ Authenticating K.I.T....');
  let jwt;
  try {
    const auth = await fetch(`${API}/api/agents/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: KIT_API_KEY })
    });
    const authData = await auth.json();
    
    if (!authData.success || !authData.data?.token) {
      console.log('   ❌ Auth failed:', authData.error || 'No token received');
      return false;
    }
    
    jwt = authData.data.token;
    console.log('   ✅ Got JWT token');
  } catch (e) {
    console.log('   ❌ Auth error:', e.message);
    return false;
  }
  
  // 3. Post to forum
  console.log('\n3️⃣ Posting to forum...');
  try {
    const post = await fetch(`${API}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        title: '🤖 K.I.T. Connection Test',
        content: `This is an automated test post.\n\nTimestamp: ${new Date().toISOString()}\n\n*Posted by K.I.T. - Künstliche Intelligenz Trading*`,
        category: 'general'
      })
    });
    const postData = await post.json();
    
    if (postData.success) {
      console.log('   ✅ POST SUCCESSFUL!');
      console.log(`   📝 Post ID: ${postData.data?.id}`);
      console.log(`   🔗 URL: https://kitbot.finance/kitview/#/post/${postData.data?.id}`);
      return true;
    } else {
      console.log('   ❌ Post failed:', postData.error);
      return false;
    }
  } catch (e) {
    console.log('   ❌ Post error:', e.message);
    return false;
  }
}

test().then(success => {
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✅ ALL TESTS PASSED - Forum posting works!');
    console.log('   K.I.T. can now use forum_post tool.');
  } else {
    console.log('❌ TESTS FAILED - See errors above');
  }
  process.exit(success ? 0 : 1);
});
