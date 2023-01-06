const { SlashCommandBuilder } = require('discord.js');
const { getDiscounts } = require('../databaseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('discounts')
        .setDescription('See guild discounts!'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const response = getDiscounts();
        await interaction.editReply({ content: response });
    },
};