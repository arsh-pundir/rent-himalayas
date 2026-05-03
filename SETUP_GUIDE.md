# 🚀 Rent Himalaaya - Complete Setup & Deployment Guide

## What's Changed?

### ✅ New HTML Frontend (app.html)
- **Converted from React to vanilla HTML/CSS/JavaScript**
- Serves directly from the backend Node.js server
- No build step needed
- Same UI/UX as React version
- Full routing with browser history support

### ✅ Enhanced Event Emitter System
Implemented 5 Node.js EventEmitter pattern concepts:
1. **New Listener Event** - Auto-tracks when listeners register
2. **Inspecting Event Listeners** - Check active listeners with `.listeners()` method
3. **Listeners() Method** - Inspect and count active listeners
4. **One-Time Event Listeners** - `.once()` for first user signup
5. **Custom Event Emitter** - Extended EventEmitter class for app-specific needs

### ✅ MySQL Connection Pool
- 10 simultaneous connections
- Automatic connection management
- Better performance for concurrent requests

---

## Quick Start (5 Steps)

### Step 1: Navigate to Server Directory
```powershell
cd server
```

### Step 2: Install/Verify Dependencies
```powershell
npm install mysql2 dotenv
```

### Step 3: Create/Setup MySQL Database
```powershell
# MySQL shell
mysql -u root -p
```
Then run:
```sql
source schema.sql;
```

### Step 4: Start the Server
```powershell
node server.js
```

### Step 5: Access the Application
Open browser and go to:
```
http://localhost:5000/
```

---

## File Structure

```
server/
├── .env                      ← Database credentials (already configured)
├── .env.example              ← Example env file
├── server.js                 ← Main Node.js server (ENHANCED)
│   ├── Event Emitter setup
│   ├── HTTP routes
│   └── MySQL integration
├── db.js                     ← Database connection pool (ENHANCED)
├── schema.sql                ← MySQL database schema
├── app.html                  ← NEW! Frontend (vanilla HTML/CSS/JS)
├── index.html                ← Old React build file (for reference)
├── data.json                 ← Property data backup
├── users.json                ← User data backup
└── EVENT_EMITTERS_GUIDE.md  ← NEW! Complete guide to event system
```

---

## API Endpoints

### 1. Get Frontend
```
GET http://localhost:5000/
Response: HTML page (app.html)
```

### 2. Get All Properties
```
GET http://localhost:5000/data
Response: 
[
  { "id": 1, "name": "Cedar Ridge Cabin", "location": "Manali", "price": 2800 },
  { "id": 2, "name": "Apple Orchard Loft", "location": "Shimla", "price": 2300 },
  { "id": 3, "name": "Riverstone Retreat", "location": "Tirthan Valley", "price": 1950 }
]
```

### 3. Login/Signup
```
POST http://localhost:5000/auth
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123",
  "mode": "signup"     // or "login"
}

Response:
{ "message": "Credentials saved in MySQL." }
```

### 4. Get All Users
```
GET http://localhost:5000/users
Response:
[
  { "id": 1, "username": "john_doe", "password": "password123", "mode": "signup", "createdAt": "2026-03-05..." },
  { "id": 2, "username": "jane_doe", "password": "pass456", "mode": "login", "createdAt": "2026-03-05..." }
]
```

### 5. System Status (Check Event Listeners)
```
GET http://localhost:5000/system/status
Response:
{
  "server": "running",
  "port": 5000,
  "database": "connected",
  "eventEmitters": {
    "dbActivity": 1,
    "authSuccess": 1,
    "apiRequest": 1,
    "error:log": 1
  },
  "timestamp": "2026-03-05T10:30:45.123Z"
}
```

---

## Event Emitter Features At A Glance

### 1️⃣ New Listener Detection
Every time a listener is registered, it logs:
```
[EVENT SYSTEM] New listener registered for event: "authSuccess"
[EVENT SYSTEM] Total listeners for "authSuccess": 1
```

### 2️⃣ Database Activity Tracking
Every database query is logged:
```
[DB ACTIVITY] SELECT: Fetched 3 properties from database
[DB ACTIVITY] INSERT: auth_users <- john_doe (signup)
```

