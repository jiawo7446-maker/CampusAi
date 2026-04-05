const app = getApp()

const DEFAULT_COURSES = [
  { id: 1, name: '高等数学', room: 'A103', dayOfWeek: 0, startTime: '08:00', endTime: '09:40', color: 'primary' },
  { id: 2, name: '大学英语', room: 'B205', dayOfWeek: 0, startTime: '10:00', endTime: '11:40', color: 'secondary' },
  { id: 3, name: '思想政治', room: 'D401', dayOfWeek: 0, startTime: '14:00', endTime: '15:40', color: 'tertiary' },
  { id: 4, name: '线性代数', room: 'A201', dayOfWeek: 1, startTime: '08:00', endTime: '09:40', color: 'tertiary' },
  { id: 5, name: '计算机基础', room: '机房3', dayOfWeek: 1, startTime: '14:00', endTime: '15:40', color: 'primary' },
  { id: 6, name: '体育', room: '操场', dayOfWeek: 2, startTime: '10:00', endTime: '11:40', color: 'tertiary' },
  { id: 7, name: '大学物理', room: 'C101', dayOfWeek: 2, startTime: '14:00', endTime: '15:40', color: 'secondary' },
  { id: 8, name: '数据结构与算法', room: '402教研室', dayOfWeek: 3, startTime: '14:00', endTime: '15:30', color: 'primary' },
  { id: 9, name: '大学英语', room: 'B205', dayOfWeek: 4, startTime: '08:00', endTime: '09:40', color: 'secondary' },
  { id: 10, name: '大学物理', room: 'C101', dayOfWeek: 4, startTime: '14:00', endTime: '15:40', color: 'secondary' }
]

