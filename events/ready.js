const mongoose = require("mongoose");

module.exports = async (client) => {
    await mongoose.connect(client.config.mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err) => {
        if (err) return console.error(err);
        console.log(`${client.user.username} database is connected...`)
    });
    console.log(`${client.user.username} bot is connected...`);
    
    let guild = client.guilds.cache.get(client.config.guildID);
    guild.channels.cache.map(ch => {
        if (ch.parentId === client.config.voiceCategory && !client.config.voiceChannelTypes.includes(ch.name)) ch.delete();
    });
    client.config.voiceChannelTypes.map(async vc => {
        if (!guild.channels.cache.find(ch => ch.name === vc)) {
            guild.channels.create(vc, { type: "GUILD_VOICE" }).then(ch => {
                ch.setParent(client.config.voiceCategory);
            });
        };
    });
};