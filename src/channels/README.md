# K.I.T. Channels

K.I.T. supports ALL messaging channels like OpenClaw.

## Supported Channels

| Channel | Status | Library |
|---------|--------|---------|
| 📱 **Telegram** | ✅ Ready | telegraf |
| 💬 **Discord** | ✅ Ready | discord.js |
| 📲 **WhatsApp** | ✅ Ready | @whiskeysockets/baileys |
| 🔒 **Signal** | 🚧 In Progress | signal-bot |
| 💼 **Slack** | ✅ Ready | @slack/bolt |
| 👥 **Microsoft Teams** | 🚧 Planned | botbuilder |
| 💬 **Google Chat** | 🚧 Planned | googleapis |
| 🔗 **Matrix** | ✅ Ready | matrix-js-sdk |
| 💬 **Mattermost** | ✅ Ready | @mattermost/client |
| 🎮 **Twitch** | ✅ Ready | tmi.js |
| 📱 **iMessage** | 🚧 Planned | bluebubbles |
| 🌐 **WebChat** | ✅ Ready | socket.io |

## Configuration

Add channel configs to `~/.kit/config.json`:

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "token": "BOT_TOKEN",
      "allowedUsers": [123456789]
    },
    "discord": {
      "enabled": true,
      "token": "BOT_TOKEN",
      "allowedGuilds": ["guild_id"]
    },
    "whatsapp": {
      "enabled": true
    },
    "slack": {
      "enabled": true,
      "token": "xoxb-...",
      "signingSecret": "..."
    }
  }
}
```

## Adding a New Channel

1. Create `src/channels/<channel>.ts`
2. Implement the `Channel` interface
3. Register in `src/channels/index.ts`
4. Add to config schema

See existing implementations for reference.
