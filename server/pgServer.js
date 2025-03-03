import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB_NAME,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT
});

// Test the database connection
pool.query('SELECT NOW()')
    .then(res => {
        console.log('Connected to database');
        console.log('Current time:', res.rows[0].now);

        // Start the server after successful connection
        startServer();
    })
    .catch(err => {
        console.error('Error connecting to the database', err);
        process.exit(1); // Exit the process if connection fails
    });

function startServer() {
    app.post('/api/quizzes', async (req, res) => {
        const {
            quiz_name,
            quiz_code,
            created_by,
            questions
        } = req.body;

        try {
            const query = `
                INSERT INTO quizzes (quiz_name, quiz_code, created_by, questions)
                VALUES ($1, $2, $3, $4::jsonb)
                RETURNING quiz_id;
            `;

            const values = [quiz_name, quiz_code, created_by, JSON.stringify({
                questions
            })];

            const result = await pool.query(query, values);
            const quizId = result.rows[0].quiz_id;

            console.log('Quiz created with ID:', quizId);
            res.status(201).json({
                message: 'Quiz created successfully',
                quizId: quizId
            });

        } catch (error) {
            console.error('Error creating quiz:', error);
            res.status(500).json({
                message: 'Failed to create quiz',
                error: error.message,
                stack: error.stack // Helpful for debugging
            });
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
