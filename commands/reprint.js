const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reprint_contracts')
        .setDescription('Reprint your contracts!'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        await interaction.deleteReply();
    },
};