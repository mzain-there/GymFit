const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ────────────────────────────────────────────────────────────────
const membersRouter = require('./routes/members');
const trainersRouter = require('./routes/trainers');
const plansRouter = require('./routes/plans');

app.use('/api/members', membersRouter);
app.use('/api/trainers', trainersRouter);
app.use('/api/plans', plansRouter);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GymFit API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ─── Catch-all: Serve Frontend ─────────────────────────────────────
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🏋️  GymFit Management System`);
  console.log(`✅  Server running at: http://localhost:${PORT}`);
  console.log(`📊  API Base:          http://localhost:${PORT}/api`);
  console.log(`🔗  Members API:       http://localhost:${PORT}/api/members`);
  console.log(`🔗  Trainers API:      http://localhost:${PORT}/api/trainers`);
  console.log(`🔗  Plans API:         http://localhost:${PORT}/api/plans\n`);
});

module.exports = app;
