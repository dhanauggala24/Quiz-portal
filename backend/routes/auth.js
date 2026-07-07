const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Student = require('../models/Student');

const compareSecrets = (candidate, stored) => {
  if (!candidate || !stored) return false;
  try {
    const candidateBuffer = Buffer.from(candidate);
    const storedBuffer = Buffer.from(stored);
    if (candidateBuffer.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(candidateBuffer, storedBuffer);
  } catch {
    return false;
  }
};

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 min

const isRateLimited = (key) => {
  const record = loginAttempts.get(key);
  if (!record) return false;
  if (Date.now() - record.timestamp > LOCKOUT_TIME) {
    loginAttempts.delete(key);
    return false;
  }
  return record.attempts >= MAX_ATTEMPTS;
};

const recordAttempt = (key) => {
  const record = loginAttempts.get(key) || { attempts: 0, timestamp: Date.now() };
  record.attempts++;
  loginAttempts.set(key, record);
};

// Faculty Login
router.post('/faculty-login', (req, res) => {
  const { username, password } = req.body;
  const expectedUsername = process.env.FACULTY_USERNAME;
  const expectedPassword = process.env.FACULTY_PASSWORD;

  if (isRateLimited('faculty')) {
    return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
  }

  if (
    username === expectedUsername &&
    compareSecrets(password, expectedPassword)
  ) {
    loginAttempts.delete('faculty');
    const token = jwt.sign({ role: 'faculty', username }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, role: 'faculty' });
  }
  recordAttempt('faculty');
  res.status(401).json({ message: 'Invalid faculty credentials' });
});

// Student Login by Registration Number
router.post('/student-login', async (req, res) => {
  const regdNo = (req.body.regdNo || '').trim();
  if (!regdNo) return res.status(400).json({ message: 'Registration number required' });
  if (!/^[a-zA-Z0-9]+$/.test(regdNo)) return res.status(400).json({ message: 'Invalid registration number format' });

  if (isRateLimited(regdNo)) {
    return res.status(429).json({ message: 'Too many login attempts. Please try again later.' });
  }

  try {
    const student = await Student.findOne({ regdNo });
    const token = jwt.sign({ role: 'student', regdNo }, process.env.JWT_SECRET, { expiresIn: '4h' });
    res.json({ token, role: 'student', regdNo, registered: !!student, quizCompleted: student?.quizCompleted || false });
  } catch (err) {
    console.error('Student login error:', { regdNo, error: err.message });
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
});

module.exports = router;
