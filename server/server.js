import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

app.post('/signup', async (req, res) => {
    const { username, email, password, userType } = req.body;
    const table = userType === 'student' ? 'student_login' : 'teacher_login';

    try {
        const connection = await mysql.createConnection(dbConfig);
        const query = `INSERT INTO ${table} (username, email, password) VALUES (?, ?, ?)`;
        await connection.execute(query, [username, email, password]);
        await connection.end();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'An error occurred during signup' });
    }
});

app.post('/student-login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received student login attempt for:', username);
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM student_login WHERE username = ? AND password = ?', [username, password]);
        await connection.end();

        if (rows.length > 0) {
            console.log('Student login successful for:', username);
            res.json({ success: true, message: 'Student login successful' });
        } else {
            console.log('Student login failed for:', username);
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during student login:', error);
        res.status(500).json({ error: 'An error occurred during login', details: error.message });
    }
});


app.post('/teacher-login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received login attempt for:', username);
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM teacher_login WHERE username = ? AND password = ?', [username, password]);
        await connection.end();

        if (rows.length > 0) {
            console.log('Login successful for:', username);
            res.json({ success: true, message: 'Teacher login successful' });
        } else {
            console.log('Login failed for:', username);
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during teacher login:', error);
        res.status(500).json({ error: 'An error occurred during login', details: error.message });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
