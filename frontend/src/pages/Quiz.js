import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QUESTIONS = [
  {
    q: "What best defines a field project?",
    options: ["Study of theoretical concepts in class", "Collection of data from books and journals", "Systematic collection of real-world data for analysis", "Writing assignments without data collection"]
  },
  {
    q: "Which step is MOST crucial for the success of a field project?",
    options: ["Presentation of results", "Planning and methodology design", "Writing the final report", "Selecting a general topic"]
  },
  {
    q: "Which of the following is NOT a primary method of data collection?",
    options: ["Observation", "Interview", "Experiment in lab only", "Survey"]
  },
  {
    q: "What is the main risk of poor data collection?",
    options: ["Increased time consumption", "Biased or incorrect conclusions", "Better presentation quality", "Improved analysis"]
  },
  {
    q: "Which of the following BEST represents the correct sequence?",
    options: [
      "Data collection → Topic selection → Analysis → Report",
      "Topic selection → Planning → Data collection → Analysis",
      "Analysis → Planning → Data collection → Presentation",
      "Planning → Topic selection → Analysis → Data collection"
    ]
  },
  {
    q: "Which option shows BOTH an advantage and a disadvantage?",
    options: ["Easy data collection and no cost", "Practical exposure but time-consuming", "No effort and high accuracy", "Only theoretical knowledge"]
  },
  {
    q: "Why is interpretation important after analysis?",
    options: ["To collect more data", "To convert data into meaningful conclusions", "To repeat the project", "To reduce project length"]
  },
  {
    q: "Which of the following BEST explains \"bias\" in a field project?",
    options: ["Collecting large amounts of data", "Collecting data without a plan", "Collecting data that unfairly favors a certain outcome", "Analyzing data using tools"]
  },
  {
    q: "Which option is MOST relevant to future use of field projects?",
    options: ["Memorizing definitions", "Gaining real-world experience for careers", "Writing lengthy answers", "Avoiding practical work"]
  },
  {
    q: "What happens if the sample size is too small?",
    options: ["Results become more reliable", "Data becomes biased or less accurate", "Analysis becomes easier and correct", "No effect on the project"]
  }
];

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(10).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutes
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const regdNo = localStorage.getItem('regdNo');

  useEffect(() => {
    if (!token || localStorage.getItem('role') !== 'student') navigate('/');
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const select = (optIdx) => {
    const updated = [...answers];
    updated[current] = optIdx;
    setAnswers(updated);
  };

  const handleSubmit = async (autoSubmit = false) => {
    const finalAnswers = answers.map(a => a === null ? 0 : a);
    const unanswered = answers.filter(a => a === null).length;
    if (!autoSubmit && unanswered > 0) {
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    setSubmitting(true); setError('');
    try {
      const { data } = await axios.post('/api/student/submit-quiz', {
        regdNo, answers: finalAnswers
      }, { headers: { Authorization: `Bearer ${token}` } });

      localStorage.setItem('quizResult', JSON.stringify(data));
      navigate('/student/result');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  const answered = answers.filter(a => a !== null).length;

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <h2>📝 Field Project Quiz</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span className="badge badge-blue">Q {current + 1} / {QUESTIONS.length}</span>
            <span className="badge badge-gold">Answered: {answered}/10</span>
            <span className="badge" style={{
              background: timeLeft < 120 ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
              color: timeLeft < 120 ? '#ef4444' : 'var(--text)',
              border: `1px solid ${timeLeft < 120 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.15)'}`,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.95rem',
              fontWeight: 700
            }}>⏱ {formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }}></div>
        </div>

        {/* Question dots */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {QUESTIONS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.8rem', fontFamily: 'Outfit, sans-serif',
                background: i === current
                  ? 'linear-gradient(135deg, #e94560, #f5a623)'
                  : answers[i] !== null
                  ? 'rgba(16,185,129,0.3)'
                  : 'rgba(255,255,255,0.08)',
                color: 'white',
                transition: 'all 0.2s'
              }}
            >{i + 1}</button>
          ))}
        </div>

        <div className="question-card">
          <div className="question-num">Question {current + 1} of {QUESTIONS.length}</div>
          <div className="question-text">{QUESTIONS[current].q}</div>
          <div className="options">
            {QUESTIONS[current].options.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${answers[current] === i ? 'selected' : ''}`}
                onClick={() => select(i)}
              >
                <span className="option-letter">{['A','B','C','D'][i]}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <div className="quiz-nav">
          <button
            className="btn btn-outline"
            style={{ flex: 1 }}
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
          >← Previous</button>

          {current < QUESTIONS.length - 1 ? (
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => setCurrent(current + 1)}
            >Next →</button>
          ) : (
            <button
              className="btn btn-primary"
              style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)' }}
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >{submitting ? 'Submitting...' : '✅ Submit Quiz'}</button>
          )}
        </div>
      </div>
    </div>
  );
}
