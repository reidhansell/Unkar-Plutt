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
                    .setCustomId(interaction.id)
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Primary),
            );

        const filter = i => i.customId === interaction.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            const response2 = "**Mining Contract**\n" +
                "Status: IN PROGRESS by <@" + i.user.id + ">\n" +
                "Buyer: <@" + interaction.user.id + ">\n" +
                "Resource: https://swgtracker.com/?r=" + interaction.options.getString('resource') + "\n" +
                "Quantity: " + interaction.options.getString('quantity') + "\n" +
                "CPU: " + interaction.options.getString('cpu') + "\n";
            await i.update({ content: response2, components: [] });
        });

        await interaction.reply({ content: response, components: [row] });

    },

};