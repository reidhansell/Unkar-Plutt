//const initSqlJs = require('sql.js');
const fs = require('fs');
const initSqlJs = require('sql-wasm.js');
const filebuffer = fs.readFileSync('swg-shade.sqlite');

class databaseManager {

    constructor() {
        if (filebuffer) {
            initSqlJs().then(function (SQL) {
                // Load the db
                this.db = new SQL.Database(filebuffer);

                // Execute a single SQL string that contains multiple statements
                let sqlstr = "CREATE TABLE contract (id INTEGER, crafter TEXT, miner TEXT, resource TEXT, quantity INTEGER, cpu INTEGER)";
                this.db.run(sqlstr); // Run the query without returning anything
            });
        } else {
            // Create a database
            this.db = new SQL.Database();
            const data = this.db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync("swg-shade.sqlite", buffer);
        }
    }





}