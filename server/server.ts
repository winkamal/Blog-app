import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3001;

// Allow requests from any origin
app.use(cors()); 

// Increase payload size limit for base64 images/audio
app.use(express.json({ limit: '10mb' })); 

// Configure PostgreSQL connection pool
// Heroku and Render provide the DATABASE_URL env var automatically
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Required for platforms like Heroku/Render that use self-signed certificates
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

/**
 * A one-time setup endpoint to create the 'posts' table in your database.
 * After deploying, visit YOUR_BACKEND_URL/api/setup once to initialize.
 */
app.get('/api/setup', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        date TEXT NOT NULL,
        content TEXT NOT NULL,
        imageUrl TEXT,
        audioUrl TEXT,
        hashtags JSONB,
        comments JSONB
      );
    `);
    res.status(200).send('Database table "posts" created or already exists.');
  } catch (err: any) {
    console.error('Database setup failed:', err);
    res.status(500).json({ error: 'Failed to setup database table.', details: err.message });
  }
});

// GET all posts
app.get('/api/posts', async (req, res) => {
  try {
    // Order by ID (which is an ISO date string) to get newest posts first
    const result = await pool.query('SELECT * FROM posts ORDER BY id DESC;');
    res.json(result.rows);
  } catch (err: any) {
    console.error('Failed to retrieve posts:', err);
    res.status(500).json({ error: 'Failed to retrieve posts.', details: err.message });
  }
});

// POST a new post
app.post('/api/posts', async (req, res) => {
    const { id, title, author, date, content, imageUrl, audioUrl, hashtags, comments } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO posts (id, title, author, date, content, imageUrl, audioUrl, hashtags, comments) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [id, title, author, date, content, imageUrl, audioUrl, JSON.stringify(hashtags || []), JSON.stringify(comments || [])]
        );
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error('Failed to create post:', err);
        res.status(500).json({ error: 'Failed to create post.', details: err.message });
    }
});

// PUT (update) a post
app.put('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, hashtags, imageUrl, audioUrl } = req.body;
    try {
        const result = await pool.query(
            'UPDATE posts SET title = $1, content = $2, hashtags = $3, imageUrl = $4, audioUrl = $5 WHERE id = $6 RETURNING *',
            [title, content, JSON.stringify(hashtags), imageUrl, audioUrl, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post not found.' });
        }
        res.json(result.rows[0]);
    } catch (err: any) {
        console.error('Failed to update post:', err);
        res.status(500).json({ error: 'Failed to update post.', details: err.message });
    }
});

// DELETE a post
app.delete('/api/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM posts WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post not found.' });
        }
        res.status(204).send(); // No content
    } catch (err: any) {
        console.error('Failed to delete post:', err);
        res.status(500).json({ error: 'Failed to delete post.', details: err.message });
    }
});

// POST a new comment
app.post('/api/posts/:id/comments', async (req, res) => {
    const { id: postId } = req.params;
    const { newComment } = req.body;
    try {
        const postResult = await pool.query('SELECT comments FROM posts WHERE id = $1', [postId]);
        if (postResult.rowCount === 0) {
            return res.status(404).json({ error: 'Post not found.' });
        }

        const existingComments = postResult.rows[0].comments || [];
        const updatedComments = [...existingComments, newComment];

        const updateResult = await pool.query(
            'UPDATE posts SET comments = $1 WHERE id = $2 RETURNING *',
            [JSON.stringify(updatedComments), postId]
        );
        res.json(updateResult.rows[0]);
    } catch (err: any) {
        console.error('Failed to add comment:', err);
        res.status(500).json({ error: 'Failed to add comment.', details: err.message });
    }
});


// DELETE a comment
app.delete('/api/posts/:id/comments/:commentId', async (req, res) => {
    const { id: postId, commentId } = req.params;
    try {
        const postResult = await pool.query('SELECT comments FROM posts WHERE id = $1', [postId]);
        if (postResult.rowCount === 0) {
            return res.status(404).json({ error: 'Post not found.' });
        }

        const existingComments = postResult.rows[0].comments || [];
        const updatedComments = existingComments.filter((c: any) => c.id !== commentId);

        const updateResult = await pool.query(
            'UPDATE posts SET comments = $1 WHERE id = $2 RETURNING *',
            [JSON.stringify(updatedComments), postId]
        );
        res.json(updateResult.rows[0]);
    } catch (err: any) {
        console.error('Failed to delete comment:', err);
        res.status(500).json({ error: 'Failed to delete comment.', details: err.message });
    }
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
