const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { generateContract, acceptContract, completeContract } = require('../utilities/contractGenerator');
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
        const completeID = uuidv4();
        const uncompleteID = uuidv4();
        const confirmID = uuidv4();
        collector.on('collect', async interaction => {

            if (interaction.customId === acceptID || interaction.customId === uncompleteID) {
                if (miner === "") { miner = interaction.user.id; }
                if (miner != interaction.user.id) {
                    await interaction.reply({ content: "You cannot uncomplete a contract that you did not open.", ephemeral: true })
                } else {
                    const acceptedContractContent = acceptContract(contract, miner);
                    const acceptedContractButtons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(vendorsID)
                                .setLabel("Vendors")
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(completeID)
                                .setLabel('Complete')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(unacceptID)
                                .setLabel('Unaccept')
                                .setStyle(ButtonStyle.Danger),
                        );
                    await interaction.update({ content: acceptedContractContent, components: [acceptedContractButtons] });
                }
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
                await interaction.deferReply({ ephemeral: true });
                const vendors = await getVendors(contract.user.id);
                await interaction.editReply({ content: vendors })
            }
            else if (interaction.customId === cancelID || interaction.customId === confirmID) {
                if (crafter != interaction.user.id) {
                    await interaction.reply({ content: "You cannot close a contract that you did not open.", ephemeral: true })
                } else {
                    await interaction.update({ content: "" })
                    await contract.deleteReply();
                }
            } else if (interaction.customId === completeID) {
                if (miner != interaction.user.id) {
                    await interaction.reply({ content: "You cannot complete a contract that you did not accept.", ephemeral: true });
                } else {
                    const completedContractContent = await completeContract(contract, interaction);
                    const completedContractButtons = new ActionRowBuilder()
                        .addComponents([
                            new ButtonBuilder()
                                .setCustomId(confirmID)
                                .setLabel('Confirm')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(uncompleteID)
                                .setLabel('Uncomplete')
                                .setStyle(ButtonStyle.Danger),

                        ]);
                    await interaction.update({ content: completedContractContent, components: [completedContractButtons] })
                }
            }
        });

    },

};

//just remove filters altogether, use if statements instead? don't specify interaction type in variable name