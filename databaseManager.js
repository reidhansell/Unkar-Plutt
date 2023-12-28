import Database from 'better-sqlite3';
const db = new Database('shade.db');
import Contract from "./objects/Contract.js";

const createVendorTable = db.prepare("CREATE TABLE IF NOT EXISTS vendor (owner_id TEXT, name TEXT, vendor_object JSON)");
createVendorTable.run();
const createContractTable = db.prepare("CREATE TABLE IF NOT EXISTS contract (crafter_id TEXT, miner_id TEXT, status TEXT, url TEXT, message_id TEXT, channel_id TEXT, accept_id TEXT, cancel_id TEXT, unaccept_id TEXT, vendors_id TEXT, complete_id TEXT, uncomplete_id TEXT, confirm_id TEXT, contract_object JSON)");
createContractTable.run();
const createNotificationTable = db.prepare("CREATE TABLE IF NOT EXISTS notification (user_id TEXT)");
createNotificationTable.run();

async function registerVendor(vendorObject) {
    const getVendor = db.prepare("SELECT * FROM vendor WHERE owner_id = ? AND name = ?");
    let vendor = getVendor.get(vendorObject.ownerID, vendorObject.name);
    if (vendor) {
        throw ('You already own a vendor named, "' + vendorObject.name + '"');
    }
    const registerVendor = db.prepare("INSERT INTO vendor VALUES (?, ?, ?)");
    registerVendor.run(vendorObject.ownerID, vendorObject.name, JSON.stringify(vendorObject));
}

async function unregisterVendor(ownerID, name) {
    const getVendor = db.prepare("SELECT * FROM vendor WHERE owner_id = ? AND LOWER(name) = ?");
    let vendor = getVendor.get(ownerID, name);
    if (!vendor) {
        throw ('You do not own a vendor named, "' + name + '"');
    }

    const unregisterVendor = db.prepare("DELETE FROM vendor WHERE owner_id = ? AND LOWER(name) = ?");
    unregisterVendor.run(ownerID, name);
}

async function getVendors(ownerID) {
    const getVendors = db.prepare("SELECT vendor_object FROM vendor WHERE owner_id = ?");
    let vendors = getVendors.all(ownerID);
    let vendorsContent = "<@" + ownerID + ">'s vendors:\n";
    for (let i = 0; i < vendors.length; i++) {
        const vendor = JSON.parse(vendors[i].vendor_object);
        vendorsContent += vendor.name + ": " + vendor.location + "\n";
    }
    return vendorsContent;
}

async function openContract(contractObject) {
    const openContract = db.prepare("INSERT INTO contract VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    openContract.run(
        contractObject.crafter_id,
        contractObject.miner_id,
        contractObject.status,
        contractObject.url,
        contractObject.message_id,
        contractObject.channel_id,
        contractObject.accept_id,
        contractObject.cancel_id,
        contractObject.unaccept_id,
        contractObject.vendors_id,
        contractObject.complete_id,
        contractObject.uncomplete_id,
        contractObject.confirm_id,
        JSON.stringify(contractObject)
    );
}

async function updateContract(contractObject) {
    const updateContract = db.prepare("UPDATE contract SET contract_object = ?, status = ?, miner_id = ? WHERE url = ?");
    updateContract.run(JSON.stringify(contractObject), contractObject.status, contractObject.miner_id, contractObject.url);
}

async function updateURL(contractObject, oldURL) {
    const updateContract = db.prepare("UPDATE contract SET contract_object = ?, status = ?, miner_id = ?, url = ?, message_id = ?, channel_id = ? WHERE url = ?");
    updateContract.run(JSON.stringify(contractObject), contractObject.status, contractObject.miner_id, contractObject.url, contractObject.message_id, contractObject.channel_id, oldURL);
}

async function getContracts(id) {
    const getContracts = db.prepare("SELECT contract_object FROM contract WHERE crafter_id = ? OR miner_id = ?");
    let contracts = getContracts.all(id, id);
    let contractsContent = "Your open contracts:\n";
    for (let i = 0; i < contracts.length; i++) {
        const contract = JSON.parse(contracts[i].contract_object);
        if (contract.status != "CONFIRMED" && contract.status != "CANCELLED" && contract.status != "EXPIRED") {
            contractsContent += contract.resource + ": " + contract.url + "\nStatus: " + contract.status + "\n\n";
        }
    }
    return contractsContent;
}

async function getContractObjects(id) {
    const getContracts = db.prepare("SELECT contract_object FROM contract WHERE crafter_id = ? OR miner_id = ?");
    let contracts = getContracts.all(id, id);
    let parsedContracts = [];
    for (let i = 0; i < contracts.length; i++) {
        const contract = JSON.parse(contracts[i].contract_object);
        if (contract.status != "CONFIRMED" && contract.status != "CANCELLED" && contract.status != "EXPIRED") {
            parsedContracts.push(new Contract(contract));
        }
    }
    return parsedContracts;
}

async function getContractByButton(button_id) {
    const getContract = db.prepare("SELECT contract_object FROM contract WHERE accept_id = ? OR cancel_id = ? OR unaccept_id = ? OR vendors_id = ? OR complete_id = ? OR uncomplete_id = ? OR confirm_id = ?");
    let contract = new Contract(JSON.parse(getContract.get(button_id, button_id, button_id, button_id, button_id, button_id, button_id).contract_object));
    return contract;
}

async function toggleNotifications(userID) {
    const getUser = db.prepare("SELECT * FROM notification WHERE user_id = ?");
    let user = getUser.get(userID);
    if (!user) {
        const toggleNotifications = db.prepare("INSERT INTO notification VALUES (?)");
        toggleNotifications.run(userID);
        return true;
    }
    else {
        const toggleNotifications = db.prepare("DELETE FROM notification WHERE user_id = ?");
        toggleNotifications.run(userID);
        return false;
    }
}

async function checkNotifications(userID) {
    const getUser = db.prepare("SELECT * FROM notification WHERE user_id = ?");
    let user = getUser.get(userID);
    if (!user) {
        return false;
    }
    else {
        return true;
    }
}

async function getCrafterContracts(userID) {
    const crafterContractsQuery = db.prepare("SELECT contract_object FROM contract WHERE crafter_id = ?");
    const crafterContracts = crafterContractsQuery.all(userID);
    return crafterContracts;
}

async function getMinerContracts(userID) {
    const minerContractsQuery = db.prepare("SELECT contract_object FROM contract WHERE miner_id = ?");
    const minerContracts = minerContractsQuery.all(userID);
    return minerContracts;
}

async function getExpiredContracts() {
    const expiredContractsQuery = db.prepare("SELECT contract_object FROM contract WHERE status = 'OPEN' AND (strftime('%s','now') - strftime('%s', JSON_EXTRACT(contract_object, '$.created_at'))) > 2419200");
    const expiredContracts = expiredContractsQuery.all();
    return expiredContracts;
}

async function getTotalContractCount() {
    const totalContractsQuery = db.prepare("SELECT COUNT(*) as count FROM contract");
    const totalContracts = totalContractsQuery.get();
    return totalContracts['count'];
}

export {
    registerVendor,
    unregisterVendor,
    getVendors,
    openContract,
    updateContract,
    getContracts,
    getContractByButton,
    toggleNotifications,
    checkNotifications,
    getContractObjects,
    updateURL,
    getCrafterContracts,
    getMinerContracts,
    getExpiredContracts,
    getTotalContractCount
}

