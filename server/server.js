import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME
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

app.post('/login', async (req, res) => {
    const { username, password, userType } = req.body;
    const table = userType === 'student' ? 'student_login' : 'teacher_login';

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute(`SELECT id, username, email FROM ${table} WHERE username = ? AND password = ?`, [username, password]);
        await connection.end();

        if (rows.length > 0) {
            res.json({
                success: true,
                message: `${userType} login successful`,
                user: {
                    id: rows[0].id,
                    username: rows[0].username,
                    email: rows[0].email,
                    userType
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'An error occurred during login', details: error.message });
    }
});


app.post('/change-password', async (req, res) => {
    const { username, currentPassword, newPassword, userType } = req.body;
    const table = userType === 'student' ? 'student_login' : 'teacher_login';

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [user] = await connection.execute(`SELECT * FROM ${table} WHERE username = ? AND password = ?`, [username, currentPassword]);

        if (user.length === 0) {
            await connection.end();
            return res.status(401).json({ success: false, message: 'Incorrect username or password' });
        }

        await connection.execute(`UPDATE ${table} SET password = ? WHERE username = ?`, [newPassword, username]);

        await connection.end();
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error during password change:', error);
        res.status(500).json({ success: false, error: 'An error occurred during password change', details: error.message });
    }
});

app.get('/api/current-user', async (req, res) => {
    // This endpoint is not properly secured, so it's commented out for now.
    // You would need to implement authentication to securely fetch the current user.
    // For now, you can manually pass the user ID or username in the request.
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [user] = await connection.execute('SELECT id, username, email FROM teacher_login WHERE id = 1'); // Example query
        await connection.end();

        if (user.length > 0) {
            res.json({
                id: user[0].id,
                username: user[0].username,
                email: user[0].email
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'An error occurred while fetching user data' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
