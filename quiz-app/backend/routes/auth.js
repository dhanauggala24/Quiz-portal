const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Faculty Login
router.post('/faculty-login', (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.FACULTY_USERNAME &&
    password === process.env.FACULTY_PASSWORD
  ) {
    const token = jwt.sign({ role: 'faculty', username }, process.env.JWT_SECRET, { expiresIn: '8h' });
    return res.json({ token, role: 'faculty' });
  }
  res.status(401).json({ message: 'Invalid faculty credentials' });
});

// Student Login by Registration Number
router.post('/student-login', async (req, res) => {
  const { regdNo } = req.body;
  if (!regdNo) return res.status(400).json({ message: 'Registration number required' });

  try {
    let student = await Student.findOne({ regdNo });
    // Allow login even if not registered yet — they'll complete the form next
    const token = jwt.sign({ role: 'student', regdNo }, process.env.JWT_SECRET, { expiresIn: '4h' });
    res.json({ token, role: 'student', regdNo, registered: !!student, quizCompleted: student?.quizCompleted || false });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
