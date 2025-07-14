const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

router.post('/', authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;

  console.log('✅ Creating post for user:', req.user.username);

  const newPost = new Post({
    title,
    content,
    tags,
    username: req.user.username
  });

  const saved = await newPost.save();
  res.status(201).json(saved);
});

router.put('/:id', authenticateToken, async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (post.username !== req.user.username) {
    return res.status(403).json({ error: 'Unauthorized to edit this post' });
  }

  post.title = req.body.title;
  post.content = req.body.content;
  post.tags = req.body.tags;
  const updated = await post.save();

  res.json(updated);
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (post.username !== req.user.username) {
    return res.status(403).json({ error: 'Unauthorized to delete this post' });
  }

  await Post.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

module.exports = router;
