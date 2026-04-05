const express = require('express')
const router = express.Router()
const { callAI } = require('../utils/aiClient')

const COLORS = ['primary', 'secondary', 'tertiary']
const FALLBACK_EVENTS = [
  { id: 1, tag: '社团招新', name: '街舞社在中心广场表演', time: '今日 14:00', location: '中心广场', color: 'secondary' },
  { id: 2, tag: '环保工作坊', name: '绿植领养活动进行中', time: '今日 全天', location: '学生活动中心', color: 'tertiary' },
  { id: 3, tag: '讲座提醒', name: 'AI前沿讲座', time: '今日 15:00', location: '报告厅A202', color: 'primary' },
  { id: 4, tag: '体育赛事', name: '羽毛球友谊赛', time: '今日 16:00', location: '体育馆', color: 'primary' },
  { id: 5, tag: '文艺演出', name: '话剧社公演《未来已来》', time: '今日 19:30', location: '大礼堂', color: 'secondary' }
]

let _cache = null
let _cacheHour = -1

async function getEvents() {
  const hour = new Date().getHours()
  if (_cache && _cacheHour === hour) return _cache

  const now = new Date()
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]

  try {
    const reply = await callAI([
      {
        role: 'system',
        content: '你是一个中国大学校园活动生成器。根据给定的时间和星期，生成5条真实感强的校园活动，以JSON数组返回，不要包含任何markdown格式或代码块。每条格式：{"tag":"标签","name":"活动名","time":"时间描述","location":"地点"}。tag从以下选：社团招新、学术讲座、体育赛事、文艺演出、志愿服务、环保工作坊、美食节、职业发展。time格式如"今日 14:00"或"明日 10:00"或"15分钟后"。'
      },
      {
        role: 'user',
        content: `现在是${weekDay} ${timeStr}，请生成5条今天及近期的校园活动，要多样化，符合大学生活节奏。`
      }
    ], 600, 0.9)

    const jsonStr = reply.replace(/```json|```/gi, '').trim()
    const parsed = JSON.parse(jsonStr)
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('empty array')

    _cache = parsed.map((e, i) => ({
      id: i + 1,
      tag: String(e.tag || '活动').slice(0, 20),
      name: String(e.name || '校园活动').slice(0, 40),
      time: String(e.time || '今日').slice(0, 20),
      location: String(e.location || '校园内').slice(0, 30),
      color: COLORS[i % COLORS.length]
    }))
    _cacheHour = hour
    return _cache
  } catch (err) {
    console.warn('[events] AI generation failed, using fallback:', err.message)
    return FALLBACK_EVENTS
  }
}

// GET /api/events
router.get('/', async (req, res) => {
  const events = await getEvents()
  res.json({ events, total: events.length })
})

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  const events = await getEvents()
  const event = events.find(e => e.id === parseInt(req.params.id))
  if (!event) return res.status(404).json({ error: 'Event not found' })
  res.json({ event })
})

module.exports = router
