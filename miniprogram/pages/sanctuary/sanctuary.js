const app = getApp()

const AI_REPLY_FALLBACKS = [
  '谢谢你愿意在这里分享，你的感受很真实。希望这个小小的树洞能给你带来温暖 🌱',
  '每一段经历都是成长的印记。你已经很勇敢了，继续加油！✨',
  '感受到你的心情了。无论如何，你并不孤单，这里有很多人在默默支持你 💙',
  '你的分享让我感受到了真实的情感。希望明天会是新的开始 🌅'
]

Page({
  _publishing: false,
  data: {
    navBarHeight: 100,
    tabBarBottom: 80,
    inputContent: '',
    selectedMoodEmoji: '',
    selectedMoodLabel: '',
    draftImage: '',
    isAnonymous: true,
    showMoodPicker: false,
    moods: [
      { emoji: '😊', label: '开心' },
      { emoji: '😌', label: '平静' },
      { emoji: '✨', label: '期待' },
      { emoji: '🍃', label: '放松' },
      { emoji: '🌧', label: '忧郁' },
      { emoji: '😤', label: '压力' },
      { emoji: '😴', label: '疲惫' },
      { emoji: '❤️', label: '感恩' }
    ],
    savedPostIds: [],
    likedPostIds: [],
    huggedPostIds: [],
    isLoading: true,
    isRefreshing: false,
    activeFilter: '全部动态',
    filters: ['全部动态', '✨ 期待', '🍃 放松', '🌧 忧郁', '😤 压力'],
    filteredPosts: [],
    showCommentModal: false,
    activeCommentPostId: null,
    activeCommentList: [],
    commentInput: '',
    posts: [
      {
        id: 1,
        author: '匿名同学 #2942',
        time: '12分钟前 · 图书馆',
        mood: '😤 压力',
        image: '',
        content: '期末周真的压力好大，感觉怎么复习都复习不完。深夜的图书馆灯光很亮，但心里却空荡荡的... 真的很想回家吃妈妈做的红烧肉。',
        aiName: 'AI 治愈小助手',
        aiColor: 'primary',
        aiIconPath: '/assets/icons/brain-primary.svg',
        aiReply: '抱抱你，压力是暂时的，而你的努力正在为你铺就未来的路。今晚早点休息，明天奖励自己一份好吃的吧，你已经做得很棒了！',
        likes: 24,
        comments: 6,
        liked: false,
        actionText: '抱抱TA',
        hideFooter: false,
        commentList: [
          { id: 1, author: '匿名 #3310', text: '加油！期末一定没问题的！' },
          { id: 2, author: '匿名 #5502', text: '我也在图书馆，一起加油🤝' },
          { id: 3, author: '匿名 #8812', text: '深夜复习最辛苦了，记得喝杯热水暖暖胃 ☕' },
          { id: 4, author: '匿名 #2267', text: '红烧肉治百病！撑过这周就好了，一起冲！' },
          { id: 5, author: '匿名 #6630', text: '我去年期末也这样，但最后还是过了，你也可以的 💪' },
          { id: 6, author: '匿名 #4401', text: '抱抱你，期末加油，你不是一个人在战斗 🌙' }
        ]
      },
      {
        id: 2,
        author: '匿名同学 #1024',
        time: '1小时前 · 操场',
        mood: '🍃 放松',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhrd-kdJHC6OdEwZOrsDkgnjL87q8rMPI9b8sK8puaVQUTF-h69wiaHXnJ8lebauDJvdKdg_FF7jOC-AhlJJDvpus_vxRGFbuJiKqApnYVwcaPaKiM6dXWzxMTm0dGtg5Cd-DxjI6hEqBfoUJmLHuo1PCpwcTWV4g6VS58x10cUpLQ1EKc2nX3pOtietZiXrhZDjYcD5-Mxmqvxy0ccY3JSkkdDGeC6l2pPnIGUKxalKvHaMuaLEJQaea90QxOAkW7Bio9axI5vBE6',
        content: '今天在操场跑了5公里，出了一身汗，心情瞬间好多了！晚霞真的很美，分享给大家。',
        aiName: 'AI 能量伙伴',
        aiColor: 'tertiary',
        aiIconPath: '/assets/icons/brain-tertiary.svg',
        aiReply: '运动释放的内啡肽是最好的治愈剂！晚霞是天空给努力生活的你的礼物，保持这份活力吧！',
        likes: 156,
        comments: 5,
        liked: false,
        actionText: '点个赞',
        hideFooter: false,
        commentList: [
          { id: 1, author: '匿名 #7721', text: '晚霞真的好美！' },
          { id: 2, author: '匿名 #4489', text: '跑步真的好解压，明天我也去！' },
          { id: 3, author: '匿名 #9903', text: '5公里好厉害，我最多跑两圈就不行了哈哈 😅' },
          { id: 4, author: '匿名 #1156', text: '运动完吃饭香，睡觉也香，快乐加倍！' },
          { id: 5, author: '匿名 #3374', text: '照片发出来让我们也看看那个晚霞 📸' }
        ]
      },
      {
        id: 3,
        author: '匿名同学 #0881',
        time: '3小时前 · 宿舍区',
        mood: '🌧 忧郁',
        image: '',
        content: '面试又没过，感觉自己好差劲。大四真的好迷茫，身边的朋友要么保研了，要么已经拿到大厂offer了。只有我还在原地打转。',
        aiName: 'AI 治愈小助手',
        aiColor: 'primary',
        aiIconPath: '/assets/icons/brain-primary.svg',
        aiReply: '每个人都有自己的花期，没必要在别人的季节里焦虑。这一次的失败只是为了让你在更合适的地方绽放。继续加油，你值得更好的。',
        likes: 38,
        comments: 4,
        liked: false,
        actionText: '抱抱TA',
        hideFooter: false,
        commentList: [
          { id: 1, author: '匿名 #2211', text: '你不差劲，只是还没遇到适合你的机会而已。' },
          { id: 2, author: '匿名 #5566', text: '我大四也经历过，现在回头看那段时间真的教会了我很多。加油！' },
          { id: 3, author: '匿名 #9087', text: '每一次拒信都是在为你筛掉不适合你的地方，对的那个在路上了 🌱' },
          { id: 4, author: '匿名 #3345', text: '抱抱你，迷茫是成长的证明，你已经很勇敢了 💙' }
        ]
      },
      {
        id: 4,
        author: '匿名同学 #7733',
        time: '5小时前 · 咖啡厅',
        mood: '😊 开心',
        image: '',
        content: '今天终于拿到了心仪社团的offer！准备了好久，面试的时候腿都在抖，没想到真的过了！开心到想哭 😭',
        aiName: 'AI 能量伙伴',
        aiColor: 'tertiary',
        aiIconPath: '/assets/icons/brain-tertiary.svg',
        aiReply: '恭喜你！努力从来不会骗人，这一刻的喜悦是你应得的。期待你在社团大展身手！',
        likes: 67,
        comments: 5,
        liked: false,
        actionText: '抱抱TA',
        hugged: false,
        hideFooter: false,
        commentList: [
          { id: 1, author: '匿名 #1122', text: '恭喜恭喜！是哪个社团呀？' },
          { id: 2, author: '匿名 #6677', text: '太棒了！努力的人运气都不会太差 🎉' },
          { id: 3, author: '匿名 #3398', text: '腿抖还发挥好，这才是真的厉害！' },
          { id: 4, author: '匿名 #8821', text: '同喜同喜，我也在等通知，你给我打气了！' },
          { id: 5, author: '匿名 #5540', text: '开心到哭最幸福了，好好享受这一刻 🌟' }
        ]
      },
      {
        id: 5,
        author: '匿名同学 #4456',
        time: '昨天 · 宿舍',
        mood: '😴 疲惫',
        image: '',
        content: '连续熬了三天夜赶论文，交完之后整个人躺在床上动都动不了。但是看着那份提交成功的截图，感觉一切都值了。',
        aiName: 'AI 治愈小助手',
        aiColor: 'primary',
        aiIconPath: '/assets/icons/brain-primary.svg',
        aiReply: '三天三夜，这份坚持就是你最好的答案。好好睡一觉，明天的你会因为今天的努力而自豪。',
        likes: 113,
        comments: 4,
        liked: false,
        actionText: '抱抱TA',
        hugged: false,
        hideFooter: false,
        commentList: [
          { id: 1, author: '匿名 #7712', text: '三天没睡？！铁人！快去补觉！😴' },
          { id: 2, author: '匿名 #2290', text: '那种提交成功的瞬间太治愈了，所有疲惫一扫而空' },
          { id: 3, author: '匿名 #4431', text: '论文杀手终于倒下，快去睡吧英雄 🫡' },
          { id: 4, author: '匿名 #6654', text: '我也在熬，看到你交了给了我动力，冲！' }
        ]
      },
      {
        id: 6,
        author: '匿名同学 #3321',
        time: '2天前 · 图书馆',
        mood: '❤️ 感恩',
        image: '',
        content: '今天在食堂忘带饭卡，一个不认识的同学直接帮我刷了，留下一句"没事别放心上"就走了。校园里真的有很多温暖的人。',
        aiName: 'AI 治愈小助手',
        aiColor: 'primary',
        aiIconPath: '/assets/icons/brain-primary.svg',
        aiReply: '素不相识的善意，是这个世界最美好的存在。愿你也能把这份温暖传递下去 🌸',
        likes: 289,
        comments: 6,
        liked: false,
        actionText: '抱抱TA',
        hugged: false,
        hideFooter: false,
        commentList: [
          { id: 1, author: '匿名 #8801', text: '这种事真的会让人相信世界是美好的 🥹' },
          { id: 2, author: '匿名 #3367', text: '我也遇到过类似的事，当时感动好久！' },
          { id: 3, author: '匿名 #5512', text: '以后我也要做这样的人！' },
          { id: 4, author: '匿名 #9934', text: '校园里确实有很多善意，只是平时没注意 🌷' },
          { id: 5, author: '匿名 #2278', text: '看完心里暖暖的，谢谢你分享这个故事' },
          { id: 6, author: '匿名 #6641', text: '希望那位同学看到这条帖子，知道你很感激他 💛' }
        ]
      },
      {
        id: 7,
        author: '匿名同学 #5577',
        time: '2天前 · 操场',
        mood: '😔 孤独',
        image: '',
        content: '室友们都回家了，宿舍就剩我一个人。开着灯也觉得空旷，外卖一个人点感觉吃不完，又懒得出去。大学里有时候真的很孤独。',
        aiName: 'AI 治愈小助手',
        aiColor: 'primary',
        aiIconPath: '/assets/icons/brain-primary.svg',
        aiReply: '孤独感是真实的，但你不是一个人在承受。给自己放一首喜欢的歌，点一份喜欢的外卖，今晚就属于你自己吧 🌙',
        likes: 74,
        comments: 7,
        liked: false,
        actionText: '抱抱TA',
        hugged: false,
        hideFooter: false,
        commentList: [
          { id: 1, author: '匿名 #1140', text: '抱抱你，我今晚也一个人，我们一起孤独吧 😄' },
          { id: 2, author: '匿名 #6623', text: '一个人也要好好吃饭，点一份自己最爱吃的！' },
          { id: 3, author: '匿名 #3309', text: '孤独是成长的一部分，你比你想象中的更强大 💙' },
          { id: 4, author: '匿名 #8845', text: '我大二也经常这样，后来慢慢就习惯了享受独处' },
          { id: 5, author: '匿名 #2234', text: '去散散步吧，操场晚上有时候风很好 🌿' },
          { id: 6, author: '匿名 #7712', text: '想找人说话可以发帖哈，大家都在的！' },
          { id: 7, author: '匿名 #4456', text: '抱抱你，明天室友们回来就好了，今晚坚持一下 🤗' }
        ]
      },
      {
        id: 8,
        author: '匿名同学 #8866',
        time: '3天前 · 教学楼',
        mood: '😤 委屈',
        image: '',
        content: '小组作业我做了90%的内容，最后汇报老师点名让组长上台，所有功劳都算在别人头上。组员还在群里说"谢谢组长辛苦了"。真的很委屈，不知道说什么好。',
        aiName: 'AI 能量伙伴',
        aiColor: 'tertiary',
        aiIconPath: '/assets/icons/brain-tertiary.svg',
        aiReply: '你的付出是真实存在的，不会因为没被看见就消失。这次经历让你知道了自己的能力，也让你看清楚了身边的人 🌱',
        likes: 195,
        comments: 8,
        liked: false,
        actionText: '抱抱TA',
        hugged: false,
        hideFooter: false,
        commentList: [
          { id: 1, author: '匿名 #3312', text: '这种经历太难受了，我也遇到过，真的很窝火！' },
          { id: 2, author: '匿名 #7723', text: '下次直接把自己的贡献截图存好，以后有用' },
          { id: 3, author: '匿名 #5589', text: '类似经历让我学会了做什么都要留记录，太重要了' },
          { id: 4, author: '匿名 #1167', text: '老师其实看得出来谁做了事，不用太担心 👀' },
          { id: 5, author: '匿名 #9901', text: '委屈了，抱抱。下次换组！' },
          { id: 6, author: '匿名 #4478', text: '这种组员真的气死，你的实力自己清楚就好 💪' },
          { id: 7, author: '匿名 #2256', text: '你不说他们也知道是谁在干活，放宽心 🌤' },
          { id: 8, author: '匿名 #6634', text: '抱抱你，吃顿好的，这口气就当放了吧！' }
        ]
      }
    ]
  },
  onLoad() {
    const phone = wx.getStorageSync('phone') || 'guest'
    const savedPostIds = wx.getStorageSync(`savedPostIds_${phone}`) || []
    const likedPostIds = wx.getStorageSync(`likedPostIds_${phone}`) || []
    const huggedPostIds = wx.getStorageSync(`huggedPostIds_${phone}`) || []
    this.setData({
      navBarHeight: app.globalData.navBarHeight || 100,
      tabBarBottom: app.globalData.tabBarBottom || 80,
      savedPostIds,
      likedPostIds,
      huggedPostIds
    })
    this._fetchPosts()
  },
  _fetchPosts(isRefresh = false) {
    if (isRefresh) this.setData({ isRefreshing: true })
    else this.setData({ isLoading: true })
    wx.request({
      url: `${app.globalData.apiBase}/api/posts`,
      method: 'GET',
      timeout: 8000,
      success: (res) => {
        if (res.statusCode === 200 && res.data && Array.isArray(res.data.posts)) {
          const savedIds = this.data.savedPostIds
          const likedIds = this.data.likedPostIds
          const remote = res.data.posts.map(p => {
            const commentList = (p.commentList || []).map(c => ({
              ...c,
              text: c.text || c.content || ''
            }))
            return {
              ...p,
              aiName: p.aiName || 'AI 治愈小助手',
              aiColor: p.aiColor || 'primary',
              aiIconPath: p.aiIconPath || '/assets/icons/brain-primary.svg',
              image: p.image || '',
              commentList,
              comments: commentList.length,
              liked: likedIds.includes(p.id),
              hugged: this.data.huggedPostIds.includes(p.id),
              actionText: this.data.huggedPostIds.includes(p.id) ? '已抱抱 ✓' : '抱抱TA',
              hideFooter: false,
              saved: savedIds.includes(p.id)
            }
          })
          this.setData({ posts: remote, isLoading: false, isRefreshing: false }, () => this._applyFilter())
        } else {
          this.setData({ isLoading: false, isRefreshing: false }, () => this._applyFilter())
        }
      },
      fail: () => {
        this.setData({ isLoading: false, isRefreshing: false }, () => this._applyFilter())
        wx.showToast({ title: '网络异常，显示本地数据', icon: 'none', duration: 2000 })
      }
    })
  },
  onRefresh() {
    this._fetchPosts(true)
  },
  onShow() {
    app.syncUser()
    const tb = typeof this.getTabBar === 'function' && this.getTabBar()
    if (tb && tb.data.selected !== 2) tb.setData({ selected: 2 })
    if (this._needsRefresh) {
      this._needsRefresh = false
      this._fetchPosts(true)
    }
  },
  _applyFilter() {
    const { posts, activeFilter } = this.data
    const filtered = activeFilter === '全部动态'
      ? posts
      : posts.filter(p => p.mood === activeFilter)
    this.setData({ filteredPosts: filtered })
  },
  onInputChange(e) {
    this.setData({ inputContent: e.detail.value })
  },
  onMoodToolTap() {
    this.setData({ showMoodPicker: true })
  },
  onMoodPickerClose() {
    this.setData({ showMoodPicker: false })
  },
  onMoodSelect(e) {
    const { emoji, label } = e.currentTarget.dataset
    this.setData({ selectedMoodEmoji: emoji, selectedMoodLabel: label, showMoodPicker: false })
  },
  onImageToolTap() {
    if (this.data.draftImage) {
      wx.showActionSheet({
        itemList: ['查看大图', '重新选择', '移除图片'],
        success: (res) => {
          if (res.tapIndex === 0) this.onPreviewDraftImage()
          else if (res.tapIndex === 1) this._chooseImage()
          else this.setData({ draftImage: '' })
        }
      })
      return
    }
    this._chooseImage()
  },
  _safePreview(src) {
    if (!src) return
    if (!src.startsWith('data:')) { wx.previewImage({ urls: [src], current: src }); return }
    const b64 = src.split(',')[1] || ''
    const ext = src.startsWith('data:image/png') ? 'png' : 'jpg'
    const tmpPath = `${wx.env.USER_DATA_PATH}/preview_${Date.now()}.${ext}`
    wx.getFileSystemManager().writeFile({
      filePath: tmpPath, data: b64, encoding: 'base64',
      success: () => wx.previewImage({ urls: [tmpPath], current: tmpPath }),
      fail: () => wx.showToast({ title: '预览失败', icon: 'none' })
    })
  },
  onPreviewDraftImage() {
    this._safePreview(this.data.draftImage)
  },
  onRemoveDraftImage() {
    this.setData({ draftImage: '' })
  },
  _readBase64(filePath, cb) {
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'base64',
      success: (r) => cb(`data:image/jpeg;base64,${r.data}`),
      fail: () => cb('')
    })
  },
  _chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const path = res.tempFiles[0].tempFilePath
        this.setData({ draftImage: path, draftImageBase64: '' })
        this._readBase64(path, b64 => this.setData({ draftImageBase64: b64 }))
        wx.showToast({ title: '图片已选择', icon: 'success', duration: 1500 })
      },
      fail: (err) => {
        const msg = (err && err.errMsg) || ''
        if (msg.includes('cancel') || msg.includes('chooseMedia:fail')) return
        wx.chooseImage({
          count: 1,
          sizeType: ['compressed'],
          sourceType: ['album', 'camera'],
          success: (res) => {
            const p = res.tempFilePaths[0]
            this.setData({ draftImage: p, draftImageBase64: '' })
            this._readBase64(p, b64 => this.setData({ draftImageBase64: b64 }))
            wx.showToast({ title: '图片已选择', icon: 'success', duration: 1500 })
          }
        })
      }
    })
  },
  onAnonymousTap() {
    const isAnonymous = !this.data.isAnonymous
    this.setData({ isAnonymous })
    wx.showToast({ title: isAnonymous ? '已开启匿名' : '已关闭匿名', icon: 'none', duration: 1200 })
  },
  onFilterTap(e) {
    const { filter } = e.currentTarget.dataset
    this.setData({ activeFilter: filter }, () => this._applyFilter())
  },
  onPublishPost() {
    if (this._publishing) return
    const content = app.sanitize(this.data.inputContent)
    if (!content) {
      wx.showToast({ title: '请输入内容', icon: 'none' })
      return
    }
    if (content.length < 5) {
      wx.showToast({ title: '内容太短啦，多说几句吧 😊', icon: 'none' })
      return
    }
    this._publishing = true
    const { selectedMoodEmoji, selectedMoodLabel, draftImage, isAnonymous } = this.data
    if (selectedMoodEmoji) {
      this._doPublish(content, `${selectedMoodEmoji} ${selectedMoodLabel}`, draftImage, isAnonymous)
      return
    }
    const moods = this.data.moods
    const moodList = moods.map(m => m.label).join('、')
    app.callAI({
      messages: [
        { role: 'system', content: `你是情绪识别助手。根据用户文字，从以下情绪中选出最匹配的一个，只返回情绪标签文字本身，不加任何解释：${moodList}` },
        { role: 'user', content }
      ],
      maxTokens: 20, temperature: 0.3,
      onSuccess: (reply) => {
        const matched = moods.find(m => reply.includes(m.label))
        const moodTag = matched ? `${matched.emoji} ${matched.label}` : ''
        this._doPublish(content, moodTag, draftImage, isAnonymous)
      },
      onFail: () => this._doPublish(content, '', draftImage, isAnonymous)
    })
  },
  _doPublish(content, moodTag, draftImage, isAnonymous) {
    const username = app.globalData.username || wx.getStorageSync('username') || ''
    const isPhone = /^1[3-9]\d{9}$/.test(username)
    const displayName = isAnonymous
      ? `匿名同学 #${Math.floor(Math.random() * 9000 + 1000)}`
      : (isPhone ? username.slice(0, 3) + '****' + username.slice(-4) : username || '匿名同学')
    const postId = Date.now()
    const userId = app.globalData.userId || wx.getStorageSync('userId') || null
    const phone = wx.getStorageSync('phone') || 'guest'
    const fallback = AI_REPLY_FALLBACKS[Math.floor(Math.random() * AI_REPLY_FALLBACKS.length)]
    const newPost = {
      id: postId,
      author: displayName,
      time: '刚刚',
      mood: moodTag || '全部动态',
      image: this.data.draftImageBase64 || draftImage || '',
      content,
      aiName: 'AI 治愈小助手',
      aiColor: 'primary',
      aiIconPath: '/assets/icons/brain-primary.svg',
      aiReply: 'AI 正在分析...',
      aiLoading: true,
      likes: 0,
      comments: 0,
      liked: false,
      saved: false,
      actionText: '抱抱TA',
      hideFooter: false,
      commentList: [],
      authorId: isAnonymous ? null : userId
    }
    // Persist my post to localStorage
    if (!isAnonymous) {
      const myPosts = wx.getStorageSync(`myPosts_${phone}`) || []
      myPosts.unshift({ id: postId, content: content.slice(0, 80), mood: moodTag || '全部动态', time: '刚刚' })
      wx.setStorageSync(`myPosts_${phone}`, myPosts.slice(0, 50))
    }
    const posts = [newPost, ...this.data.posts]
    this.setData({
      posts,
      inputContent: '',
      selectedMoodEmoji: '',
      selectedMoodLabel: '',
      draftImage: '',
      draftImageBase64: ''
    }, () => this._applyFilter())
    wx.showToast({ title: '树洞已发布 🌱', icon: 'success', duration: 2000 })
    this._needsRefresh = true
    const systemPrompt = `你是「智校·AI生活助手」树洞社区的情感陪伴者，专为大学生提供匿名情绪支持。
规则：
1. 根据用户分享内容给出温暖、真诚的回应，50字以内，多用emoji，语气亲切自然。
2. 若内容涉及开心/成就：真诚祝贺，给予正向反馈。
3. 若内容涉及压力/焦虑/低落：先共情，再给一个具体可做的小动作。
4. 若内容出现自伤/极度绝望/危机信号：先表达真诚关心，鼓励用户现在就去找一个信任的朋友或室友待在一起，不要一个人扛；同时告知可联系学校心理中心或拨打心理援助热线 400-161-9995。
5. 只输出回应正文，不加"AI回复："等前缀。`
    const userPrompt = moodTag ? `用户心情标签：${moodTag}\n用户内容：${content}` : `用户内容：${content}`
    app.callAI({
      systemPrompt,
      userPrompt,
      maxTokens: 150,
      temperature: 0.85,
      onSuccess: (reply) => {
        const aiReply = reply || fallback
        const idx = this.data.posts.findIndex(p => p.id === postId)
        if (idx !== -1) {
          this.setData({ [`posts[${idx}].aiReply`]: aiReply, [`posts[${idx}].aiLoading`]: false }, () => this._applyFilter())
        }
        this._publishing = false
        wx.request({ url: `${app.globalData.apiBase}/api/posts/${postId}`, method: 'PATCH', data: { aiReply }, timeout: 6000, fail: () => {} })
      },
      onFail: () => {
        const idx = this.data.posts.findIndex(p => p.id === postId)
        if (idx !== -1) {
          this.setData({ [`posts[${idx}].aiReply`]: fallback, [`posts[${idx}].aiLoading`]: false }, () => this._applyFilter())
        }
        this._publishing = false
      }
    })
    wx.setStorageSync('statPosts', (wx.getStorageSync('statPosts') || 0) + 1)
    wx.request({
      url: `${app.globalData.apiBase}/api/posts`,
      method: 'POST',
      data: { content, mood: moodTag || '全部动态', authorId: isAnonymous ? null : userId, author: displayName, imageBase64: this.data.draftImageBase64 || '' },
      timeout: 6000,
      fail: () => {}
    })
  },
  onSaveTap(e) {
    const id = e.currentTarget.dataset.id
    const idx = this.data.posts.findIndex(p => p.id == id)
    if (idx === -1) return
    const phone = wx.getStorageSync('phone') || 'guest'
    const post = this.data.posts[idx]
    const savedPostIds = [...this.data.savedPostIds]
    const alreadySaved = savedPostIds.includes(post.id)
    let savedPosts = wx.getStorageSync(`savedPosts_${phone}`) || []
    if (alreadySaved) {
      const newIds = savedPostIds.filter(i => i !== post.id)
      savedPosts = savedPosts.filter(p => p.id !== post.id)
      this.setData({ savedPostIds: newIds, [`posts[${idx}].saved`]: false }, () => this._applyFilter())
      wx.setStorageSync(`savedPostIds_${phone}`, newIds)
      wx.setStorageSync(`savedPosts_${phone}`, savedPosts)
      wx.showToast({ title: '已取消收藏', icon: 'none', duration: 1200 })
    } else {
      savedPostIds.push(post.id)
      savedPosts.unshift({ id: post.id, content: post.content.slice(0, 80), mood: post.mood, author: post.author, time: post.time })
      this.setData({ savedPostIds, [`posts[${idx}].saved`]: true }, () => this._applyFilter())
      wx.setStorageSync(`savedPostIds_${phone}`, savedPostIds)
      wx.setStorageSync(`savedPosts_${phone}`, savedPosts.slice(0, 50))
      wx.showToast({ title: '已收藏 🔖', icon: 'none', duration: 1200 })
    }
  },
  onLikeTap(e) {
    const id = e.currentTarget.dataset.id
    const idx = this.data.posts.findIndex(p => p.id == id)
    if (idx === -1) return
    const p = this.data.posts[idx]
    const nowLiked = !p.liked
    this.setData({
      [`posts[${idx}].liked`]: nowLiked,
      [`posts[${idx}].likes`]: nowLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
    }, () => this._applyFilter())
    // Persist liked state per-user
    const phone = wx.getStorageSync('phone') || 'guest'
    let likedPostIds = [...this.data.likedPostIds]
    if (nowLiked) {
      if (!likedPostIds.includes(p.id)) likedPostIds.push(p.id)
    } else {
      likedPostIds = likedPostIds.filter(i => i !== p.id)
    }
    this.setData({ likedPostIds })
    wx.setStorageSync(`likedPostIds_${phone}`, likedPostIds)
    wx.vibrateShort({ type: 'light' })
    wx.request({ url: `${app.globalData.apiBase}/api/posts/${id}/like`, method: 'PATCH', timeout: 6000, fail: () => {} })
  },
  onCommentTap(e) {
    const id = e.currentTarget.dataset.id
    const post = this.data.posts.find(p => p.id == id)
    if (!post) return
    this.setData({
      showCommentModal: true,
      activeCommentPostId: id,
      activeCommentList: post.commentList || [],
      commentInput: ''
    })
  },
  preventClose() {},
  onCloseComment() {
    this.setData({ showCommentModal: false })
  },
  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value })
  },
  onSendComment() {
    if (this._commenting) return
    const text = app.sanitize(this.data.commentInput)
    if (!text) return
    this._commenting = true
    const newComment = {
      id: Date.now(),
      author: `匿名 #${Math.floor(Math.random() * 9000 + 1000)}`,
      text
    }
    const postId = this.data.activeCommentPostId
    const idx = this.data.posts.findIndex(p => p.id == postId)
    if (idx === -1) { this._commenting = false; return }
    const p = this.data.posts[idx]
    const commentList = [...(p.commentList || []), newComment]
    const activeCommentList = [...this.data.activeCommentList, newComment]
    this.setData({
      [`posts[${idx}].commentList`]: commentList,
      [`posts[${idx}].comments`]: commentList.length,
      activeCommentList,
      commentInput: ''
    }, () => this._applyFilter())
    this._commenting = false
    wx.vibrateShort({ type: 'light' })
    wx.showToast({ title: '评论成功', icon: 'success' })
    wx.request({ url: `${app.globalData.apiBase}/api/posts/${postId}/comment`, method: 'POST', data: { content: text, author: newComment.author }, timeout: 6000, fail: () => {} })
  },
  onActionTap(e) {
    const id = e.currentTarget.dataset.id
    const text = e.currentTarget.dataset.text
    if (text === '抱抱TA') {
      const idx = this.data.posts.findIndex(p => p.id == id)
      const post = idx !== -1 ? this.data.posts[idx] : null
      if (post && post.hugged) {
        wx.showToast({ title: '你已经抱抱过TA了 🤗', icon: 'none' })
        return
      }
      wx.showModal({
        title: '送出一个温暖的拥抱 🤗',
        content: '你匿名送出了一个拥抱，希望能让对方感受到温暖。',
        showCancel: false,
        confirmText: '送出拥抱',
        success: (res) => {
          if (!res.confirm) return
          const idx2 = this.data.posts.findIndex(p => p.id == id)
          if (idx2 !== -1) {
            const p2 = this.data.posts[idx2]
            this.setData({
              [`posts[${idx2}].likes`]: p2.likes + 1,
              [`posts[${idx2}].actionText`]: '已抱抱 ✓',
              [`posts[${idx2}].hugged`]: true
            }, () => this._applyFilter())
          }
          wx.vibrateShort({ type: 'medium' })
          wx.showToast({ title: '拥抱已送出 💛', icon: 'none', duration: 1500 })
          wx.setStorageSync('statHugs', (wx.getStorageSync('statHugs') || 0) + 1)
          const phone2 = wx.getStorageSync('phone') || 'guest'
          const newHuggedIds = [...this.data.huggedPostIds, id]
          this.setData({ huggedPostIds: newHuggedIds })
          wx.setStorageSync(`huggedPostIds_${phone2}`, newHuggedIds)
          // Notify the post author on backend (non-anonymous posts only)
          const huggedPost = idx2 !== -1 ? this.data.posts[idx2] : null
          if (huggedPost && huggedPost.authorId) {
            wx.request({ url: `${app.globalData.apiBase}/api/users/${huggedPost.authorId}/hug`, method: 'POST', timeout: 6000, fail: () => {} })
          }
        }
      })
    } else {
      this.onLikeTap(e)
    }
  },
  onImageTap(e) {
    const { src } = e.currentTarget.dataset
    this._safePreview(src)
  }
})
