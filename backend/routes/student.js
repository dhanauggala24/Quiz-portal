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
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Unsupported file type'));
  }
});

const QUIZ_ANSWERS = [2, 1, 2, 1, 1, 1, 1, 2, 1, 1]; // 0-indexed: A=0,B=1,C=2,D=3

// Submit student details + file
router.post('/register', authMiddleware, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
}, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
  try {
    const { name, section, branch } = req.body;
    const regdNo = req.user.regdNo;
    const uploadedFile = req.file ? req.file.filename : null;

    if (req.body.regdNo && req.body.regdNo !== regdNo) {
      return res.status(403).json({ message: 'Registration number mismatch' });
    }

    let student = await Student.findOne({ regdNo });
    if (student) {
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
    console.error('Registration error:', { regdNo: req.user.regdNo, error: err.message });
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Submit quiz
router.post('/submit-quiz', authMiddleware, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Forbidden' });
  try {
    const regdNo = req.user.regdNo;
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length !== QUIZ_ANSWERS.length || answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
      return res.status(400).json({ message: 'Invalid quiz answers format' });
    }

    const student = await Student.findOne({ regdNo });
    if (!student) return res.status(404).json({ message: 'Student not registered. Please register first.' });
    if (student.quizCompleted) return res.status(400).json({ message: 'Quiz already submitted. You cannot resubmit.' });

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
    console.error('Quiz submission error:', { userId: req.user.regdNo, error: err.message });
    res.status(500).json({ message: 'Submission failed. Please try again.' });
  }
});

// Get student info
router.get('/me/:regdNo', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'student' && req.params.regdNo !== req.user.regdNo) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const student = await Student.findOne({ regdNo: req.params.regdNo });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    console.error('Get student error:', { regdNo: req.params.regdNo, error: err.message });
    res.status(500).json({ message: 'Error retrieving student data' });
  }
});

module.exports = router;
