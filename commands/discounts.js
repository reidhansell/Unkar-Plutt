const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('discounts')
        .setDescription('See guild discounts!'),
    async execute(interaction) {
        const response = "Standard Assault/Battle/Recon Armor: -20% \nMore to be added!"
        await interaction.reply({ content: response, ephemeral: true });
    },
};