### 3️⃣ One-Time Event (First User Marker)
Only fires when the **very first user signs up**:
```
[MILESTONE] 🎉 First signup stored for user: john_doe
[MILESTONE] This event will never trigger again (it's a one-time event)
```

### 4️⃣ Listener Inspection
Inspect all active listeners:
```
[INSPECTION] Event: "authSuccess"
[INSPECTION] Total listeners: 1
[INSPECTION] Listener functions: #1
```

### 5️⃣ Authentication Tracking
```
[AUTH SUCCESS] User "john_doe" successfully signed up
[USER UPDATE] Total users in database: 1
```

---

## Testing the System

### Test 1: Start Server
```powershell
cd server
node server.js
```

**Expected Output:**
```
============================================================
🚀 RENT HIMALAAYA SERVER STARTED
============================================================
📍 Server running: http://localhost:5000
📁 Serving HTML from: c:\...\server\app.html

✅ MySQL connection pool is active
   Host: localhost
   Database: rent_himalayas
   Pool Size: 10 connections

📡 EVENT LISTENERS REGISTERED:
   • dbActivity: 1 listener(s)
   • apiRequest: 1 listener(s)
   • authSuccess: 1 listener(s)
   • error:log: 1 listener(s)
   • newListener: 1 listener(s)
   • inspectEvent: 1 listener(s)
   • userListUpdated: 1 listener(s)
   • firstUserEver (one-time): 1 listener (will trigger once)
```

### Test 2: Access Frontend
Open browser: `http://localhost:5000/`

**Expected:** Beautiful landing page with 3 property cards

### Test 3: First User Signup
1. Click "Continue to Login"
2. Click "Signup" tab
3. Enter username: `testuser1`
4. Enter password: `test123`
5. Click "Sign up"

**Expected Console Output:**
```
[EVENT SYSTEM] New listener registered for event: "apiRequest"
[API REQUEST] POST /auth (public)
[DB ACTIVITY] INSERT: auth_users <- testuser1 (signup)
[AUTH SUCCESS] User "testuser1" successfully signed up
[USER UPDATE] Total users in database: 1
[INSPECTION] Event: "authSuccess"
[MILESTONE] 🎉 First signup stored for user: testuser1
[MILESTONE] This event will never trigger again (it's a one-time event)
```

### Test 4: Second User Signup
Enter username: `testuser2`

**Expected Console Output:**
```
[DB ACTIVITY] INSERT: auth_users <- testuser2 (signup)
[AUTH SUCCESS] User "testuser2" successfully signed up
[USER UPDATE] Total users in database: 2
[INSPECTION] Event: "authSuccess"
(Note: MILESTONE event NOT triggered - it's a one-time event)
```

### Test 5: Check System Status
Visit: `http://localhost:5000/system/status`

**Expected:** JSON showing server status and event listener counts

---

## .env Configuration

Current settings in `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=@rashi10
DB_NAME=rent_himalayas
PORT=5000
```

**To modify:**
1. Edit `server/.env`
2. Restart server: `node server.js`

---

## Database Setup

The database has been created with this schema:

### Table: auth_users
```sql
CREATE TABLE auth_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  mode ENUM('login', 'signup') NOT NULL DEFAULT 'signup',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: properties
```sql
CREATE TABLE properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  location VARCHAR(120) NOT NULL,
  price INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Initial Properties (Auto-Inserted):**
1. Cedar Ridge Cabin - Manali - ₹2800/night
2. Apple Orchard Loft - Shimla - ₹2300/night
3. Riverstone Retreat - Tirthan Valley - ₹1950/night

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         HTML Frontend (app.html)                         │
│  • Vanilla HTML/CSS/JavaScript                           │
│  • Responsive design (mobile + desktop)                 │
│  • No build step required                               │
│  • Pages: Landing, Login/Signup                         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS
                       │ API Calls
