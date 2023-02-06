// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { token } = require('./config.json');
const { getVendors, updateContract, getContractByButton, checkNotifications } = require('./databaseManager');


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Log in to Discord with your client's token
client.login(token);

client.on('ready', () => {
    var guilds = client.guilds.cache;
    guilds = guilds.values();
    var textChannels = []
    for (const guild of guilds) {
        guild.commands.set([]); // Remove this
        var guildTextChannels = guild.channels.cache;
        guildTextChannels.sweep(channel => channel.type != 0);
        guildTextChannels = guildTextChannels.values();
        for (const textChannel of guildTextChannels) {
            textChannels.push(textChannel);
        }
    }

    for (const channel of textChannels) {
        const collector = channel.createMessageComponentCollector({ componentType: ComponentType.Button });

        collector.on('collect', async (interaction) => {
            contractObject = getContractByButton(interaction.customId);

            if (interaction.customId === contractObject.accept_id || interaction.customId === contractObject.uncomplete_id) {
                if (contractObject.miner_id === "") { contractObject.setMiner(interaction.user.id); }
                if (contractObject.miner_id != interaction.user.id) {
                    await interaction.reply({ content: "You cannot uncomplete a contract that you did not open.", ephemeral: true })
                } else {
                    contractObject.setStatus('IN PROGRESS');
                    updateContract(contractObject);
                    const acceptedContractContent = contractObject.toString();
                    const acceptedContractButtons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(contractObject.vendors_id)
                                .setLabel("Vendors")
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(contractObject.complete_id)
                                .setLabel('Complete')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(contractObject.unaccept_id)
                                .setLabel('Unaccept')
                                .setStyle(ButtonStyle.Danger),
                        );
                    await interaction.update({ content: acceptedContractContent, components: [acceptedContractButtons] });
                    if (checkNotifications(contractObject.crafter_id)) {
                        const crafter = await client.users.fetch(contractObject.crafter_id);
                        const crafterDM = await crafter.createDM();
                        crafterDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: " + contractObject.url);
                    }
                }
            }
            else if (interaction.customId === contractObject.unaccept_id) {
                if (contractObject.miner_id != interaction.user.id) {
                    await interaction.reply({ content: "You cannot unaccept a contract that you did not accept.", ephemeral: true })
                } else {
                    contractObject.setMiner("");
                    contractObject.setStatus("OPEN");
                    updateContract(contractObject);
                    const contractContent = contractObject.toString();

                    const contractButtons = new ActionRowBuilder()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(contractObject.accept_id)
                                .setLabel('Accept')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(contractObject.cancel_id)
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Danger)
                        ]);

                    await interaction.update({ content: contractContent, components: [contractButtons] });
                    if (checkNotifications(contractObject.crafter_id)) {
                        const crafter = await client.users.fetch(contractObject.crafter_id);
                        const crafterDM = await crafter.createDM();
                        crafterDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: " + contractObject.url);
                    }
                }
            } else if (interaction.customId === contractObject.vendors_id) {
                await interaction.deferReply({ ephemeral: true });
                const vendors = await getVendors(contractObject.crafter_id);
                await interaction.editReply({ content: vendors })
            }
            else if (interaction.customId === contractObject.cancel_id || interaction.customId === contractObject.confirm_id) {
                if (contractObject.crafter_id != interaction.user.id) {
                    await interaction.reply({ content: "You cannot close a contract that you did not open.", ephemeral: true })
                } else {
                    if (interaction.customId === contractObject.cancel_id) {
                        contractObject.setStatus("CANCELLED");
                    } else {
                        contractObject.setStatus("CONFIRMED");
                    }
                    updateContract(contractObject);
                    await interaction.update({ content: "" })
                    await interaction.deleteReply();
                    if (interaction.customId === contractObject.confirm_id) {
                        if (checkNotifications(contractObject.miner_id)) {
                            const miner = await client.users.fetch(contractObject.miner_id);
                            const minerDM = await miner.createDM();
                            minerDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: REMOVED");
                        }
                    }
                    delete contractObject;
                }
            } else if (interaction.customId === contractObject.complete_id) {
                if (contractObject.miner_id != interaction.user.id) {
                    await interaction.reply({ content: "You cannot complete a contract that you did not accept.", ephemeral: true });
                } else {
                    contractObject.setStatus('COMPLETE');
                    updateContract(contractObject);
                    const completedContractContent = contractObject.toString();
                    const completedContractButtons = new ActionRowBuilder()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(contractObject.confirm_id)
                                .setLabel('Confirm')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(contractObject.uncomplete_id)
                                .setLabel('Uncomplete')
                                .setStyle(ButtonStyle.Danger),

                        ]);
                    await interaction.update({ content: completedContractContent, components: [completedContractButtons] });
                    if (checkNotifications(contractObject.crafter_id)) {
                        const crafter = await client.users.fetch(contractObject.crafter_id);
                        const crafterDM = await crafter.createDM();
                        crafterDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: " + contractObject.url);
                    }
                }
            }
        }
        )
    };
    console.log("collectors are running on in all known guilds");
});

