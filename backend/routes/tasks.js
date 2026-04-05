const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()
const { callAI } = require('../utils/aiClient')

const DATA_DIR = path.join(__dirname, '..', 'data')
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function saveTasks() {
  try { fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8') } catch (e) { console.error('[tasks] save failed:', e.message) }
}

function sanitize(str) {
  if (typeof str !== 'string') return ''
  return str.replace(/<[^>]*>/g, '').trim()
}

const ALLOWED_TAGS = ['餐饮代购', '物流搬运', '跑腿/借用', '学习互助', '其他']

function safeId(param) {
  const n = parseInt(param, 10)
  return Number.isFinite(n) ? n : null
}

const DEFAULT_TASKS = [
  { id: 1, name: '小明', tag: '餐饮代购', desc: '需要在图书馆5楼帮带一份食堂三楼的照烧鸡腿饭，谢谢！', location: '主校区 图书馆', time: '2分钟前', accepted: false, reward: '5元红包' },
  { id: 2, name: '大力', tag: '物流搬运', desc: '大件快递到校门口了，求一位有平衡车或推车的小伙伴帮忙。', location: '北门 快递点', time: '5分钟前', accepted: false, reward: '10元红包' },
  { id: 3, name: '小红', tag: '跑腿/借用', desc: '急借一个Type-C转HDMI转换器，今天下午多媒体课用。', location: 'C区 教学楼', time: '8分钟前', accepted: false, reward: '感谢+借用费' },
  { id: 4, name: '晓雯', tag: '学习互助', desc: '高数期末复习，求大神一起学习打卡，我请奶茶！', location: 'B栋 402自习室', time: '12分钟前', accepted: false, reward: '奶茶一杯' },
  { id: 5, name: '阿辉', tag: '餐饮代购', desc: '帮我在一食堂买份红烧肉套餐带到宿舍楼B栋，速度快一点哦。', location: '宿舍楼 B栋', time: '15分钟前', accepted: false, reward: '3元跑腿费' }
]

let tasks
try {
  const raw = fs.readFileSync(TASKS_FILE, 'utf8')
  const parsed = JSON.parse(raw)
  tasks = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TASKS
} catch { tasks = DEFAULT_TASKS }

// GET /api/tasks
router.get('/', (req, res) => {
  res.json({ tasks, total: tasks.length })
})

// POST /api/tasks - create new task
router.post('/', (req, res) => {
  const name = sanitize(req.body.name)
  const tag = sanitize(req.body.tag)
  const desc = sanitize(req.body.desc)
  const location = sanitize(req.body.location)
  const reward = sanitize(req.body.reward)
  if (!desc) {
    return res.status(400).json({ error: 'desc is required' })
  }
  if (!location) {
    return res.status(400).json({ error: 'location is required' })
  }
  if (desc.length > 200) {
    return res.status(400).json({ error: 'desc too long (max 200 chars)' })
  }
  if (location.trim().length > 100) {
    return res.status(400).json({ error: 'location too long (max 100 chars)' })
  }
  const resolvedTag = ALLOWED_TAGS.includes(tag) ? tag : '其他'
  const newTask = {
    id: Date.now(),
    name: (typeof name === 'string' ? name.trim().slice(0, 50) : '') || '匿名用户',
    tag: resolvedTag,
    desc: desc.trim(),
    location: location.trim(),
    time: '刚刚',
    accepted: false,
    reward: (typeof reward === 'string' ? reward.trim().slice(0, 50) : '') || ''
  }
  tasks = [newTask, ...tasks]
  saveTasks()
  res.status(201).json({ task: newTask })
})

// PATCH /api/tasks/:id/accept
router.patch('/:id/accept', (req, res) => {
  const id = safeId(req.params.id)
  if (id === null) return res.status(400).json({ error: 'Invalid task id' })
  const task = tasks.find(t => t.id === id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  if (task.accepted) return res.status(409).json({ error: 'Task already accepted' })
  task.accepted = true
  saveTasks()
  res.json({ task })
})

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', (req, res) => {
  const id = safeId(req.params.id)
  if (id === null) return res.status(400).json({ error: 'Invalid task id' })
  const task = tasks.find(t => t.id === id)
  if (!task) return res.status(404).json({ error: 'Task not found' })
  if (!task.accepted) return res.status(409).json({ error: 'Task not yet accepted' })
  task.completed = true
  saveTasks()
  res.json({ task })
})

// GET /api/tasks/suggestions - AI-generated task ideas
let _sugCache = null
let _sugHour = -1
router.get('/suggestions', async (req, res) => {
  const hour = new Date().getHours()
  if (_sugCache && _sugHour === hour) return res.json({ suggestions: _sugCache })
  const now = new Date()
  const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  try {
    const reply = await callAI([
      {
        role: 'system',
        content: '你是大学校园互助平台的智能助手。根据时间和星期生成3条互助任务建议，以JSON数组返回，不含markdown代码块。每条格式：{"tag":"分类","desc":"任务描述","location":"地点","reward":"报酬"}。tag从以下选：餐饮代购、物流搬运、跑腿/借用、学习互助、其他。desc不超过40字，真实感强。'
      },
      {
        role: 'user',
        content: `现在是${weekDay} ${timeStr}，生成3条符合当前时间段和场景的校园互助任务建议。`
      }
    ], 400, 0.9)
    const jsonStr = reply.replace(/```json|```/gi, '').trim()
    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('empty')
    _sugCache = parsed.map(s => ({
      tag: String(s.tag || '其他').slice(0, 20),
      desc: String(s.desc || '').slice(0, 60),
      location: String(s.location || '校园内').slice(0, 30),
      reward: String(s.reward || '').slice(0, 30)
    }))
    _sugHour = hour
    res.json({ suggestions: _sugCache })
  } catch (err) {
    console.warn('[tasks] AI suggestions failed:', err.message)
    res.json({ suggestions: [] })
  }
})

module.exports = router
module.exports.flush = saveTasks
