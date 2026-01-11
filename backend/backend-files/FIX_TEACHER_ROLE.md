# Fix for "No Create Group Button" Issue

## Problem Diagnosis
The user has a teacher role but cannot see the "Create New Group" button.

## Root Causes Identified:
1. **Backend Port Conflict** - Port 5000 is already in use
2. **User Role Not Set** - User role may be 'student' (default) in database
3. **API Connection Issue** - Frontend cannot communicate with backend

---

## Solution Steps

### Step 1: Kill Existing Node Processes
```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force
```

### Step 2: Set User Role to Teacher

**Option A: Via API Call (Recommended)**
Open browser console on your app and run:
```javascript
// Get auth token
const token = await window.Clerk.session.getToken();

// Set role to teacher
fetch('http://localhost:5000/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ role: 'teacher' })
}).then(r => r.json()).then(console.log);
```

**Option B: Direct Database Update (MongoDB Compass/Shell)**
```javascript
// Connect to MongoDB and run:
use('odessey-db');
db.users.updateOne(
  { clerkUserId: 'YOUR_USER_ID_HERE' },
  { $set: { role: 'teacher' } }
);
```

### Step 3: Verify Backend is Running
```bash
cd nextjs-backend
npm run dev
```
Backend should start on http://localhost:5000

### Step 4: Verify Frontend is Running
```bash
cd frontend/health-dashboard
npm run dev
```
Frontend should start on http://localhost:5173 or 5174

### Step 5: Test the Flow
1. Navigate to http://localhost:5173/classroom
2. You should now see "Create New Group" button
3. Click it and create a group

---

## Debugging Checklist

### ✅ Check Role in Database
Run this in browser console after signing in:
```javascript
const token = await window.Clerk.session.getToken();
fetch('http://localhost:5000/api/users', {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(r => r.json())
  .then(data => console.log('Current role:', data.user.role));
```

### ✅ Check Backend Connection
```javascript
fetch('http://localhost:5000/api/users')
  .then(r => console.log('Backend reachable:', r.status))
  .catch(e => console.error('Backend not reachable:', e));
```

### ✅ Check Environment Variables
Verify `.env.local` in frontend has:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Quick Fix Script

Save this as `set-teacher-role.html` and open in browser while signed in:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Set Teacher Role</title>
  <script src="https://accounts.clerk.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"></script>
</head>
<body>
  <h1>Set User Role to Teacher</h1>
  <button onclick="setTeacherRole()">Set as Teacher</button>
  <pre id="output"></pre>

  <script>
    const clerkPubKey = 'pk_test_Y2FwaXRhbC1haXJlZGFsZS04Ny5jbGVyay5hY2NvdW50cy5kZXYk';
    const clerk = window.Clerk;

    async function setTeacherRole() {
      try {
        await clerk.load({ publishableKey: clerkPubKey });
        
        if (!clerk.user) {
          document.getElementById('output').textContent = 'Please sign in first!';
          return;
        }

        const token = await clerk.session.getToken();
        
        const response = await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ role: 'teacher' })
        });

        const data = await response.json();
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
        
        if (data.success) {
          alert('✅ Role set to teacher! Refresh the classroom page.');
        }
      } catch (error) {
        document.getElementById('output').textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

---

## Alternative: Add Role Selector on First Login

For future users, add a role selection page. This is the proper solution.

---

## If Issue Persists

1. **Clear browser cache and localStorage**
2. **Sign out and sign in again**
3. **Check browser console for errors**
4. **Verify MongoDB connection in backend**
5. **Check that User model has role field**

The issue is most likely that your user role is still 'student' (the default). Once you set it to 'teacher', the "Create New Group" button will appear!