client.on("guildCreate", guild => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }

    var guilds = client.guilds.cache;
    guilds = guilds.values();
    var textChannels = []
    var guildTextChannels = guild.channels.cache;
    guildTextChannels.sweep(channel => channel.type != 0);
    guildTextChannels = guildTextChannels.values();
    for (const textChannel of guildTextChannels) {
        textChannels.push(textChannel);
    }

    for (const channel of textChannels) {
        const collector = channel.createMessageComponentCollector({ componentType: ComponentType.Button });

        collector.on('collect', async (interaction) => {
            contractObject = getContractByButton(interaction.customId);

            if (interaction.customId === contractObject.accept_id || interaction.customId === contractObject.uncomplete_id) {
                if (contractObject.miner_id === "") { contractObject.setMiner(interaction.user.id); }
                if (contractObject.miner_id != interaction.user.id) {
                    await interaction.reply({ content: "You cannot uncomplete a contract that you did not open.", ephemeral: true })
                } else {
                    contractObject.setStatus('IN PROGRESS');
                    updateContract(contractObject);
                    const acceptedContractContent = contractObject.toString();
                    const acceptedContractButtons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(contractObject.vendors_id)
                                .setLabel("Vendors")
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(contractObject.complete_id)
                                .setLabel('Complete')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(contractObject.unaccept_id)
                                .setLabel('Unaccept')
                                .setStyle(ButtonStyle.Danger),
                        );
                    await interaction.update({ content: acceptedContractContent, components: [acceptedContractButtons] });
                    if (checkNotifications(contractObject.crafter_id)) {
                        const crafter = await client.users.fetch(contractObject.crafter_id);
                        const crafterDM = await crafter.createDM();
                        crafterDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: " + contractObject.url);
                    }
                }
            }
            else if (interaction.customId === contractObject.unaccept_id) {
                if (contractObject.miner_id != interaction.user.id) {
                    await interaction.reply({ content: "You cannot unaccept a contract that you did not accept.", ephemeral: true })
                } else {
                    contractObject.setMiner("");
                    contractObject.setStatus("OPEN");
                    updateContract(contractObject);
                    const contractContent = contractObject.toString();

                    const contractButtons = new ActionRowBuilder()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(contractObject.accept_id)
                                .setLabel('Accept')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(contractObject.cancel_id)
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Danger)
                        ]);

                    await interaction.update({ content: contractContent, components: [contractButtons] });
                    if (checkNotifications(contractObject.crafter_id)) {
                        const crafter = await client.users.fetch(contractObject.crafter_id);
                        const crafterDM = await crafter.createDM();
                        crafterDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: " + contractObject.url);
                    }
                }
            } else if (interaction.customId === contractObject.vendors_id) {
                await interaction.deferReply({ ephemeral: true });
                const vendors = await getVendors(contractObject.crafter_id);
                await interaction.editReply({ content: vendors })
            }
            else if (interaction.customId === contractObject.cancel_id || interaction.customId === contractObject.confirm_id) {
                if (contractObject.crafter_id != interaction.user.id) {
                    await interaction.reply({ content: "You cannot close a contract that you did not open.", ephemeral: true })
                } else {
                    if (interaction.customId === contractObject.cancel_id) {
                        contractObject.setStatus("CANCELLED");
                    } else {
                        contractObject.setStatus("CONFIRMED");
                    }
                    updateContract(contractObject);
                    await interaction.update({ content: "" })
                    await interaction.deleteReply();
                    if (interaction.customId === contractObject.confirm_id) {
                        if (checkNotifications(contractObject.miner_id)) {
                            const miner = await client.users.fetch(contractObject.miner_id);
                            const minerDM = await miner.createDM();
                            minerDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: REMOVED");
                        }
                    }
                    delete contractObject;
                }
            } else if (interaction.customId === contractObject.complete_id) {
                if (contractObject.miner_id != interaction.user.id) {
                    await interaction.reply({ content: "You cannot complete a contract that you did not accept.", ephemeral: true });
                } else {
                    contractObject.setStatus('COMPLETE');
                    updateContract(contractObject);
                    const completedContractContent = contractObject.toString();
                    const completedContractButtons = new ActionRowBuilder()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(contractObject.confirm_id)
                                .setLabel('Confirm')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(contractObject.uncomplete_id)
                                .setLabel('Uncomplete')
                                .setStyle(ButtonStyle.Danger),

                        ]);
                    await interaction.update({ content: completedContractContent, components: [completedContractButtons] });
                    if (checkNotifications(contractObject.crafter_id)) {
                        const crafter = await client.users.fetch(contractObject.crafter_id);
                        const crafterDM = await crafter.createDM();
                        crafterDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: " + contractObject.url);
                    }
                }
            }
        }
        )
    };
    console.log("collectors are running in a new guild");
})


