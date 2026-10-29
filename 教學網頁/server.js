'use strict';
/**
 * 風與空氣知識王：區網配對伺服器
 * 啟動：node server.js（或雙擊 start-battle.bat）
 * 不需要任何 npm 套件，使用 Node 內建模組。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 8765;
const TOTAL = 10;
const QUESTION_MS = 20000;
const OFFLINE_GRACE_MS = 15000;

const QUESTIONS = JSON.parse(fs.readFileSync(path.join(ROOT, 'questions.json'), 'utf8'));
if (!Array.isArray(QUESTIONS) || QUESTIONS.length < TOTAL) {
  console.error('questions.json 題庫不足，至少需要 ' + TOTAL + ' 題。');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

const players = new Map();
const rooms = new Map();
let waiting = [];

const uid = (n) => crypto.randomBytes(n).toString('hex');
const now = () => Date.now();

function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

function pickQuestions() {
  return shuffle(QUESTIONS.map((q) => q)).slice(0, TOTAL).map((q) => {
    const opts = q.o.map((text, i) => ({ text, i }));
    shuffle(opts);
    return {
      q: q.q,
      o: opts.map((x) => x.text),
      a: opts.findIndex((x) => x.i === q.a),
      e: q.e
    };
  });
}

function newRoomCode() {
  let code;
  do { code = String(1000 + Math.floor(Math.random() * 9000)); } while (rooms.has(code));
  return code;
}

function json(res, data, status = 200) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100000) { req.destroy(); reject(new Error('too large')); }
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function send(player, msg) {
  if (!player || !player.res || player.res.writableEnded) return;
  try {
    player.res.write('data: ' + JSON.stringify(msg) + '\n\n');
  } catch (e) {
    /* 連線已斷，交給 close 事件處理 */
  }
}

function sendRoom(room, msg) {
  room.players.forEach((id) => send(players.get(id), msg));
}

function publicPlayers(room) {
  return room.players.map((id) => {
    const p = players.get(id);
    return { id, name: p ? p.name : '玩家' };
  });
}

function winnerOf(room) {
  const [a, b] = room.players;
  if (room.scores[a] === room.scores[b]) return null;
  return room.scores[a] > room.scores[b] ? a : b;
}

function startRoom(a, b) {
  const room = {
    code: newRoomCode(),
    players: [a.id, b.id],
    scores: { [a.id]: 0, [b.id]: 0 },
    questions: pickQuestions(),
    index: -1,
    phase: 'countdown',
    answers: {},
    correct: null,
    scoredBy: null,
    explanation: '',
    deadline: 0,
    remaining: 0,
    paused: false,
    timer: null,
    offlineTimer: null,
    rematch: new Set()
  };
  a.roomId = b.roomId = room.code;
  a.waiting = b.waiting = false;
  rooms.set(room.code, room);

  send(a, {
    type: 'matched', room: room.code, total: TOTAL,
    you: { id: a.id, name: a.name }, players: publicPlayers(room), scores: room.scores
  });
  send(b, {
    type: 'matched', room: room.code, total: TOTAL,
    you: { id: b.id, name: b.name }, players: publicPlayers(room), scores: room.scores
  });

  room.timer = setTimeout(() => startQuestion(room), 2600);
}

function startQuestion(room) {
  if (!rooms.has(room.code) || room.phase === 'finished') return;
  room.index += 1;
  if (room.index >= TOTAL) { finishRoom(room); return; }

  const q = room.questions[room.index];
  room.phase = 'question';
  room.answers = {};
  room.correct = null;
  room.scoredBy = null;
  room.explanation = '';
  room.paused = false;
  room.deadline = now() + QUESTION_MS;

  sendRoom(room, {
    type: 'question',
    index: room.index,
    total: TOTAL,
    q: q.q,
    o: q.o,
    scores: room.scores,
    deadline: QUESTION_MS / 1000
  });

  clearTimeout(room.timer);
  room.timer = setTimeout(() => resolveQuestion(room, null), QUESTION_MS);
}

