const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const filter = (reaction) => {
    return reaction.emoji.name === '👍';
}

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
    async execute(interaction) {
        const response = "**Mining Contract**\n" +
            "Status: OPEN" + "\n" +
            "Buyer: <@" + interaction.user.id + ">\n" +
            "Resource: https://swgtracker.com/?r=" + interaction.options.getString('resource') + "\n" +
            "Quantity: " + interaction.options.getString('quantity') + "\n" +
            "CPU: " + interaction.options.getString('cpu') + "\n";
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('primary')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Primary),
            );

        const filter = i => i.customId === 'primary';

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        const response2 = "**Mining Contract**\n" +
            "Status: IN PROGRESS" + "\n" +
            "Buyer: <@" + interaction.user.id + ">\n" +
            "Resource: https://swgtracker.com/?r=" + interaction.options.getString('resource') + "\n" +
            "Quantity: " + interaction.options.getString('quantity') + "\n" +
            "CPU: " + interaction.options.getString('cpu') + "\n";

        collector.on('collect', async i => {
            await i.update({ content: response2, components: [] });
        });

        await interaction.reply({ content: response, components: [row] });

    },

};