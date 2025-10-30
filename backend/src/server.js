require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/onboarding', require('./routes/onboarding'));
app.use('/api/v1/workouts', require('./routes/workouts'));
app.use('/api/v1/meals', require('./routes/meals'));
app.use('/api/v1/posts', require('./routes/posts'));
app.use('/api/v1/feed', require('./routes/feed'));
app.use('/api/v1/groups', require('./routes/groups'));
app.use('/api/v1/progress', require('./routes/progress'));
app.use('/api/v1/calendar', require('./routes/calendar'));

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Unweighted API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Unweighted API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api/v1`);
});

module.exports = app;
