const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { generateContract } = require('../utilities/contractGenerator');
const { db } = require('../databaseManager');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('contract')
        .setDescription('Post a mining contract!')
        .addStringOption(option =>
            option.setName('resource')
                .setDescription('What resource do you want to buy?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('quantity')
                .setDescription('How many units of said resource?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('cpu')
                .setDescription('How many credits per unit?')
                .setRequired(true)),
    async execute(initialCrafterInteraction) {
        const contract = generateContract(initialCrafterInteraction);

        const acceptID = uuidv4();
        const cancelID = uuidv4();
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(acceptID)
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(cancelID)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            );

        await initialCrafterInteraction.reply({ content: contract, components: [row] });

        const acceptFilter = initialMinerInteraction => initialMinerInteraction.customId === acceptID;

        const collector = initialCrafterInteraction.channel.createMessageComponentCollector({ acceptFilter });

        const unacceptID = uuidv4();
        collector.on('collect', async initialMinerInteraction => {
            const acceptedContract = acceptContract(initialCrafterInteraction, initialMinerInteraction)
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(unacceptID)
                        .setLabel('Unaccept')
                        .setStyle(ButtonStyle.Danger),
                );
            await initialMinerInteraction.update({ content: acceptedContract, components: [row] });
        });

        collector.stop();

    },

};