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

    // New API endpoint for getting quizzes using quiz_code
    app.get('/api/quizzes/:quiz_code', async (req, res) => {
        const {
            quiz_code
        } = req.params;

        try {
            const query = `
                SELECT quiz_name, questions
                FROM quizzes
                WHERE quiz_code = $1;
            `;

            const values = [quiz_code];

            console.log("Executing query:", query, "with values:", values); // Debugging

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                console.log(`Quiz with code ${quiz_code} not found`); // Debugging
                return res.status(404).json({
                    message: 'Quiz not found'
                });
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
        const {
            quiz_code,
            user_id,
            answers
        } = req.body;

        try {
            // First, fetch the quiz details
            const quizQuery = `
                SELECT quiz_id, questions
                FROM quizzes
                WHERE quiz_code = $1;
            `;
            const quizResult = await pool.query(quizQuery, [quiz_code]);

            if (quizResult.rows.length === 0) {
                return res.status(404).json({
                    message: 'Quiz not found'
                });
            }

            const quiz = quizResult.rows[0];
            const questions = quiz.questions.questions;

            // Calculate score
            let score = 0;
            let totalQuestions = questions.length;

            questions.forEach((question, index) => {
                const correctAnswerIndex = question.options.findIndex(option => option.is_correct);
                const userAnswer = parseInt(answers[index]); // Parse the user's answer to an integer
                if (correctAnswerIndex === userAnswer) {
                    score++;
                }
            });

            // Insert the attempt into the database
            const insertQuery = `
                INSERT INTO quiz_attempts (quiz_id, user_id, score, total_questions, answers)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING attempt_id;
            `;
            const insertValues = [quiz.quiz_id, user_id, score, totalQuestions, JSON.stringify(answers)];
            const insertResult = await pool.query(insertQuery, insertValues);

            const attemptId = insertResult.rows[0].attempt_id;

            res.status(201).json({
                message: 'Quiz submitted successfully',
                attemptId: attemptId,
                score: score,
                totalQuestions: totalQuestions,
                question_results: questions.map((question, index) => {
                    const correctAnswerIndex = question.options.findIndex(option => option.is_correct);
                    const userAnswer = parseInt(answers[index]); // Parse the user's answer to an integer
                    const isCorrect = correctAnswerIndex === userAnswer;

                    return {
                        question_index: index,
                        question_text: question.question_text,
                        is_correct: isCorrect,
                        selected_option: userAnswer,
                        correct_option: correctAnswerIndex
                    };
                })
            });

        } catch (error) {
            console.error('Error submitting quiz:', error);
            res.status(500).json({
                message: 'Failed to submit quiz',
                error: error.message,
                stack: error.stack // Helpful for debugging
            });
        }
    });

    app.get('/api/quiz-result/:quiz_code/:user_id', async (req, res) => {
        const { quiz_code, user_id } = req.params;

        try {
            // Get the quiz details
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

            // Handle the case where answers might be a string or an object
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


    // New endpoint to check if user has already attempted the quiz before starting
    app.get('/api/check-quiz-attempt/:quizCode/:userId', async (req, res) => {
        const {
            quizCode,
            userId
        } = req.params;

        try {
            // First, get the quiz_id from the quiz_code
            const quizQuery = 'SELECT quiz_id FROM quizzes WHERE quiz_code = $1';
            const quizResult = await pool.query(quizQuery, [quizCode]);

            if (quizResult.rows.length === 0) {
                return res.status(404).json({
                    message: 'Quiz not found'
                });
            }

            const quizId = quizResult.rows[0].quiz_id;

            // Now check for an existing attempt
            const attemptQuery = 'SELECT * FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2';
            const attemptResult = await pool.query(attemptQuery, [quizId, userId]);

            if (attemptResult.rows.length > 0) {
                // An attempt exists
                res.json({
                    hasAttempted: true,
                    message: 'You have already attempted this quiz.'
                });
            } else {
                // No attempt exists
                res.json({
                    hasAttempted: false
                });
            }
        } catch (error) {
            console.error('Error checking quiz attempt:', error);
            res.status(500).json({
                message: 'Error checking quiz attempt',
                error: error.message
            });
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
