import { SlashCommandBuilder } from "discord.js";
import { toggleNotifications } from "../databaseManager.js";

export const data = new SlashCommandBuilder()
    .setName('toggle_notifications')
    .setDescription('Toggle notifications for contract status changes!');
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
        let isToggledOn = await toggleNotifications(interaction.user.id);
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
}