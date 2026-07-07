# Quiz Portal Deployment Guide

## Environment Variables Required for Render

Before deploying to Render, set these environment variables in your Render project settings:

```
MONGO_URI=mongodb+srv://[username]:[password]@[cluster].mongodb.net/[database]
JWT_SECRET=[strong-random-secret-key-minimum-32-chars]
FACULTY_USERNAME=faculty
FACULTY_PASSWORD=[strong-password]
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### How to generate a strong JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment Steps

### Option 1: Deploy with render.yaml
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your repository to Render
3. Render will auto-detect `render.yaml` and deploy both backend and frontend

### Option 2: Manual Render Deployment
1. Create a Web Service for backend:
   - Build Command: `npm --prefix backend install`
   - Start Command: `npm --prefix backend start`
   - Add environment variables (see above)

2. Create a Static Site for frontend:
   - Build Command: `npm --prefix frontend install && npm --prefix frontend run build`
   - Publish directory: `frontend/build`
   - Add Route: `/*` → `/index.html` (for SPA routing)

## Security Checklist

- [x] Rate limiting on auth endpoints (5 attempts per 15 minutes)
- [x] Request size limits (10MB)
- [x] CORS configured with specific origins
- [x] Timing-safe password comparison
- [x] Input validation on regdNo (alphanumeric only)
- [x] Ownership checks on student endpoints
- [ ] Add Helmet for security headers (recommended for production)
- [ ] Enable HTTPS (automatic on Render)
- [ ] Monitor error logs for suspicious activity

## Health Check

After deployment, verify the backend is healthy:
```bash
curl https://your-backend-url.onrender.com/health
```

Should return:
```json
{"status":"ok","timestamp":"2026-07-07T..."}
```

## Monitoring

Watch the Render dashboard for:
1. Application logs (any errors during startup or runtime)
2. Memory/CPU usage
3. MongoDB connection status

## Troubleshooting

### "Login failed" on frontend
- Check browser DevTools Network tab for request/response details
- Verify `FRONTEND_URL` matches your deployed frontend origin
- Check backend logs for error messages

### MongoDB connection fails
- Verify `MONGO_URI` is correct and DB user has permissions
- Check if IP whitelist allows Render's IPs (usually automatic on Render)

### Quiz not submitting
- Check backend logs for validation errors
- Verify answer array format: `[0, 1, 2, 1, ...]` (0-3 for A-D options)

## Next Steps

1. Test student login locally before deploying
2. Test faculty dashboard and student submission flow
3. Download and verify certificate generation works
4. Load test with multiple concurrent users
5. Set up monitoring and alerting on Render
