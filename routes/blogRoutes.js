const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Blog = require('../models/blog');
const User = require('../models/user');

const router = express.Router();

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, config.secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

router.get('/blogs', authenticateToken, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.userId }).populate('author', 'username');
    res.status(200).json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/blogs/title', authenticateToken, async (req, res) => {
  try {
    const title = req.query.title;
    const blogs = await Blog.find({ title, author: req.user.userId }).populate('author', 'username');
    res.status(200).json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/blogs/category', authenticateToken, async (req, res) => {
  try {
    const category = req.query.category;
    const blogs = await Blog.find({ category, author: req.user.userId }).populate('author', 'username');
    res.status(200).json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/blogs/sort', authenticateToken, async (req, res) => {
  try {
    const sortField = req.query.sort;
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const blogs = await Blog.find({ author: req.user.userId }).sort({ [sortField]: sortOrder }).populate('author', 'username');
    res.status(200).json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.post('/blogs', authenticateToken, async (req, res) => {
  try {
    const { title, content, category } = req.body;

    const newBlog = new Blog({
      title,
      content,
      category,
      author: req.user.userId,
    });

    await newBlog.save();
    res.status(201).json({ message: 'Blog created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const blogId = req.params.id;

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, content, category },
      { new: true }
    );

    res.status(200).json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.delete('/blogs/:id', authenticateToken, async (req, res) => {
  try {
    const blogId = req.params.id;
    await Blog.findByIdAndDelete(blogId);
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.patch('/blogs/:id/like', authenticateToken, async (req, res) => {
  try {
    const blogId = req.params.id;

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    res.status(200).json({ message: 'Blog liked successfully', blog: updatedBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.patch('/blogs/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const blogId = req.params.id;

    const comment = {
      user: req.user.userId,
      text,
    };

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { comments: comment } },
      { new: true }
    );

    res.status(200).json({ message: 'Comment added successfully', blog: updatedBlog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
