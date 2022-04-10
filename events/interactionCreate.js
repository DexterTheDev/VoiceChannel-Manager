let STATES = require("../models/channelState")

module.exports = async (client, interaction) => {
    if (!interaction.isButton()) return;

    let guild = client.guilds.cache.get(client.config.guildID);

    if (!interaction.user.bot) {
        switch (interaction.customId) {
            case 'rename':
                let channel = guild.channels.cache.get(interaction.channelId);
                let check = await STATES.findOne({ ownerID: interaction.member.id, control: interaction.channelId });
                if (!check) interaction.reply({ content: "You are not the owner of the vc.", ephemeral: true });
                else {
                    interaction.reply({ content: "**Type below the new name (1 Mins)**", ephemeral: true }).then(async msg => {
                        await channel.awaitMessages({
                            time: 1 * 60000,
                            max: 1
                        }).then(messages => {
                            if (!messages.first().content) interaction.editReply({ content: "Command has been cancelled.", ephemeral: true });
                            else {
                                guild.channels.cache.get(check.id).setName(`${messages.first().content} #${guild.channels.cache.get(check.id).name.split(" #")[1]}`);
                                interaction.editReply({ content: "**Channel name has been changed.**", ephemeral: true });
                            }
                        })
                    })
                }
                break;
            case 'lock':
                let checkL = await STATES.findOne({ ownerID: interaction.member.id, control: interaction.channelId });
                if (!checkL) interaction.reply({ content: "You are not the owner of the vc.", ephemeral: true });
                else {
                    guild.channels.cache.get(checkL.id).permissionOverwrites.edit(guild.id, {
                        CONNECT: false
                    })
                    interaction.reply({ content: "**Channel has been locked**", ephemeral: true });
                }
                break;
            case 'unlock':
                let checkUL = await STATES.findOne({ ownerID: interaction.member.id, control: interaction.channelId });
                if (!checkUL) interaction.reply({ content: "You are not the owner of the vc.", ephemeral: true });
                else {
                    guild.channels.cache.get(checkUL.id).permissionOverwrites.edit(guild.id, {
                        CONNECT: true
                    })
                    interaction.reply({ content: "**Channel has been unlocked**", ephemeral: true });
                }
                break;
            case 'hide':
                let checkH = await STATES.findOne({ ownerID: interaction.member.id, control: interaction.channelId });
                if (!checkH) interaction.reply({ content: "You are not the owner of the vc.", ephemeral: true });
                else {
                    guild.channels.cache.get(checkH.id).permissionOverwrites.edit(guild.id, {
                        VIEW_CHANNEL: false
                    })
                    interaction.reply({ content: "**Channel has been hidden**", ephemeral: true });
                }
                break;
            case 'unhide':
                let checkUH = await STATES.findOne({ ownerID: interaction.member.id, control: interaction.channelId });
                if (!checkUH) interaction.reply({ content: "You are not the owner of the vc.", ephemeral: true });
                else {
                    guild.channels.cache.get(checkUH.id).permissionOverwrites.edit(guild.id, {
                        VIEW_CHANNEL: true
                    })
                    interaction.reply({ content: "**Channel has been unhidden**", ephemeral: true });
                }
                break;
            case 'chatchannel':
                let checkCH = await STATES.findOne({ ownerID: interaction.member.id, control: interaction.channelId });
                if (!checkCH) interaction.reply({ content: "You are not the owner of the vc.", ephemeral: true });
                else {
                    let ControlCh = await guild.channels.create(`${guild.channels.cache.get(checkCH.id).name}-chat`);
                    ControlCh.setParent(client.config.NvoiceCategory);
                    ControlCh.permissionOverwrites.edit(interaction.member, {
                        SEND_MESSAGES: true,
                        VIEW_CHANNEL: true,
                    }).then(() => {
                        ControlCh.permissionOverwrites.edit(guild.id, {
                            VIEW_CHANNEL: false,
                        });
                        ControlCh.permissionOverwrites.edit(interaction.member, {
                            SEND_MESSAGES: true,
                            VIEW_CHANNEL: true,
                        })
                        ControlCh.permissionOverwrites.edit(client.config.adminRole, {
                            SEND_MESSAGES: true,
                            VIEW_CHANNEL: true,
                        })
                    })
                    checkCH.chat = ControlCh.id;
                    checkCH.save();
                    interaction.reply({ content: "**Private Text Channel has been created.**", ephemeral: true });
                }
                break;
        }
    };
};