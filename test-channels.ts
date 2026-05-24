/**
 * Test script for Discord and Slack channels
 * Verifies tools can be imported, called, and handle errors properly
 */

import {
  // Discord Tools
  discordSetupToolDefinition,
  discordSetupToolHandler,
  discordStatusToolDefinition,
  discordStatusToolHandler,
  discordSendToolDefinition,
  discordSendToolHandler,
  discordReactToolDefinition,
  discordReactToolHandler,
  discordEditToolDefinition,
  discordEditToolHandler,
  discordDeleteToolDefinition,
  discordDeleteToolHandler,
  discordListGuildsToolDefinition,
  discordListGuildsToolHandler,
  // Slack Tools
  slackSetupToolDefinition,
  slackSetupToolHandler,
  slackStatusToolDefinition,
  slackStatusToolHandler,
  slackSendToolDefinition,
  slackSendToolHandler,
  slackReactToolDefinition,
  slackReactToolHandler,
  slackEditToolDefinition,
  slackEditToolHandler,
  slackDeleteToolDefinition,
  slackDeleteToolHandler,
  slackListChannelsToolDefinition,
  slackListChannelsToolHandler,
} from './src/tools/system';

import {
  DiscordChannel,
  createDiscordChannel,
  hasDiscordCredentials,
  SlackChannel,
  createSlackChannel,
  hasSlackCredentials,
} from './src/channels';

const testContext = {
  workspaceDir: '/tmp/test',
  configDir: '/tmp/test',
  agentId: 'test',
};

async function testDiscordTools() {
  console.log('\n🎮 Testing Discord Tools...\n');
  
  // Test definitions exist
  const discordTools = [
    { name: 'discord_setup', def: discordSetupToolDefinition, handler: discordSetupToolHandler },
    { name: 'discord_status', def: discordStatusToolDefinition, handler: discordStatusToolHandler },
    { name: 'discord_send', def: discordSendToolDefinition, handler: discordSendToolHandler },
    { name: 'discord_react', def: discordReactToolDefinition, handler: discordReactToolHandler },
    { name: 'discord_edit', def: discordEditToolDefinition, handler: discordEditToolHandler },
    { name: 'discord_delete', def: discordDeleteToolDefinition, handler: discordDeleteToolHandler },
    { name: 'discord_list_guilds', def: discordListGuildsToolDefinition, handler: discordListGuildsToolHandler },
  ];

  for (const tool of discordTools) {
    if (!tool.def || !tool.def.name) {
      console.log(`  ❌ ${tool.name}: Definition missing`);
      return false;
    }
    if (typeof tool.handler !== 'function') {
      console.log(`  ❌ ${tool.name}: Handler not a function`);
      return false;
    }
    console.log(`  ✅ ${tool.name}: Definition OK (${tool.def.description.substring(0, 50)}...)`);
  }

  // Test discord_status (should work without config - returns "not configured")
  console.log('\n  Testing discord_status handler...');
  const statusResult = await discordStatusToolHandler({}, testContext);
  console.log(`  → Result: ${JSON.stringify(statusResult).substring(0, 100)}...`);
  if (!(statusResult as any).success === true) {
    console.log(`  ❌ discord_status failed unexpectedly`);
    return false;
  }
  console.log(`  ✅ discord_status: Handler works`);

  // Test discord_setup with invalid token (should fail gracefully)
  console.log('\n  Testing discord_setup with invalid token...');
  const setupResult = await discordSetupToolHandler({ token: 'invalid_token' }, testContext);
  console.log(`  → Result: ${JSON.stringify(setupResult).substring(0, 100)}...`);
  if ((setupResult as any).success !== false) {
    console.log(`  ⚠️ discord_setup should have failed with invalid token`);
  } else {
    console.log(`  ✅ discord_setup: Properly rejects invalid token`);
  }

  // Test discord_send without config (should fail gracefully)
  console.log('\n  Testing discord_send without config...');
  const sendResult = await discordSendToolHandler({ channelId: '123', message: 'test' }, testContext);
  if ((sendResult as any).success !== false) {
    console.log(`  ⚠️ discord_send should have failed without config`);
  } else {
    console.log(`  ✅ discord_send: Properly fails without config`);
  }

  // Test channel class
  console.log('\n  Testing DiscordChannel class...');
  if (typeof DiscordChannel !== 'function') {
    console.log(`  ❌ DiscordChannel class not exported`);
    return false;
  }
  console.log(`  ✅ DiscordChannel class exported`);
  
  console.log(`  ✅ hasDiscordCredentials: ${hasDiscordCredentials()}`);
  console.log(`  ✅ createDiscordChannel: ${createDiscordChannel() === null ? 'null (no config)' : 'created'}`);

  return true;
}

