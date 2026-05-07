# Dashboard Troubleshooting Guide

## Issue: "Unable to load dashboard"

### Possible Causes & Solutions

### 1. **No Workspace Created**
**Symptom:** Dashboard shows "No workspace selected"

**Solution:**
1. Click "Go to Workspaces" button
2. Create a new workspace
3. Return to dashboard

**OR via Sidebar:**
1. Click workspace dropdown at top of sidebar
2. Click "+ New workspace"
3. Fill in workspace details
4. Dashboard will load automatically

---

### 2. **User Role Not Set**
**Symptom:** Console shows `user.role` as `undefined` or `null`

**Solution:**
1. Check browser console for logs
2. Verify registration included role selection
3. Re-register with role selected
4. Or update existing user in database:
```sql
UPDATE users SET role = 'MEMBER' WHERE email = 'your@email.com';
```

---

### 3. **Backend Not Running**
**Symptom:** Network error or 500 status code

**Solution:**
```bash
cd backend
mvn spring-boot:run
```

Verify backend is running at `http://localhost:8080`

---

### 4. **JWT Token Missing Role**
**Symptom:** 403 Forbidden or authorization errors

**Solution:**
1. Logout and login again
2. Check JWT token at [jwt.io](https://jwt.io)
3. Verify token has `role` claim
4. If not, backend needs to be updated

---

### 5. **Database Schema Issue**
**Symptom:** SQL errors in backend logs

**Solution:**
Check if User table has `role` column:
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'MEMBER';
```

---

## Debugging Steps

### 1. Check Browser Console
Open DevTools (F12) and look for:
```javascript
console.log('Dashboard stats:', res.data);
console.log('User role:', user?.role);
```

### 2. Check Network Tab
- Look for `/api/workspaces/{id}/dashboard` request
- Check response status (should be 200)
- Verify response body structure

### 3. Check Local Storage
```javascript
// In browser console
localStorage.getItem('fp_access')  // Should have JWT token
localStorage.getItem('fp-auth')    // Should have user data with role
```

### 4. Verify User Data
```javascript
// In browser console
JSON.parse(localStorage.getItem('fp-auth'))
// Should show: { user: { role: "ADMIN" or "MEMBER" } }
```

---

## Quick Fixes

### Force Logout and Re-login
```javascript
// In browser console
localStorage.clear();
window.location.href = '/auth/login';
```

### Check Backend Logs
```bash
# Look for errors in Spring Boot console
# Should see: "Mapped [GET] /api/workspaces/{workspaceId}/dashboard"
```

### Verify API Response
```bash
# Get your access token from localStorage
curl -X GET http://localhost:8080/api/workspaces/{workspaceId}/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Expected Behavior

### For ADMIN Users:
- Dashboard title: "Admin Dashboard"
- Subtitle: "full workspace overview"
- Shows: totalTasks, dailyMomentum, riskAlerts
- API returns: `DashboardStats` object

### For MEMBER Users:
- Dashboard title: "My Dashboard"
- Subtitle: "personal overview"
- Shows: assignedTasks, upcomingDeadlines
- API returns: `MemberDashboardStats` object

---

## Common Error Messages

### "Unable to load dashboard"
- User role is not ADMIN or MEMBER
- Stats object doesn't match expected structure
- Check console logs for details

### "No workspace selected"
- User hasn't created/joined any workspace
- Click "Go to Workspaces" to create one

### "Failed to load dashboard"
- Backend API error
- Check backend logs
- Verify workspace ID is valid

### 403 Forbidden
- User doesn't have access to workspace
- User needs to be added as member
- Check workspace membership

---

## Testing Checklist

- [ ] Backend running on port 8080
- [ ] Frontend running on port 3000
- [ ] User registered with role selected
- [ ] User logged in successfully
- [ ] JWT token in localStorage
- [ ] User data has role field
- [ ] Workspace created
- [ ] Active workspace selected
- [ ] Dashboard API returns 200
- [ ] Correct dashboard component renders

---

## Still Having Issues?

1. **Clear everything and start fresh:**
```bash
# Stop both servers
# Clear browser data
localStorage.clear();
# Drop and recreate database
# Restart backend
# Restart frontend
# Register new user with role
```

2. **Check the implementation:**
- Review `ROLE_BASED_AUTH_IMPLEMENTATION.md`
- Follow `TESTING_GUIDE.md` step by step

3. **Verify all files are updated:**
- Backend: 11 files modified
- Frontend: 6 files modified
- Check git diff or file timestamps

---

## Contact Points

If dashboard still doesn't load:
1. Check browser console for errors
2. Check backend logs for exceptions
3. Verify database has role column
4. Ensure JWT includes role claim
5. Confirm workspace exists and user is member

The most common issue is **no workspace created**. New users must create a workspace before the dashboard will load!
