/*  This file is not run by default. 
    It is a tool for recovering contracts from the database.
    This tool datamines old messages for contracts and inserts them into the DB.
    It should be used when the database is wiped, major changes are made, etc. */

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Client, GatewayIntentBits, Collection, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from './config.json' assert { type: 'json' };;
const { token } = config;
import { openContract } from './databaseManager';
import { v4 as uuidv4 } from 'uuid';
import Contract from "./objects/Contract.js";

// Manually enter the guild ID, channel name, and message IDs here
const guildID = '941946604309594142'; // SHADE ID
const channelName = ""
const message_ids = [];

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Set the commands in the client
client.commands = new Collection();
const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

// Bot is ready, login and start the collectors
client.login(token);
client.on('ready', async () => {

    const guild = client.guilds.cache.get(guildID);
    var textChannels = guild.channels.cache;
    textChannels.sweep(channel => channel.name != channelName);
    textChannels = textChannels.values();
    for (const channel of textChannels) {
        for (const message_id of message_ids) {
            var message = await channel.messages.fetch(message_id);
            const lines = message.content.split(/\r?\n/);
            const status = lines[1].substring(8);
            const endOfCrafterLine = lines[2].indexOf(">");
            const crafter_id = lines[2].substring(11, endOfCrafterLine);
            var miner_id = ""
            var resource = ""
            var quantity = ""
            var cpu = ""
            if (lines[3].substring(0, 1) === "M") {
                const endOfMinerLine = lines[3].indexOf(">");
                var miner_id = lines[3].substring(9, endOfMinerLine);

                const beginningOfResourceLine = lines[4].indexOf("=");
                resource = lines[4].substring(beginningOfResourceLine + 1);
                quantity = lines[5].substring(10);
                cpu = lines[6].substring(5);
            }
            else {
                const beginningOfResourceLine = lines[3].indexOf("=");
                resource = lines[3].substring(beginningOfResourceLine + 1);
                quantity = lines[4].substring(10);
                cpu = lines[5].substring(5);
            }
            const url = message.url;
            const channel_id = message.channel_id;

            var contractObject = new Contract({
                "crafter_id": crafter_id,
                "miner_id": miner_id,
                "status": status,
                "url": url,
                "resource": resource,
                "quantity": quantity,
                "cpu": cpu,
                "message_id": message_id,
                "channel_id": channel_id,
                "accept_id": uuidv4(),
                "cancel_id": uuidv4(),
                "unaccept_id": uuidv4(),
                "vendors_id": uuidv4(),
                "complete_id": uuidv4(),
                "uncomplete_id": uuidv4(),
                "confirm_id": uuidv4(),
            })
            var contractButtons = null;
            if (status === "OPEN") {
                contractButtons = new ActionRowBuilder()
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
            } else if (status === "IN PROGRESS") {
                contractButtons = new ActionRowBuilder()
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
            } else if (status === "COMPLETE") {
                contractButtons = new ActionRowBuilder()
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
            }
            await message.edit({ content: contractObject.toString(), components: [contractButtons] });

            openContract(contractObject);

        }
    }
    console.log("Success");
    return true;
})