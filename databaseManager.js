const db = require('better-sqlite3')('shade.db');

const createVendorTable = db.prepare("CREATE TABLE IF NOT EXISTS vendor (owner_id TEXT, name TEXT, vendor_object JSON)");
createVendorTable.run();
const createContractTable = db.prepare("CREATE TABLE IF NOT EXISTS contract (crafter_id TEXT, miner_id TEXT, status TEXT, url TEXT, contract_object JSON)");
createContractTable.run();

function registerVendor(vendorObject) {
    const getVendor = db.prepare("SELECT * FROM vendor WHERE owner_id='" + vendorObject.ownerID + "' AND name='" + vendorObject.name + "'");
    var vendor = getVendor.get();
    if (vendor) {
        throw ('You already own a vendor named, "' + vendorObject.name + '"');
    }
    const registerVendor = db.prepare("INSERT INTO vendor VALUES ('" + vendorObject.ownerID + "', '" + vendorObject.name + "', '" + JSON.stringify(vendorObject) + "')");
    registerVendor.run();
}

function unregisterVendor(ownerID, name) {
    const getVendor = db.prepare("SELECT * FROM vendor WHERE owner_id='" + ownerID + "' AND name='" + name + "'");
    var vendor = getVendor.get();
    if (!vendor) {
        throw ('You do not own a vendor named, "' + name + '"');
    }
    const unregisterVendor = db.prepare("DELETE FROM vendor WHERE owner_id='" + ownerID + "' AND name='" + name + "'");
    unregisterVendor.run();
}

function getVendors(ownerID) {
    const getVendors = db.prepare("SELECT vendor_object FROM vendor WHERE owner_id='" + ownerID + "'");
    var vendors = getVendors.all();
    var vendorsContent = "<@" + ownerID + ">'s vendors:\n";
    for (var i = 0; i < vendors.length; i++) {
        const vendor = JSON.parse(vendors[i].vendor_object);
        vendorsContent += vendor.name + ": " + vendor.location + "\n";
    }
    return vendorsContent;
}

function getDiscounts() {
    const getVendors = db.prepare("SELECT vendor_object FROM vendor");
    var vendors = getVendors.all();
    var vendorsContent = "Guild discounts:\n";
    for (var i = 0; i < vendors.length; i++) {
        const vendor = JSON.parse(vendors[i].vendor_object);
        if (vendor.discounts != "") {
            vendorsContent += vendor.name + ": " + vendor.discounts + "\nLocation: " + vendor.location + "\n\n";
        }
    }
    return vendorsContent;
}

function openContract(contractObject) {
    const openContract = db.prepare("INSERT INTO CONTRACT VALUES ('" + contractObject.crafterID + "', '', 'OPEN', '" + contractObject.url + "', '" + JSON.stringify(contractObject) + "')");
    openContract.run();
}

function updateContract(contractObject) {
    const updateContract = db.prepare("UPDATE contract SET contract_object='" + JSON.stringify(contractObject) + "', status ='" + contractObject.status + "' WHERE url='" + contractObject.url + "'");
    updateContract.run();
}

function getContracts(id) {
    const getContracts = db.prepare("SELECT contract_object FROM contract WHERE crafter_id='" + id + "' OR miner_id='" + id + "'");
    var contracts = getContracts.all();
    var contractsContent = "Your open contracts:\n";
    for (var i = 0; i < contracts.length; i++) {
        const contract = JSON.parse(contracts[i].contract_object);
        if (contract.status != "CONFIRMED" && contract.status != "CANCELLED") {
            contractsContent += contract.resource + ": " + contract.url + "\nStatus: " + contract.status + "\n\n";
        }
    }
    return contractsContent;
}

module.exports = { registerVendor, unregisterVendor, getVendors, getDiscounts, openContract, updateContract, getContracts }

