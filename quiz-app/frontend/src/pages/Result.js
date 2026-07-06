import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Result() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const regdNo = localStorage.getItem('regdNo');
  const [result, setResult] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    const stored = localStorage.getItem('quizResult');
    if (stored) setResult(JSON.parse(stored));

    axios.get(`/api/student/me/${regdNo}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setStudent(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generateCertificate = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const W = 297, H = 210;

    // Background gradient effect using rectangles
    doc.setFillColor(15, 52, 96);
    doc.rect(0, 0, W, H, 'F');

    // Gold border
    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(3);
    doc.rect(10, 10, W - 20, H - 20);
    doc.setLineWidth(1);
    doc.rect(13, 13, W - 26, H - 26);

    // Inner white panel
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 255, 255);
    doc.roundedRect(20, 20, W - 40, H - 40, 5, 5, 'F');

    // Header
    doc.setFillColor(26, 26, 46);
    doc.rect(20, 20, W - 40, 35, 'F');

    doc.setTextColor(245, 166, 35);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF ACHIEVEMENT', W / 2, 38, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.text('Field Project Assessment — Quiz Excellence Award', W / 2, 48, { align: 'center' });

    // Body text
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', W / 2, 75, { align: 'center' });

    // Name
    doc.setTextColor(26, 26, 46);
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text(student?.name || regdNo, W / 2, 95, { align: 'center' });

    // Underline
    const nameWidth = doc.getTextWidth(student?.name || regdNo);
    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(0.8);
    doc.line(W / 2 - nameWidth / 2, 99, W / 2 + nameWidth / 2, 99);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the Field Project Quiz with a score of', W / 2, 112, { align: 'center' });

    // Score highlight
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result?.score?.toFixed(1) || student?.quizScore?.toFixed(1)}%`, W / 2, 130, { align: 'center' });

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Regd. No: ${student?.regdNo || regdNo}   |   Branch: ${student?.branch || ''}   |   Section: ${student?.section || ''}`, W / 2, 143, { align: 'center' });

    // Date
    const date = new Date(student?.submittedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Date: ${date}`, W / 2, 155, { align: 'center' });

    // Footer
    doc.setFillColor(26, 26, 46);
    doc.rect(20, 163, W - 40, 27, 'F');

    doc.setTextColor(245, 166, 35);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Faculty Signature', 80, 175, { align: 'center' });
    doc.text('Quiz Portal — Field Project Assessment', W / 2, 180, { align: 'center' });
    doc.text('Authorized by Department', W - 80, 175, { align: 'center' });

    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(0.5);
    doc.line(50, 170, 110, 170);
    doc.line(W - 110, 170, W - 50, 170);

    doc.save(`Certificate_${student?.name || regdNo}.pdf`);
  };

  if (loading) return (
    <div className="result-page">
      <div className="loading"><div className="spinner"></div><p>Loading results...</p></div>
    </div>
  );

  const score = result?.score ?? student?.quizScore ?? 0;
  const passed = score >= 70;
  const correct = result?.correct ?? Math.round((score / 100) * 10);

  return (
    <div className="result-page">
      <div className="card" style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        <div className="logo">
          <h1>{passed ? '🏆 Congratulations!' : '📋 Quiz Completed'}</h1>
          <p>{passed ? 'You passed the quiz!' : 'Better luck next time'}</p>
        </div>

        <div className={`score-ring ${passed ? 'pass' : 'fail'}`}>
          <div className="score-num" style={{ color: passed ? '#10b981' : '#ef4444' }}>
            {score.toFixed(0)}%
          </div>
          <div className="score-label">Score</div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '20px 0' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 24px', flex: 1 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{correct}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correct</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 24px', flex: 1 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{10 - correct}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wrong</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 24px', flex: 1 }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f5a623' }}>10</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
          </div>
        </div>

        {student && (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, marginBottom: 16, textAlign: 'left' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Student Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.9rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Name: </span>{student.name}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Regd: </span>{student.regdNo}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Branch: </span>{student.branch}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Section: </span>{student.section}</div>
            </div>
          </div>
        )}

        {passed ? (
          <>
            <div className="success-msg">
              🎉 You scored ≥70%! You are eligible for a certificate.
            </div>
            <button className="cert-btn" onClick={generateCertificate}>
              📄 Download Certificate
            </button>
          </>
        ) : (
          <div className="error-msg" style={{ fontSize: '0.95rem', padding: 16 }}>
            You need ≥70% to earn a certificate. You scored {score.toFixed(1)}%. Please attempt again in the next session.
          </div>
        )}

        <button
          className="btn btn-outline"
          style={{ marginTop: 16 }}
          onClick={() => { localStorage.clear(); navigate('/'); }}
        >← Back to Login</button>
      </div>
    </div>
  );
}
