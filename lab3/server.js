const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Помилка підключення до БД:', err.message);
    } else {
        console.log('Успішно підключено до бази даних SQLite.');
        

        db.run(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                startTime TEXT,
                endTime TEXT,
                duration TEXT
            )
        `);


        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                gender TEXT,
                dob TEXT
            )
        `);
    }
});




app.post('/api/register', (req, res) => {
    const { name, email, password, gender, dob } = req.body;
    
    const query = `INSERT INTO users (name, email, password, gender, dob) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name, email, password, gender, dob], function(err) {
        if (err) {

            return res.status(400).json({ error: 'Користувач з таким email вже існує!' });
        }

        res.json({ 
            message: 'Реєстрація успішна!', 
            user: { name, email, gender, dob } 
        });
    });
});


app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    

    db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Невірний email або пароль!' });
        }

        res.json({ 
            message: 'Вхід успішний!', 
            user: { name: user.name, email: user.email, gender: user.gender, dob: user.dob } 
        });
    });
});


app.delete('/api/users/:email', (req, res) => {
    const email = req.params.email;
    
    db.run(`DELETE FROM users WHERE email = ?`, email, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Користувача успішно видалено з бази даних!' });
    });
});


app.get('/api/sessions', (req, res) => {
    db.all('SELECT * FROM sessions', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/sessions', (req, res) => {
    const { name, startTime, endTime, duration } = req.body;
    const query = `INSERT INTO sessions (name, startTime, endTime, duration) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, startTime, endTime, duration], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: 'Сеанс збережено!' });
    });
});


app.delete('/api/sessions/:id', (req, res) => {
    const id = req.params.id;
    
    db.run(`DELETE FROM sessions WHERE id = ?`, id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Сеанс успішно видалено!' });
    });
});

app.listen(PORT, () => {
    console.log(`Сервер працює на http://localhost:${PORT}`);
});