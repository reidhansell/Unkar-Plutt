const { SlashCommandBuilder } = require('discord.js');
const { unregisterVendor } = require('../databaseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unregisterVendor')
        .setDescription('Unregister a vendor!')
        .addStringOption(option =>
            option.setName('vendorName')
                .setDescription('What is the name of the vendor you want to remove?')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        unregisterVendor(interaction.user.id, interaction.options.getString("vendorName"));
        const response = interaction.options.getString('vendorName') + " has been unregistered."
        await interaction.editReply({ content: response });
    },
};