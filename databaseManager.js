const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS vendor (owner_id TEXT, vendor_name TEXT, location TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS contract (crafter TEXT, miner TEXT, resource TEXT, quantity TEXT, cpu TEXT, url TEXT)");

    /*const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    stmt.finalize();

    db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
        console.log(row.id + ": " + row.info);
    });*/
});

function registerVendor(ownerID, vendorName, vendorLocation) {
    const statement = db.prepare("INSERT INTO vendor VALUES (" + ownerID + " TEXT, " + vendorName + " TEXT, " + vendorLocation + ")");
    statement.finalize();
}

function unregisterVendor(ownerID, vendorName) {
    const statement = db.prepare("DELETE FROM vendor WHERE owner_id EQUALS " + ownerID + " AND vendor_name EQUALS " + vendorName);
    statement.finalize();
}

function getVendors(ownerID) {
    var vendors = "<@" + ownerID + ">'s vendors:\n";
    db.each("SELECT * from vendor WHERE owner_id EQUALS " + ownerID, (err, row) => {
        vendors = vendors + row.info + "\n"
    })
}

module.exports = { db, registerVendor, unregisterVendor, getVendors }