const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('discounts')
        .setDescription('See guild discounts!'),
    async execute(interaction) {
        await interaction.deferReply({ content: response, ephemeral: true });
        const response = "Standard Assault/Battle/Recon Armor: -20% \nMore to be added!"
        await interaction.editReply({ content: response, ephemeral: true });
    },
};