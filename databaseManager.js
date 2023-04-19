const db = require('better-sqlite3')('shade.db');
const Contract = require("./objects/Contract");

const createVendorTable = db.prepare("CREATE TABLE IF NOT EXISTS vendor (owner_id TEXT, name TEXT, vendor_object JSON)");
createVendorTable.run();
const createContractTable = db.prepare("CREATE TABLE IF NOT EXISTS contract (crafter_id TEXT, miner_id TEXT, status TEXT, url TEXT, message_id TEXT, channel_id TEXT, accept_id TEXT, cancel_id TEXT, unaccept_id TEXT, vendors_id TEXT, complete_id TEXT, uncomplete_id TEXT, confirm_id TEXT, contract_object JSON)");
createContractTable.run();
const createNotificationTable = db.prepare("CREATE TABLE IF NOT EXISTS notification (user_id TEXT)");
createNotificationTable.run();

function registerVendor(vendorObject) {
    const getVendor = db.prepare("SELECT * FROM vendor WHERE owner_id='" + vendorObject.ownerID + "' AND name='" + vendorObject.name + "'");
    let vendor = getVendor.get();
    if (vendor) {
        throw ('You already own a vendor named, "' + vendorObject.name + '"');
    }
    const registerVendor = db.prepare("INSERT INTO vendor VALUES ('" + vendorObject.ownerID + "', '" + vendorObject.name + "', '" + JSON.stringify(vendorObject) + "')");
    registerVendor.run();
}

function unregisterVendor(ownerID, name) {
    const getVendor = db.prepare("SELECT * FROM vendor WHERE owner_id='" + ownerID + "' AND name='" + name + "'");
    let vendor = getVendor.get();
    if (!vendor) {
        throw ('You do not own a vendor named, "' + name + '"');
    }
    const unregisterVendor = db.prepare("DELETE FROM vendor WHERE owner_id='" + ownerID + "' AND name='" + name + "'");
    unregisterVendor.run();
}

function getVendors(ownerID) {
    const getVendors = db.prepare("SELECT vendor_object FROM vendor WHERE owner_id='" + ownerID + "'");
    let vendors = getVendors.all();
    let vendorsContent = "<@" + ownerID + ">'s vendors:\n";
    for (let i = 0; i < vendors.length; i++) {
        const vendor = JSON.parse(vendors[i].vendor_object);
        vendorsContent += vendor.name + ": " + vendor.location + "\n";
    }
    return vendorsContent;
}

function openContract(contractObject) {
    const openContract = db.prepare("INSERT INTO contract VALUES ('" +
        contractObject.crafter_id + "', '" +
        contractObject.miner_id + "', '" +
        contractObject.status + "', '" +
        contractObject.url + "', '" +
        //Resource, quantity, and cpu are not columns because they do not help fetch data
        contractObject.message_id + "', '" +
        contractObject.channel_id + "', '" +
        contractObject.accept_id + "', '" +
        contractObject.cancel_id + "', '" +
        contractObject.unaccept_id + "', '" +
        contractObject.vendors_id + "', '" +
        contractObject.complete_id + "', '" +
        contractObject.uncomplete_id + "', '" +
        contractObject.confirm_id + "', '" +
        JSON.stringify(contractObject) + "')");
    openContract.run();
}

function updateContract(contractObject) {
    const updateContract = db.prepare("UPDATE contract SET contract_object='" + JSON.stringify(contractObject) + "', status ='" + contractObject.status + "', miner_id ='" + contractObject.miner_id + "' WHERE url ='" + contractObject.url + "'");
    updateContract.run();
}

function updateURL(contractObject, oldURL) {
    const updateContract = db.prepare("UPDATE contract SET contract_object='" + JSON.stringify(contractObject) + "', status ='" + contractObject.status + "', miner_id ='" + contractObject.miner_id + "', url ='" + contractObject.url + "', message_id = '" + contractObject.message_id + "', channel_id = '" + contractObject.channel_id + "' WHERE url ='" + oldURL + "'");
    updateContract.run();
}

function getContracts(id) {
    const getContracts = db.prepare("SELECT contract_object FROM contract WHERE crafter_id='" + id + "' OR miner_id='" + id + "'");
    let contracts = getContracts.all();
    let contractsContent = "Your open contracts:\n";
    for (let i = 0; i < contracts.length; i++) {
        const contract = JSON.parse(contracts[i].contract_object);
        if (contract.status != "CONFIRMED" && contract.status != "CANCELLED") {
            contractsContent += contract.resource + ": " + contract.url + "\nStatus: " + contract.status + "\n\n";
        }
    }
    return contractsContent;
}

function getContractObjects(id) {
    const getContracts = db.prepare("SELECT contract_object FROM contract WHERE crafter_id='" + id + "' OR miner_id='" + id + "'");
    let contracts = getContracts.all();
    let parsedContracts = [];
    for (let i = 0; i < contracts.length; i++) {
        const contract = JSON.parse(contracts[i].contract_object);
        if (contract.status != "CONFIRMED" && contract.status != "CANCELLED") {
            parsedContracts.push(new Contract(contract));
        }
    }
    return parsedContracts;
}

function getContractByButton(button_id) {
    const getContract = db.prepare("SELECT contract_object FROM contract WHERE accept_id='" + button_id + "' OR cancel_id='" + button_id + "' OR unaccept_id='" + button_id + "' OR vendors_id='" + button_id + "' OR complete_id='" + button_id + "' OR uncomplete_id='" + button_id + "' OR confirm_id='" + button_id + "'");
    let contract = new Contract(JSON.parse(getContract.get().contract_object));
    return contract;
}

function toggleNotifications(userID) {
    const getUser = db.prepare("SELECT * FROM notification WHERE user_id='" + userID + "'");
    let user = getUser.get();
    if (!user) {
        const toggleNotifications = db.prepare("INSERT INTO notification VALUES ('" + userID + "')");
        toggleNotifications.run();
        return true;
    }
    else {
        const toggleNotifications = db.prepare("DELETE FROM notification WHERE user_id='" + userID + "'");
        toggleNotifications.run();
        return false;
    }
}

function checkNotifications(userID) {
    const getUser = db.prepare("SELECT * FROM notification WHERE user_id='" + userID + "'");
    let user = getUser.get();
    if (!user) {
        return false;
    }
    else {
        return true;
    }
}

module.exports = { registerVendor, unregisterVendor, getVendors, openContract, updateContract, getContracts, getContractByButton, toggleNotifications, checkNotifications, getContractObjects, updateURL }

