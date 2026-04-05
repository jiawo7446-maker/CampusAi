const fs = require('fs')
const path = require('path')
const express = require('express')
const router = express.Router()

const DATA_DIR = path.join(__dirname, '..', 'data')
const POSTS_FILE = path.join(DATA_DIR, 'posts.json')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const ALLOWED_MOODS = ['全部动态', '✨ 期待', '🍃 放松', '🌧 忧郁', '😤 压力', '😊 开心', '😌 平静', '😴 疲惫', '❤️ 感恩']

function safeId(param) {
  const n = parseInt(param, 10)
  return Number.isFinite(n) ? n : null
}

function savePosts() {
  try { fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8') } catch (e) { console.error('[posts] save failed:', e.message) }
}

const AI_REPLIES = [
  '谢谢你愿意在这里分享，你的感受很真实。希望这个小小的树洞能给你带来温暖 🌱',
  '每一段经历都是成长的印记。你已经很勇敢了，继续加油！✨',
  '感受到你的心情了。无论如何，你并不孤单，这里有很多人在默默支持你 💙',
  '你的分享让我感受到了真实的情感。希望明天会是新的开始 🌅',
  '抱抱你，压力是暂时的，而你的努力正在为你铺就未来的路 🤗'
]

const DEFAULT_POSTS = [
  {
    id: 1,
    author: '匿名同学 #2942',
    time: '12分钟前 · 图书馆',
    mood: '😤 压力',
    content: '期末周真的压力好大，感觉怎么复习都复习不完。深夜的图书馆灯光很亮，但心里却空荡荡的...',
    aiReply: AI_REPLIES[0],
    likes: 24,
    comments: 6,
    liked: false,
    commentList: [
      { id: 101, author: '匿名 #3310', content: '加油！期末一定没问题的！', time: '10分钟前' },
      { id: 102, author: '匿名 #5502', content: '我也在图书馆，一起加油 🤝', time: '8分钟前' },
      { id: 103, author: '匿名 #8812', content: '深夜复习最辛苦了，记得喝杯热水暖暖胃 ☕', time: '7分钟前' },
      { id: 104, author: '匿名 #2267', content: '红烧肉治百病！撑过这周就好了，一起冲！', time: '5分钟前' },
      { id: 105, author: '匿名 #6630', content: '我去年期末也这样，但最后还是过了，你也可以的 💪', time: '3分钟前' },
      { id: 106, author: '匿名 #4401', content: '抱抱你，期末加油，你不是一个人在战斗 🌙', time: '1分钟前' }
    ]
  },
  {
    id: 2,
    author: '匿名同学 #1024',
    time: '1小时前 · 操场',
    mood: '🍃 放松',
    content: '今天在操场跑了5公里，心情瞬间好多了！晚霞真的很美。',
    aiReply: AI_REPLIES[3],
    likes: 156,
    comments: 5,
    liked: false,
    commentList: [
      { id: 201, author: '匿名 #7721', content: '晚霞真的好美！', time: '50分钟前' },
      { id: 202, author: '匿名 #4489', content: '跑步真的好解压，明天我也去！', time: '45分钟前' },
      { id: 203, author: '匿名 #9903', content: '5公里好厉害，我最多跑两圈就不行了哈哈 😅', time: '40分钟前' },
      { id: 204, author: '匿名 #1156', content: '运动完吃饭香，睡觉也香，快乐加倍！', time: '30分钟前' },
      { id: 205, author: '匿名 #3374', content: '照片发出来让我们也看看那个晚霞 📸', time: '20分钟前' }
    ]
  },
  {
    id: 3,
    author: '匿名同学 #0881',
    time: '3小时前 · 宿舍区',
    mood: '🌧 忧郁',
    content: '面试又没过，感觉自己好差劲。大四真的好迷茫，身边的朋友要么保研了，要么已经拿到大厂offer了。只有我还在原地打转。',
    aiReply: AI_REPLIES[1],
    likes: 38,
    comments: 4,
    liked: false,
    commentList: [
      { id: 301, author: '匿名 #2211', content: '你不差劲，只是还没遇到适合你的机会而已。', time: '2小时前' },
      { id: 302, author: '匿名 #5566', content: '我大四也经历过，现在回头看那段时间真的教会了我很多。加油！', time: '2小时前' },
      { id: 303, author: '匿名 #9087', content: '每一次拒信都是在为你筛掉不适合你的地方，对的那个在路上了 🌱', time: '1小时前' },
      { id: 304, author: '匿名 #3345', content: '抱抱你，迷茫是成长的证明，你已经很勇敢了 💙', time: '30分钟前' }
    ]
  },
  {
    id: 4,
    author: '匿名同学 #7733',
    time: '5小时前 · 咖啡厅',
    mood: '😊 开心',
    content: '今天终于拿到了心仪社团的offer！准备了好久，面试的时候腿都在抖，没想到真的过了！开心到想哭 😭',
    aiReply: AI_REPLIES[2],
    likes: 67,
    comments: 5,
    liked: false,
    commentList: [
      { id: 401, author: '匿名 #1122', content: '恭喜恭喜！是哪个社团呀？', time: '4小时前' },
      { id: 402, author: '匿名 #6677', content: '太棒了！努力的人运气都不会太差 🎉', time: '4小时前' },
      { id: 403, author: '匿名 #3398', content: '腿抖还发挥好，这才是真的厉害！', time: '3小时前' },
      { id: 404, author: '匿名 #8821', content: '同喜同喜，我也在等通知，你给我打气了！', time: '2小时前' },
      { id: 405, author: '匿名 #5540', content: '开心到哭最幸福了，好好享受这一刻 🌟', time: '1小时前' }
    ]
  },
  {
    id: 5,
    author: '匿名同学 #4456',
    time: '昨天 · 宿舍',
    mood: '😴 疲惫',
    content: '连续熬了三天夜赶论文，交完之后整个人躺在床上动都动不了。但是看着那份提交成功的截图，感觉一切都值了。',
    aiReply: AI_REPLIES[0],
    likes: 113,
    comments: 4,
    liked: false,
    commentList: [
      { id: 501, author: '匿名 #7712', content: '三天没睡？！铁人！快去补觉！😴', time: '昨天' },
      { id: 502, author: '匿名 #2290', content: '那种提交成功的瞬间太治愈了，所有疲惫一扫而空', time: '昨天' },
      { id: 503, author: '匿名 #4431', content: '论文杀手终于倒下，快去睡吧英雄 🫡', time: '昨天' },
      { id: 504, author: '匿名 #6654', content: '我也在熬，看到你交了给了我动力，冲！', time: '昨天' }
    ]
  },
  {
    id: 6,
    author: '匿名同学 #3321',
    time: '2天前 · 食堂',
    mood: '❤️ 感恩',
    content: '今天在食堂忘带饭卡，一个不认识的同学直接帮我刷了，留下一句"没事别放心上"就走了。校园里真的有很多温暖的人。',
    aiReply: AI_REPLIES[2],
    likes: 289,
    comments: 6,
    liked: false,
    commentList: [
      { id: 601, author: '匿名 #8801', content: '这种事真的会让人相信世界是美好的 🥹', time: '2天前' },
      { id: 602, author: '匿名 #3367', content: '我也遇到过类似的事，当时感动好久！', time: '2天前' },
      { id: 603, author: '匿名 #5512', content: '以后我也要做这样的人！', time: '2天前' },
      { id: 604, author: '匿名 #9934', content: '校园里确实有很多善意，只是平时没注意 🌷', time: '2天前' },
      { id: 605, author: '匿名 #2278', content: '看完心里暖暖的，谢谢你分享这个故事', time: '2天前' },
      { id: 606, author: '匿名 #6641', content: '希望那位同学看到这条帖子，知道你很感激他 💛', time: '2天前' }
    ]
  }
]

let posts
try {
  const raw = fs.readFileSync(POSTS_FILE, 'utf8')
  const parsed = JSON.parse(raw)
  posts = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_POSTS
} catch { posts = DEFAULT_POSTS }

// GET /api/posts
router.get('/', (req, res) => {
  const { mood } = req.query
  const filtered = mood && mood !== '全部动态'
    ? posts.filter(p => p.mood === mood)
    : posts
  res.json({ posts: filtered, total: filtered.length })
})

// POST /api/posts - publish new post
router.post('/', (req, res) => {
  const { content, mood, authorId, author: rawAuthor, imageBase64 } = req.body
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'content is required' })
  }
  if (content.trim().length > 500) {
    return res.status(400).json({ error: 'content too long (max 500 chars)' })
  }
  const resolvedMood = ALLOWED_MOODS.includes(mood) ? mood : '全部动态'
  const aiReply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)]
  const resolvedAuthorId = Number.isFinite(Number(authorId)) ? Number(authorId) : null
  const safeAuthor = (typeof rawAuthor === 'string' && rawAuthor.trim().slice(0, 50)) || `匿名同学 #${Math.floor(Math.random() * 9000 + 1000)}`
  const newPost = {
    id: Date.now(),
    author: safeAuthor,
    time: '刚刚',
    mood: resolvedMood,
    content: content.trim(),
    aiReply,
    likes: 0,
    comments: 0,
    liked: false,
    commentList: [],
    authorId: resolvedAuthorId,
    image: (typeof imageBase64 === 'string' && imageBase64.startsWith('data:image/')) ? imageBase64.slice(0, 400000) : ''
  }
  posts = [newPost, ...posts]
  savePosts()
  res.status(201).json({ post: newPost })
})

