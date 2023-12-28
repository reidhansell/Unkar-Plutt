import { SlashCommandBuilder } from '@discordjs/builders';
import { getContracts } from '../databaseManager.js';

export const data = new SlashCommandBuilder()
    .setName('my_contracts')
    .setDescription('See your open contracts!');
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const response = await getContracts(interaction.user.id);
    await interaction.editReply({ content: response });
}