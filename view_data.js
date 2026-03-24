const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// This script lets you see your database content in the terminal
db.all("SELECT * FROM contacts", [], (err, rows) => {
    if (err) throw err;
    console.log("--- CURRENT DATABASE ENTRIES ---");
    console.table(rows);
    db.close();
});