import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('contract_help')
    .setDescription('Get help with my commands!');
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const response = "**Commands:**\n"
        + "/contract {name} {quantity} {cpu}\n"
        + "/my_contracts\n"
        + "/toggle_notifications (default is OFF)\n"
        + "/register_vendor {name} {location}\n"
        + "/unregister_vendor {name}\n"
        + "/reprint_contracts\n"
        + "/my_stats\n"
        + "\n"
        + "**Contract Lifecycle:**\n"
        + "EXPIRED\n"
        + "CANCELLED\n"
        + "OPEN\n"
        + "IN PROGRESS\n"
        + "COMPLETE\n"
        + "CONFIRMED\n"
        + "\n"
        + "**General:**\n"
        + "-Buttons are visible to everyone, but they will only work when the crafter/miner interacts with them.\n"
        + "-It is recommended that you open contracts with quantities of 1 mil or less to ensure that your miners can get the full amount. \n"
        + "-For bug reports and feature requests, contact <@230703283331661825>\n"

    await interaction.editReply({ content: response });
}