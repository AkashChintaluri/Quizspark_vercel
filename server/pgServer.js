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
        startServer();
    })
    .catch(err => {
        console.error('Error connecting to the database', err);
        process.exit(1);
    });

function startServer() {
    app.post('/signup', async (req, res) => {
        const { username, email, password, userType } = req.body;
        const table = userType === 'student' ? 'student_login' : 'teacher_login';

        try {
            const query = `
                INSERT INTO ${table} (username, email, password)
                VALUES ($1, $2, $3)
                RETURNING id
            `;
            const result = await pool.query(query, [username, email, password]);
            res.status(201).json({
                message: 'User registered successfully',
                userId: result.rows[0].id
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    });

    app.post('/login', async (req, res) => {
        const { username, password, userType } = req.body;
        const table = userType === 'student' ? 'student_login' : 'teacher_login';

        try {
            const query = `
                SELECT id, username, email 
                FROM ${table} 
                WHERE username = $1 AND password = $2
            `;
            const result = await pool.query(query, [username, password]);

            if (result.rows.length > 0) {
                res.json({
                    success: true,
                    user: {
                        ...result.rows[0],
                        userType
                    }
                });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    });

    app.post('/change-password', async (req, res) => {
        const { username, currentPassword, newPassword, userType } = req.body;
        const table = userType === 'student' ? 'student_login' : 'teacher_login';

        try {
            const verifyQuery = `
                SELECT id FROM ${table} 
                WHERE username = $1 AND password = $2
            `;
            const verifyResult = await pool.query(verifyQuery, [username, currentPassword]);

            if (verifyResult.rows.length === 0) {
                return res.status(401).json({ success: false, message: 'Invalid credentials' });
            }

            const updateQuery = `
                UPDATE ${table} 
                SET password = $1 
                WHERE username = $2
            `;
            await pool.query(updateQuery, [newPassword, username]);
            res.json({ success: true, message: 'Password updated' });
        } catch (error) {
            console.error('Password change error:', error);
            res.status(500).json({ success: false, error: 'Password update failed' });
        }
    });

    app.get('/api/current-user/:userId/:userType', async (req, res) => {
        const { userId, userType } = req.params;
        const table = userType === 'student' ? 'student_login' : 'teacher_login';

        try {
            const query = `
                SELECT id, username, email 
                FROM ${table} 
                WHERE id = $1
            `;
            const result = await pool.query(query, [userId]);

            if (result.rows.length > 0) {
                res.json({ ...result.rows[0], userType });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Current user error:', error);
            res.status(500).json({ error: 'Failed to fetch user' });
        }
    });

    app.get('/api/subscriptions/:student_id', async (req, res) => {
        const { student_id } = req.params;
        try {
            const studentIdInt = parseInt(student_id, 10);
            if (isNaN(studentIdInt)) {
                console.error(`Invalid student_id: ${student_id} is not a number`);
                return res.status(400).json({ error: 'Invalid student_id: must be a number' });
            }

            const query = `
                SELECT t.id AS id, t.username, t.email
                FROM teacher_login t
                INNER JOIN subscriptions s ON t.id = s.teacher_id
                WHERE s.student_id = $1;
            `;
            console.log('Executing subscriptions query:', query, 'with student_id:', studentIdInt);
            const result = await pool.query(query, [studentIdInt]);
            console.log('Subscriptions query result:', result.rows);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching subscriptions:', {
                message: error.message,
                stack: error.stack,
                code: error.code,
                detail: error.detail
            });
            res.status(500).json({
                error: 'Failed to fetch subscriptions',
                details: error.message
            });
        }
    });

    app.post('/api/quizzes', async (req, res) => {
        const { quiz_name, quiz_code, created_by, questions, due_date } = req.body;

        try {
            const query = `
                INSERT INTO quizzes (quiz_name, quiz_code, created_by, questions, due_date)
                VALUES ($1, $2, $3, $4::jsonb, $5)
                RETURNING quiz_id;
            `;
            const values = [quiz_name, quiz_code, created_by, JSON.stringify({ questions }), due_date];
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
                stack: error.stack
            });
        }
    });

    app.get('/api/quizzes/:quiz_code', async (req, res) => {
        const { quiz_code } = req.params;

        try {
            const query = `
                SELECT quiz_name, questions
                FROM quizzes
                WHERE quiz_code = $1;
            `;
            const values = [quiz_code];
            console.log("Executing query:", query, "with values:", values);
            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                console.log(`Quiz with code ${quiz_code} not found`);
                return res.status(404).json({ message: 'Quiz not found' });
            }

            const quiz = result.rows[0];
            res.status(200).json({
                quiz_name: quiz.quiz_name,
                questions: quiz.questions
            });
        } catch (error) {
            console.error('Error fetching quiz:', error);
            res.status(500).json({
                message: 'Failed to fetch quiz',
                error: error.message,
                stack: error.stack
            });
        }
    });

    app.post('/api/submit-quiz', async (req, res) => {
        const { quiz_code, user_id, answers } = req.body;
        try {
            const quizQuery = `
            SELECT quiz_id, questions
            FROM quizzes
            WHERE quiz_code = $1;
        `;
            const quizResult = await pool.query(quizQuery, [quiz_code]);
            if (quizResult.rows.length === 0) {
                return res.status(404).json({ message: 'Quiz not found' });
            }

            const quiz = quizResult.rows[0];
            const questions = quiz.questions.questions;

            let score = 0;
            let totalQuestions = questions.length;

            questions.forEach((question, index) => {
                const correctAnswerIndex = question.options.findIndex(option => option.is_correct);
                const userAnswer = parseInt(answers[index]);
                if (correctAnswerIndex === userAnswer) {
                    score++;
                }
            });

            const insertQuery = `
            INSERT INTO quiz_attempts (quiz_id, user_id, score, total_questions, answers)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING attempt_id;
        `;
            const insertValues = [quiz.quiz_id, user_id, score, totalQuestions, JSON.stringify(answers)];
            const insertResult = await pool.query(insertQuery, insertValues);

            const attemptId = insertResult.rows[0].attempt_id;

            res.status(201).json({ /* response data */ });
        } catch (error) {
            console.error('Error submitting quiz:', error);
            res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
        }
    });

    app.get('/api/quiz-result/:quiz_code/:user_id', async (req, res) => {
        const { quiz_code, user_id } = req.params;

        try {
            const quizQuery = `
                SELECT q.quiz_id, q.quiz_name, q.questions, qa.answers, qa.score, qa.total_questions
                FROM quizzes q
                LEFT JOIN quiz_attempts qa ON q.quiz_id = qa.quiz_id AND qa.user_id = $2
                WHERE q.quiz_code = $1;
            `;
            const quizResult = await pool.query(quizQuery, [quiz_code, user_id]);

            if (quizResult.rows.length === 0) {
                return res.status(404).json({ message: 'Quiz not found' });
            }

            const quizData = quizResult.rows[0];
            const questions = quizData.questions.questions;

            let userAnswers = {};
            if (quizData.answers) {
                if (typeof quizData.answers === 'string') {
                    try {
                        userAnswers = JSON.parse(quizData.answers);
                    } catch (error) {
                        console.error('Error parsing answers:', error);
                    }
                } else if (typeof quizData.answers === 'object') {
                    userAnswers = quizData.answers;
                }
            }

            const quizResults = {
                quizName: quizData.quiz_name,
                score: quizData.score || 0,
                totalQuestions: quizData.total_questions || questions.length,
                questions: questions.map((question, index) => {
                    const correctAnswerIndex = question.options.findIndex(option => option.is_correct);
                    const userAnswer = userAnswers[index];

                    return {
                        question_text: question.question_text,
                        options: question.options.map((option, optionIndex) => ({
                            ...option,
                            isSelected: userAnswer == optionIndex,
                            isCorrectAnswer: optionIndex == correctAnswerIndex,
                        })),
                    };
                }),
                userAnswers: userAnswers
            };

            res.json(quizResults);
        } catch (error) {
            console.error('Error fetching quiz result:', error);
            res.status(500).json({
                message: 'Failed to fetch quiz result',
                error: error.message
            });
        }
    });

    app.get('/api/check-quiz-attempt/:quizCode/:userId', async (req, res) => {
        const { quizCode, userId } = req.params;

        try {
            const quizQuery = 'SELECT quiz_id FROM quizzes WHERE quiz_code = $1';
            const quizResult = await pool.query(quizQuery, [quizCode]);

            if (quizResult.rows.length === 0) {
                return res.status(404).json({ message: 'Quiz not found' });
            }

            const quizId = quizResult.rows[0].quiz_id;

            const attemptQuery = 'SELECT * FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2';
            const attemptResult = await pool.query(attemptQuery, [quizId, userId]);

            if (attemptResult.rows.length > 0) {
                res.json({
                    hasAttempted: true,
                    message: 'You have already attempted this quiz.'
                });
            } else {
                res.json({ hasAttempted: false });
            }
        } catch (error) {
            console.error('Error checking quiz attempt:', error);
            res.status(500).json({
                message: 'Error checking quiz attempt',
                error: error.message
            });
        }
    });

    app.get('/api/recent-results/:user_id', async (req, res) => {
        const { user_id } = req.params;
        try {
            const query = `
                SELECT q.quiz_name, qa.attempt_id, qa.score, qa.total_questions, qa.attempt_date
                FROM quiz_attempts qa
                JOIN quizzes q ON q.quiz_id = qa.quiz_id
                WHERE qa.user_id = $1
                ORDER BY qa.attempt_date DESC
                LIMIT 5;
            `;
            const result = await pool.query(query, [user_id]);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching recent results:', error);
            res.status(500).json({ message: 'Failed to fetch recent results' });
        }
    });

    app.get('/api/user-stats/:user_id', async (req, res) => {
        const { user_id } = req.params;
        try {
            const query = `
            SELECT 
                COUNT(*) as total_attempts,
                COALESCE(AVG(CAST(score AS FLOAT) / total_questions * 100), 0) as average_score,
                COUNT(DISTINCT quiz_id) as completed_quizzes
            FROM quiz_attempts
            WHERE user_id = $1;
        `;
            const result = await pool.query(query, [user_id]);
            console.log('User stats response:', result.rows[0]); // Add this
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching user stats:', error);
            res.status(500).json({ message: 'Failed to fetch user stats' });
        }
    });

    app.get('/api/teachers', async (req, res) => {
        try {
            const result = await pool.query(`
                SELECT id AS id, username, email 
                FROM teacher_login
            `);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            res.status(500).json({ error: 'Failed to fetch teachers' });
        }
    });

    app.post('/api/subscribe', async (req, res) => {
        const { student_id, teacher_id } = req.body;
        try {
            await pool.query(`
                INSERT INTO subscriptions (student_id, teacher_id)
                VALUES ($1, $2)
                ON CONFLICT (student_id, teacher_id) DO NOTHING
            `, [student_id, teacher_id]);
            res.json({ success: true });
        } catch (error) {
            console.error('Subscription error:', error);
            res.status(500).json({ error: 'Subscription failed' });
        }
    });

    app.post('/api/unsubscribe', async (req, res) => {
        const { student_id, teacher_id } = req.body;
        try {
            await pool.query(`
                DELETE FROM subscriptions 
                WHERE student_id = $1 AND teacher_id = $2
            `, [student_id, teacher_id]);
            res.json({ success: true });
        } catch (error) {
            console.error('Unsubscription error:', error);
            res.status(500).json({ error: 'Unsubscription failed' });
        }
    });

    app.get('/api/upcoming-quizzes/:student_id', async (req, res) => {
        const { student_id } = req.params;
        try {
            const query = `
                SELECT q.*, t.username AS teacher_name
                FROM quizzes q
                JOIN teacher_login t ON q.created_by = t.id
                WHERE q.created_by IN (
                    SELECT teacher_id 
                    FROM subscriptions 
                    WHERE student_id = $1
                )
                AND q.due_date > NOW()
                AND NOT EXISTS (
                    SELECT 1 
                    FROM quiz_attempts 
                    WHERE quiz_id = q.quiz_id 
                    AND user_id = $1
                )
                ORDER BY q.due_date ASC
            `;
            const result = await pool.query(query, [student_id]);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            res.status(500).json({ error: 'Failed to fetch quizzes' });
        }
    });

    app.get('/api/attempted-quizzes/:user_id', async (req, res) => {
        const { user_id } = req.params;
        try {
            const query = `
            SELECT DISTINCT q.quiz_id, q.quiz_name, q.quiz_code, t.username AS teacher_name, q.due_date
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.quiz_id
            JOIN teacher_login t ON q.created_by = t.id
            WHERE qa.user_id = $1;
        `;
            const result = await pool.query(query, [user_id]);
            console.log('Attempted quizzes for user_id:', user_id, 'Result:', result.rows);
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching attempted quizzes:', error);
            res.status(500).json({ message: 'Failed to fetch attempted quizzes' });
        }
    });

    app.get('/api/quizzes/created/:user_id', async (req, res) => {
        const { user_id } = req.params;
        try {
            const query = `
            SELECT quiz_id, quiz_name, quiz_code, questions, due_date, created_at
            FROM quizzes
            WHERE created_by = $1
            ORDER BY created_at DESC
        `;
            const result = await pool.query(query, [user_id]);

            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching created quizzes:', error);
            res.status(500).json({
                error: 'Failed to fetch created quizzes',
                details: error.message
            });
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}