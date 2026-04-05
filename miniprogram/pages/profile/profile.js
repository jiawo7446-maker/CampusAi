const app = getApp()

Page({
  data: {
    statusBarHeight: 20,
    navHeight: 88,
    username: '',
    avatarUrl: '',
    initial: '',
    phone: '',
    showEditModal: false,
    editName: '',
    stats: {
      days: 1,
      tasks: 0,
      posts: 0,
      checkins: 0,
      hugs: 0
    },
    myPosts: [],
    savedPosts: [],
    activeTab: 'posts'
  },

  onLoad() {
    try {
      const sys = wx.getWindowInfo()
      const statusBarHeight = sys.statusBarHeight || 20
      const navContentPx = Math.ceil(88 * (sys.screenWidth || 375) / 750)
      this.setData({
        statusBarHeight,
        navHeight: statusBarHeight + navContentPx + 4
      })
    } catch (e) {}
    this._loadUserInfo()
    this._loadStats()
    this._fromLoad = true
  },

  onShow() {
    if (this._fromLoad) { this._fromLoad = false; return }
    this._loadUserInfo()
    this._loadStats()
  },

  onPullDownRefresh() {
    this._loadUserInfo()
    this._loadStats()
    setTimeout(() => wx.stopPullDownRefresh(), 1200)
  },

  _loadUserInfo() {
    const username = app.globalData.username || wx.getStorageSync('username') || ''
    const avatarUrl = app.globalData.avatarUrl || wx.getStorageSync('avatarUrl') || ''
    const phone = wx.getStorageSync('phone') || ''
    const initial = username ? username.charAt(0).toUpperCase() : '?'
    this.setData({ username, avatarUrl, initial, phone })
  },

  _loadStats() {
    const joinedAt = wx.getStorageSync('joinedAt')
    if (!joinedAt) wx.setStorageSync('joinedAt', Date.now())
    const days = joinedAt ? Math.max(1, Math.floor((Date.now() - joinedAt) / 86400000)) : 1
    const tasks = wx.getStorageSync('statTasks') || 0
    const posts = wx.getStorageSync('statPosts') || 0
    const checkins = wx.getStorageSync('statCheckins') || 0
    const hugs = wx.getStorageSync('statHugs') || 0
    const phone = wx.getStorageSync('phone') || 'guest'
    const myPosts = wx.getStorageSync(`myPosts_${phone}`) || []
    const savedPosts = wx.getStorageSync(`savedPosts_${phone}`) || []
    this.setData({
      stats: { days, tasks, posts, checkins, hugs },
      myPosts: myPosts.slice(0, 20),
      savedPosts: savedPosts.slice(0, 20)
    })
    // Fetch hugsReceived and real post count from backend
    const userId = wx.getStorageSync('userId')
    if (userId) {
      wx.request({
        url: `${app.globalData.apiBase}/api/users/${userId}/profile`,
        method: 'GET',
        timeout: 6000,
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            const h = res.data.hugsReceived || 0
            wx.setStorageSync('statHugs', h)
            this.setData({ 'stats.hugs': h })
          }
        },
        fail: () => {}
      })
      wx.request({
        url: `${app.globalData.apiBase}/api/users/${userId}/posts-count`,
        method: 'GET',
        timeout: 6000,
        success: (res) => {
          if (res.statusCode === 200 && typeof res.data.count === 'number') {
            const backendPosts = res.data.count
            if (backendPosts > 0) {
              wx.setStorageSync('statPosts', backendPosts)
              this.setData({ 'stats.posts': backendPosts })
            }
          }
        },
        fail: () => {}
      })
    }
  },

  onTabSwitch(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab })
  },

  onGoSchedule() {
    wx.navigateTo({ url: '/pages/schedule/schedule' })
  },

  onBack() {
    wx.navigateBack()
  },

  onChangeAvatar() {
    wx.showActionSheet({
      itemList: ['从相册选择', '拍照'],
      success: (res) => {
        const sourceType = res.tapIndex === 0 ? ['album'] : ['camera']
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType,
          success: (imgRes) => {
            const avatarUrl = imgRes.tempFilePaths[0]
            app.globalData.avatarUrl = avatarUrl
            wx.setStorageSync('avatarUrl', avatarUrl)
            const initial = this.data.username ? this.data.username.charAt(0).toUpperCase() : '?'
            this.setData({ avatarUrl, initial })
            wx.showToast({ title: '头像已更新', icon: 'success' })
          }
        })
      }
    })
  },

  onEditUsername() {
    this.setData({ showEditModal: true, editName: this.data.username })
  },

  onEditInput(e) {
    this.setData({ editName: e.detail.value })
  },

  onCancelEdit() {
    this.setData({ showEditModal: false, editName: '' })
  },

  onConfirmEdit() {
    const name = app.sanitize(this.data.editName)
    if (!name || name.length < 2) {
      wx.showToast({ title: '昵称至少2个字符', icon: 'none' })
      return
    }
    if (name.length > 20) {
      wx.showToast({ title: '昵称最多20个字符', icon: 'none' })
      return
    }
    app.globalData.username = name
    app.globalData.userInfo = { ...(app.globalData.userInfo || {}), username: name }
    wx.setStorageSync('username', name)
    const initial = name.charAt(0).toUpperCase()
    this.setData({ username: name, initial, showEditModal: false, editName: '' })
    wx.showToast({ title: '昵称已更新', icon: 'success' })
  },

  preventClose() {},

  onNotify() {
    wx.showToast({ title: '通知设置开发中', icon: 'none' })
  },

  onAbout() {
    wx.showModal({
      title: '智校·AI生活助手',
      content: '版本 1.0.0\n基于微信小程序的AI校园生活服务平台\n脉动 · 互助 · 树洞 · 健康 · AI搭子',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onLogout() {
    wx.showModal({
      title: '确认退出登录？',
      content: '退出后需要重新登录才能使用全部功能',
      confirmColor: '#e11d48',
      success: (res) => {
        if (res.confirm) {
          app.globalData.userInfo = null
          app.globalData.username = ''
          app.globalData.avatarUrl = ''
          wx.removeStorageSync('isLoggedIn')
          wx.removeStorageSync('username')
          wx.removeStorageSync('avatarUrl')
          wx.removeStorageSync('phone')
          wx.removeStorageSync('userId')
          wx.removeStorageSync('statHugs')
          wx.removeStorageSync('statCheckins')
          wx.removeStorageSync('statTasks')
          wx.removeStorageSync('statPosts')
          wx.removeStorageSync('streakDays')
          wx.removeStorageSync('healthScore')
          wx.removeStorageSync('joinedAt')
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  }
})
