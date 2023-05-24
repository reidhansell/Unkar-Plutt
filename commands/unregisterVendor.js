const { SlashCommandBuilder } = require('discord.js');
const { unregisterVendor } = require('../databaseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unregister_vendor')
        .setDescription('Unregister a vendor!')
        .addStringOption(option =>
            option.setName('vendor_name')
                .setDescription('What is the name of the vendor you want to remove?')
                .setRequired(true)
                .setMaxLength(200)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            unregisterVendor(interaction.user.id, interaction.options.getString("vendor_name").trim());
            const response = interaction.options.getString('vendor_name').trim() + " has been unregistered."
            await interaction.editReply({ content: response });
        }
        catch (error) { await interaction.editReply({ content: error }) }
    },
};