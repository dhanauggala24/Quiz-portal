import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [tab, setTab] = useState('student');
  const [regdNo, setRegdNo] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (!regdNo.trim()) return setError('Enter your registration number');
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/auth/student-login', { regdNo: regdNo.trim() });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'student');
      localStorage.setItem('regdNo', data.regdNo);
      if (data.quizCompleted) {
        navigate('/student/result');
      } else {
        navigate('/student/register');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('/api/auth/faculty-login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'faculty');
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ width: '100%', maxWidth: 440 }}>
        <div className="logo">
          <h1>🎓 QuizPortal</h1>
          <p>Field Project Assessment System</p>
        </div>

        <div className="tab-switcher">
          <button className={`tab-btn ${tab === 'student' ? 'active' : ''}`} onClick={() => { setTab('student'); setError(''); }}>
            👤 Student
          </button>
          <button className={`tab-btn ${tab === 'faculty' ? 'active' : ''}`} onClick={() => { setTab('faculty'); setError(''); }}>
            🏫 Faculty
          </button>
        </div>

        {tab === 'student' ? (
          <form onSubmit={handleStudentLogin}>
            <div className="form-group">
              <label>Registration Number</label>
              <input
                type="text"
                placeholder="e.g. 22A91A0501"
                value={regdNo}
                onChange={e => setRegdNo(e.target.value)}
                autoFocus
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn btn-primary" disabled={loading} style={{ marginTop: 24 }}>
              {loading ? 'Logging in...' : 'Enter Quiz Portal →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleFacultyLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="faculty"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn btn-primary" disabled={loading} style={{ marginTop: 24 }}>
              {loading ? 'Logging in...' : 'Access Dashboard →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
