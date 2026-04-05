const app = getApp()

Component({
  properties: {
    pageTitle: { type: String, value: '' }
  },
  data: {
    statusBarHeight: 0,
    username: '',
    avatarUrl: '',
    initial: ''
  },
  lifetimes: {
    attached() {
      const sys = wx.getWindowInfo()
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 })
      this._loadUserInfo()
    }
  },
  pageLifetimes: {
    show() {
      this._loadUserInfo()
    }
  },
  methods: {
    _loadUserInfo() {
      const raw = app.globalData.username || wx.getStorageSync('username') || ''
      const avatarUrl = app.globalData.avatarUrl || wx.getStorageSync('avatarUrl') || ''
      const isPhone = /^1[3-9]\d{9}$/.test(raw)
      const username = isPhone ? raw.slice(0, 3) + '****' + raw.slice(-4) : raw
      const initial = raw ? raw.charAt(0).toUpperCase() : '?'
      this.setData({ username, avatarUrl, initial })
    },
    onAvatarTap() {
      wx.navigateTo({ url: '/pages/profile/profile' })
    },
    onBellTap() {
      wx.showToast({ title: '暂无新通知', icon: 'none' })
    }
  }
})
