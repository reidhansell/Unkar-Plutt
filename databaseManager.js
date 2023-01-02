//const initSqlJs = require('sql.js');
const fs = require('fs');
const initSqlJs = require('sql-wasm.js');
const filebuffer = fs.readFileSync('swg-shade.sqlite');

if (filebuffer) {
    initSqlJs().then(function (SQL) {
        // Load the db
        const db = new SQL.Database(filebuffer);

        // Execute a single SQL string that contains multiple statements
        let sqlstr = "CREATE TABLE contract (id INTEGER, crafter TEXT, miner TEXT, resource TEXT, quantity INTEGER, cpu INTEGER)";
        db.run(sqlstr); // Run the query without returning anything
    });
} else {
    // Create a database
    const db = new SQL.Database();
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync("swg-shade.sqlite", buffer);
}

module.exports = db