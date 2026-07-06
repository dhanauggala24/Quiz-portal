const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const authMiddleware = require('../middleware/auth');

// Get all students (faculty only)
router.get('/students', authMiddleware, async (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
  try {
    const students = await Student.find().sort({ submittedAt: -1 });
    res.json(students);
  } catch {
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Get stats
router.get('/stats', authMiddleware, async (req, res) => {
  if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Forbidden' });
  try {
    const total = await Student.countDocuments();
    const completed = await Student.countDocuments({ quizCompleted: true });
    const passed = await Student.countDocuments({ certificateEligible: true });
    const avgScore = await Student.aggregate([
      { $match: { quizCompleted: true } },
      { $group: { _id: null, avg: { $avg: '$quizScore' } } }
    ]);
    res.json({ total, completed, passed, avgScore: avgScore[0]?.avg || 0 });
  } catch {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
