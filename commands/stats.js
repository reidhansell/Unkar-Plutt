import { SlashCommandBuilder } from "discord.js";
import { getCrafterContracts, getMinerContracts, getTotalContractCount } from "../databaseManager.js";

export const data = new SlashCommandBuilder()
    .setName('my_stats')
    .setDescription('See your contract stats!');
export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const crafterContracts = await getCrafterContracts(interaction.user.id);
    const minerContracts = await getMinerContracts(interaction.user.id);
    const totalContracts = await getTotalContractCount();

    let crafterContractsCompleted = 0;
    let crafterContractsOpen = 0;
    let crafterContractsInProgress = 0;
    let crafterContractsCancelled = 0;
    let crafterContractsConfirmed = 0;
    let crafterContractsExpired = 0;
    let creditsMade = 0;

    let minerContractsCompleted = 0;
    let minerContractsInProgress = 0;
    let minerContractsConfirmed = 0;
    let minerContractsExpired = 0;
    let creditsSpent = 0;

    for (let contract of crafterContracts) {
        const contractObject = JSON.parse(contract.contract_object);
        if (contractObject.status === "CONFIRMED") {
            crafterContractsConfirmed++;
            const quantityFloat = parseFloat(contractObject.quantity);
            const cpuFloat = parseFloat(contractObject.cpu);
            if (!isNaN(quantityFloat) && !isNaN(cpuFloat)) {
                creditsMade += quantityFloat * cpuFloat;
            }
        }
        else if (contractObject.status === "OPEN") {
            crafterContractsOpen++;
        }
        else if (contractObject.status === "IN PROGRESS") {
            crafterContractsInProgress++;
        }
        else if (contractObject.status === "CANCELLED") {
            crafterContractsCancelled++;
        }
        else if (contractObject.status === "COMPLETE") {
            crafterContractsCompleted++;
        }
        else if (contractObject.status === "EXPIRED") {
            crafterContractsExpired++;
        }
    }

    for (let contract of minerContracts) {
        const contractObject = JSON.parse(contract.contract_object);
        if (contractObject.status === "COMPLETE") {
            minerContractsCompleted++;
            creditsSpent += contractObject.quantity;
        }
        else if (contractObject.status === "IN PROGRESS") {
            minerContractsInProgress++;
        }
        else if (contractObject.status === "CONFIRMED") {
            minerContractsConfirmed++;
        }
        else if (contractObject.status === "EXPIRED") {
            minerContractsExpired++;
        }
    }

    const response =
        `**Your Contract Statistics**
\`\`\`
Crafter Contracts:
- Credits Made (confirmed contracts): ${creditsMade.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Confirmed: ${crafterContractsConfirmed}
- Completed: ${crafterContractsCompleted}
- In Progress: ${crafterContractsInProgress}
- Open: ${crafterContractsOpen}
- Cancelled: ${crafterContractsCancelled}
- Expired: ${crafterContractsExpired}

Miner Contracts:
- Credits Spent (confirmed contracts): ${creditsSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Confirmed: ${minerContractsConfirmed}
- Completed: ${minerContractsCompleted}
- In Progress: ${minerContractsInProgress}
- Expired: ${minerContractsExpired}
\`\`\`
You created ${crafterContracts.length + minerContracts.length} contracts out of ${totalContracts} total contracts on the server.`;

    await interaction.editReply({ content: response });

}