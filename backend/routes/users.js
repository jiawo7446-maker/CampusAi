const fs = require('fs')
const path = require('path')
const express = require('express')

const router = express.Router()
const DATA_DIR = path.join(__dirname, '..', 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

function readUsers() {
  try {
    const content = fs.readFileSync(USERS_FILE, 'utf8')
    const parsed = JSON.parse(content)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8')
}

// GET /api/users/:id/profile - get public profile data (hugsReceived)
router.get('/:id/profile', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid id' })
  const users = readUsers()
  const user = users.find(u => u.id === id)
  if (!user) return res.status(404).json({ error: 'user not found' })
  res.json({ id: user.id, nickname: user.nickname, hugsReceived: user.hugsReceived || 0 })
})

// POST /api/users/:id/hug - someone sent this user a hug (on their post)
router.post('/:id/hug', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid id' })
  const users = readUsers()
  const user = users.find(u => u.id === id)
  if (!user) return res.status(404).json({ error: 'user not found' })
  user.hugsReceived = (user.hugsReceived || 0) + 1
  try {
    writeUsers(users)
    res.json({ hugsReceived: user.hugsReceived })
  } catch (err) {
    console.error('[users] failed to persist hug:', err.message)
    res.status(500).json({ error: 'failed to save' })
  }
})

// GET /api/users/:id/posts-count - count published posts for a user
router.get('/:id/posts-count', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid id' })
  // Lazy-require to avoid circular deps; posts module exposes its array via a getter
  let postsRoute
  try { postsRoute = require('./posts') } catch { return res.json({ count: 0 }) }
  // posts router doesn't export the array directly - read from file instead
  const fs = require('fs'), path = require('path')
  const POSTS_FILE = path.join(__dirname, '..', 'data', 'posts.json')
  let count = 0
  try {
    const posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'))
    count = Array.isArray(posts) ? posts.filter(p => p.authorId === id).length : 0
  } catch {}
  res.json({ count })
})

module.exports = router
