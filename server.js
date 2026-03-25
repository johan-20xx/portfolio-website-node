const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

const db = new Database(path.join(__dirname, 'database.db'));

db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Submit contact form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    try {
        db.prepare(`
            INSERT INTO contacts (name, email, message)
            VALUES (?, ?, ?)
        `).run(name, email, message);

        res.status(201).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Storage Error", details: err });
    }
});

// Fetch all messages
app.get('/api/messages', (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT * FROM contacts ORDER BY date DESC
        `).all();

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

// Delete message
app.delete('/api/delete/:id', (req, res) => {
    try {
        db.prepare(`DELETE FROM contacts WHERE id = ?`)
          .run(req.params.id);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});