const app = getApp()

Page({
  data: {
    nickname: '',
    phone: '',
    password: '',
    password2: '',
    showPwd: false,
    agreedTerms: false,
    loading: false,
    focusField: '',
    pwdLevel: 'weak',
    pwdLabel: '弱',
    pwdWidth: '33%'
  },
  onLoad() {},
  onFocus(e) {
    this.setData({ focusField: e.currentTarget.dataset.field })
  },
  onBlur() {
    this.setData({ focusField: '' })
  },
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },
  onPasswordInput(e) {
    const pwd = e.detail.value
    const level = this._getPwdLevel(pwd)
    this.setData({ password: pwd, ...level })
  },
  onPassword2Input(e) {
    this.setData({ password2: e.detail.value })
  },
  onTogglePwd() {
    this.setData({ showPwd: !this.data.showPwd })
  },
  onToggleTerms() {
    this.setData({ agreedTerms: !this.data.agreedTerms })
  },
  _getPwdLevel(pwd) {
    if (!pwd || pwd.length < 3) return { pwdLevel: 'weak',   pwdLabel: '弱',   pwdWidth: '25%'  }
    if (pwd.length < 6)        return { pwdLevel: 'weak',   pwdLabel: '弱',   pwdWidth: '33%'  }
    const hasBoth = /[a-zA-Z]/.test(pwd) && /[0-9]/.test(pwd)
    if (pwd.length >= 10 && hasBoth) return { pwdLevel: 'strong', pwdLabel: '强',   pwdWidth: '100%' }
    if (pwd.length >= 6  && hasBoth) return { pwdLevel: 'medium', pwdLabel: '中',   pwdWidth: '66%'  }
    return { pwdLevel: 'medium', pwdLabel: '中', pwdWidth: '50%' }
  },
  onRegister() {
    const { phone, password, password2, agreedTerms, loading } = this.data
    if (loading) return
    const nickname = app.sanitize(this.data.nickname)
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' }); return
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' }); return
    }
    if (password.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' }); return
    }
    if (password !== password2) {
      wx.showToast({ title: '两次密码输入不一致', icon: 'none' }); return
    }
    if (!agreedTerms) {
      wx.showToast({ title: '请同意用户协议与隐私政策', icon: 'none' }); return
    }
    this.setData({ loading: true })
    const _saveAndGo = (name, userId, userPhone) => {
      app.globalData.userInfo = { username: name, isLoggedIn: true }
      app.globalData.username = name
      app.globalData.avatarUrl = ''
      app.globalData.userId = userId || null
      wx.setStorageSync('isLoggedIn', true)
      wx.setStorageSync('username', name)
      wx.setStorageSync('phone', userPhone || phone)
      if (userId) wx.setStorageSync('userId', userId)
      if (!wx.getStorageSync('joinedAt')) wx.setStorageSync('joinedAt', Date.now())
      this.setData({ loading: false })
      wx.showToast({ title: '注册成功！', icon: 'success', duration: 1500 })
      setTimeout(() => wx.switchTab({ url: '/pages/pulse/pulse' }), 1500)
    }
    wx.request({
      url: `${app.globalData.apiBase}/api/auth/register`,
      method: 'POST',
      data: { nickname: nickname.trim(), phone, password },
      timeout: 6000,
      success: (res) => {
        if (res.statusCode === 201 && res.data && res.data.user) {
          const u = res.data.user
          _saveAndGo(u.nickname || nickname.trim(), u.id, u.phone || phone)
        } else if (res.statusCode === 201) {
          _saveAndGo(nickname.trim(), null, phone)
        } else {
          this.setData({ loading: false })
          wx.showToast({ title: (res.data && res.data.error) || '注册失败，请重试', icon: 'none' })
        }
      },
      fail: () => {
        _saveAndGo(nickname.trim(), null, phone)
      }
    })
  },
  onBack() {
    wx.navigateBack()
  }
})
