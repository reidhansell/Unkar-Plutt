const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { generateContract } = require('../utilities/contractGenerator');
const { db } = require('../databaseManager');

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
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(initialCrafterInteraction.id)
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Primary),
            );

        await initialCrafterInteraction.reply({ content: contract, components: [row] });

        const acceptFilter = initialMinerInteraction => initialMinerInteraction.customId === initialCrafterInteraction.id;

        const collector = initialCrafterInteraction.channel.createMessageComponentCollector({ acceptFilter });

        collector.on('collect', async initialMinerInteraction => {
            const acceptedContract = acceptContract(initialCrafterInteraction, initialMinerInteraction)
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(initialCrafterInteraction.id)
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Primary),
                );
            await initialMinerInteraction.update({ content: acceptedContract, components: [row] });
        });



    },

};