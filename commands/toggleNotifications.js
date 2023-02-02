const { SlashCommandBuilder } = require('discord.js');
const { toggleNotifications } = require('../databaseManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toggle_notifications')
        .setDescription('Toggle notifications for contract status changes!'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            isToggledOn = toggleNotifications(interaction.user.id);
            if (isToggledOn) {
                const response = "Mining contract notifications are now on."
                await interaction.editReply({ content: response });
            } else {
                const response = "Mining contract notifications are now off."
                await interaction.editReply({ content: response });
            }
        }
        catch (error) {
            await interaction.editReply({ content: error.toString() });
        }
    },
};