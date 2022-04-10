const { Client } = require("discord.js");
const config = require("./config.js");
const client = new Client({ disableMentions: "everyone", disabledEvents: ["TYPING_START"], intents: 32767, partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const events = require("./structures/event");

client.config = config;
events.run(client)

client.login(config.token)