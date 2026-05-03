const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { pool, testConnection } = require('./db');
const PORT = Number(process.env.PORT || 5000);
const ROOT_DIR = path.join(__dirname, '..');
const INDEX_FILE = path.join(ROOT_DIR, 'index.html');
const STYLE_FILE = path.join(ROOT_DIR, 'style.css');
const SCRIPT_FILE = path.join(ROOT_DIR, 'script.js');

class AppEvents extends EventEmitter {}
const events = new AppEvents();

// 4) newListener Event
events.on('newListener', (eventName) => {
  console.log(`[events] listener added -> ${eventName}`);
});

// 5) Custom Event Emitter
events.on('dbActivity', (action, detail) => {
  console.log(`[db] ${action}: ${detail}`);
});

// 1) One-Time Event Listener
events.once('firstSignup', (username) => {
  console.log(`[milestone] first signup: ${username}`);
});

// 2) Inspecting Event Listeners + 3) listeners() Method
events.on('inspectEvent', (eventName) => {
  const list = events.listeners(eventName);
  console.log(`[inspect] ${eventName} listener count: ${list.length}`);
});

const sendJson = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const sendFile = (res, filePath, contentType) => {
  fs.readFile(filePath, (err, file) => {
    if (err) {
      sendJson(res, 404, { error: 'File not found.' });
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(file);
  });
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

const serveIndex = (res) => {
  fs.readFile(INDEX_FILE, 'utf8', (err, html) => {
    if (err) {
      sendJson(res, 500, { error: 'Cannot load index.html' });
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  });
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/login')) {
    serveIndex(res);
    return;
  }

  if (req.method === 'GET' && req.url === '/style.css') {
    sendFile(res, STYLE_FILE, 'text/css; charset=utf-8');
    return;
  }

  if (req.method === 'GET' && req.url === '/script.js') {
    sendFile(res, SCRIPT_FILE, 'application/javascript; charset=utf-8');
    return;
  }

  if (req.url === '/api/properties' && req.method === 'GET') {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, location, price FROM properties ORDER BY id DESC',
      );
      events.emit('dbActivity', 'SELECT', `properties=${rows.length}`);
      sendJson(res, 200, rows);
    } catch {
      sendJson(res, 500, { error: 'Could not fetch properties from MySQL.' });
    }
    return;
  }

  if (req.url === '/api/auth' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const parsed = JSON.parse(body);
      const username = String(parsed.username || '').trim();
      const password = String(parsed.password || '');
      const mode = parsed.mode === 'signup' ? 'signup' : 'login';

      if (!username || !password) {
        sendJson(res, 400, { error: 'Username and password are required.' });
        return;
      }

      if (mode === 'signup') {
        const [countRows] = await pool.execute('SELECT COUNT(*) AS total FROM users');
        const totalBefore = Number(countRows?.[0]?.total || 0);

        await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        events.emit('dbActivity', 'INSERT', `users <- ${username}`);
        if (totalBefore === 0) events.emit('firstSignup', username);
        sendJson(res, 200, { message: 'Signup successful. User saved in MySQL.' });
      } else {
        const [rows] = await pool.execute(
          'SELECT id, username FROM users WHERE username = ? AND password = ? LIMIT 1',
          [username, password],
        );
        if (!rows.length) {
          sendJson(res, 401, { error: 'Invalid username or password.' });
          return;
        }
        events.emit('dbActivity', 'LOGIN', `user=${username}`);
        sendJson(res, 200, { message: 'Login successful.' });
      }
    } catch (error) {
      if (error && error.code === 'ER_DUP_ENTRY') {
        sendJson(res, 409, { error: 'Username already exists. Use another username.' });
        return;
      }
      if (error && error.code === 'ER_NO_SUCH_TABLE') {
        sendJson(res, 500, { error: 'MySQL table missing. Run schema.sql first.' });
        return;
      }
      sendJson(res, 500, { error: 'Database error. Check MySQL and .env values.' });
    }
    return;
  }

  if (req.url === '/api/users' && req.method === 'GET') {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, password, created_at AS createdAt FROM users ORDER BY id DESC',
      );
      events.emit('dbActivity', 'SELECT', `users=${rows.length}`);
      sendJson(res, 200, rows);
    } catch {
      sendJson(res, 500, { error: 'Could not fetch users.' });
    }
    return;
  }

  if (req.url === '/api/events' && req.method === 'GET') {
    sendJson(res, 200, {
      dbActivity: events.listenerCount('dbActivity'),
      firstSignup: events.listenerCount('firstSignup'),
      inspectEvent: events.listenerCount('inspectEvent'),
      newListener: events.listenerCount('newListener'),
    });
    return;
  }

  sendJson(res, 404, { error: 'Route not found.' });
});

server.listen(PORT, async () => {
  try {
    await testConnection();
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('MySQL pool connected.');
  } catch {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('MySQL connection failed. Check MySQL service, .env and schema.sql');
  }
  events.emit('inspectEvent', 'dbActivity');
});
