const app = getApp()

Page({
  data: {
    navBarHeight: 100,
    tabBarBottom: 80,
    safeAreaBottom: 0,
    chatBottomPad: 280,
    username: '',
    displayName: '',
    avatarUrl: '',
    inputText: '',
    isTyping: false,
    moodChips: [
      { emoji: '😊', label: '开心',  text: '我今天心情很好！' },
      { emoji: '😔', label: '低落',  text: '我今天有点低落…' },
      { emoji: '😤', label: '有压力', text: '我现在有点压力，能帮我排解一下吗？' },
      { emoji: '😴', label: '疲惫',  text: '我感觉很疲惫…' },
      { emoji: '🤩', label: '充能',  text: '我今天精力充沛！有什么推荐吗？' },
      { emoji: '😌', label: '平静',  text: '我现在心情平静' }
    ],
    todayCourses: [],
    actionShortcuts: [
      { emoji: '📚', label: '学习建议', text: '给我一些学习建议' },
      { emoji: '🎯', label: '今日任务', text: '帮我规划今天的任务' },
      { emoji: '💪', label: '减压技巧', text: '教我几个减压技巧' },
      { emoji: '🧘', label: '冥想引导', text: '帮我做一个冥想练习' },
      { emoji: '🍽️', label: '饮食推荐', text: '推荐今天吃什么' },
      { emoji: '📅', label: '时间规划', text: '帮我规划今天的时间' }
    ],
    dailySuggestion: '',
    dailyLoading: true,
    messages: [
      {
        id: 1,
        role: 'bot',
        text: '你好！我是智校 AI 搭子 👋 我可以帮你规划时间、推荐美食、疏导情绪或查询校园资讯。今天想聊什么？'
      }
    ],
    quickReplies: ['帮我规划今天', '推荐自习地点', '我压力有点大', '给个学习方案', '今天吃什么', '最近活动有哪些'],
    showShortcuts: true,
    scrollToBottom: '',
    showPlanModal: false,
    currentPlan: null
  },
  _buildContextBlock() {
    const now = new Date()
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${weekDays[now.getDay()]} ${timeStr}`
    const name = this._buildDisplayName()
    const streak = wx.getStorageSync('streakDays') || 0
    const checkins = wx.getStorageSync('statCheckins') || 0
    const tasks = wx.getStorageSync('statTasks') || 0
    const courses = (this.data.todayCourses || [])
    const courseStr = courses.length
      ? courses.map(c => `${c.startTime}-${c.endTime} ${c.name}(${c.room})`).join('、')
      : '今天没有课'
    const cached = wx.getStorageSync('cachedTasks') || []
    const openTasks = Array.isArray(cached) ? cached.filter(t => !t.accepted).length : 0
    let block = `【当前用户上下文】\n`
    block += `- 用户昵称：${name}\n`
    block += `- 当前时间：${dateStr}\n`
    block += `- 今日课程：${courseStr}\n`
    block += `- 健康打卡连续天数：${streak} 天，累计打卡 ${checkins} 次\n`
    block += `- 已完成互助任务：${tasks} 个，平台当前开放任务：${openTasks} 个\n`
    return block
  },
  _buildDisplayName() {
    const raw = app.globalData.username || wx.getStorageSync('username') || ''
    const isPhone = /^1[3-9]\d{9}$/.test(raw)
    return isPhone ? raw.slice(0, 3) + '****' + raw.slice(-4) : (raw || '同学')
  },
  _loadTodayCourses() {
    const today = new Date().getDay()
    const todayIdx = today === 0 ? 6 : today - 1
    const allCourses = wx.getStorageSync('courses') || []
    const toMin = t => { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + m }
    const todayCourses = allCourses
      .filter(c => c.dayOfWeek === todayIdx)
      .sort((a, b) => toMin(a.startTime) - toMin(b.startTime))
      .slice(0, 4)
    this.setData({ todayCourses })
  },
  _loadDailySuggestion() {
    const today = new Date()
    const dateKey = `ds2_${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    const cached = wx.getStorageSync(dateKey)
    const isValidSuggestion = cached && cached.length >= 8 && cached.length <= 60 && !cached.includes('①') && !cached.includes('街舞') && !cached.includes('活动：')
    if (isValidSuggestion) {
      this.setData({ dailySuggestion: cached, dailyLoading: false })
      return
    }
    const FALLBACKS = [
      '保持好奇心，每天学一点新的东西 📖',
      '善待自己，你已经很努力了 💙',
      '今天也要记得喝水，照顾好自己 💧',
      '小步前进，坚持就是胜利 🌱',
      '抬起头来，校园里有很多美好等你发现 ✨'
    ]
    const fallback = FALLBACKS[today.getDate() % FALLBACKS.length]
    this.setData({ dailySuggestion: fallback, dailyLoading: false })
    app.callAI({
      messages: [
        { role: 'system', content: '你是「智校·AI生活助手」，只输出一句简短的每日建议，不加任何多余格式。' },
        { role: 'user', content: `现在是${new Date().getHours()}点，给一位大学生一条今日生活建议，15-25字，贴合当前时段（早/上午/下午/晚），涉及时间管理、健康或情绪，语气温暖真诚，结尾带一个emoji，不加引号。` }
      ],
      maxTokens: 60,
      temperature: 0.9,
      onSuccess: (reply) => {
        const text = (reply || '').trim().slice(0, 60) || fallback
        wx.setStorageSync(dateKey, text)
        this.setData({ dailySuggestion: text })
      },
      onFail: () => {}
    })
  },
  onLoad() {
    const tabBarBottom = app.globalData.tabBarBottom || 80
    const safeAreaBottom = app.globalData.safeAreaBottom || 0
    const username = app.globalData.username || wx.getStorageSync('username') || ''
    const avatarUrl = app.globalData.avatarUrl || wx.getStorageSync('avatarUrl') || ''
    const displayName = this._buildDisplayName()
    this.setData({
      navBarHeight: app.globalData.navBarHeight || 100,
      tabBarBottom,
      safeAreaBottom,
      chatBottomPad: tabBarBottom + 268 + safeAreaBottom,
      username,
      displayName,
      avatarUrl
    })
    this._loadTodayCourses()
    this._loadDailySuggestion()
  },
  onDailySuggestionTap() {
    const suggestion = this.data.dailySuggestion
    if (!suggestion) return
    const text = `今天的每日建议是：「${suggestion}」你觉得我今天应该如何做到这一点？`
    this.setData({ inputText: text }, () => this.onSend())
  },
  onMoodTap(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ inputText: text }, () => this.onSend())
  },
  onActionShortcut(e) {
    const text = e.currentTarget.dataset.text
    this.setData({ inputText: text }, () => this.onSend())
  },
  onViewSchedule() {
    wx.navigateTo({ url: '/pages/schedule/schedule' })
  },
  onShow() {
    app.syncUser()
    const tb = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tb && tb.data.selected !== 4) tb.setData({ selected: 4 })
    const username = app.globalData.username || wx.getStorageSync('username') || ''
    const avatarUrl = app.globalData.avatarUrl || wx.getStorageSync('avatarUrl') || ''
    const displayName = this._buildDisplayName()
    this.setData({ username, displayName, avatarUrl })
    this._loadTodayCourses()
    wx.nextTick(() => this.scrollToEnd())
  },
  onInputChange(e) {
    this.setData({ inputText: e.detail.value })
  },
  scrollToEnd() {
    const id = 'msg-' + (this.data.messages.length - 1)
    this.setData({ scrollToBottom: id })
  },
  onSend() {
    if (this.data.isTyping) return
    const raw = this.data.inputText.trim()
    if (!raw) return
    const text = raw.slice(0, 500)

    const userMsg = { id: Date.now(), role: 'user', text }
    let messages = [...this.data.messages, userMsg]
    if (messages.length > 40) messages = messages.slice(-40)
    this.setData({ messages, inputText: '', isTyping: true })
    this.scrollToEnd()
    this._fetchAIReply(text, messages)
  },
  _fetchAIReply(userText, currentMessages) {
    const contextBlock = this._buildContextBlock()
    const systemPrompt = `你是「智校 · AI生活助手」，专为大学生打造的校园智能助理，运行在微信小程序中。

【角色定位】
- 兼顾陪伴感与行动建议：可聊天、可共情、可出方案。
- 回答使用中文，语气温暖、简洁、真诚，不说空话，不堆砌鸡汤。
- 适当使用 emoji 增加亲和力，但不过量。

【App 页面说明（引导用户时使用）】
- 「脉动」首页：校园活动、今日推荐、摄影大赛
- 「互助」页面：发布或接取校园互助任务（跑腿/借用/物流等）
- 「树洞」页面：匿名情绪倾诉、查看他人故事、给人抱抱
- 「健康」页面：每日情绪打卡、健康分、冥想记录
- 「课程表」页面：查看/添加课程安排

【决策规则】
1. 优先级：危机支持 > 明确求方案 > 普通咨询 > 闲聊。
2. 闲聊/情感支持：直接用自然语言回复，结尾可带一个轻度追问。
3. 方案/计划类（用户问"怎么做/给我方案/帮我规划"时）：必须输出 JSON 格式（见下方）。
4. 上下文不足时：先给最小可执行建议，再追问 1 个关键问题。
5. 遇到自伤/极端绝望信号：先共情陪伴，建议联系学校心理中心或拨打心理援助热线 400-161-9995。

【方案类输出格式（仅方案类使用，不加代码块）】
{"type":"plan","summary":"一句话结论","plan":{"goal":"目标","steps":["步骤1","步骤2","步骤3"],"time_blocks":["时间段描述1","时间段描述2"],"fallback":"备选方案"},"next_action":"现在就能做的第一步","follow_up_question":"一个追问"}

${contextBlock}`

    const msgs = [
      { role: 'system', content: systemPrompt },
      ...currentMessages.slice(-10).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text
      }))
    ]
    app.callAI({
      messages: msgs,
      maxTokens: 700,
      temperature: 0.75,
      onSuccess: (reply) => {
        const parsed = this._parseAIResponse(reply)
        const planData = this._pendingPlan || null
        this._pendingPlan = null
        this._appendBotMsg(parsed || this._localFallbackReply(userText), planData)
      },
      onFail: () => {
        this._appendBotMsg(this._localFallbackReply(userText))
      }
    })
  },
  _parseAIResponse(raw) {
    if (!raw) return ''
    this._pendingPlan = null
    let trimmed = raw.trim()
    trimmed = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    let obj = null
    if (trimmed.startsWith('{')) {
      try { obj = JSON.parse(trimmed) } catch (e) {
        const m = trimmed.match(/\{[\s\S]*\}/)
        if (m) { try { obj = JSON.parse(m[0]) } catch (e2) {} }
      }
    }
    if (!obj) return trimmed
    if (obj.type === 'chat' || obj.type === 'support' || !obj.plan) {
      let out = obj.summary || trimmed
      if (obj.follow_up_question) out += `\n\n💬 ${obj.follow_up_question}`
      return out
    }
    const p = obj.plan || {}
    this._pendingPlan = {
      summary: obj.summary || '',
      goal: p.goal || '',
      steps: Array.isArray(p.steps) ? p.steps : [],
      time_blocks: Array.isArray(p.time_blocks) ? p.time_blocks : [],
      fallback: p.fallback || '',
      next_action: obj.next_action || '',
      follow_up_question: obj.follow_up_question || ''
    }
    let out = obj.summary || ''
    if (p.goal) out += `\n\n🎯 ${p.goal}`
    if (Array.isArray(p.time_blocks) && p.time_blocks.length) {
      out += '\n\n' + p.time_blocks.slice(0, 4).map(t => `⏰ ${t}`).join('\n')
      if (p.time_blocks.length > 4) out += `\n…共 ${p.time_blocks.length} 个时间段`
    } else if (Array.isArray(p.steps) && p.steps.length) {
      out += '\n' + p.steps.slice(0, 3).map((s, i) => `${['①','②','③'][i]} ${s}`).join('\n')
      if (p.steps.length > 3) out += `\n…共 ${p.steps.length} 步`
    }
    if (obj.next_action) out += `\n\n▶️ ${obj.next_action}`
    return out.trim()
  },
  _appendBotMsg(text, planData) {
    const botMsg = { id: Date.now() + 1, role: 'bot', text, planData: planData || null }
    const messages = [...this.data.messages, botMsg]
    this.setData({ messages, isTyping: false })
    this.scrollToEnd()
  },
  onViewPlan(e) {
    const idx = e.currentTarget.dataset.idx
    const msg = this.data.messages[idx]
    if (msg && msg.planData) this.setData({ showPlanModal: true, currentPlan: msg.planData })
  },
  onClosePlan() { this.setData({ showPlanModal: false }) },
  preventClose() {},
  _localFallbackReply(text) {
    const t = (text || '').toLowerCase()
    if (t.includes('吃') || t.includes('食堂') || t.includes('饭') || t.includes('推荐')) {
      return '推荐你去二食堂三楼的素心小品，今天有新菜上线！或者艺术中心附近的轻食店也不错，清淡养胃 🥗'
    }
    if (t.includes('活动') || t.includes('今天有') || t.includes('讲座') || t.includes('社团')) {
      return '今天校内有：① 街舞社招新（中心广场 14:00）② 绿植领养工作坊（全天）③ AI前沿讲座（报告厅A202）。感兴趣哪个？'
    }
    if (t.includes('第三') || t.includes('3号') || t.includes('ai讲座') || t.includes('报告厅')) {
      return 'AI前沿讲座今晚在报告厅A202举行，涵盖大模型应用与校园智能化专题，非常值得去！建议提前10分钟到场占座 🎤'
    }
    if (t.includes('第一') || t.includes('街舞') || t.includes('招新')) {
      return '街舞社招新今天下午2点在中心广场，零基础也可以参加！带上学生证即可报名，氛围超好 💃'
    }
    if (t.includes('第二') || t.includes('绿植') || t.includes('工作坊')) {
      return '绿植领养工作坊全天开放，在生命科学楼一楼大厅，可以免费领养一盆绿植带回宿舍，先到先得 🌿'
    }
    if (t.includes('方案') || t.includes('怎么') || t.includes('如何') || t.includes('建议')) {
      return '根据你的情况，建议：① 先去脉动页面看今日 AI 实时推荐 ② 打开健康页面做个情绪打卡 ③ 有具体问题可以继续告诉我，我帮你细化 ✨'
    }
    if (t.includes('复习') || t.includes('学习') || t.includes('自习') || t.includes('作业')) {
      return 'B栋402室当前安静指数98%，推荐去！记得每45分钟休息一下，效率更高 📚'
    }
    if (t.includes('运动') || t.includes('健身') || t.includes('跑步') || t.includes('操场')) {
      return '体育馆今天有羽毛球友谊赛，可以去围观或参与！操场跑步也是不错的选择，晚霞时刻最美 🏃'
    }
    if (t.includes('压力') || t.includes('焦虑') || t.includes('累') || t.includes('难受')) {
      return '感受到你的压力了。推荐先做个5分钟冥想放松一下，或者去树洞社区写写心情。记住，你已经很努力了 💙'
    }
    if (t.includes('睡') || t.includes('休息') || t.includes('困')) {
      return '午休黄金时间是13:00-14:00，宿舍或图书馆负一楼休息区都不错。短暂小憩20分钟就够，睡太久反而更困 😴'
    }
    if (t.includes('天气') || t.includes('出门') || t.includes('下雨')) {
      return '今天校园天气适宜，出行以步行为主。若有雨记得带伞，学校便利店也有雨伞出售 ☂️'
    }
    const _generic = [
      '明白了！你可以继续告诉我更多细节，我来帮你制定具体计划 📋',
      '收到～可以告诉我更多背景，我来给你更精准的建议 🤔',
      '好的！你是想了解课程、活动、吃饭还是其他方面？说说看 😊',
      '我在听！你可以问我校园活动、自习地点、餐厅推荐或健康建议 ✨',
      '嗯嗯，继续说，我帮你一起想想办法 💡'
    ]
    const idx = (this._fallbackIdx = ((this._fallbackIdx || 0) + 1) % _generic.length)
    return _generic[idx]
  },
  onToggleShortcuts() {
    const show = !this.data.showShortcuts
    const { tabBarBottom, safeAreaBottom } = this.data
    const pad = tabBarBottom + safeAreaBottom + (show ? 268 : 110)
    this.setData({ showShortcuts: show, chatBottomPad: pad })
    if (show) wx.nextTick(() => this.scrollToEnd())
  },
  onQuickReply(e) {
    const { text } = e.currentTarget.dataset
    this.setData({ inputText: text }, () => this.onSend())
  },
  onPlusTap() {
    wx.showActionSheet({
      itemList: ['发送图片', '发送我的位置', '发起语音'],
      success(res) {
        if (res.tapIndex === 1) {
          wx.getLocation({
            type: 'wgs84',
            success(loc) {
              wx.showToast({ title: `已分享位置 (${loc.latitude.toFixed(3)}, ${loc.longitude.toFixed(3)})`, icon: 'none', duration: 2000 })
            },
            fail() {
              wx.showToast({ title: '获取位置失败', icon: 'none' })
            }
          })
        } else {
          wx.showToast({ title: '功能开发中', icon: 'none' })
        }
      }
    })
  }
})
