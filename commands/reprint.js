import { getContractObjects, updateURL } from "../databaseManager.js";
import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName('reprint_contracts')
    .setDescription('Reprint your contracts!');
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    let contractObjects = await getContractObjects(interaction.user.id);
    for (let i = 0; i < contractObjects.length; i++) {
        if (contractObjects[i].message_id && contractObjects[i].channel_id) {
            try {
                let channel = await interaction.guild.channels.fetch(contractObjects[i].channel_id);
                let message = await channel.messages.fetch(contractObjects[i].message_id);
                message.delete();
            } catch (error) {
                console.error(error);
            }
        }
        let oldURL = contractObjects[i].url;
        let message = await interaction.channel.send({ content: contractObjects[i].toString(), components: [contractObjects[i].toButtons()] });
        contractObjects[i].url = message.url;
        contractObjects[i].message_id = message.id;
        contractObjects[i].channel_id = interaction.channel.id;
        await updateURL(contractObjects[i], oldURL);
    }
    await interaction.deleteReply();
}