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

function startCollectors() {

    var guilds = client.guilds.cache;
    guilds = guilds.values();
    var textChannels = []
    for (const guild of guilds) {
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
                    await interaction.update({ content: contractObject.toString(), components: [contractObject.toButtons()] });
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
                    await interaction.update({ content: contractObject.toString(), components: [contractObject.toButtons()] });
                    if (checkNotifications(contractObject.crafter_id)) {
                        const crafter = await client.users.fetch(contractObject.crafter_id);
                        const crafterDM = await crafter.createDM();
                        crafterDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: " + contractObject.url);
                    }
                }
            } else if (interaction.customId === contractObject.vendors_id) {
                await interaction.deferReply({ ephemeral: true });
                await interaction.deleteReply();
                const vendors = await getVendors(contractObject.crafter_id);
                const minerDM = await interaction.user.createDM();
                minerDM.send(vendors);
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
                    await interaction.update({ content: contractObject.toString(), components: [contractObject.toButtons()] });
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
}

client.on('ready', () => {
    startCollectors();
});

client.on("guildCreate", guild => {
    startCollectors();
})


