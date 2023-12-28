import { getVendors, updateContract, getContractByButton, checkNotifications } from './databaseManager.js';
import { ComponentType } from 'discord.js';

let client;

export async function startCollectors(clientParam) {
    client = clientParam;
    const SHADEID = '941946604309594142'; // Change this for testing
    const guild = await client.guilds.cache.get(SHADEID);

    if (!guild) {
        console.log(`Guild with ID ${SHADEID} not found.`);
        return;
    }

    let guildChannels = guild.channels.cache;
    guildChannels = await guildChannels.filter(channel => channel.type === 0);
    for (const channel of guildChannels.values()) {
        const collector = channel.createMessageComponentCollector({ componentType: ComponentType.Button });
        collector.on('collect', interactionHandler);
    };

    console.log("Collectors are running on SHADE");
}

async function interactionHandler(interaction) {
    await interaction.deferReply({ ephemeral: true });
    let contractObject;
    try {
        contractObject = await getContractByButton(interaction.customId);
    } catch (error) {
        console.error("Error getting contract by button:", error);
        interaction.editReply({ content: "There was an error processing your request. Please try again later.", ephemeral: true });
        return;
    }

    try {
        if (interaction.customId === contractObject.accept_id || interaction.customId === contractObject.uncomplete_id) {
            await handleAcceptOrUncomplete(interaction, contractObject);
        } else if (interaction.customId === contractObject.unaccept_id) {
            await handleUnaccept(interaction, contractObject);
        } else if (interaction.customId === contractObject.vendors_id) {
            await handleVendors(interaction, contractObject);
        } else if (interaction.customId === contractObject.cancel_id || interaction.customId === contractObject.confirm_id) {
            await handleCancelOrConfirm(interaction, contractObject);
        } else if (interaction.customId === contractObject.complete_id) {
            await handleComplete(interaction, contractObject);
        }
    } catch (error) {
        console.error("Error handling interaction:", error);
        interaction.editReply({ content: "There was an error processing your request. Please try again later.", ephemeral: true });
    }
}

async function handleAcceptOrUncomplete(interaction, contractObject) {
    if (contractObject.miner_id === "" || contractObject.miner_id === interaction.user.id) {
        if (contractObject.miner_id === "") {
            await contractObject.setMiner(interaction.user.id);
        }
        contractObject.setStatus('IN PROGRESS');
        await updateContract(contractObject);

        await interaction.message.edit({ content: contractObject.toString(), components: [contractObject.toButtons()] });
        if (await checkNotifications(contractObject.crafter_id)) {
            const crafter = await client.users.fetch(contractObject.crafter_id);
            const crafterDM = await crafter.createDM();
            await crafterDM.send(`Your ${contractObject.resource} contract is now: ${contractObject.status}\nURL: ${contractObject.url}`);
        }
        await interaction.deleteReply();
    } else {
        await interaction.editReply({ content: "You cannot uncomplete a contract that you did not open.", ephemeral: true });
    }
}

async function handleUnaccept(interaction, contractObject) {
    if (contractObject.miner_id != interaction.user.id) {
        await interaction.editReply({ content: "You cannot unaccept a contract that you did not accept.", ephemeral: true })
    } else {
        await contractObject.setMiner("");
        await contractObject.setStatus("OPEN");
        await updateContract(contractObject);
        await interaction.message.edit({ content: contractObject.toString(), components: [contractObject.toButtons()] });
        if (await checkNotifications(contractObject.crafter_id)) {
            const crafter = await client.users.fetch(contractObject.crafter_id);
            const crafterDM = await crafter.createDM();
            await crafterDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: " + contractObject.url);
        }
        await interaction.deleteReply();
    }

}

async function handleVendors(interaction, contractObject) {
    const vendors = await getVendors(contractObject.crafter_id);
    const minerDM = await interaction.user.createDM();
    minerDM.send(vendors);
    await interaction.deleteReply();
}

async function handleCancelOrConfirm(interaction, contractObject) {
    if (contractObject.crafter_id != interaction.user.id) {
        await interaction.editReply({ content: "You cannot close a contract that you did not open.", ephemeral: true })
    } else {
        if (interaction.customId === contractObject.cancel_id) {
            contractObject.setStatus("CANCELLED");
        } else {
            contractObject.setStatus("CONFIRMED");
        }
        updateContract(contractObject);
        await interaction.message.delete();
        if (interaction.customId === contractObject.confirm_id) {
            if (await checkNotifications(contractObject.miner_id)) {
                const miner = await client.users.fetch(contractObject.miner_id);
                const minerDM = await miner.createDM();
                minerDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: REMOVED");
            }
        }
        await interaction.deleteReply();
    }
}

async function handleComplete(interaction, contractObject) {
    if (contractObject.miner_id != interaction.user.id) {
        await interaction.editReply({ content: "You cannot complete a contract that you did not accept.", ephemeral: true });
    } else {
        contractObject.setStatus('COMPLETE');
        updateContract(contractObject);
        await interaction.message.edit({ content: contractObject.toString(), components: [contractObject.toButtons()] });
        if (await checkNotifications(contractObject.crafter_id)) {
            const crafter = await client.users.fetch(contractObject.crafter_id);
            const crafterDM = await crafter.createDM();
            crafterDM.send("Your " + contractObject.resource + " contract is now: " + contractObject.status + "\nURL: " + contractObject.url);
        }
        await interaction.deleteReply();
    }
}