function resolveQuestion(room, scoredBy) {
  if (!rooms.has(room.code) || room.phase !== 'question') return;
  clearTimeout(room.timer);
  room.phase = 'reveal';
  room.paused = false;
  room.scoredBy = scoredBy;

  const q = room.questions[room.index];
  room.correct = q.a;
  room.explanation = q.e;

  sendRoom(room, {
    type: 'reveal',
    index: room.index,
    total: TOTAL,
    correct: q.a,
    explanation: q.e,
    answers: room.answers,
    scores: room.scores,
    scoredBy
  });

  room.timer = setTimeout(() => {
    if (room.index >= TOTAL - 1) finishRoom(room);
    else startQuestion(room);
  }, 3200);
}

function finishRoom(room) {
  if (!rooms.has(room.code)) return;
  clearTimeout(room.timer);
  room.phase = 'finished';
  room.paused = false;
  sendRoom(room, {
    type: 'finished',
    scores: room.scores,
    winner: winnerOf(room),
    players: publicPlayers(room)
  });
}

function snapshot(room, player) {
  const q = room.questions[room.index] || null;
  const msg = {
    type: 'snapshot',
    room: room.code,
    phase: room.phase,
    index: room.index,
    total: TOTAL,
    scores: room.scores,
    players: publicPlayers(room),
    answers: room.answers
  };
  if (q) { msg.q = q.q; msg.o = q.o; }
  if (room.phase === 'question') {
    msg.timeLeft = Math.max(0, Math.round((room.deadline - now()) / 100) / 10);
  }
  if (room.phase === 'reveal') {
    msg.correct = room.correct;
    msg.scoredBy = room.scoredBy;
    msg.explanation = room.explanation;
  }
  if (room.phase === 'finished') msg.winner = winnerOf(room);
  send(player, msg);
}

function enqueue(player) {
  if (player.roomId || player.waiting) return;
  player.waiting = true;
  waiting.push(player.id);
  send(player, { type: 'waiting', count: waiting.filter((id) => players.get(id)?.connected).length });
  tryMatch();
}

function tryMatch() {
  while (waiting.length >= 2) {
    const a = players.get(waiting.shift());
    const b = players.get(waiting.shift());
    const valid = [a, b].filter((p) => p && p.connected && !p.roomId);
    if (valid.length < 2) {
      valid.forEach((p) => { p.waiting = true; waiting.push(p.id); });
      continue;
    }
    startRoom(valid[0], valid[1]);
    break;
  }
}

function dropPlayer(player) {
  const idx = waiting.indexOf(player.id);
  if (idx >= 0) waiting.splice(idx, 1);
  player.waiting = false;

  setTimeout(() => {
    if (!player.connected && !player.roomId) players.delete(player.id);
  }, 120000);

  if (!player.roomId) return;
  const room = rooms.get(player.roomId);
  if (!room) { player.roomId = null; return; }

  const otherId = room.players.find((id) => id !== player.id);
  const other = players.get(otherId);
  if (other && other.connected) send(other, { type: 'opponent_offline' });

  // 暫停這一題的倒數，等對方回來
  if (room.phase === 'question') {
    room.remaining = Math.max(1000, room.deadline - now());
    room.paused = true;
    clearTimeout(room.timer);
  }

  clearTimeout(room.offlineTimer);
  room.offlineTimer = setTimeout(() => {
    if (player.connected) return;
    if (rooms.get(room.code) !== room) return;
    clearTimeout(room.timer);
    rooms.delete(room.code);
    if (other) other.roomId = null;
    player.roomId = null;
    if (other && other.connected) send(other, { type: 'opponent_left' });
  }, OFFLINE_GRACE_MS);
}

/* ── HTTP ───────────────────────────────────────────── */

