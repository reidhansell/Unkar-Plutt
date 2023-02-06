const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('contract_help')
        .setDescription('Get help with my commands!'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const response = "**Commands:**\n"
            + "/contract {name} {quantity} {cpu}\n"
            + "/my_contracts\n"
            + "/toggle_notifications\n"
            + "/register_vendor {name} {location} {(optional) discounts}\n"
            + "/unregister_vendor {name}\n"
            + "/discounts\n"
            + "\n"
            + "**Contract Lifecycle:**\n"
            + "CANCELLED\n"
            + "OPEN\n"
            + "IN PROGRESS\n"
            + "COMPLETE\n"
            + "CONFIRMED\n"
            + "\n"
            + "**General:**\n"
            + "-Buttons are visible to everyone, but they will only work when the crafter/miner interacts with them.\n"
            + "-It is recommended that you open contracts with quantities of 1 mil or less, to ensure that your miners can get the full amount. \n"
            + "-For bug reports and feature requests, contact <@230703283331661825>\n"

        await interaction.editReply({ content: response });
    },
};