const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

const db = new sqlite3.Database(path.join(__dirname, 'database.db'));
db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT, 
    email TEXT, 
    message TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    db.run(`INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`, 
    [name, email, message], (err) => {
        if (err) return res.status(500).json({ error: "Storage Error" });
        res.status(201).json({ success: true });
    });
});

// Fetch all messages
app.get('/api/messages', (req, res) => {
    db.all("SELECT * FROM contacts ORDER BY date DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
});

// Delete message
app.delete('/api/delete/:id', (req, res) => {
    db.run("DELETE FROM contacts WHERE id = ?", req.params.id, err => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});