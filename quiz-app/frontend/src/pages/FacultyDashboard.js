import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, passed: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  if (!token || localStorage.getItem('role') !== 'faculty') {
    navigate('/');
    return null;
  }

  const fetchData = useCallback(async () => {
    try {
      const [studRes, statRes] = await Promise.all([
        axios.get('/api/faculty/students', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/faculty/stats', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStudents(studRes.data);
      setStats(statRes.data);
      setLastUpdate(new Date());
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate('/'); }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    // Poll every 5 seconds for live updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = students.filter(s => {
    const matchSearch = !search || 
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.regdNo?.toLowerCase().includes(search.toLowerCase()) ||
      s.branch?.toLowerCase().includes(search.toLowerCase()) ||
      s.section?.toLowerCase().includes(search.toLowerCase());
    
    const matchFilter = filter === 'all' ||
      (filter === 'completed' && s.quizCompleted) ||
      (filter === 'pending' && !s.quizCompleted) ||
      (filter === 'passed' && s.certificateEligible) ||
      (filter === 'failed' && s.quizCompleted && !s.certificateEligible);
    
    return matchSearch && matchFilter;
  });

  const logout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>🏫 Faculty Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            {lastUpdate ? `Last updated: ${lastUpdate.toLocaleTimeString()}` : 'Loading...'} 
            <span style={{ marginLeft: 8, color: '#10b981', fontSize: '0.75rem' }}>● Live</span>
          </p>
        </div>
        <button className="btn btn-outline" style={{ width: 'auto', padding: '10px 20px' }} onClick={logout}>
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{stats.total}</div>
          <div className="stat-label">Registered</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.completed}</div>
          <div className="stat-label">Completed Quiz</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.total - stats.completed}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ fontSize: '2rem' }}>{stats.passed}</div>
          <div className="stat-label">Certificate Eligible</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ fontSize: '2rem' }}>{stats.avgScore?.toFixed(1)}%</div>
          <div className="stat-label">Avg Score</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-section">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2>Student Records ({filtered.length})</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search name, regdNo, branch..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '8px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none', minWidth: 240
              }}
            />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{
                padding: '8px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 10, color: 'white', fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', outline: 'none'
              }}
            >
              <option value="all">All Students</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="passed">Passed (≥70%)</option>
              <option value="failed">Failed (&lt;70%)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div><p>Loading students...</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Regd. No</th>
                  <th>Branch</th>
                  <th>Section</th>
                  <th>Uploaded File</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    No students found
                  </td></tr>
                ) : filtered.map((s, i) => (
                  <tr key={s._id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{s.name || '—'}</td>
                    <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>{s.regdNo}</td>
                    <td><span className="badge badge-blue">{s.branch}</span></td>
                    <td><span className="badge badge-gold">{s.section}</span></td>
                    <td>
                      {s.uploadedFile ? (
                        <a
                          href={`/uploads/${s.uploadedFile}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.85rem' }}
                        >
                          📎 View File
                        </a>
                      ) : '—'}
                    </td>
                    <td>
                      {s.quizCompleted ? (
                        <span style={{
                          fontWeight: 700,
                          color: s.quizScore >= 70 ? '#10b981' : '#ef4444',
                          fontSize: '1rem'
                        }}>{s.quizScore?.toFixed(1)}%</span>
                      ) : '—'}
                    </td>
                    <td>
                      {!s.quizCompleted ? (
                        <span className="status-badge status-pending">⏳ Pending</span>
                      ) : s.certificateEligible ? (
                        <span className="status-badge status-pass">✅ Passed</span>
                      ) : (
                        <span className="status-badge status-fail">❌ Failed</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
