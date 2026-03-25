const express = require('express');
const { Pool } = require('pg'); // Swapped sqlite3 for pg
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'Public')));

// 1. Connect to PostgreSQL using the Environment Variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Render's managed PostgreSQL
    }
});

// 2. Set your Admin Password here!
const ADMIN_PASSWORD = "Iwillnottell.2"; 

// 3. Create table if not exists (Auto-Initialize)
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("PostgreSQL table is ready");
    } catch (err) {
        console.error("Database initialization error:", err);
    }
};
initDb();

// Submit contact form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const query = `
        INSERT INTO contacts (name, email, message)
        VALUES ($1, $2, $3) RETURNING id
    `;

    try {
        const result = await pool.query(query, [name, email, message]);
        res.status(201).json({ success: true, id: result.rows[0].id });
    } catch (err) {
        console.error("Insert error:", err);
        res.status(500).json({ error: "Database insert failed" });
    }
});

// Fetch all messages (Protected by Password)
app.get('/api/messages', async (req, res) => {
    const { password } = req.query;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const query = `SELECT * FROM contacts ORDER BY date DESC`;

    try {
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: "Database fetch failed" });
    }
});

// Delete message (Protected by Password)
app.delete('/api/delete/:id', async (req, res) => {
    const { password } = req.query;

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized access" });
    }

    const query = `DELETE FROM contacts WHERE id = $1`;

    try {
        const result = await pool.query(query, [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Message not found" });
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "Database delete failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});