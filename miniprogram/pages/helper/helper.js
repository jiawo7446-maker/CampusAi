const app = getApp()

Page({
  _submitting: false,
  data: {
    navBarHeight: 100,
    tabBarBottom: 80,
    onlineCount: 124,
    onlyUrgent: false,
    isRefreshing: false,
    displayTasks: [],
    showPublishModal: false,
    showDetailModal: false,
    detailTask: {},
    acceptedCount: 0,
    acceptedTotal: 0,
    taskTypes: ['餐饮代购', '物流搬运', '跑腿/借用', '学习互助', '其他'],
    publishForm: { type: '餐饮代购', desc: '', location: '', reward: '' },
    tasks: [
      { id: 1, name: '小明', avatarBg: '#6366f1', avatarInitial: '明', tag: '餐饮代购', tagColor: 'secondary', tagIcon: '/assets/icons/utensils-white.svg', desc: '需要在图书馆5楼帮带一份食堂三楼的照烧鸡腿饭，谢谢！', location: '主校区 图书馆', time: '2分钟前', accepted: false, reward: '5元红包' },
      { id: 2, name: '大力', avatarBg: '#3b82f6', avatarInitial: '力', tag: '物流搬运', tagColor: 'primary', tagIcon: '/assets/icons/package-white.svg', desc: '大件快递到校门口了，求一位有平衡车或推车的小伙伴帮忙。', location: '北门 快递点', time: '5分钟前', accepted: false, reward: '10元红包' },
      { id: 3, name: '小红', avatarBg: '#ec4899', avatarInitial: '红', tag: '跑腿/借用', tagColor: 'tertiary', tagIcon: '/assets/icons/shopping-bag-white.svg', desc: '急借一个Type-C转HDMI转换器，今天下午多媒体课用。', location: 'C区 教学楼', time: '8分钟前', accepted: false, reward: '感谢+借用费' },
      { id: 4, name: '晓雯', avatarBg: '#8b5cf6', avatarInitial: '雯', tag: '学习互助', tagColor: 'primary', tagIcon: '/assets/icons/utensils-white.svg', desc: '高数期末复习，求大神一起学习打卡，我请奶茶！', location: 'B栋 402自习室', time: '12分钟前', accepted: false, reward: '奶茶一杯' },
      { id: 5, name: '阿辉', avatarBg: '#f97316', avatarInitial: '辉', tag: '餐饮代购', tagColor: 'secondary', tagIcon: '/assets/icons/utensils-white.svg', desc: '帮我在一食堂买份红烧肉套餐带到宿舍楼B栋，速度快一点哦。', location: '宿舍楼 B栋', time: '15分钟前', accepted: false, reward: '3元跑腿费' },
      { id: 6, name: '小婷', avatarBg: '#14b8a6', avatarInitial: '婷', tag: '跑腿/借用', tagColor: 'tertiary', tagIcon: '/assets/icons/shopping-bag-white.svg', desc: '借用一下充电宝，忘带了，明天一定还，谢谢！', location: '艺术楼 A201', time: '20分钟前', accepted: false, reward: '感谢' },
      { id: 7, name: '老王', avatarBg: '#64748b', avatarInitial: '王', tag: '物流搬运', tagColor: 'primary', tagIcon: '/assets/icons/package-white.svg', desc: '需要帮忙搬宿舍行李，东西比较多，大约需要30分钟。', location: '西区宿舍楼', time: '25分钟前', accepted: false, reward: '15元红包' },
      { id: 8, name: '美美', avatarBg: '#f43f5e', avatarInitial: '美', tag: '餐饮代购', tagColor: 'secondary', tagIcon: '/assets/icons/utensils-white.svg', desc: '麻烦帮我从艺术中心轻食店带一份三文鱼沙拉，不要沙拉酱！', location: '图书馆南门', time: '30分钟前', accepted: false, reward: '2元辛苦费' },
      { id: 9, name: '小张', avatarBg: '#22c55e', avatarInitial: '张', tag: '学习互助', tagColor: 'primary', tagIcon: '/assets/icons/utensils-white.svg', desc: '英语四六级口语练习，找搭档互相对话，每天30分钟。', location: '图书馆3楼', time: '40分钟前', accepted: false, reward: '互惠互利' },
      { id: 10, name: '小李', avatarBg: '#eab308', avatarInitial: '李', tag: '其他', tagColor: 'tertiary', tagIcon: '/assets/icons/shopping-bag-white.svg', desc: '寻找走失的雨伞，黑色折叠款，昨天在报告厅落下了，求告知！', location: '报告厅 A202', time: '1小时前', accepted: false, reward: '感谢+小礼物' },
      { id: 11, name: '小周', avatarBg: '#7c3aed', avatarInitial: '周', tag: '餐饮代购', tagColor: 'secondary', tagIcon: '/assets/icons/utensils-white.svg', desc: '帮我买一杯奶茶，二食堂门口的那家，珍珠奶茶少糖少冰，谢谢！', location: '二食堂 门口', time: '1小时前', accepted: false, reward: '3元红包' },
      { id: 12, name: '阿杰', avatarBg: '#0891b2', avatarInitial: '杰', tag: '学习互助', tagColor: 'primary', tagIcon: '/assets/icons/utensils-white.svg', desc: '线性代数作业不会做第5题，求会的同学帮讲解一下，非常感谢！', location: '图书馆 4楼自习区', time: '1.5小时前', accepted: false, reward: '请喝咖啡' },
      { id: 13, name: '晓晴', avatarBg: '#be185d', avatarInitial: '晴', tag: '跑腿/借用', tagColor: 'tertiary', tagIcon: '/assets/icons/shopping-bag-white.svg', desc: '打印店帮我打一份资料，A4单面彩印，20页，麻烦送到D栋302。', location: 'D栋 302', time: '2小时前', accepted: false, reward: '5元辛苦费' },
      { id: 14, name: '大牛', avatarBg: '#047857', avatarInitial: '牛', tag: '物流搬运', tagColor: 'primary', tagIcon: '/assets/icons/package-white.svg', desc: '快递太重了搬不动，求有力气的同学帮拿到西区7号宿舍楼，两箱书。', location: '西门快递站', time: '2小时前', accepted: false, reward: '10元红包' },
      { id: 15, name: '小月', avatarBg: '#b45309', avatarInitial: '月', tag: '其他', tagColor: 'tertiary', tagIcon: '/assets/icons/shopping-bag-white.svg', desc: '急求一本《概率论与数理统计》教材借用一周，明天要用，付押金！', location: '可协商地点', time: '3小时前', accepted: false, reward: '借用费+押金' }
    ]
  },
  onLoad() {
    this.setData({
      navBarHeight: app.globalData.navBarHeight || 100,
      tabBarBottom: app.globalData.tabBarBottom || 80
    })
    this._loaded = true
    this._startOnlineCounter()
    const cached = wx.getStorageSync('cachedTasks')
    if (cached && Array.isArray(cached) && cached.length > 0) {
      const tasks = cached.map(t => this._mapTask(t))
      const acceptedCount = tasks.filter(t => t.accepted && !t.completed).length
      const acceptedTotal = tasks.filter(t => t.accepted).length
      this.setData({ tasks, acceptedCount, acceptedTotal }, () => this._updateDisplayTasks())
    } else {
      this._updateDisplayTasks()
    }
    this._fetchTasks()
  },
  _fetchTasks() {
    wx.request({
      url: `${app.globalData.apiBase}/api/tasks`,
      method: 'GET',
      timeout: 6000,
      success: (res) => {
        this.setData({ isRefreshing: false })
        if (res.statusCode === 200 && res.data && Array.isArray(res.data.tasks)) {
          const raw = res.data.tasks
          wx.setStorageSync('cachedTasks', raw)
          const tasks = raw.map(t => this._mapTask(t))
          const acceptedCount = tasks.filter(t => t.accepted && !t.completed).length
          const acceptedTotal = tasks.filter(t => t.accepted).length
          this.setData({ tasks, acceptedCount, acceptedTotal }, () => this._updateDisplayTasks())
        }
      },
      fail: () => {
        this.setData({ isRefreshing: false })
        const hasCached = wx.getStorageSync('cachedTasks')
        wx.showToast({ title: hasCached ? '网络异常，显示缓存数据' : '加载失败，下拉可重试', icon: 'none', duration: 1800 })
      }
    })
  },
  onRefresh() {
    this.setData({ isRefreshing: true })
    this._fetchTasks()
  },
  _mapTask(t) {
    const COLORS = ['#6366f1', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316', '#14b8a6', '#f43f5e', '#22c55e', '#eab308', '#64748b']
    const TAG_COLOR = { '餐饮代购': 'secondary', '物流搬运': 'primary', '跑腿/借用': 'tertiary', '学习互助': 'primary', '其他': 'tertiary' }
    const TAG_ICON = { '餐饮代购': '/assets/icons/utensils-white.svg', '物流搬运': '/assets/icons/package-white.svg', '跑腿/借用': '/assets/icons/shopping-bag-white.svg', '学习互助': '/assets/icons/utensils-white.svg', '其他': '/assets/icons/shopping-bag-white.svg' }
    const name = t.name || '匿名'
    const initial = name.slice(-1)
    return {
      ...t,
      avatarBg: COLORS[t.id % COLORS.length] || '#6366f1',
      avatarInitial: initial,
      tagColor: TAG_COLOR[t.tag] || 'tertiary',
      tagIcon: TAG_ICON[t.tag] || '/assets/icons/shopping-bag-white.svg',
      done: !!t.completed
    }
  },
  onShow() {
    app.syncUser()
    const tb = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tb && tb.data.selected !== 1) tb.setData({ selected: 1 })
    if (this._loaded) this._fetchTasks()
  },
  onUnload() {
    if (this._counterTimer) clearInterval(this._counterTimer)
  },
  _startOnlineCounter() {
    this._counterTimer = setInterval(() => {
      const delta = Math.floor(Math.random() * 3) - 1
      const next = Math.min(160, Math.max(100, this.data.onlineCount + delta))
      this.setData({ onlineCount: next })
    }, 4000)
  },
  _updateDisplayTasks() {
    const { tasks, onlyUrgent } = this.data
    const URGENT_RE = /急|紧急|马上|立刻|尽快/
    let filtered = tasks.filter(t => !t.completed)
    if (onlyUrgent) filtered = filtered.filter(t => URGENT_RE.test(t.desc))
    this.setData({ displayTasks: filtered })
  },
  onToggleUrgent() {
    const onlyUrgent = !this.data.onlyUrgent
    this.setData({ onlyUrgent }, () => this._updateDisplayTasks())
    wx.vibrateShort({ type: 'light' })
  },
  onCompleteTask(e) {
    const id = Number(e.currentTarget.dataset.id)
    const tasks = this.data.tasks
    const idx = tasks.findIndex(t => t.id === id)
    if (idx === -1 || tasks[idx].done) return
    wx.showModal({
      title: '确认完成？',
      content: `确认已完成「${tasks[idx].name}」的任务？`,
      confirmText: '已完成',
      cancelText: '还没',
      success: (res) => {
        if (!res.confirm) return
        this.setData({
          [`tasks[${idx}].done`]: true,
          [`tasks[${idx}].completed`]: true,
          acceptedCount: Math.max(0, this.data.acceptedCount - 1)
        }, () => this._updateDisplayTasks())
        wx.vibrateShort({ type: 'medium' })
        wx.showToast({ title: '任务已完成 🎉', icon: 'success', duration: 2000 })
        wx.setStorageSync('statTasks', (wx.getStorageSync('statTasks') || 0) + 1)
        wx.request({ url: `${app.globalData.apiBase}/api/tasks/${id}/complete`, method: 'PATCH', timeout: 6000, fail: () => {} })
      }
    })
  },
  preventClose() {},
  onViewDetail(e) {
    const id = Number(e.currentTarget.dataset.id)
    const task = this.data.tasks.find(t => t.id === id)
    if (!task) return
    this.setData({ showDetailModal: true, detailTask: task })
  },
  onCloseDetail() {
    this.setData({ showDetailModal: false })
  },
  onAcceptFromDetail() {
    const task = this.data.detailTask
    if (task.accepted) {
      wx.showToast({ title: '你已接受过此任务', icon: 'none' })
      return
    }
    this._doAccept(task.id)
  },
  onAcceptTask(e) {
    const id = Number(e.currentTarget.dataset.id)
    const tasks = this.data.tasks
    const task = tasks.find(t => t.id === id)
    if (!task) return
    if (task.accepted) {
      wx.showToast({ title: '你已接受过此任务', icon: 'none' })
      return
    }
    this._doAccept(id)
  },
  _doAccept(id) {
    const tasks = this.data.tasks
    const idx = tasks.findIndex(t => t.id === id)
    if (idx === -1) return
    wx.showModal({
      title: '确认接受任务？',
      content: `接受 ${tasks[idx].name} 的「${tasks[idx].tag}」请求\n📍 ${tasks[idx].location}`,
      confirmText: '确认接受',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          const patch = {
            [`tasks[${idx}].accepted`]: true,
            acceptedCount: this.data.acceptedCount + 1,
            acceptedTotal: this.data.acceptedTotal + 1
          }
          if (this.data.showDetailModal) patch.detailTask = { ...this.data.detailTask, accepted: true }
          this.setData(patch)
          wx.vibrateShort({ type: 'medium' })
          wx.showToast({ title: '已接受，请及时联系对方', icon: 'success', duration: 2000 })
          wx.request({ url: `${app.globalData.apiBase}/api/tasks/${id}/accept`, method: 'PATCH', timeout: 6000, fail: () => {} })
        }
      }
    })
  },
  onPublishTask() {
    this.setData({
      showPublishModal: true,
      publishForm: { type: '餐饮代购', desc: '', location: '', reward: '' }
    })
  },
  onModalMaskTap() {
    this.setData({ showPublishModal: false })
  },
  onCancelPublish() {
    this.setData({ showPublishModal: false })
  },
  onTypeSelect(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ 'publishForm.type': type })
  },
  onFormDescInput(e) {
    this.setData({ 'publishForm.desc': e.detail.value })
  },
  onFormLocInput(e) {
    this.setData({ 'publishForm.location': e.detail.value })
  },
  onFormRewardInput(e) {
    this.setData({ 'publishForm.reward': e.detail.value })
  },
  onSubmitTask() {
    if (this._submitting) return
    const { type, desc, location, reward } = this.data.publishForm
    const cleanDesc = app.sanitize(desc)
    const cleanLoc = app.sanitize(location)
    if (!cleanDesc) {
      wx.showToast({ title: '请填写需求描述', icon: 'none' })
      return
    }
    if (!cleanLoc) {
      wx.showToast({ title: '请填写地点', icon: 'none' })
      return
    }
    this._submitting = true
    const rawName = app.globalData.username || wx.getStorageSync('username') || ''
    const isPhone = /^1[3-9]\d{9}$/.test(rawName)
    const displayName = isPhone ? rawName.slice(0, 3) + '****' + rawName.slice(-4) : (rawName || '我')
    const initial = displayName.charAt(0)
    const COLORS = ['#6366f1', '#ec4899', '#3b82f6', '#8b5cf6', '#f97316', '#14b8a6', '#f43f5e', '#22c55e']
    const avatarBg = COLORS[Math.floor(Math.random() * COLORS.length)]
    const tagColorMap = { '餐饮代购': 'secondary', '物流搬运': 'primary', '跑腿/借用': 'tertiary', '学习互助': 'primary', '其他': 'tertiary' }
    const tagIconMap = { '餐饮代购': '/assets/icons/utensils-white.svg', '物流搬运': '/assets/icons/package-white.svg', '跑腿/借用': '/assets/icons/shopping-bag-white.svg', '学习互助': '/assets/icons/utensils-white.svg', '其他': '/assets/icons/shopping-bag-white.svg' }
    const newTask = {
      id: Date.now(),
      name: displayName,
      avatarBg,
      avatarInitial: initial,
      tag: type,
      tagColor: tagColorMap[type] || 'tertiary',
      tagIcon: tagIconMap[type] || '/assets/icons/shopping-bag-white.svg',
      desc: cleanDesc,
      location: cleanLoc,
      reward: (reward || '').trim().slice(0, 50) || '无',
      time: '刚刚',
      accepted: false
    }
    const tasks = [newTask, ...this.data.tasks]
    this.setData({ tasks, showPublishModal: false }, () => this._updateDisplayTasks())
    this._submitting = false
    wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: '需求已发布！', icon: 'success', duration: 2000 })
    wx.setStorageSync('statTasks', (wx.getStorageSync('statTasks') || 0) + 1)
    wx.request({
      url: `${app.globalData.apiBase}/api/tasks`,
      method: 'POST',
      data: { name: displayName, tag: type, desc: cleanDesc, location: cleanLoc, reward: (reward || '').trim().slice(0, 50) || '' },
      timeout: 6000,
      fail: () => {}
    })
  }
})
