const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { openContract } = require('../databaseManager');
const { v4: uuidv4 } = require('uuid');
const Contract = require("../objects/Contract");


module.exports = {
    data: new SlashCommandBuilder()
        .setName('contract')
        .setDescription('Post a mining contract!')
        .addStringOption(option =>
            option.setName('resource')
                .setDescription('What resource do you want to buy?')
                .setRequired(true)
                .setMaxLength(200))
        .addStringOption(option =>
            option.setName('quantity')
                .setDescription('How many units of said resource?')
                .setRequired(true)
                .setMaxLength(200))
        .addStringOption(option =>
            option.setName('cpu')
                .setDescription('How many credits per unit?')
                .setRequired(true)
                .setMaxLength(200)),
    async execute(contract) {
        await contract.reply({ ephemeral: false, content: "Generating a contract..." });
        var url = ""
        var message_id = ""
        var channel_id = ""
        var resource = contract.options.getString("resource").replace(/[^a-zA-Z0-9 ]/g, '').trim();
        if (resource.indexOf("=") != -1) {
            resource = resource.substring(resource.indexOf("=") + 1);
        }
        await contract.fetchReply().then(reply => { url = reply.url; reply_id = reply.id; channel_id = reply.channelId });

        var contractObject = new Contract({
            "crafter_id": contract.user.id,
            "miner_id": "",
            "status": "OPEN",
            "url": url,
            "resource": resource,
            "quantity": contract.options.getString("quantity").replace(/[^a-zA-Z0-9 .]/g, '').trim(),
            "cpu": contract.options.getString("cpu").replace(/[^a-zA-Z0-9 .]/g, '').trim(),
            "message_id": message_id,
            "channel_id": channel_id,
            "accept_id": uuidv4(),
            "cancel_id": uuidv4(),
            "unaccept_id": uuidv4(),
            "vendors_id": uuidv4(),
            "complete_id": uuidv4(),
            "uncomplete_id": uuidv4(),
            "confirm_id": uuidv4(),
        })

        const contractButtons = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId(contractObject.accept_id)
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(contractObject.cancel_id)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            ]);

        await contract.editReply({ content: contractObject.toString(), components: [contractButtons] });

        openContract(contractObject);

    },

};

//just remove filters altogether, use if statements instead? don't specify interaction type in variable name
