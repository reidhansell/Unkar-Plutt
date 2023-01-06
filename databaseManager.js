const db = require('better-sqlite3')('shade.db');

const createVendorTable = db.prepare("CREATE TABLE IF NOT EXISTS vendor (owner_id TEXT, name TEXT, vendor_object JSON)");
createVendorTable.run();
const createContractTable = db.prepare("CREATE TABLE IF NOT EXISTS contract (contract_object JSON)");
createContractTable.run();

function registerVendor(ownerID, name, location) {
    const vendor = JSON.stringify({ "name": name, "location": location })
    console.log(vendor);
    const registerVendor = db.prepare("INSERT INTO vendor VALUES ('" + ownerID + "', '" + name + "', '" + vendor + "')");
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
    console.log(vendors);
    var vendorsContent = "<@" + ownerID + ">'s vendors:\n";
    for (var i = 0; i < vendors.length; i++) {
        const vendor = JSON.parse(vendors[i].vendor_object);
        console.log(vendor);
        vendorsContent += vendor.name + ": " + vendor.location + "\n";
    }
    return vendorsContent;
}
module.exports = { registerVendor, unregisterVendor, getVendors }

