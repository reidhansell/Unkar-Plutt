import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import config from './config.json' assert { type: 'json' };
import { startCollectors } from './collectors.js';
import { markExpiredContracts } from './expirationMonitor.js';
import cron from 'node-cron';

const { token } = config;
const __dirname = dirname(fileURLToPath(import.meta.url));

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function loadEvents(client) {
    const eventsPath = join(__dirname, 'events');
    const eventFiles = await readdir(eventsPath);

    for (const file of eventFiles) {
        if (file.endsWith('.js')) {
            const event = await import(`file://${join(eventsPath, file)}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
}

async function loadCommands(client) {
    client.commands = new Collection();
    const commandsPath = join(__dirname, 'commands');
    const commandFiles = await readdir(commandsPath);

    for (const file of commandFiles) {
        if (file.endsWith('.js')) {
            const command = await import(`file://${join(commandsPath, file)}`);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${join(commandsPath, file)} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

(async () => {
    try {
        await loadEvents(client);
        await loadCommands(client);
        await client.login(token).catch(error => {
            console.error(`Failed to login: ${error}`);
        });;
        client.on('ready', () => {
            startCollectors(client);
            markExpiredContracts();
            cron.schedule('0 0 * * *', () => {
                markExpiredContracts();
            });
        });
    } catch (error) {
        console.error('Error initializing bot:', error);
    }
})();