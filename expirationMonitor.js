import {getExpiredContracts, updateContract } from './databaseManager.js';
import Contract from './objects/Contract.js';

export async function markExpiredContracts() {
    try {
        console.log("Marking expired contracts...");
        const expiredContracts = await getExpiredContracts();

        for (let contractData of expiredContracts) {
            let contract = new Contract(JSON.parse(contractData.contract_object));
            contract.setStatus("EXPIRED");
            await updateContract(contract);
            console.log(`Marked contract ${contract.getContractID()} as EXPIRED`);
        }
    } catch (error) {
        console.error("Error marking contracts as expired:", error);
    }
}