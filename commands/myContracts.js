const { SlashCommandBuilder } = require('discord.js');
const { getContracts } = require('../databaseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('my_contracts')
        .setDescription('See your open contracts!'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const response = getContracts(interaction.user.id);
        await interaction.editReply({ content: response });
    },
};