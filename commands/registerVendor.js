const { SlashCommandBuilder } = require('discord.js');
const { registerVendor } = require('../databaseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register_vendor')
        .setDescription('Register a vendor!')
        .addStringOption(option =>
            option.setName('vendor_name')
                .setDescription('What is the name of your vendor?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('vendor_location')
                .setDescription('Where is your vendor located?')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            registerVendor(interaction.user.id, interaction.options.getString("vendor_name"), interaction.options.getString("vendor_location"));
            const response = interaction.options.getString('vendor_name') + " has been registered."
            await interaction.editReply({ content: response });
        }
        catch (error) {
            await interaction.editReply({ content: error });
        }
    },
};