async function testSlackTools() {
  console.log('\n💼 Testing Slack Tools...\n');
  
  const slackTools = [
    { name: 'slack_setup', def: slackSetupToolDefinition, handler: slackSetupToolHandler },
    { name: 'slack_status', def: slackStatusToolDefinition, handler: slackStatusToolHandler },
    { name: 'slack_send', def: slackSendToolDefinition, handler: slackSendToolHandler },
    { name: 'slack_react', def: slackReactToolDefinition, handler: slackReactToolHandler },
    { name: 'slack_edit', def: slackEditToolDefinition, handler: slackEditToolHandler },
    { name: 'slack_delete', def: slackDeleteToolDefinition, handler: slackDeleteToolHandler },
    { name: 'slack_list_channels', def: slackListChannelsToolDefinition, handler: slackListChannelsToolHandler },
  ];

  for (const tool of slackTools) {
    if (!tool.def || !tool.def.name) {
      console.log(`  ❌ ${tool.name}: Definition missing`);
      return false;
    }
    if (typeof tool.handler !== 'function') {
      console.log(`  ❌ ${tool.name}: Handler not a function`);
      return false;
    }
    console.log(`  ✅ ${tool.name}: Definition OK (${tool.def.description.substring(0, 50)}...)`);
  }

  // Test slack_status (should work without config)
  console.log('\n  Testing slack_status handler...');
  const statusResult = await slackStatusToolHandler({}, testContext);
  console.log(`  → Result: ${JSON.stringify(statusResult).substring(0, 100)}...`);
  if (!(statusResult as any).success === true) {
    console.log(`  ❌ slack_status failed unexpectedly`);
    return false;
  }
  console.log(`  ✅ slack_status: Handler works`);

  // Test slack_setup with invalid tokens
  console.log('\n  Testing slack_setup with invalid tokens...');
  const setupResult = await slackSetupToolHandler({ 
    botToken: 'invalid', 
    appToken: 'invalid' 
  }, testContext);
  console.log(`  → Result: ${JSON.stringify(setupResult).substring(0, 100)}...`);
  if ((setupResult as any).success !== false) {
    console.log(`  ⚠️ slack_setup should have failed with invalid tokens`);
  } else {
    console.log(`  ✅ slack_setup: Properly rejects invalid tokens`);
  }

  // Test slack_send without config
  console.log('\n  Testing slack_send without config...');
  const sendResult = await slackSendToolHandler({ channel: 'C123', message: 'test' }, testContext);
  if ((sendResult as any).success !== false) {
    console.log(`  ⚠️ slack_send should have failed without config`);
  } else {
    console.log(`  ✅ slack_send: Properly fails without config`);
  }

  // Test channel class
  console.log('\n  Testing SlackChannel class...');
  if (typeof SlackChannel !== 'function') {
    console.log(`  ❌ SlackChannel class not exported`);
    return false;
  }
  console.log(`  ✅ SlackChannel class exported`);
  
  console.log(`  ✅ hasSlackCredentials: ${hasSlackCredentials()}`);
  console.log(`  ✅ createSlackChannel: ${createSlackChannel() === null ? 'null (no config)' : 'created'}`);

  return true;
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   K.I.T. Discord & Slack Channel Tests');
  console.log('═══════════════════════════════════════════════════');

  let allPassed = true;

  try {
    const discordOk = await testDiscordTools();
    if (!discordOk) allPassed = false;
  } catch (error) {
    console.log(`\n❌ Discord tests crashed: ${error}`);
    allPassed = false;
  }

  try {
    const slackOk = await testSlackTools();
    if (!slackOk) allPassed = false;
  } catch (error) {
    console.log(`\n❌ Slack tests crashed: ${error}`);
    allPassed = false;
  }

  console.log('\n═══════════════════════════════════════════════════');
  if (allPassed) {
    console.log('   ✅ ALL TESTS PASSED - Ready for GitHub push');
  } else {
    console.log('   ❌ SOME TESTS FAILED - DO NOT PUSH');
  }
  console.log('═══════════════════════════════════════════════════\n');

  process.exit(allPassed ? 0 : 1);
}

main();