function _timeToMin(t) {
  if (!t || !t.includes(':')) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function _buildTodaySlots(courses) {
  if (!courses.length) return []
  const sorted = [...courses].sort((a, b) => _timeToMin(a.startTime) - _timeToMin(b.startTime))
  const slots = []
  sorted.forEach((course, i) => {
    slots.push({ key: `c${course.id}`, type: 'course', id: course.id, name: course.name, room: course.room, startTime: course.startTime, endTime: course.endTime, color: course.color })
    if (i < sorted.length - 1) {
      const dur = _timeToMin(sorted[i + 1].startTime) - _timeToMin(course.endTime)
      if (dur >= 15) {
        slots.push({ key: `g${course.endTime}`, type: 'gap', startTime: course.endTime, endTime: sorted[i + 1].startTime })
      }
    }
  })
  const last = sorted[sorted.length - 1]
  if (last && _timeToMin(last.endTime) < _timeToMin('18:00')) {
    slots.push({ key: `g${last.endTime}end`, type: 'gap', startTime: last.endTime, endTime: '18:00' })
  }
  return slots.slice(0, 5)
}

Page({
  data: {
    navBarHeight: 100,
    tabBarBottom: 80,
    isRefreshing: false,
    todaySlots: [],
    hasTodayCourses: false,
    foods: [
      { id: 1, badge: '营养师推荐', name: '凉拌面套餐', desc: '轻盈低卡，活力开启', emoji: '🍜', color: '#fef9e7', location: '二食堂三楼', lat: 31.230300, lng: 121.473500 },
      { id: 2, badge: '今日新品', name: '素心豆腐汤', desc: '清淡鲜美，回味无穷', emoji: '🥣', color: '#f0fdf4', location: '二食堂三楼', lat: 31.230300, lng: 121.473500 },
      { id: 3, badge: '人气爆款', name: '三文鱼沙拉', desc: '高蛋白低脂，健康之选', emoji: '🥗', color: '#eff6ff', location: '艺术中心轻食店', lat: 31.230700, lng: 121.473200 },
      { id: 4, badge: '食堂特供', name: '照烧鸡腿饭', desc: '分量十足，元气满分', emoji: '🍗', color: '#fff7ed', location: '一食堂二楼', lat: 31.230100, lng: 121.473700 },
      { id: 5, badge: '热饮推荐', name: '现磨咖啡', desc: '醇厚香浓，下午好搭档', emoji: '☕', color: '#fdf4ff', location: '图书馆一楼咖啡厅', lat: 31.230900, lng: 121.473400 },
      { id: 6, badge: '素食优选', name: '全麦大吐司', desc: '松软香甜，健康之选', emoji: '🥖', color: '#fff7ed', location: '学生活动中心', lat: 31.231100, lng: 121.473600 }
    ],
    studySpots: [
      { id: 1, name: 'B栋402室', type: '自习室', current: 12, total: 30, score: 98, tag: 'AI首推 🥇', reason: '当前人数最少，安静指数全校最高，靠窗座位光线充足，网络信号满格', lat: 31.230516, lng: 121.473801 },
      { id: 2, name: '图书馆三楼阅览室', type: '图书馆', current: 45, total: 120, score: 92, tag: '藏书丰富 📖', reason: '藏书资源丰富，环境极度安静，适合查阅文献和深度阅读', lat: 31.230216, lng: 121.473601 },
      { id: 3, name: 'A栋201研讨室', type: '研讨室', current: 3, total: 8, score: 88, tag: '小组推荐 👥', reason: '配备投影设备，隔音效果好，适合3-6人小组讨论不打扰他人', lat: 31.230816, lng: 121.473901 },
      { id: 4, name: '工科楼西厅', type: '开放空间', current: 20, total: 60, score: 82, tag: '全天开放 🌙', reason: '24小时不关门，插座数量充足，邻近工科楼教室，深夜首选', lat: 31.230116, lng: 121.474001 },
      { id: 5, name: '学生活动中心二楼', type: '学习吧', current: 8, total: 25, score: 79, tag: '氛围感 ☕', reason: '背景轻音乐，咖啡飘香，适合创意类作业和放松状态下的学习', lat: 31.231016, lng: 121.473501 }
    ],
    navSub: '去健身房的最快路线',
    navKm: '650米',
    events: [
      { id: 1, tag: '社团招新', name: '街舞社在中心广场表演', time: '今日 14:00', location: '中心广场', color: 'secondary' },
      { id: 2, tag: '环保工作坊', name: '绿植领养活动进行中', time: '今日 全天', location: '学生活动中心', color: 'tertiary' },
      { id: 3, tag: '讲座提醒', name: 'AI前沿讲座', time: '15分钟后', location: '报告厅A202', color: 'primary' },
      { id: 4, tag: '体育赛事', name: '羽毛球友谊赛', time: '今日 16:00', location: '体育馆', color: 'primary' },
      { id: 5, tag: '文艺演出', name: '话剧社公演《未来已来》', time: '今日 19:30', location: '大礼堂', color: 'secondary' }
    ],
    showGallery: false,
    showSubmitModal: false,
    submitDraftPath: '',
    submitDraftBase64: '',
    submitCaption: '',
    galleryWorks: [
      { id: 1,  author: '摄影爱好者', avatarBg: '#6366f1', avatarInitial: '摄', type: 'photo', imagePath: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&q=80', caption: '清晨的图书馆，光线特别美，一个人的时光最治愈', likes: 42, liked: false },
      { id: 2,  author: '校园记录者', avatarBg: '#ec4899', avatarInitial: '校', type: 'photo', imagePath: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&q=80', caption: '操场的夕阳，每次看都心动，忘记了所有压力', likes: 78, liked: false },
      { id: 3,  author: '随拍达人',   avatarBg: '#14b8a6', avatarInitial: '随', type: 'photo', imagePath: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop&q=80', caption: '食堂排队的小猫咪，每天风雨无阻来蹭饭 🥣', likes: 135, liked: false },
      { id: 4,  author: '夜猫子',     avatarBg: '#3b82f6', avatarInitial: '夜', type: 'photo', imagePath: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=300&fit=crop&q=80', caption: '凌晨两点的宿舍楼，灯光里都是拼搏的故事', likes: 91, liked: false },
      { id: 5,  author: '树下读书人', avatarBg: '#f97316', avatarInitial: '树', type: 'photo', imagePath: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&q=80', caption: '秋天银杏大道，落叶铺满整条路，美得不真实', likes: 204, liked: false },
      { id: 6,  author: '话剧小达人', avatarBg: '#f43f5e', avatarInitial: '剧', type: 'photo', imagePath: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=400&h=300&fit=crop&q=80', caption: '社团公演前的后台，紧张又兴奋，青春就是这样', likes: 63, liked: false },
      { id: 7,  author: '咖啡续命者', avatarBg: '#92400e', avatarInitial: '咖', type: 'photo', imagePath: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop&q=80', caption: '考试周深夜，一杯美式撑过整个图书馆闭馆时间', likes: 156, liked: false },
      { id: 8,  author: '运动健将',   avatarBg: '#22c55e', avatarInitial: '运', type: 'photo', imagePath: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=300&fit=crop&q=80', caption: '秋季运动会冲刺瞬间，这张照片我看了一百遍', likes: 88, liked: false },
      { id: 9,  author: '花痴少女',   avatarBg: '#ec4899', avatarInitial: '花', type: 'photo', imagePath: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&h=300&fit=crop&q=80', caption: '三月份的校门口樱花，每年都来这里等你', likes: 312, liked: false },
      { id: 10, author: '大四学长',   avatarBg: '#8b5cf6', avatarInitial: '学', type: 'photo', imagePath: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop&q=80', caption: '毕业典礼那天的操场，四年所有回忆都在这里了', likes: 278, liked: false }
    ]
  },
  onLoad() {
    this.setData({
      navBarHeight: app.globalData.navBarHeight || 100,
      tabBarBottom: app.globalData.tabBarBottom || 80
    })
    this._fetchEvents()
    this._loadTodaySchedule()
    this._fetchAINavTip()
    this._fetchAIStudySpots()
    this._fetchGallery()
  },
  _fetchGallery() {
    wx.request({
      url: `${app.globalData.apiBase}/api/gallery`,
      method: 'GET',
      timeout: 6000,
      success: (res) => {
        if (res.statusCode === 200 && res.data && Array.isArray(res.data.works)) {
          this.setData({ galleryWorks: res.data.works })
        }
      },
      fail: () => {}
    })
  },
  _fetchAINavTip() {
    const now = new Date()
    const hour = now.getHours()
    const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
    const cacheKey = `navTip_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${Math.floor(hour / 3)}`
    const cached = wx.getStorageSync(cacheKey)
    if (cached) { try { const d = JSON.parse(cached); this.setData({ navSub: d.sub, navKm: d.km }); return } catch (e) {} }
    app.callAI({
      messages: [
        { role: 'system', content: '你是「智校·AI生活助手」出行模块，根据当前时间和星期生成一条出行建议，以JSON返回，不含代码块：{"sub":"目的地和路线，不超过14字","km":"距离，如650米或1.2公里"}' },
        { role: 'user', content: `现在是${weekDay} ${hour}:00，推荐一个大学生此时适合去的校园地点（食堂/自习室/操场/图书馆/咖啡厅等），并给出简短路线提示和距离。` }
      ],
      maxTokens: 80, temperature: 0.85,
      onSuccess: (reply) => {
        try {
          const d = JSON.parse(reply.replace(/```json|```/gi, '').trim())
          if (d.sub && d.km) {
            wx.setStorageSync(cacheKey, JSON.stringify(d))
            this.setData({ navSub: d.sub, navKm: d.km })
          }
        } catch (e) {}
      },
      onFail: () => {}
    })
  },
  _fetchAIStudySpots() {
    const now = new Date()
    const hour = now.getHours()
    const cacheKey = `studySpots_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${Math.floor(hour / 2)}`
    const cached = wx.getStorageSync(cacheKey)
    if (cached) { try { this.setData({ studySpots: JSON.parse(cached) }); return } catch (e) {} }
    const weekDay = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][now.getDay()]
    app.callAI({
      messages: [
        { role: 'system', content: '你是「智校·AI生活助手」自习点推荐模块，生成5个自习地点状态，以JSON数组返回，不含代码块。每条格式：{"id":数字,"name":"地点名","type":"类型","current":当前人数,"total":总容量,"score":安静指数0-100,"tag":"标签+emoji","reason":"推荐理由不超过30字","lat":31.2305,"lng":121.4738}。类型从：自习室/图书馆/研讨室/开放空间/学习吧中选。' },
        { role: 'user', content: `现在是${weekDay} ${hour}:00，请根据当前时段（${hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上'}）生成符合实际的校园自习点状态数据，晚上人多，下午次之。` }
      ],
      maxTokens: 600, temperature: 0.7,
      onSuccess: (reply) => {
        try {
          const spots = JSON.parse(reply.replace(/```json|```/gi, '').trim())
          if (Array.isArray(spots) && spots.length > 0) {
            wx.setStorageSync(cacheKey, JSON.stringify(spots))
            this.setData({ studySpots: spots })
          }
        } catch (e) {}
      },
      onFail: () => {}
    })
  },
  _loadTodaySchedule() {
    const jsDay = new Date().getDay()
    const dayOfWeek = (jsDay + 6) % 7
    const stored = wx.getStorageSync('courses')
    const courses = (Array.isArray(stored) && stored.length) ? stored : DEFAULT_COURSES
    const todayCourses = courses.filter(c => c.dayOfWeek === dayOfWeek)
    const todaySlots = _buildTodaySlots(todayCourses)
    this.setData({ todaySlots, hasTodayCourses: todayCourses.length > 0 })
  },
  _fetchEvents() {
    const cached = wx.getStorageSync('cachedEvents')
    if (cached && Array.isArray(cached) && cached.length > 0) {
      this.setData({ events: cached })
    }
    wx.request({
      url: `${app.globalData.apiBase}/api/events`,
      method: 'GET',
      timeout: 6000,
      success: (res) => {
        if (res.statusCode === 200 && res.data && Array.isArray(res.data.events)) {
          wx.setStorageSync('cachedEvents', res.data.events)
          this.setData({ events: res.data.events })
        }
      },
      fail: () => {
        if (!cached || !cached.length) return
        wx.showToast({ title: '网络异常，显示缓存活动', icon: 'none', duration: 1500 })
      }
    })
  },
  onRefresh() {
    this.setData({ isRefreshing: true })
    this._fetchEvents()
    setTimeout(() => this.setData({ isRefreshing: false }), 1200)
  },
  onShow() {
    app.syncUser()
    this._loadTodaySchedule()
    const tb = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tb && tb.data.selected !== 0) tb.setData({ selected: 0 })
  },
  onViewSchedule() {
    wx.navigateTo({ url: '/pages/schedule/schedule' })
  },
  onOrderTap() {
    wx.showActionSheet({
      itemList: ['配送到宿舍楼（预计20分钟）', '去食堂自取（步行5分钟）', '查看更多食物推荐'],
      success(res) {
        if (res.tapIndex === 0) {
          wx.showToast({ title: '配送已下单，骑手接单中…', icon: 'success', duration: 2000 })
        } else if (res.tapIndex === 1) {
          wx.showToast({ title: '导航已开启，步行约5分钟', icon: 'none', duration: 2000 })
        } else {
          wx.showToast({ title: '更多推荐功能开发中', icon: 'none' })
        }
      }
    })
  },
  onStudyCardTap() {
    const spots = this.data.studySpots
    const itemList = spots.map(s =>
      `${s.tag}  ${s.name}  安静${s.score}%（${s.current}/${s.total}人）`
    )
    wx.showActionSheet({
      itemList,
      success: (res) => {
        const spot = spots[res.tapIndex]
        wx.showModal({
          title: `📚 ${spot.name}`,
          content: `类型：${spot.type}\n当前人数：${spot.current} / ${spot.total} 人\n安静指数：${spot.score}%\n\n💡 AI推荐理由\n${spot.reason}`,
          showCancel: true,
          cancelText: '取消',
          confirmText: '导航前往',
          success(modal) {
            if (!modal.confirm) return
            wx.openLocation({
              latitude: spot.lat,
              longitude: spot.lng,
              name: spot.name,
              address: `校园 · ${spot.type}`,
              scale: 17,
              fail() { wx.showToast({ title: '地图启动失败，请重试', icon: 'none' }) }
            })
          }
        })
      }
    })
  },
  onFoodCardTap(e) {
    const id = e.currentTarget.dataset.id
    const food = this.data.foods.find(f => f.id == id)
    if (!food) return
    wx.showActionSheet({
      itemList: ['🛵 配送到宿舍楼（预计20分钟）', `🚶 去${food.location}自取（步行约5分钟）`],
      success(res) {
        if (res.tapIndex === 0) {
          wx.showModal({
            title: '🛵 外卖配送',
            content: `已下单「${food.name}」\n\n📍 送达地点：当前宿舍楼\n⏱ 预计时间：20 分钟\n💰 配送费：免费`,
            showCancel: false,
            confirmText: '好的，等待配送'
          })
        } else {
          wx.openLocation({
            latitude: food.lat,
            longitude: food.lng,
            name: food.location,
            address: food.location,
            scale: 17,
            fail() { wx.showToast({ title: '地图启动失败，请重试', icon: 'none' }) }
          })
        }
      }
    })
  },
  onViewMoreFood() {
    wx.navigateTo({ url: '/pages/food/food' })
  },
  onNavigateTap() {
    wx.showModal({
      title: '🏋️ 前往健身房',
      content: '距离：650 米\n步行时间：约 8 分钟\n推荐路线：经图书馆南门 → 体育中心',
      showCancel: true,
      cancelText: '取消',
      confirmText: '开始导航',
      success(res) {
        if (!res.confirm) return
        wx.openLocation({
          latitude: 31.230416,
          longitude: 121.473701,
          name: '校园健身房',
          address: '主校区体育中心',
          scale: 17,
          fail() {
            wx.showToast({ title: '地图启动失败，请重试', icon: 'none' })
          }
        })
      }
    })
  },
  onEventTap(e) {
    const { tag, name, time, loc } = e.currentTarget.dataset
    wx.showModal({
      title: `${tag}`,
      content: `📌 ${name}\n\n⏰ 时间：${time}\n📍 地点：${loc}`,
      showCancel: true,
      cancelText: '稍后再看',
      confirmText: '我要参加',
      success(res) {
        if (res.confirm) {
          wx.showToast({ title: '已添加到日程！', icon: 'success' })
        }
      }
    })
  },
  onNeedPlan() {
    wx.navigateTo({ url: '/pages/schedule/schedule' })
  },
  onPhotoCardTap() {
    this.setData({ showGallery: true })
  },
  onGalleryClose() {
    this.setData({ showGallery: false })
  },
  preventClose() {},
  _safePreview(src) {
    if (!src) return
    if (!src.startsWith('data:')) {
      wx.previewImage({ urls: [src], current: src })
      return
    }
    const b64 = src.split(',')[1] || ''
    const ext = src.startsWith('data:image/png') ? 'png' : 'jpg'
    const tmpPath = `${wx.env.USER_DATA_PATH}/preview_${Date.now()}.${ext}`
    wx.getFileSystemManager().writeFile({
      filePath: tmpPath, data: b64, encoding: 'base64',
      success: () => wx.previewImage({ urls: [tmpPath], current: tmpPath }),
      fail: () => wx.showToast({ title: '预览失败', icon: 'none' })
    })
  },
  onWorkTap(e) {
    const { id } = e.currentTarget.dataset
    const work = this.data.galleryWorks.find(w => w.id === id)
    if (!work) return
    if (work.type === 'photo') {
      this._safePreview(work.imagePath)
    } else {
      wx.showToast({ title: work.caption, icon: 'none', duration: 2000 })
    }
  },
  onWorkLike(e) {
    const { id } = e.currentTarget.dataset
    const idx = this.data.galleryWorks.findIndex(w => w.id == id)
    if (idx === -1) return
    const w = this.data.galleryWorks[idx]
    this.setData({
      [`galleryWorks[${idx}].liked`]: !w.liked,
      [`galleryWorks[${idx}].likes`]: w.liked ? w.likes - 1 : w.likes + 1
    })
    wx.request({ url: `${app.globalData.apiBase}/api/gallery/${id}/like`, method: 'PATCH', timeout: 6000, fail: () => {} })
  },
  _readBase64(filePath, cb) {
    wx.getFileSystemManager().readFile({
      filePath, encoding: 'base64',
      success: (r) => cb(`data:image/jpeg;base64,${r.data}`),
      fail: () => cb('')
    })
  },
  onGallerySubmit() {
    const pickDone = (path) => {
      this.setData({ submitDraftPath: path, submitDraftBase64: '', submitCaption: '', showSubmitModal: true })
      this._readBase64(path, b64 => this.setData({ submitDraftBase64: b64 }))
    }
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => { pickDone(res.tempFiles[0].tempFilePath) },
      fail: () => {
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => { pickDone(res.tempFilePaths[0]) }
        })
      }
    })
  },
  onSubmitCaptionInput(e) {
    this.setData({ submitCaption: e.detail.value })
  },
  onCancelSubmit() {
    this.setData({ showSubmitModal: false, submitDraftPath: '', submitDraftBase64: '', submitCaption: '' })
  },
  onConfirmSubmit() {
    const { submitDraftPath, submitDraftBase64, submitCaption } = this.data
    if (!submitDraftPath) return
    const caption = app.sanitize(submitCaption) || '我的投稿'
    const username = app.globalData.username || wx.getStorageSync('username') || ''
    const isPhone = /^1[3-9]\d{9}$/.test(username)
    const displayName = isPhone ? username.slice(0, 3) + '****' + username.slice(-4) : (username || '我')
    const COLORS = ['#6366f1', '#ec4899', '#3b82f6', '#8b5cf6', '#f97316', '#14b8a6', '#f43f5e', '#22c55e']
    const avatarBg = COLORS[Math.floor(Math.random() * COLORS.length)]
    const newWork = {
      id: Date.now(),
      author: displayName,
      avatarBg,
      avatarInitial: displayName.charAt(0),
      type: 'photo',
      imagePath: submitDraftBase64 || submitDraftPath,
      caption,
      likes: 0,
      liked: false
    }
    const galleryWorks = [newWork, ...this.data.galleryWorks]
    this.setData({ galleryWorks, showSubmitModal: false, submitDraftPath: '', submitDraftBase64: '', submitCaption: '' })
    wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: '投稿成功！等待审核中 🎉', icon: 'success', duration: 2000 })
    wx.request({
      url: `${app.globalData.apiBase}/api/gallery`,
      method: 'POST',
      data: { author: displayName, avatarBg, avatarInitial: displayName.charAt(0), caption, imageBase64: submitDraftBase64 || '' },
      timeout: 8000,
      fail: () => {}
    })
  },
  onViewAllTap() {
    const events = this.data.events || []
    const itemList = events.slice(0, 6).map(e => `${e.tag} | ${e.name} | ${e.time}`)
    if (!itemList.length) { wx.showToast({ title: '暂无活动', icon: 'none' }); return }
    wx.showActionSheet({
      itemList,
      success: (res) => {
        const ev = events[res.tapIndex]
        if (ev) wx.showToast({ title: `已添加「${ev.name}」到日程`, icon: 'success' })
      }
    })
  }
})
