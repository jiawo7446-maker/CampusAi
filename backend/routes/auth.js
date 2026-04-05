const fs = require('fs')
const path = require('path')
const express = require('express')

const router = express.Router()

const DATA_DIR = path.join(__dirname, '..', 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const DEFAULT_USERS = [
  { id: 1, nickname: '测试用户', phone: '13800000000', passwordHash: Buffer.from('123456').toString('base64'), createdAt: new Date(0).toISOString(), hugsReceived: 0 },
  { id: 2, nickname: '小明', phone: '18800000001', passwordHash: Buffer.from('123456').toString('base64'), createdAt: new Date(0).toISOString(), hugsReceived: 0 }
]

function sanitize(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 200)
}

const ALLOWED_NICKNAME_RE = /^[\u4e00-\u9fa5a-zA-Z0-9_\-\. ]{2,20}$/

function validatePhone(phone) {
  return typeof phone === 'string' && /^1[3-9]\d{9}$/.test(phone)
}

function validatePassword(pwd) {
  return typeof pwd === 'string' && pwd.length >= 6 && pwd.length <= 64
}

function validateNickname(nickname) {
  return typeof nickname === 'string' && ALLOWED_NICKNAME_RE.test(nickname.trim())
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') return null
  const nickname = sanitize(raw.nickname)
  const phone = sanitize(raw.phone)
  const passwordHash = typeof raw.passwordHash === 'string'
    ? raw.passwordHash
    : (typeof raw.password === 'string' ? raw.password : '')

  if (!validateNickname(nickname) || !validatePhone(phone) || !passwordHash) return null

  return {
    id: Number.isFinite(Number(raw.id)) ? Number(raw.id) : Date.now(),
    nickname,
    phone,
    passwordHash,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
    hugsReceived: Number.isFinite(Number(raw.hugsReceived)) ? Number(raw.hugsReceived) : 0
  }
}

function writeUsersFile(users) {
  ensureDataDir()
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
}

function loadUsers() {
  ensureDataDir()
  if (!fs.existsSync(USERS_FILE)) {
    writeUsersFile(DEFAULT_USERS)
    return [...DEFAULT_USERS]
  }

  try {
    const content = fs.readFileSync(USERS_FILE, 'utf8')
    const parsed = JSON.parse(content)
    if (!Array.isArray(parsed)) throw new Error('users.json is not an array')

    const normalized = parsed.map(normalizeUser).filter(Boolean)
    if (!normalized.length) {
      writeUsersFile(DEFAULT_USERS)
      return [...DEFAULT_USERS]
    }

    // Auto-migrate legacy data format to current schema
    writeUsersFile(normalized)
    return normalized
  } catch (err) {
    console.error('[auth] failed to load users.json, fallback to defaults:', err.message)
    writeUsersFile(DEFAULT_USERS)
    return [...DEFAULT_USERS]
  }
}

let users = loadUsers()

// POST /api/auth/register
router.post('/register', (req, res) => {
  const nickname = sanitize(req.body.nickname)
  const phone = sanitize(req.body.phone)
  const password = typeof req.body.password === 'string' ? req.body.password.slice(0, 64) : ''

  if (!validateNickname(nickname)) {
    return res.status(400).json({ error: '昵称需 2-20 位，仅限中英文、数字和下划线' })
  }
  if (!validatePhone(phone)) {
    return res.status(400).json({ error: '手机号格式不正确' })
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: '密码至少 6 位' })
  }
  if (users.find(u => u.phone === phone)) {
    return res.status(409).json({ error: '该手机号已注册' })
  }

  const user = {
    id: Date.now(),
    nickname: nickname.trim(),
    phone,
    passwordHash: Buffer.from(password).toString('base64'), // demo only
    createdAt: new Date().toISOString(),
    hugsReceived: 0
  }
  users.push(user)

  try {
    writeUsersFile(users)
  } catch (err) {
    console.error('[auth] failed to persist user:', err.message)
    users = users.filter(u => u.id !== user.id)
    return res.status(500).json({ error: '注册成功但保存失败，请重试' })
  }

  res.status(201).json({
    message: '注册成功',
    user: { id: user.id, nickname: user.nickname, phone: user.phone }
  })
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  const username = sanitize(req.body.username)
  const password = typeof req.body.password === 'string' ? req.body.password.slice(0, 64) : ''

  if (!username || !password) {
    return res.status(400).json({ error: '账号和密码不能为空' })
  }

  const user = users.find(u => u.phone === username || u.nickname === username)
  if (!user) {
    return res.status(401).json({ error: '账号不存在，请先注册' })
  }

  const hash = Buffer.from(password).toString('base64')
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: '密码错误' })
  }

  return res.json({
    message: '登录成功',
    user: { id: user.id, nickname: user.nickname, phone: user.phone }
  })
})

module.exports = router
