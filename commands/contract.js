import { SlashCommandBuilder } from 'discord.js';
import { openContract } from '../databaseManager.js';
import { v4 as uuidv4 } from 'uuid';
import Contract from "../objects/Contract.js";

export const data = new SlashCommandBuilder()
    .setName('contract')
    .setDescription('Post a mining contract!')
    .addStringOption(option => option.setName('resource')
        .setDescription('What resource do you want to buy?')
        .setRequired(true)
        .setMaxLength(200))
    .addIntegerOption(option => option.setName('quantity')
        .setDescription('How many units of said resource?')
        .setRequired(true))
    .addNumberOption(option => option.setName('cpu')
        .setDescription('How many credits per unit?')
        .setRequired(true));
export async function execute(contract) {
    await contract.reply({ ephemeral: false, content: "Generating a contract..." });
    let url = "";
    let message_id = "";
    let channel_id = "";
    let quantity = contract.options.getInteger("quantity").toString().trim();
    let cpu = contract.options.getNumber("cpu").toString().trim();
    let resource = contract.options.getString("resource").trim();

    if (resource.indexOf("=") != -1) {
        resource = resource.substring(resource.indexOf("=") + 1);
    }
    resource = resource.trim();
    await contract.fetchReply().then(reply => { url = reply.url; message_id = reply.id; channel_id = reply.channel.id; });

    let contractObject = new Contract({
        "crafter_id": contract.user.id,
        "miner_id": "",
        "status": "OPEN",
        "url": url,
        "resource": resource,
        "quantity": quantity,
        "cpu": cpu,
        "message_id": message_id,
        "channel_id": channel_id,
        "accept_id": uuidv4(),
        "cancel_id": uuidv4(),
        "unaccept_id": uuidv4(),
        "vendors_id": uuidv4(),
        "complete_id": uuidv4(),
        "uncomplete_id": uuidv4(),
        "confirm_id": uuidv4(),
    });

    await openContract(contractObject);

    await contract.editReply({ content: contractObject.toString(), components: [contractObject.toButtons()] });

}