const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url, 'http://localhost'); }
  catch (e) { return json(res, { error: 'bad url' }, 400); }

  const pathname = url.pathname;

  /* 允許 GitHub Pages（或任何網站）跨網域呼叫 /api/*；對戰只用一次性 token，不靠 cookie。 */
  if (pathname.indexOf('/api/') === 0) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }
  }

  try {
    if (pathname === '/api/health' && req.method === 'GET') {
      return json(res, {
        ok: true,
        players: players.size,
        waiting: waiting.filter((id) => players.get(id)?.connected).length,
        rooms: rooms.size
      });
    }

    if (pathname === '/api/session' && req.method === 'GET') {
      const player = players.get(url.searchParams.get('id') || '');
      const ok = !!player && player.token === url.searchParams.get('token');
      return json(res, { ok }, ok ? 200 : 404);
    }

    if (pathname === '/api/join' && req.method === 'POST') {
      const body = await readBody(req);
      const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 12) || '玩家';
      const id = uid(5);
      const token = uid(16);
      players.set(id, {
        id, token, name,
        roomId: null, res: null, connected: false, waiting: false, joinedAt: now()
      });
      return json(res, { ok: true, id, token, name });
    }

    if (pathname === '/api/stream' && req.method === 'GET') {
      const id = url.searchParams.get('id') || '';
      const token = url.searchParams.get('token') || '';
      const player = players.get(id);
      if (!player || player.token !== token) return json(res, { error: 'invalid session' }, 401);

      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      });
      res.write(': connected\n\n');

      if (player.res && player.res !== res) {
        try { player.res.end(); } catch (e) { /* ignore */ }
      }
      player.res = res;
      player.connected = true;

      if (player.roomId) {
        const room = rooms.get(player.roomId);
        if (room) {
          clearTimeout(room.offlineTimer);
          if (room.paused && room.phase === 'question') {
            room.deadline = now() + room.remaining;
            room.paused = false;
            clearTimeout(room.timer);
            room.timer = setTimeout(() => resolveQuestion(room, null), room.remaining);
          }
          send(player, { type: 'hello', id: player.id, name: player.name });
          snapshot(room, player);
          const otherId = room.players.find((x) => x !== player.id);
          const other = players.get(otherId);
          if (other && other.connected) send(other, { type: 'opponent_online' });
        } else {
          player.roomId = null;
          send(player, { type: 'hello', id: player.id, name: player.name });
          enqueue(player);
        }
      } else {
        send(player, { type: 'hello', id: player.id, name: player.name });
        enqueue(player);
      }

      const heartbeat = setInterval(() => {
        if (res.writableEnded) return;
        try { res.write(': ping\n\n'); } catch (e) { /* 連線已斷 */ }
      }, 20000);

      req.on('close', () => {
        clearInterval(heartbeat);
        if (player.res === res) {
          player.res = null;
          player.connected = false;
          dropPlayer(player);
        }
      });
      return;
    }

    if (pathname === '/api/answer' && req.method === 'POST') {
      const body = await readBody(req);
      const player = players.get(String(body.id || ''));
      if (!player || player.token !== body.token) return json(res, { error: 'invalid session' }, 401);
      const room = player.roomId && rooms.get(player.roomId);
      if (!room) return json(res, { error: 'not in room' }, 409);
      if (room.phase !== 'question') return json(res, { error: 'not answering' }, 409);
      if (room.answers[player.id] !== undefined) return json(res, { error: 'already answered' }, 409);

      const choice = Number(body.choice);
      if (!Number.isInteger(choice) || choice < 0 || choice > 3) {
        return json(res, { error: 'bad choice' }, 400);
      }

      room.answers[player.id] = choice;
      const q = room.questions[room.index];
      const otherId = room.players.find((id) => id !== player.id);
      const otherAnswered = room.answers[otherId] !== undefined;

      if (choice === q.a) {
        room.scores[player.id] += 1;
        resolveQuestion(room, player.id);
      } else {
        sendRoom(room, { type: 'wrong', who: player.id });
        if (otherAnswered) resolveQuestion(room, null);
      }
      return json(res, { ok: true });
    }

    if (pathname === '/api/rematch' && req.method === 'POST') {
      const body = await readBody(req);
      const player = players.get(String(body.id || ''));
      if (!player || player.token !== body.token) return json(res, { error: 'invalid session' }, 401);
      const room = player.roomId && rooms.get(player.roomId);
      if (!room) return json(res, { error: 'not in room' }, 409);
      if (room.phase !== 'finished') return json(res, { error: 'not finished' }, 409);

      room.rematch.add(player.id);
      sendRoom(room, { type: 'rematch_wait', count: room.rematch.size, total: 2 });

      if (room.rematch.size >= 2) {
        room.rematch.clear();
        room.questions = pickQuestions();
        room.index = -1;
        room.phase = 'countdown';
        room.answers = {};
        room.scores[room.players[0]] = 0;
        room.scores[room.players[1]] = 0;
        sendRoom(room, { type: 'rematch_start' });
        room.timer = setTimeout(() => startQuestion(room), 2000);
      }
      return json(res, { ok: true });
    }

    if (pathname === '/api/leave' && req.method === 'POST') {
      const body = await readBody(req);
      const player = players.get(String(body.id || ''));
      if (!player || player.token !== body.token) return json(res, { error: 'invalid session' }, 401);

      const idx = waiting.indexOf(player.id);
      if (idx >= 0) waiting.splice(idx, 1);
      player.waiting = false;

      if (player.roomId) {
        const room = rooms.get(player.roomId);
        if (room) {
          const otherId = room.players.find((id) => id !== player.id);
          const other = players.get(otherId);
          clearTimeout(room.timer);
          clearTimeout(room.offlineTimer);
          rooms.delete(room.code);
          if (other) other.roomId = null;
          if (other && other.connected) send(other, { type: 'opponent_left' });
        }
        player.roomId = null;
      }
      return json(res, { ok: true });
    }

    if (pathname.startsWith('/api/')) return json(res, { error: 'not found' }, 404);
    return serveStatic(req, res, pathname);
  } catch (err) {
    console.error('[error]', err);
    if (!res.headersSent) return json(res, { error: 'server error' }, 500);
    try { res.end(); } catch (e) { /* ignore */ }
  }
});

