import { REST, Routes } from 'discord.js';
import config from './config.json' assert { type: 'json' };
import { readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const commandsPath = join(__dirname, 'commands');
const { clientId, token } = config;

async function loadCommands() {
    const commands = [];
    const commandFiles = await readdir(commandsPath);

    for (const file of commandFiles) {
        if (file.endsWith('.js')) {
            const filePath = `file://${join(commandsPath, file)}`;
            const commandModule = await import(filePath);

            // Since the commands are named exports, we directly access them
            const commandData = commandModule.data;
            const commandExecute = commandModule.execute;

            if (commandData && commandExecute) {
                commands.push(commandData.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
    return commands;
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        const commands = await loadCommands();
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();