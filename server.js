const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serves index.html and script.js

let users = [];

// CREATE
app.post('/users', (req, res) => {
    const { name, items, date } = req.body;
    if (!name || !items || !date) {
        return res.status(400).json({ message: 'All fields required' });
    }
    users.push({ name, items, date });
    res.json({ message: 'User added!' });
});

// READ
app.get('/users', (req, res) => {
    res.json(users);
});

// UPDATE
app.put('/users/name/:name', (req, res) => {
    const { name } = req.params;
    const { items, date } = req.body;
    const user = users.find(u => u.name === name);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.items = items || user.items;
    user.date = date || user.date;
    res.json({ message: 'User updated!' });
});

// DELETE
app.delete('/users/name/:name', (req, res) => {
    const { name } = req.params;
    const initialLength = users.length;
    users = users.filter(u => u.name !== name);
    if (users.length === initialLength) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted!' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));