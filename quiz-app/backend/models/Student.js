const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regdNo: { type: String, required: true, unique: true },
  section: { type: String, required: true },
  branch: { type: String, required: true },
  uploadedFile: { type: String },
  quizScore: { type: Number, default: null },
  quizAnswers: { type: [Number], default: [] },
  quizCompleted: { type: Boolean, default: false },
  certificateEligible: { type: Boolean, default: false },
  submittedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
