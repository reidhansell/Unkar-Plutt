import {getExpiredContracts, updateContract, getCrafterContracts, getMinerContracts } from './databaseManager.js';
import Contract from './objects/Contract.js';

export async function markExpiredContracts() {
    try {
        console.log("Marking expired contracts...");
        const expiredContracts = await getExpiredContracts();

        for (let contractData of expiredContracts) {
            let contract = new Contract(JSON.parse(contractData.contract_object));
            contract.setStatus("EXPIRED");
            await updateContract(contract);
        }
    } catch (error) {
        console.error("Error marking contracts as expired:", error);
    }
}

export async function markSingleContractExpired(crafter_id, url) {
    try {
        console.log("Marking expired contract...");
        const contractData = await getCrafterContracts(crafter_id);
        for (let singleContractData of contractData) {
            let contract = new Contract(JSON.parse(singleContractData.contract_object));
            if (contract.url === url) {
                contract.setStatus("EXPIRED");
                await updateContract(contract);
                break;
            }
        }
        const minerContractData = await getMinerContracts(crafter_id);
        for (let singleContractData of minerContractData) {
            let contract = new Contract(JSON.parse(singleContractData.contract_object));
            if (contract.url === url) {
                contract.setStatus("EXPIRED");
                await updateContract(contract);
                break;
            }
        }
    } catch (error) {
        console.error("Error marking contract as expired:", error);
    }
}