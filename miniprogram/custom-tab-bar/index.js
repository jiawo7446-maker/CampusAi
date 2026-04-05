Component({
  data: {
    selected: 0,
    safeBottom: 0,
    list: [
      { pagePath: '/pages/pulse/pulse',     text: '脉动',   icon: '/assets/icons/tab-activity.svg',   activeIcon: '/assets/icons/tab-activity-a.svg' },
      { pagePath: '/pages/helper/helper',   text: '互助',   icon: '/assets/icons/tab-users.svg',      activeIcon: '/assets/icons/tab-users-a.svg' },
      { pagePath: '/pages/sanctuary/sanctuary', text: '树洞', icon: '/assets/icons/tab-leaf.svg',    activeIcon: '/assets/icons/tab-leaf-a.svg' },
      { pagePath: '/pages/wellness/wellness', text: '健康', icon: '/assets/icons/tab-flower.svg',    activeIcon: '/assets/icons/tab-flower-a.svg' },
      { pagePath: '/pages/aipal/aipal',     text: 'AI搭子', icon: '/assets/icons/tab-bot.svg',       activeIcon: '/assets/icons/tab-bot-a.svg' }
    ]
  },
  lifetimes: {
    attached() {
      try {
        const sysInfo = wx.getWindowInfo()
        const screenHeight = sysInfo.screenHeight || 667
        const safeBottom = sysInfo.safeArea
          ? Math.max(0, screenHeight - sysInfo.safeArea.bottom)
          : 0
        this.setData({ safeBottom })
      } catch (e) {}
    }
  },
  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  }
})
