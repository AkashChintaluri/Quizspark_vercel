import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
