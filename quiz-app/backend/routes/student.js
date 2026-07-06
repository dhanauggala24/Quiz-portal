const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/auth');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.regdNo}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const QUIZ_ANSWERS = [2, 1, 2, 1, 1, 1, 1, 2, 1, 1]; // 0-indexed: A=0,B=1,C=2,D=3

// Submit student details + file
router.post('/register', authMiddleware, upload.single('file'), async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name, regdNo, section, branch } = req.body;
    const uploadedFile = req.file ? req.file.filename : null;

    let student = await Student.findOne({ regdNo });
    if (student) {
      // Update if already exists
      student.name = name;
      student.section = section;
      student.branch = branch;
      if (uploadedFile) student.uploadedFile = uploadedFile;
      await student.save();
    } else {
      student = await Student.create({ name, regdNo, section, branch, uploadedFile });
    }
    res.json({ message: 'Registered successfully', student });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Submit quiz
router.post('/submit-quiz', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { regdNo, answers } = req.body; // answers: array of 0-indexed chosen options
    const student = await Student.findOne({ regdNo });
    if (!student) return res.status(404).json({ message: 'Student not registered' });
    if (student.quizCompleted) return res.status(400).json({ message: 'Quiz already submitted' });

    let correct = 0;
    answers.forEach((ans, i) => {
      if (ans === QUIZ_ANSWERS[i]) correct++;
    });
    const score = (correct / QUIZ_ANSWERS.length) * 100;
    const certificateEligible = score >= 70;

    student.quizAnswers = answers;
    student.quizScore = score;
    student.quizCompleted = true;
    student.certificateEligible = certificateEligible;
    student.submittedAt = new Date();
    await student.save();

    res.json({ score, correct, total: QUIZ_ANSWERS.length, certificateEligible });
  } catch (err) {
    res.status(500).json({ message: 'Submission failed', error: err.message });
  }
});

// Get student info
router.get('/me/:regdNo', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findOne({ regdNo: req.params.regdNo });
    if (!student) return res.status(404).json({ message: 'Not found' });
    res.json(student);
  } catch {
    res.status(500).json({ message: 'Error' });
  }
});

module.exports = router;