// PATCH /api/posts/:id - update mutable fields (aiReply, image)
router.patch('/:id', (req, res) => {
  const id = safeId(req.params.id)
  if (id === null) return res.status(400).json({ error: 'Invalid post id' })
  const post = posts.find(p => p.id === id)
  if (!post) return res.status(404).json({ error: 'Post not found' })
  const { aiReply, image } = req.body
  if (typeof aiReply === 'string' && aiReply.trim().length <= 300) post.aiReply = aiReply.trim()
  if (typeof image === 'string') post.image = image.slice(0, 400000)
  savePosts()
  res.json({ post })
})

// PATCH /api/posts/:id/like
router.patch('/:id/like', (req, res) => {
  const id = safeId(req.params.id)
  if (id === null) return res.status(400).json({ error: 'Invalid post id' })
  const post = posts.find(p => p.id === id)
  if (!post) return res.status(404).json({ error: 'Post not found' })
  post.liked = !post.liked
  post.likes = Math.max(0, post.likes + (post.liked ? 1 : -1))
  savePosts()
  res.json({ post })
})

// POST /api/posts/:id/comment
router.post('/:id/comment', (req, res) => {
  const id = safeId(req.params.id)
  if (id === null) return res.status(400).json({ error: 'Invalid post id' })
  const post = posts.find(p => p.id === id)
  if (!post) return res.status(404).json({ error: 'Post not found' })
  const { content, author } = req.body
  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'content is required' })
  }
  if (content.trim().length > 300) {
    return res.status(400).json({ error: 'comment too long (max 300 chars)' })
  }
  if (!post.commentList) post.commentList = []
  const comment = {
    id: Date.now(),
    author: (typeof author === 'string' && author.trim()) || '匿名同学',
    content: content.trim(),
    time: '刚刚'
  }
  post.commentList = [comment, ...post.commentList]
  post.comments = (post.comments || 0) + 1
  savePosts()
  res.status(201).json({ comment, comments: post.comments })
})

module.exports = router
module.exports.flush = savePosts
