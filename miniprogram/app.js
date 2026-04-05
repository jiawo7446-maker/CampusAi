App({
  globalData: {
    userInfo: null,
    username: '',
    avatarUrl: '',
    navBarHeight: 100,
    tabBarBottom: 80,
    safeAreaBottom: 0,
    apiBase: 'http://localhost:3000'
  },
  syncUser() {
    const username = wx.getStorageSync('username') || ''
    const avatarUrl = wx.getStorageSync('avatarUrl') || ''
    if (username) {
      this.globalData.username = username
      this.globalData.avatarUrl = avatarUrl
    }
  },
  callAI({ systemPrompt, userPrompt, messages, maxTokens = 300, temperature = 0.85, onSuccess, onFail }) {
    const normalizedMessages = Array.isArray(messages)
      ? messages
        .map((m) => ({
          role: (m && typeof m.role === 'string') ? m.role : '',
          content: this.sanitize(m && m.content)
        }))
        .filter(m => m.role && m.content)
      : []

    const plainPrompt = this.sanitize(userPrompt)
    const sysFromMessages = normalizedMessages.find(m => m.role === 'system')
    const stripTags = s => (typeof s === 'string' ? s.replace(/<[^>]*>/g, '').trim() : '')
    const promptText = stripTags(systemPrompt) || (sysFromMessages ? stripTags(sysFromMessages.content) : '')
    const chatMessages = normalizedMessages.filter(m => m.role !== 'system')
    let lastUserIndex = -1
    for (let i = chatMessages.length - 1; i >= 0; i--) {
      if (chatMessages[i].role === 'user') {
        lastUserIndex = i
        break
      }
    }

    const message = (lastUserIndex >= 0 ? chatMessages[lastUserIndex].content : plainPrompt).slice(0, 500)
    const history = (lastUserIndex > 0 ? chatMessages.slice(Math.max(0, lastUserIndex - 20), lastUserIndex) : [])
      .map(item => ({
        role: item.role === 'assistant' ? 'bot' : item.role,
        content: item.content.slice(0, 1000)
      }))
      .filter(item => ['user', 'bot'].includes(item.role))

    if (!message) {
      onFail && onFail(new Error('message is empty'))
      return
    }

    wx.request({
      url: `${this.globalData.apiBase}/api/ai/chat`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: {
        message,
        history,
        systemPrompt: promptText.slice(0, 3000),
        maxTokens,
        temperature
      },
      timeout: 15000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const text = res.data && typeof res.data.reply === 'string'
            ? res.data.reply.trim()
            : ''
          if (text) {
            onSuccess && onSuccess(text)
          } else {
            onFail && onFail(new Error('AI returned empty reply'))
          }
        } else {
          onFail && onFail(new Error(`AI request failed: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        onFail && onFail(err)
      }
    })
  },
  sanitize(str) {
    if (typeof str !== 'string') return ''
    return str.replace(/<[^>]*>/g, '').trim().slice(0, 800)
  },
  showNetError(msg) {
    wx.showToast({ title: msg || '网络连接失败，请稍后重试', icon: 'none', duration: 2000 })
  },
  onLaunch() {
    const isLoggedIn = wx.getStorageSync('isLoggedIn')
    const username = wx.getStorageSync('username') || ''
    const avatarUrl = wx.getStorageSync('avatarUrl') || ''
    if (isLoggedIn && username) {
      this.globalData.userInfo = { username, isLoggedIn: true }
      this.globalData.username = username
      this.globalData.avatarUrl = avatarUrl
    } else {
      wx.reLaunch({ url: '/pages/login/login' })
    }
    try {
      const sysInfo = wx.getWindowInfo()
      const statusBarHeight = sysInfo.statusBarHeight || 20
      const screenWidth = sysInfo.screenWidth || 375
      const screenHeight = sysInfo.screenHeight || 667
      // Custom nav: status bar + single bar (92rpx)
      const navContentPx = Math.ceil(100 * screenWidth / 750)
      this.globalData.navBarHeight = statusBarHeight + navContentPx + 8
      // Safe area bottom (home indicator on newer iPhones)
      const safeAreaBottom = sysInfo.safeArea
        ? Math.max(0, screenHeight - sysInfo.safeArea.bottom)
        : 0
      this.globalData.safeAreaBottom = safeAreaBottom
      // Tab bar height for content bottom padding
      const tabBarContentPx = Math.ceil(88 * screenWidth / 750)
      this.globalData.tabBarBottom = tabBarContentPx + safeAreaBottom + 20
    } catch (e) {
      console.error('SysInfo error', e)
    }
  }
})
