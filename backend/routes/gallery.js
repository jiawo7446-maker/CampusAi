const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()

const DATA_DIR = path.join(__dirname, '..', 'data')
const GALLERY_FILE = path.join(DATA_DIR, 'gallery.json')
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const DEFAULT_WORKS = [
  { id: 1,  author: '摄影爱好者', avatarBg: '#6366f1', avatarInitial: '摄', type: 'emoji', bg: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', emoji: '📚', caption: '清晨的图书馆，光线特别美，一个人的时光最治愈', likes: 42, liked: false },
  { id: 2,  author: '校园记录者', avatarBg: '#ec4899', avatarInitial: '校', type: 'emoji', bg: 'linear-gradient(135deg,#f7971e 0%,#ffd200 100%)', emoji: '🌅', caption: '操场的夕阳，每次看都心动，忘记了所有压力', likes: 78, liked: false },
  { id: 3,  author: '随拍达人',   avatarBg: '#14b8a6', avatarInitial: '随', type: 'emoji', bg: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)', emoji: '🐱', caption: '食堂排队的小猫咪，每天风雨无阻来蹭饭 🥣', likes: 135, liked: false },
  { id: 4,  author: '夜猫子',     avatarBg: '#3b82f6', avatarInitial: '夜', type: 'emoji', bg: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', emoji: '🌙', caption: '凌晨两点的宿舍楼，灯光里都是拼搏的故事', likes: 91, liked: false },
  { id: 5,  author: '树下读书人', avatarBg: '#f97316', avatarInitial: '树', type: 'emoji', bg: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)', emoji: '🍂', caption: '秋天银杏大道，落叶铺满整条路，美得不真实', likes: 204, liked: false },
  { id: 6,  author: '话剧小达人', avatarBg: '#f43f5e', avatarInitial: '剧', type: 'emoji', bg: 'linear-gradient(135deg,#e96c8a 0%,#7b2ff7 100%)', emoji: '🎭', caption: '社团公演前的后台，紧张又兴奋，青春就是这样', likes: 63, liked: false },
  { id: 7,  author: '咖啡续命者', avatarBg: '#92400e', avatarInitial: '咖', type: 'emoji', bg: 'linear-gradient(135deg,#c79b6d 0%,#6b3f1e 100%)', emoji: '☕', caption: '考试周深夜，一杯美式撑过整个图书馆闭馆时间', likes: 156, liked: false },
  { id: 8,  author: '运动健将',   avatarBg: '#22c55e', avatarInitial: '运', type: 'emoji', bg: 'linear-gradient(135deg,#56ab2f 0%,#a8e063 100%)', emoji: '🏃', caption: '秋季运动会冲刺瞬间，这张照片我看了一百遍', likes: 88, liked: false },
  { id: 9,  author: '花痴少女',   avatarBg: '#ec4899', avatarInitial: '花', type: 'emoji', bg: 'linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)', emoji: '🌸', caption: '三月份的校门口樱花，每年都来这里等你', likes: 312, liked: false },
  { id: 10, author: '大四学长',   avatarBg: '#8b5cf6', avatarInitial: '学', type: 'emoji', bg: 'linear-gradient(135deg,#f8c471 0%,#e74c3c 100%)', emoji: '🎓', caption: '毕业典礼那天的操场，四年所有回忆都在这里了', likes: 278, liked: false }
]

let works
try {
  const raw = fs.readFileSync(GALLERY_FILE, 'utf8')
  const parsed = JSON.parse(raw)
  works = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_WORKS
} catch { works = [...DEFAULT_WORKS] }

function saveGallery() {
  try { fs.writeFileSync(GALLERY_FILE, JSON.stringify(works, null, 2), 'utf8') } catch (e) { console.error('[gallery] save failed:', e.message) }
}

// GET /api/gallery
router.get('/', (req, res) => {
  res.json({ works })
})

// POST /api/gallery - submit a new work
router.post('/', (req, res) => {
  const { author, caption, imageBase64, avatarBg, avatarInitial } = req.body
  if (!author || typeof author !== 'string') return res.status(400).json({ error: 'author required' })
  const safeCaption = typeof caption === 'string' ? caption.trim().slice(0, 200) : ''
  const safeImage = typeof imageBase64 === 'string' && imageBase64.startsWith('data:image/') ? imageBase64.slice(0, 400000) : ''
  const newWork = {
    id: Date.now(),
    author: author.trim().slice(0, 50),
    avatarBg: (typeof avatarBg === 'string' && /^#[0-9a-f]{6}$/i.test(avatarBg)) ? avatarBg : '#6366f1',
    avatarInitial: (typeof avatarInitial === 'string' ? avatarInitial.slice(0, 1) : '我') || '我',
    caption: safeCaption,
    imagePath: safeImage,
    likes: 0,
    liked: false
  }
  works = [newWork, ...works]
  saveGallery()
  res.status(201).json({ work: newWork })
})

// PATCH /api/gallery/:id/like
router.patch('/:id/like', (req, res) => {
  const id = parseInt(req.params.id, 10)
  const work = works.find(w => w.id === id)
  if (!work) return res.status(404).json({ error: 'Not found' })
  work.liked = !work.liked
  work.likes = Math.max(0, work.likes + (work.liked ? 1 : -1))
  saveGallery()
  res.json({ work })
})

module.exports = router
module.exports.flush = saveGallery
