const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
let STATES = require("../models/channelState")

module.exports = async (client, oldState, newState) => {
    let guild = client.guilds.cache.get(client.config.guildID);

    if (oldState.channelId === null) {
        let view = await STATES.findOne({ id: newState.channelId });
        if (view) {
            let channel = guild.channels.cache.get(view.chat);
            if (channel) {
                channel.permissionOverwrites.edit(newState.member.id, {
                    SEND_MESSAGES: true,
                    VIEW_CHANNEL: true,
                })
            }
        }
        if (client.config.voiceChannelTypes.includes(newState.channel.name)) {
            let check = await STATES.findOne({ ownerID: newState.member.id });
            if (check) {
                let ch = guild.channels.cache.get(check.id);
                let Cch = guild.channels.cache.get(check.control);
                let Cpch = guild.channels.cache.get(check.chat);
                if (Cpch) Cpch.delete();
                if (ch) ch.delete();
                if (Cch) Cch.delete();
                await check.deleteOne();
            }
            guild.channels.create(`${newState.channel.name} #${await (await STATES.find({ type: newState.channel.name })).length + 1}`, { type: "GUILD_VOICE" }).then(async ch => {
                ch.setParent(client.config.NvoiceCategory);
                newState.member.voice.setChannel(ch.id);
                let ControlCh = await guild.channels.create(`${newState.channel.name}-No-${await (await STATES.find({ type: newState.channel.name })).length + 1}`);

                ControlCh.permissionOverwrites.edit(newState.member.id, {
                    SEND_MESSAGES: true,
                    VIEW_CHANNEL: true,
                }).then(() => {
                    ControlCh.permissionOverwrites.edit(guild.id, {
                        VIEW_CHANNEL: false,
                    });
                    ControlCh.permissionOverwrites.edit(newState.member.id, {
                        SEND_MESSAGES: true,
                        VIEW_CHANNEL: true,
                    })
                })

                ControlCh.setParent(client.config.NvoiceCategory);

                ControlCh.send({
                    embeds: [
                        new MessageEmbed()
                            .setDescription(`**You can manage the channel using the below buttons**`)
                            .setTimestamp()
                            .setColor('AQUA')
                    ], components: [
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('rename')
                                    .setLabel('📜 Rename VC')
                                    .setStyle('SECONDARY'),
                                new MessageButton()
                                    .setCustomId('lock')
                                    .setLabel('🔒 Lock')
                                    .setStyle('SECONDARY'),
                                new MessageButton()
                                    .setCustomId('unlock')
                                    .setLabel('🔓 Unlock')
                                    .setStyle('SECONDARY')),
                        new MessageActionRow()
                            .addComponents(new MessageButton()
                                .setCustomId('hide')
                                .setLabel('🙈 Hide')
                                .setStyle('SECONDARY'),
                                new MessageButton()
                                    .setCustomId('unhide')
                                    .setLabel('🙊 Unhide')
                                    .setStyle('SECONDARY'),
                                new MessageButton()
                                    .setCustomId('chatchannel')
                                    .setLabel('⌨️ Private Text Channel')
                                    .setStyle('SECONDARY'))
                    ]
                })
                await new STATES({
                    id: ch.id,
                    ownerID: newState.member.id,
                    type: newState.channel.name.split(" #")[0],
                    control: ControlCh.id
                }).save();
            });
        } else {
            let check = await STATES.findOne({ ownerID: newState.member.id, id: oldState.channelId });
            if (check) {
                let ch = guild.channels.cache.get(check.id);
                let Cch = guild.channels.cache.get(check.control);
                let Cpch = guild.channels.cache.get(check.chat);
                if (Cpch) Cpch.delete();
                if (ch) ch.delete();
                if (Cch) Cch.delete();
                check.deleteOne();
            }
        }
    } else if (newState.channelId === null) {
        let view = await STATES.findOne({ id: oldState.channelId });
        if (view) {
            let channel = guild.channels.cache.get(view.chat);
            if (channel) {
                channel.permissionOverwrites.edit(oldState.member.id, {
                    SEND_MESSAGES: false,
                    VIEW_CHANNEL: false,
                })
            }
        }
        let check = await STATES.findOne({ id: oldState.channelId });
        if (check) {
            let continuing = false;
            let checkOwner = oldState.member.id == check.ownerID ? true : false;
            if (await guild.channels.cache.get(oldState.channelId)?.members?.size <= 0) {
                let ch = guild.channels.cache.get(check.id);
                let Cch = guild.channels.cache.get(check.control);
                let Cpch = guild.channels.cache.get(check.chat);
                if (Cpch) Cpch.delete();
                if (ch) ch.delete();
                if (Cch) Cch.delete();
                check.deleteOne();
            } else {
                if (checkOwner) {
                    await guild.channels.cache.get(oldState.channelId)?.members?.map(async user => {
                        if (user && !continuing) {
                            continuing = true;
                            check.ownerID = user.id
                            await check.save();
                            let Chcontrol = guild.channels.cache.get(check.control);
                            Chcontrol.permissionOverwrites.edit(user.id, {
                                SEND_MESSAGES: true,
                                VIEW_CHANNEL: true,
                            }).then(() => {
                                Chcontrol.permissionOverwrites.edit(user.id, {
                                    SEND_MESSAGES: true,
                                    VIEW_CHANNEL: true,
                                })
                                Chcontrol.permissionOverwrites.edit(oldState.member.id, {
                                    SEND_MESSAGES: false,
                                    VIEW_CHANNEL: false,
                                })
                            })
                        }
                    })
                }
            }
        }
    }
};