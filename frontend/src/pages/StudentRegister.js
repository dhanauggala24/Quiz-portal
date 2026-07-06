import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function StudentRegister() {
  const regdNo = localStorage.getItem('regdNo') || '';
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', section: '', branch: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  if (!token || localStorage.getItem('role') !== 'student') {
    navigate('/');
    return null;
  }

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = e => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.section || !form.branch) return setError('All fields are required');
    if (!file) return setError('Please upload a file');
    setLoading(true); setError('');

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('regdNo', regdNo);
    fd.append('section', form.section);
    fd.append('branch', form.branch);
    fd.append('file', file);

    try {
      await axios.post('/api/student/register', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      navigate('/student/quiz');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ width: '100%', maxWidth: 500 }}>
        <div className="logo">
          <h1>📋 Student Details</h1>
          <p>Fill in your information before the quiz</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" type="text" placeholder="Your full name" value={form.name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Registration Number</label>
            <input type="text" value={regdNo} disabled style={{ opacity: 0.6 }} />
          </div>

          <div className="form-group">
            <label>Section</label>
            <select name="section" value={form.section} onChange={handleChange}>
              <option value="">Select Section</option>
              {['A','B','C','D','E','F'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Branch</label>
            <select name="branch" value={form.branch} onChange={handleChange}>
              <option value="">Select Branch</option>
              {['CSE','ECE','EEE','MECH','CIVIL','IT','AIDS','AIML','CSD','CSM'].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Upload File (Assignment / Report)</label>
            <div
              className={`file-upload-area ${file ? 'has-file' : ''}`}
              onClick={() => fileRef.current.click()}
            >
              {file ? (
                <>
                  <div style={{ fontSize: '2rem' }}>✅</div>
                  <div style={{ fontWeight: 600, marginTop: 8 }}>{file.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB — Click to change
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '2rem' }}>📁</div>
                  <div style={{ fontWeight: 600, marginTop: 8 }}>Click to upload</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>PDF, DOC, DOCX, JPG, PNG (max 10MB)</div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Submitting...' : 'Proceed to Quiz →'}
          </button>
        </form>
      </div>
    </div>
  );
}
