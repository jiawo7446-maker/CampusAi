const app = getApp()

Page({
  data: {
    navBarHeight: 100,
    tabBarBottom: 80,
    isRefreshing: false,
    healthScore: 82,
    streakDays: 0,
    todayCheckedIn: false,
    sleepBars: [40, 60, 30, 80, 50, 90, 75],
    emotionHistory: [
      { id: 1, icon: '/assets/icons/zap-secondary.svg',    label: '元气满满', time: '今天 09:30', color: 'secondary' },
      { id: 2, icon: '/assets/icons/flower2-tertiary.svg', label: '平静',     time: '昨天 21:00', color: 'tertiary' },
      { id: 3, icon: '/assets/icons/moon.svg',             label: '疲惫',     time: '昨天 14:20', color: 'surface' }
    ],
    // Check-in modal
    showCheckinModal: false,
    selectedEmotion: '',
    emotionOptions: [
      { label: '元气满满', emoji: '⚡', icon: '/assets/icons/zap-secondary.svg', color: 'secondary' },
      { label: '平静',     emoji: '🍃', icon: '/assets/icons/flower2-tertiary.svg', color: 'tertiary' },
      { label: '愉快',     emoji: '😊', icon: '/assets/icons/zap-secondary.svg', color: 'secondary' },
      { label: '疲惫',     emoji: '😴', icon: '/assets/icons/moon.svg', color: 'surface' },
      { label: '焦虑',     emoji: '😰', icon: '/assets/icons/moon.svg', color: 'surface' },
      { label: '忧郁',     emoji: '🌧', icon: '/assets/icons/moon.svg', color: 'surface' }
    ],
    // Meditation modal
    showMeditationModal: false,
    meditationDurations: [1, 3, 5],
    selectedDuration: 1,
    meditationRunning: false,
    meditationSecondsLeft: 60,
    meditationDisplay: '01:00',
    aiBannerMsg: '今日记得打卡和喝水，健康小习惯成就更好的自己 💪'
  },
  _updateBannerMsg() {
    const { healthScore, streakDays, todayCheckedIn, emotionHistory } = this.data
    const today = new Date()
    const cacheKey = `wellnessBanner_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}_${todayCheckedIn ? 1 : 0}`
    const cached = wx.getStorageSync(cacheKey)
    if (cached) { this.setData({ aiBannerMsg: cached }); return }
    const lastEmotion = emotionHistory && emotionHistory[0] ? emotionHistory[0].label : '未知'
    const hour = today.getHours()
    const period = hour < 10 ? '早晨' : hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上'
    const prompt = `现在是${period}，用户健康分${healthScore}分，连续打卡${streakDays}天，今日${todayCheckedIn ? '已' : '未'}打卡，最近心情：${lastEmotion}。根据以上信息生成一句15-30字的个性化健康鼓励语，贴合当前时段，温暖口语化，结尾带一个emoji，不加引号。`
    app.callAI({
      messages: [
        { role: 'system', content: '你是「智校·AI生活助手」健康模块，只输出一句个性化鼓励语，不加任何额外说明。' },
        { role: 'user', content: prompt }
      ],
      maxTokens: 80,
      temperature: 0.9,
      onSuccess: (reply) => {
        if (reply && reply.length > 5) {
          wx.setStorageSync(cacheKey, reply)
          this.setData({ aiBannerMsg: reply })
        }
      },
      onFail: () => {
        const fallback = todayCheckedIn
          ? `已连续打卡 ${streakDays} 天，健康好习惯正在养成 ✨`
          : '今天记得打卡和喝水，健康小习惯成就更好的自己 💪'
        this.setData({ aiBannerMsg: fallback })
      }
    })
  },
  onLoad() {
    const today = new Date()
    const todayKey = `checkin_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`
    const todayCheckedIn = !!wx.getStorageSync(todayKey)
    const streakDays = wx.getStorageSync('streakDays') || 0
    this.setData({
      navBarHeight: app.globalData.navBarHeight || 100,
      tabBarBottom: app.globalData.tabBarBottom || 80,
      todayCheckedIn,
      streakDays
    }, () => this._updateBannerMsg())
    this._fetchWellness()
  },
  _fetchWellness() {
    const userId = wx.getStorageSync('userId') || wx.getStorageSync('phone') || 'default'
    wx.request({
      url: `${app.globalData.apiBase}/api/wellness`,
      method: 'GET',
      header: { 'x-user-id': String(userId) },
      timeout: 6000,
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const { healthScore, streakDays, totalCheckins, emotionHistory } = res.data
          const update = {}
          if (healthScore != null) { update.healthScore = healthScore; wx.setStorageSync('healthScore', healthScore) }
          if (streakDays != null) { update.streakDays = streakDays; wx.setStorageSync('streakDays', streakDays) }
          if (totalCheckins != null) {
            const local = wx.getStorageSync('statCheckins') || 0
            wx.setStorageSync('statCheckins', Math.max(local, totalCheckins))
          }
          if (Array.isArray(emotionHistory) && emotionHistory.length > 0) {
            update.emotionHistory = emotionHistory.map(e => ({
              id: e.id,
              label: e.label,
              time: e.time,
              emoji: e.emoji || '😊',
              icon: e.icon || '/assets/icons/zap-secondary.svg',
              color: e.color || 'secondary'
            })).slice(0, 5)
          }
          if (Object.keys(update).length) {
            this.setData(update, () => {
              setTimeout(() => this.drawHealthCircle(), 50)
              this._updateBannerMsg()
            })
          }
        }
      },
      fail: () => {
        wx.showToast({ title: '网络异常，显示缓存数据', icon: 'none', duration: 1800 })
      }
    })
  },
  onRefresh() {
    this.setData({ isRefreshing: true })
    this._fetchWellness()
    setTimeout(() => this.setData({ isRefreshing: false }), 1500)
  },
  onShow() {
    app.syncUser()
    const today = new Date()
    const todayKey = `checkin_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`
    const todayCheckedIn = !!wx.getStorageSync(todayKey)
    const streakDays = wx.getStorageSync('streakDays') || this.data.streakDays
    this.setData({ todayCheckedIn, streakDays }, () => this._updateBannerMsg())
    const tb = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tb && tb.data.selected !== 3) tb.setData({ selected: 3 })
  },
  onReady() {
    this.drawHealthCircle()
  },
  onUnload() {
    this._clearMeditationTimer()
  },
  drawHealthCircle() {
    const sysInfo = wx.getWindowInfo()
    const ratio = sysInfo.screenWidth / 750
    // canvas element is 160rpx = 80px on 375px device
    const size = Math.ceil(160 * ratio)
    const x = size / 2, y = size / 2, r = size * 0.4
    const ctx = wx.createCanvasContext('healthCircle', this)
    ctx.setLineWidth(size * 0.065)
    ctx.setLineCap('round')

    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.setStrokeStyle('#ddd9ff')
    ctx.stroke()

    const progress = this.data.healthScore / 100
    ctx.beginPath()
    ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2)
    ctx.setStrokeStyle('#2444eb')
    ctx.stroke()
    ctx.draw()
  },
  // ===== 打卡 =====
  preventClose() {},
  onCheckInTap() {
    if (this.data.todayCheckedIn) {
      wx.showToast({ title: '今日已完成打卡', icon: 'none' })
      return
    }
    this.setData({ showCheckinModal: true, selectedEmotion: '' })
  },
  onCloseCheckin() {
    this.setData({ showCheckinModal: false })
  },
  onSelectEmotion(e) {
    const { label } = e.currentTarget.dataset
    this.setData({ selectedEmotion: label })
  },
  onConfirmCheckin() {
    const { selectedEmotion, emotionOptions, emotionHistory, streakDays, healthScore } = this.data
    if (!selectedEmotion) {
      wx.showToast({ title: '请选择心情状态', icon: 'none' })
      return
    }
    const option = emotionOptions.find(o => o.label === selectedEmotion)
    const now = new Date()
    const timeStr = `今天 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const newEntry = {
      id: Date.now(),
      icon: option.icon,
      label: option.label,
      time: timeStr,
      color: option.color
    }
    const updatedHistory = [newEntry, ...emotionHistory].slice(0, 5)
    const newScore = Math.min(100, healthScore + 2)
    this.setData({
      showCheckinModal: false,
      todayCheckedIn: true,
      emotionHistory: updatedHistory,
      streakDays: streakDays + 1,
      healthScore: newScore
    }, () => this._updateBannerMsg())
    this.drawHealthCircle()
    wx.showToast({ title: `打卡成功！已连续 ${streakDays + 1} 天 🔥`, icon: 'success', duration: 2500 })
    wx.setStorageSync('statCheckins', (wx.getStorageSync('statCheckins') || 0) + 1)
    wx.setStorageSync('streakDays', streakDays + 1)
    const today2 = new Date()
    const todayKey2 = `checkin_${today2.getFullYear()}_${today2.getMonth()}_${today2.getDate()}`
    wx.setStorageSync(todayKey2, true)
    const userId = wx.getStorageSync('userId') || wx.getStorageSync('phone') || 'guest'
    wx.request({
      url: `${app.globalData.apiBase}/api/wellness/checkin`,
      method: 'POST',
      header: { 'Content-Type': 'application/json', 'x-user-id': String(userId) },
      data: { label: selectedEmotion, emoji: option ? (option.emoji || '') : '' },
      timeout: 6000,
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          const { streakDays: backendStreak, totalCheckins: backendTotal, healthScore: backendScore } = res.data
          if (backendStreak != null) {
            this.setData({ streakDays: backendStreak }, () => this.drawHealthCircle())
            wx.setStorageSync('streakDays', backendStreak)
          }
          if (backendTotal != null) {
            const local = wx.getStorageSync('statCheckins') || 0
            wx.setStorageSync('statCheckins', Math.max(local, backendTotal))
          }
          if (backendScore != null) this.setData({ healthScore: backendScore }, () => this.drawHealthCircle())
        }
      },
      fail: () => {}
    })
  },
  // ===== 冥想 =====
  onMeditationTap() {
    const secs = this.data.selectedDuration * 60
    this.setData({
      showMeditationModal: true,
      meditationRunning: false,
      meditationSecondsLeft: secs,
      meditationDisplay: this._formatTime(secs)
    })
  },
  onSelectDuration(e) {
    if (this.data.meditationRunning) return
    const duration = e.currentTarget.dataset.duration
    const secs = duration * 60
    this.setData({
      selectedDuration: duration,
      meditationSecondsLeft: secs,
      meditationDisplay: this._formatTime(secs)
    })
  },
  onToggleMeditation() {
    if (this.data.meditationRunning) {
      this._clearMeditationTimer()
      this.setData({ meditationRunning: false })
    } else {
      this.setData({ meditationRunning: true })
      this._meditationTimer = setInterval(() => {
        const left = this.data.meditationSecondsLeft - 1
        if (left <= 0) {
          this._clearMeditationTimer()
          const newHealth = Math.min(100, this.data.healthScore + 3)
          this.setData({
            meditationRunning: false,
            meditationSecondsLeft: 0,
            meditationDisplay: '00:00',
            showMeditationModal: false,
            healthScore: newHealth
          })
          this.drawHealthCircle()
          wx.showToast({ title: '冥想完成！身心已放松 🌿', icon: 'success', duration: 2500 })
          wx.request({
            url: `${app.globalData.apiBase}/api/wellness/meditation`,
            method: 'POST',
            data: { duration: this.data.selectedDuration },
            timeout: 6000,
            fail: () => {}
          })
        } else {
          this.setData({ meditationSecondsLeft: left, meditationDisplay: this._formatTime(left) })
        }
      }, 1000)
    }
  },
  onStopMeditation() {
    this._clearMeditationTimer()
    this.setData({ showMeditationModal: false, meditationRunning: false })
  },
  _clearMeditationTimer() {
    if (this._meditationTimer) {
      clearInterval(this._meditationTimer)
      this._meditationTimer = null
    }
  },
  _formatTime(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0')
    const s = String(secs % 60).padStart(2, '0')
    return `${m}:${s}`
  }
})
