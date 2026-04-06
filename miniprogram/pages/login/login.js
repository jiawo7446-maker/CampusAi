const app = getApp()

Page({
  data: {
    username: '',
    password: '',
    showPwd: false,
    loading: false,
    focusField: ''
  },
  onLoad() {},
  onFocus(e) {
    this.setData({ focusField: e.currentTarget.dataset.field })
  },
  onBlur() {
    this.setData({ focusField: '' })
  },
  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },
  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },
  onTogglePwd() {
    this.setData({ showPwd: !this.data.showPwd })
  },
  onLogin() {
    const { username, password, loading } = this.data
    if (loading) return
    const phone = username.trim()
    if (!phone) {
      wx.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入有效的手机号', icon: 'none' })
      return
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' })
      return
    }
    this.setData({ loading: true })
    const name = username.trim()
    const _saveAndGo = (nickname, userId, phone) => {
      app.globalData.userInfo = { username: nickname, isLoggedIn: true }
      app.globalData.username = nickname
      app.globalData.avatarUrl = wx.getStorageSync('avatarUrl') || ''
      app.globalData.userId = userId || null
      wx.setStorageSync('isLoggedIn', true)
      wx.setStorageSync('username', nickname)
      if (userId) wx.setStorageSync('userId', userId)
      if (phone) wx.setStorageSync('phone', phone)
      if (!wx.getStorageSync('joinedAt')) wx.setStorageSync('joinedAt', Date.now())
      this.setData({ loading: false })
      wx.switchTab({ url: '/pages/pulse/pulse' })
    }
    wx.request({
      url: `${app.globalData.apiBase}/api/auth/login`,
      method: 'POST',
      data: { username: name, password },
      timeout: 6000,
      success: (res) => {
        if (res.statusCode === 200 && res.data && res.data.user) {
          const u = res.data.user
          _saveAndGo(u.nickname || name, u.id, u.phone || name)
        } else if (res.statusCode === 401 || res.statusCode === 400) {
          const msg = (res.data && res.data.error) || '账号或密码错误'
          this.setData({ loading: false, password: '' })
          wx.showToast({ title: msg, icon: 'none', duration: 2500 })
        } else {
          _saveAndGo(name, null, name)
        }
      },
      fail: () => {
        _saveAndGo(name, null, name)
      }
    })
  },
  onWechatLogin() {
    wx.showToast({ title: '微信登录功能开发中', icon: 'none', duration: 1500 })
  },
  onGoRegister() {
    wx.navigateTo({ url: '/pages/register/register' })
  },
  onGuestEntry() {
    app.globalData.userInfo = { username: '访客', isLoggedIn: false }
    app.globalData.username = '访客'
    app.globalData.avatarUrl = ''
    wx.switchTab({ url: '/pages/pulse/pulse' })
  }
})
