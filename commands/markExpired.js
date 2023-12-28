import { markSingleContractExpired } from "../expirationMonitor.js";
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('expire_contract')
    .setDescription('Mark a contract as expired!')
    .addStringOption(option =>
        option.setName('contract_url')
            .setDescription('What is the url of your contract?')
            .setRequired(true)
            .setMaxLength(200))
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
        await markSingleContractExpired(interaction.user.id, interaction.options.getString("contract_url").trim());
        const response = "Contract has been marked as expired."
        await interaction.editReply({ content: response });
    }
    catch (error) {
        await interaction.editReply({ content: error.toString() });
    }
}