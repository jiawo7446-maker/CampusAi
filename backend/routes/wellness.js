const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()

const DATA_DIR = path.join(__dirname, '..', 'data')
const WELLNESS_FILE = path.join(DATA_DIR, 'wellness.json')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const DEFAULT_WELLNESS = {
  healthScore: 82,
  userStats: {},
  lastCheckinDate: null,
  sleepRecord: [40, 60, 30, 80, 50, 90, 75],
  emotionHistory: [
    { id: 1, label: '元气满满', emoji: '⚡', time: '今天 09:30' },
    { id: 2, label: '平静',     emoji: '🍃', time: '昨天 21:00' },
    { id: 3, label: '疲惫',     emoji: '😴', time: '昨天 14:20' }
  ],
  checkinState: {}
}

function loadWellness() {
  try {
    const raw = fs.readFileSync(WELLNESS_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return (parsed && typeof parsed.healthScore === 'number') ? parsed : { ...DEFAULT_WELLNESS }
  } catch { return { ...DEFAULT_WELLNESS } }
}

function saveWellness() {
  try { fs.writeFileSync(WELLNESS_FILE, JSON.stringify(wellnessData, null, 2), 'utf8') } catch (e) { console.error('[wellness] save failed:', e.message) }
}

const checkinDateByUser = new Map()

let wellnessData = loadWellness()
// Migrate: move legacy global streak into userStats['default']
if (!wellnessData.userStats) wellnessData.userStats = {}
if (wellnessData.streakDays != null && !wellnessData.userStats['default']) {
  wellnessData.userStats['default'] = {
    streakDays: wellnessData.streakDays || 0,
    totalCheckins: wellnessData.totalCheckins || wellnessData.streakDays || 0,
    lastCheckinDate: wellnessData.lastCheckinDate || null
  }
  delete wellnessData.streakDays
  delete wellnessData.totalCheckins
  delete wellnessData.lastCheckinDate
  saveWellness()
}
// Restore checkin state
if (wellnessData.checkinState && typeof wellnessData.checkinState === 'object') {
  Object.entries(wellnessData.checkinState).forEach(([k, v]) => checkinDateByUser.set(k, v))
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}
function yesterdayStr() {
  const d = new Date(Date.now() - 86400000)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}
function getUserStats(userId) {
  if (!wellnessData.userStats[userId]) {
    wellnessData.userStats[userId] = { streakDays: 0, totalCheckins: 0, lastCheckinDate: null }
  }
  return wellnessData.userStats[userId]
}
function checkStreakReset(stats) {
  if (!stats.lastCheckinDate) return
  if (stats.lastCheckinDate !== todayStr() && stats.lastCheckinDate !== yesterdayStr()) {
    stats.streakDays = 0
    stats.lastCheckinDate = null
  }
}

// GET /api/wellness
router.get('/', (req, res) => {
  const userId = (req.headers['x-user-id'] || 'default').slice(0, 64)
  const stats = getUserStats(userId)
  checkStreakReset(stats)
  res.json({ ...wellnessData, streakDays: stats.streakDays, totalCheckins: stats.totalCheckins })
})

// POST /api/wellness/checkin - record emotion check-in
router.post('/checkin', (req, res) => {
  const { label, emoji } = req.body
  if (!label || typeof label !== 'string' || !label.trim()) {
    return res.status(400).json({ error: 'label is required' })
  }
  if (label.trim().length > 20) {
    return res.status(400).json({ error: 'label too long (max 20 chars)' })
  }
  if (emoji !== undefined && (typeof emoji !== 'string' || emoji.length > 8)) {
    return res.status(400).json({ error: 'invalid emoji' })
  }

  const now = new Date()
  const userId = (req.headers['x-user-id'] || req.headers['authorization'] || 'default').slice(0, 64)
  const todayKey = `${userId}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  const alreadyCheckedIn = checkinDateByUser.get(userId) === todayKey

  const timeStr = `今天 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const newEntry = { id: Date.now(), label: label.trim(), emoji: emoji || '😊', time: timeStr }
  wellnessData.emotionHistory = [newEntry, ...wellnessData.emotionHistory].slice(0, 10)

  const stats = getUserStats(userId)
  if (!alreadyCheckedIn) {
    checkStreakReset(stats)
    stats.streakDays += 1
    stats.totalCheckins = (stats.totalCheckins || 0) + 1
    stats.lastCheckinDate = todayStr()
    wellnessData.healthScore = Math.min(100, wellnessData.healthScore + 2)
    checkinDateByUser.set(userId, todayKey)
    if (checkinDateByUser.size > 10000) checkinDateByUser.clear()
  }
  // Persist checkin state
  wellnessData.checkinState = Object.fromEntries(checkinDateByUser)
  saveWellness()

  res.json({
    message: '打卡成功',
    alreadyCheckedIn,
    streakDays: stats.streakDays,
    totalCheckins: stats.totalCheckins,
    healthScore: wellnessData.healthScore,
    entry: newEntry
  })
})

// POST /api/wellness/meditation - record meditation session
router.post('/meditation', (req, res) => {
  const { duration } = req.body
  const mins = parseInt(duration, 10)
  if (!Number.isFinite(mins) || mins < 1 || mins > 60) {
    return res.status(400).json({ error: 'duration must be an integer between 1 and 60 minutes' })
  }

  wellnessData.healthScore = Math.min(100, wellnessData.healthScore + 3)
  saveWellness()
  res.json({
    message: '冥想记录成功',
    duration: mins,
    healthScore: wellnessData.healthScore
  })
})

module.exports = router
module.exports.flush = saveWellness
