const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authenticateToken = require('../middleware/authMiddleware');

// Get all posts
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

// Create a new post (requires auth)
router.post('/', authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;

  console.log('✅ Creating post for user:', req.user.username); // debug log

  const newPost = new Post({
    title,
    content,
    tags,
    username: req.user.username  // ✅ FIXED: add author username here
  });

  const saved = await newPost.save();
  res.status(201).json(saved);
});


// Update a post (requires auth)
router.put('/:id', authenticateToken, async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // ✅ Only allow if current user is author
  if (post.username !== req.user.username) {
    return res.status(403).json({ error: 'Unauthorized to edit this post' });
  }

  post.title = req.body.title;
  post.content = req.body.content;
  post.tags = req.body.tags;
  const updated = await post.save();

  res.json(updated);
});

// Delete a post (requires auth)
router.delete('/:id', authenticateToken, async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  // ✅ Only allow if current user is author
  if (post.username !== req.user.username) {
    return res.status(403).json({ error: 'Unauthorized to delete this post' });
  }

  await Post.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;
