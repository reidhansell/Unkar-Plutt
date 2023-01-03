const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { generateContract, acceptContract } = require('../utilities/contractGenerator');
const { getVendors } = require('../databaseManager');
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
    async execute(contract) {
        var crafter = contract.user.id;
        await contract.deferReply({ ephemeral: false });

        const contractContent = generateContract(contract);

        const acceptID = uuidv4();
        const cancelID = uuidv4();
        const contractButtons = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId(acceptID)
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(cancelID)
                    .setLabel('Cancel')
                    .setStyle(ButtonStyle.Danger)
            ]);

        await contract.editReply({ content: contractContent, components: [contractButtons] });

        const collector = contract.channel.createMessageComponentCollector({ componentType: ComponentType.Button });

        var miner = "";
        const unacceptID = uuidv4();
        const vendorsID = uuidv4();
        collector.on('collect', async interaction => {

            if (interaction.customId === acceptID) {
                const acceptedContractContent = acceptContract(contract, interaction);
                const acceptedContractButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(vendorsID)
                            .setLabel("Vendors")
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(unacceptID)
                            .setLabel('Unaccept')
                            .setStyle(ButtonStyle.Danger),
                    );
                await interaction.update({ content: acceptedContractContent, components: [acceptedContractButtons] });
                miner = interaction.user.id;
            }
            else if (interaction.customId === unacceptID) {
                if (miner != interaction.user.id) {
                    await interaction.reply({ content: "You cannot unaccept a contract that you did not accept.", ephemeral: true })
                } else {
                    const contractContent = generateContract(contract);

                    const contractButtons = new ActionRowBuilder()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(acceptID)
                                .setLabel('Accept')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(cancelID)
                                .setLabel('Cancel')
                                .setStyle(ButtonStyle.Danger)
                        ]);

                    await interaction.update({ content: contractContent, components: [contractButtons] });
                }
            } else if (interaction.customId === vendorsID) {
                const vendors = getVendors(contract.user.id);
                interaction.reply({ content: vendors })
            }
            else if (interaction.customId === cancelID) {
                if (crafter != interaction.user.id) {
                    await interaction.reply({ content: "You cannot cancel a contract that you did not open.", ephemeral: true })
                } else {
                    await interaction.update({ content: "" })
                    await contract.deleteReply();
                }
            }
        });

    },

};

//just remove filters altogether, use if statements instead? don't specify interaction type in variable name