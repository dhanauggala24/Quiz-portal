# 🎓 Quiz Portal — MERN Stack

A full-stack quiz application for faculty to conduct quizzes for 70+ students simultaneously with real-time monitoring.

## 📁 Project Structure
```
quiz-app/
├── backend/          # Node.js + Express + MongoDB
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── uploads/      # Student uploaded files (auto-created)
│   ├── server.js
│   ├── .env
│   └── package.json
├── frontend/         # React.js
│   ├── src/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
├── start.bat         # Windows one-click start
├── start.sh          # Linux/Mac one-click start
└── README.md
```

## ⚡ Quick Setup (One Command)

### Windows
```
Double-click start.bat
```

### Linux / Mac
```bash
chmod +x start.sh && ./start.sh
```

---

## 🔧 Manual Setup

### Prerequisites
- Node.js v16+ → https://nodejs.org
- MongoDB → https://www.mongodb.com/try/download/community
  - OR use MongoDB Atlas (free cloud DB)

### Step 1: Start MongoDB
```bash
# Windows (run as Admin)
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Step 2: Backend Setup
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### Step 3: Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## 🔐 Default Credentials

| Role    | Username | Password   |
|---------|----------|------------|
| Faculty | faculty  | 1234567890 |
| Student | (use any Registration Number) | — |

---

## 🌐 Using on Multiple Computers (LAN Setup)

To let 70 students use it on different computers in the same network:

1. Find the server computer's local IP:
   - Windows: `ipconfig` → look for IPv4 Address (e.g. `192.168.1.5`)
   - Mac/Linux: `ifconfig` or `ip addr`

2. In `frontend/package.json`, change the proxy:
   ```json
   "proxy": "http://192.168.1.5:5000"
   ```

3. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

4. Serve the build via backend (add to server.js):
   ```js
   const path = require('path');
   app.use(express.static(path.join(__dirname, '../frontend/build')));
   app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));
   ```

5. Students open browser → `http://192.168.1.5:5000`
6. Faculty opens browser → `http://192.168.1.5:5000` → Faculty tab

---

## 🚀 Cloud Deployment (MongoDB Atlas)

1. Create free cluster at https://cloud.mongodb.com
2. Get connection string and update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quizapp
   ```

---

## 📋 Features

- ✅ Student login by Registration Number
- ✅ Student detail form (Name, Regd No, Section, Branch, File Upload)
- ✅ 10-question multiple choice quiz with timer (20 min)
- ✅ Auto-submit on timer expiry
- ✅ Question navigation with answered/unanswered indicators
- ✅ Certificate auto-generated (PDF) for scores ≥ 70%
- ✅ Faculty dashboard with real-time updates (polls every 5s)
- ✅ Faculty can view uploaded files
- ✅ Search and filter students in dashboard
- ✅ Live stats: total, completed, passed, average score
