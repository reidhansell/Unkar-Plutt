import { registerVendor } from "../databaseManager.js";
import { SlashCommandBuilder } from "discord.js";
import Vendor from "../objects/Vendor.js";

export const data = new SlashCommandBuilder()
    .setName('register_vendor')
    .setDescription('Register a vendor!')
    .addStringOption(option =>
        option.setName('vendor_name')
            .setDescription('What is the name of your vendor?')
            .setRequired(true)
            .setMaxLength(200))
    .addStringOption(option =>
        option.setName('vendor_location')
            .setDescription('Where is your vendor located?')
            .setRequired(true)
            .setMaxLength(200));
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
        let vendorObject = new Vendor(interaction.user.id, interaction.options.getString("vendor_name").trim(), interaction.options.getString("vendor_location").trim());
        await registerVendor(vendorObject);
        const response = interaction.options.getString('vendor_name').trim() + " has been registered."
        await interaction.editReply({ content: response });
    }
    catch (error) {
        await interaction.editReply({ content: error.toString() });
    }
}