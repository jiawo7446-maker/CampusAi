require('dotenv').config()
const express = require('express')
const cors = require('cors')

// Simple in-memory rate limiter (no extra deps)
const _rateBuckets = new Map()
function rateLimit(maxPerWindow, windowMs) {
  return (req, res, next) => {
    const key = req.ip + req.path
    const now = Date.now()
    const bucket = _rateBuckets.get(key) || { count: 0, reset: now + windowMs }
    if (now > bucket.reset) { bucket.count = 0; bucket.reset = now + windowMs }
    bucket.count++
    _rateBuckets.set(key, bucket)
    if (_rateBuckets.size > 50000) _rateBuckets.clear()
    if (bucket.count > maxPerWindow) {
      return res.status(429).json({ error: '请求过于频繁，请稍后再试' })
    }
    next()
  }
}

const aiRouter      = require('./routes/ai')
const authRouter    = require('./routes/auth')
const tasksRouter   = require('./routes/tasks')
const postsRouter   = require('./routes/posts')
const eventsRouter  = require('./routes/events')
const wellnessRouter = require('./routes/wellness')
const usersRouter   = require('./routes/users')
const galleryRouter  = require('./routes/gallery')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'] }))
app.use(express.json({ limit: '2mb' }))

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))
app.use('/api/auth',    rateLimit(10, 60000), authRouter)
app.use('/api/ai',      rateLimit(30, 60000), aiRouter)
app.use('/api/tasks',   tasksRouter)
app.use('/api/posts',   postsRouter)
app.use('/api/events',  eventsRouter)
app.use('/api/wellness', wellnessRouter)
app.use('/api/users',   usersRouter)
app.use('/api/gallery', galleryRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' })
  }
  res.status(500).json({ error: 'Internal server error' })
})

const server = app.listen(PORT, () => {
  console.log(`智校·AI生活助手 API 运行中: http://localhost:${PORT}`)
})

function gracefulShutdown(signal) {
  console.log(`[Server] ${signal} received, flushing data...`)
  try { require('./routes/wellness').flush && require('./routes/wellness').flush() } catch {}
  try { require('./routes/posts').flush && require('./routes/posts').flush() } catch {}
  try { require('./routes/tasks').flush && require('./routes/tasks').flush() } catch {}
  try { require('./routes/gallery').flush && require('./routes/gallery').flush() } catch {}
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 2000)
}
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT',  () => gracefulShutdown('SIGINT'))