/* ── 靜態檔案（含 mp4 Range）────────────────────────── */

function serveStatic(req, res, pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); }
  catch (e) { return json(res, { error: 'bad path' }, 400); }

  if (decoded === '/' || decoded === '') decoded = '/index.html';
  if (decoded.includes('\0')) return json(res, { error: 'bad path' }, 400);

  const file = path.resolve(ROOT, '.' + decoded);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
    return json(res, { error: 'not found' }, 404);
  }

  const blocked = ['questions.json', 'server.js', 'start-battle.bat']
    .map((name) => path.resolve(ROOT, name).toLowerCase());
  if (blocked.includes(file.toLowerCase())) return json(res, { error: 'not found' }, 404);

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) return json(res, { error: 'not found' }, 404);

    const ext = path.extname(file).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    const isHtml = ext === '.html';
    const headers = {
      'Content-Type': type,
      'Accept-Ranges': 'bytes',
      'Cache-Control': isHtml ? 'no-store' : 'public, max-age=3600'
    };

    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      let start = m && m[1] ? parseInt(m[1], 10) : 0;
      let end = m && m[2] ? parseInt(m[2], 10) : stat.size - 1;
      if (Number.isNaN(start) || Number.isNaN(end) || start >= stat.size || start > end) {
        res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size });
        return res.end();
      }
      end = Math.min(end, stat.size - 1);
      res.writeHead(206, {
        ...headers,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + stat.size,
        'Content-Length': end - start + 1
      });
      if (req.method === 'HEAD') return res.end();
      return fs.createReadStream(file, { start, end }).pipe(res);
    }

    res.writeHead(200, { ...headers, 'Content-Length': stat.size });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

/* ── 啟動 ───────────────────────────────────────────── */

server.on('clientError', (err, socket) => {
  if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, '0.0.0.0', () => {
  const addresses = [];
  const nets = os.networkInterfaces();
  Object.keys(nets).forEach((name) => {
    (nets[name] || []).forEach((net) => {
      if (net.family === 'IPv4' && !net.internal) addresses.push(net.address);
    });
  });

  console.log('');
  console.log('  風與空氣知識王伺服器已啟動');
  console.log('  ─────────────────────────────');
  console.log('  教學網頁：http://localhost:' + PORT + '/');
  console.log('  學生入口：http://localhost:' + PORT + '/battle.html');
  if (addresses.length) {
    console.log('');
    console.log('  同一個 Wi-Fi 的學生請開：');
    addresses.forEach((ip) => console.log('    http://' + ip + ':' + PORT + '/battle.html'));
  } else {
    console.log('  （找不到區網 IP，請確認網路連線）');
  }
  console.log('');
  console.log('  按 Ctrl + C 可停止伺服器。');
  console.log('');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('連接埠 ' + PORT + ' 已被占用。請關閉其他伺服器，或改用：set PORT=8766 && node server.js');
  } else {
    console.error(err);
  }
  process.exit(1);
});
