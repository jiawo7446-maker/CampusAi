const app = getApp()

Page({
  _aiLoading: false,
  data: {
    navBarHeight: 100,
    foods: [
      {
        id: 1,
        badge: '营养师推荐',
        badgeColor: '#10b981',
        name: '凉拌面套餐',
        desc: '轻盈低卡，活力开启',
        emoji: '🍜',
        color: '#fef9e7',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop&q=80',
        location: '二食堂三楼',
        calories: '约 380 千卡',
        price: '¥12',
        aiReason: '根据你今天的运动数据，你需要补充适量碳水。这份低卡拌面富含膳食纤维，可以增加饱腹感，控制下午零食摄入。',
        tags: ['低卡', '高纤维', '快手餐'],
        lat: 31.230300, lng: 121.473500
      },
      {
        id: 2,
        badge: '今日新品',
        badgeColor: '#6366f1',
        name: '素心豆腐汤',
        desc: '清淡鲜美，回味无穷',
        emoji: '🥣',
        color: '#f0fdf4',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop&q=80',
        location: '二食堂三楼',
        calories: '约 120 千卡',
        price: '¥8',
        aiReason: '你近期睡眠质量偏低，豆腐富含色氨酸，有助于提升血清素水平，改善睡眠。今晚食用效果最佳。',
        tags: ['低热量', '高蛋白', '助眠'],
        lat: 31.230300, lng: 121.473500
      },
      {
        id: 3,
        badge: '人气爆款',
        badgeColor: '#f97316',
        name: '三文鱼沙拉',
        desc: '高蛋白低脂，健康之选',
        emoji: '🥗',
        color: '#eff6ff',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80',
        location: '艺术中心轻食店',
        calories: '约 290 千卡',
        price: '¥28',
        aiReason: 'Omega-3脂肪酸有助于大脑高效运转，期末备考期间强烈推荐。本周已有 342 名同学选择。',
        tags: ['高蛋白', 'Omega-3', '健脑'],
        lat: 31.230700, lng: 121.473200
      },
      {
        id: 4,
        badge: '食堂特供',
        badgeColor: '#ef4444',
        name: '照烧鸡腿饭',
        desc: '分量十足，元气满分',
        emoji: '🍗',
        color: '#fff7ed',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&h=400&fit=crop&q=80',
        location: '一食堂二楼',
        calories: '约 620 千卡',
        price: '¥15',
        aiReason: '你今天上午有体育课，消耗热量较多。这份高蛋白套餐可以快速补充能量，防止下午注意力下降。',
        tags: ['高热量', '高蛋白', '饱腹'],
        lat: 31.230100, lng: 121.473700
      },
      {
        id: 5,
        badge: '热饮推荐',
        badgeColor: '#8b5cf6',
        name: '现磨咖啡',
        desc: '醇厚香浓，下午好搭档',
        emoji: '☕',
        color: '#fdf4ff',
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop&q=80',
        location: '图书馆一楼咖啡厅',
        calories: '约 50 千卡',
        price: '¥18',
        aiReason: '下午 2-4 点是人体自然犯困时段，一杯咖啡因含量适中的现磨咖啡可有效延长专注时间约 90 分钟。',
        tags: ['提神', '低卡', '下午场'],
        lat: 31.230900, lng: 121.473400
      },
      {
        id: 6,
        badge: '素食优选',
        badgeColor: '#14b8a6',
        name: '全麦大吐司',
        desc: '松软香甜，健康之选',
        emoji: '🥖',
        color: '#f0fdf4',
        image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&h=400&fit=crop&q=80',
        location: '学生活动中心',
        calories: '约 220 千卡',
        price: '¥6',
        aiReason: '全麦含有丰富的B族维生素，有助于缓解压力和疲劳。适合作为下午加餐，维持血糖稳定。',
        tags: ['粗粮', '低GI', '抗压'],
        lat: 31.231100, lng: 121.473600
      }
    ]
  },
  onLoad() {
    const navBarHeight = Number(app.globalData.navBarHeight) || 100
    const sysInfo = wx.getWindowInfo()
    const statusBarHeight = sysInfo.statusBarHeight || 20
    this.setData({ navBarHeight, statusBarHeight })
  },
  onBack() {
    wx.navigateBack()
  },
  onAiReasonTap(e) {
    if (this._aiLoading) return
    const id = e.currentTarget.dataset.id
    const food = this.data.foods.find(f => f.id == id)
    if (!food) return
    this._aiLoading = true
    wx.showLoading({ title: 'AI 分析中...', mask: true })
    const healthScore = wx.getStorageSync('healthScore') || 80
    const systemPrompt = '你是「智校·AI生活助手」饮食顾问，只输出一句60字以内的菜品推荐理由，结合健康、营养和学习效率，语气活泼，适当用emoji，不加标题前缀。'
    const userPrompt = `用户健康分：${healthScore}分。菜品：${food.name}，描述：${food.desc}，标签：${(food.tags || []).join('、')}，热量：${food.calories}。请给出个性化推荐理由。`
    app.callAI({
      systemPrompt,
      userPrompt,
      maxTokens: 120,
      temperature: 0.8,
      onSuccess: (reason) => {
        wx.hideLoading()
        this._aiLoading = false
        wx.showModal({ title: '✨ AI 推荐理由', content: reason || food.aiReason, showCancel: false, confirmText: '知道了' })
      },
      onFail: () => {
        wx.hideLoading()
        this._aiLoading = false
        wx.showModal({ title: '✨ AI 推荐理由', content: food.aiReason, showCancel: false, confirmText: '知道了' })
      }
    })
  },
  onOrderTap(e) {
    const id = e.currentTarget.dataset.id
    const food = this.data.foods.find(f => f.id === id)
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
  }
})