┌──────────────────────▼──────────────────────────────────┐
│         Node.js Server (server.js)                       │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Event Emitters (8 Custom Events)                    ││
│  │ • newListener                                       ││
│  │ • dbActivity                                        ││
│  │ • apiRequest                                        ││
│  │ • authSuccess                                       ││
│  │ • error:log                                         ││
│  │ • userListUpdated                                   ││
│  │ • firstUserEver (one-time)                          ││
│  │ • inspectEvent                                      ││
│  └─────────────────────────────────────────────────────┘│
│  HTTP Routes:                                            │
│  • GET  / (serve HTML)                                  │
│  • GET  /data (properties)                              │
│  • POST /auth (login/signup)                            │
│  • GET  /users (all users)                              │
│  • GET  /system/status (event inspection)               │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL Queries
                       │ Connection Pool
┌──────────────────────▼──────────────────────────────────┐
│         MySQL Database (rent_himalayas)                  │
│  Connection Pool: 10 max connections                    │
│  Tables: auth_users, properties                         │
│  Status: ✅ Connected & Ready                           │
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Problem: Server won't start
```
Error: Cannot find module 'mysql2'
```
**Solution:**
```powershell
npm install mysql2 dotenv
```

### Problem: MySQL connection fails
```
Error: connect ECONNREFUSED
```
**Solution:**
1. Start MySQL service (Windows: `services.msc`)
2. Verify credentials in `.env`
3. Run `mysql < schema.sql`

### Problem: Frontend not loading
```
Error: Cannot load app.html
```
**Solution:**
1. Check if `app.html` exists in `server/` folder
2. If not, it was already created - file may be cached
3. Clear browser cache or use incognito mode

### Problem: Events not appearing in console
**Solution:**
1. Check if you're sending POST to `/auth` endpoint
2. Verify request includes `username`, `password`, and `mode`
3. Restart server to see fresh event logs

### Problem: "Credentials saved" but not in database
**Solution:**
1. Run `schema.sql` to create tables
2. Verify `.env` credentials match MySQL user
3. Check MySQL is running: `mysql -u root -p`

---

## Performance Optimization

The system uses:
- **Connection Pooling:** Reuses MySQL connections (10 max)
- **Native HTTP Module:** No heavyweight framework overhead
- **Event-Driven Architecture:** Async operations with events
- **Vanilla JavaScript:** No React bundle overhead
- **CORS Support:** Can serve frontend from different domain

Expected performance:
- Frontend load time: < 100ms (single HTML file)
- API response time: < 50ms (with local MySQL)
- Concurrent users supported: 10+ (connection pool size)

---

## Production Deployment

When deploying to production:

1. **Update .env:**
   ```
   DB_HOST=your-mysql-host
   DB_USER=production-user
   DB_PASSWORD=strong-password
   PORT=80 or 443 (with HTTPS)
   ```

2. **Use Process Manager:**
   ```powershell
   npm install -g pm2
   pm2 start server.js
   ```

3. **Enable HTTPS:**
   - Use nginx/Apache as reverse proxy
   - Or use Node.js HTTPS module

4. **Monitor Events:**
   - Log events to file
   - Set up error alerts

---

## Summary of Changes

| Component | Before | After |
|-----------|--------|-------|
| Frontend | React .jsx files | Single app.html (vanilla JS) |
| Build Step | Required (npm run build) | None needed |
| Event System | Basic logging | 8 custom emitters + inspection |
| Database | Basic pool | Advanced pool with status |
| API Response | Only JSON | HTML + JSON |
| File Size | ~100KB (React) | ~50KB (HTML+CSS+JS) |

---

## Next Steps

1. ✅ Start server: `node server.js`
2. ✅ Test frontend: `http://localhost:5000/`
3. ✅ Create user: Use login page
4. ✅ Monitor events: Watch console during actions
5. ✅ Check status: Visit `/system/status` endpoint

---

## Support Files

- **Full Guide:** `EVENT_EMITTERS_GUIDE.md` - Detailed event emitter documentation
- **Schema:** `schema.sql` - Database structure
- **Env Example:** `.env.example` - Environment template
- **Server:** `server.js` - Main application logic
- **Database Helper:** `db.js` - Connection pool setup
- **Frontend:** `app.html` - HTML/CSS/JS application

---

**Last Updated:** March 5, 2026  
**Version:** 1.0  
**Status:** ✅ Ready for Development & Deployment
