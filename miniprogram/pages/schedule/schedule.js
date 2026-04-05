const app = getApp()

const COLORS = ['primary', 'secondary', 'tertiary']
const COLOR_NAMES = { primary: '蓝', secondary: '橙', tertiary: '绿' }

const DEFAULT_COURSES = [
  { id: 1, name: '高等数学', room: 'A103', dayOfWeek: 0, startTime: '08:00', endTime: '09:40', color: 'primary' },
  { id: 2, name: '大学英语', room: 'B205', dayOfWeek: 0, startTime: '10:00', endTime: '11:40', color: 'secondary' },
  { id: 3, name: '思想政治', room: 'D401', dayOfWeek: 0, startTime: '14:00', endTime: '15:40', color: 'tertiary' },
  { id: 4, name: '线性代数', room: 'A201', dayOfWeek: 1, startTime: '08:00', endTime: '09:40', color: 'tertiary' },
  { id: 5, name: '计算机基础', room: '机房3', dayOfWeek: 1, startTime: '14:00', endTime: '15:40', color: 'primary' },
  { id: 6, name: '体育', room: '操场', dayOfWeek: 2, startTime: '10:00', endTime: '11:40', color: 'tertiary' },
  { id: 7, name: '大学物理', room: 'C101', dayOfWeek: 2, startTime: '14:00', endTime: '15:40', color: 'secondary' },
  { id: 8, name: '高等数学', room: 'A103', dayOfWeek: 3, startTime: '10:00', endTime: '11:40', color: 'primary' },
  { id: 9, name: '大学英语', room: 'B205', dayOfWeek: 4, startTime: '08:00', endTime: '09:40', color: 'secondary' },
  { id: 10, name: '大学物理', room: 'C101', dayOfWeek: 4, startTime: '14:00', endTime: '15:40', color: 'secondary' }
]

function timeToMin(t) {
  if (!t || !t.includes(':')) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minToTime(mins) {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function durationText(mins) {
  if (mins >= 60) {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
  }
  return `${mins}分钟`
}

function gapSuggestion(mins) {
  if (mins >= 120) return '📖 长空档 — 适合去图书馆自习或接一个互助任务'
  if (mins >= 60)  return '🧘 中等空档 — 可以冥想放松、健康打卡或完成小任务'
  if (mins >= 30)  return '☕ 短空档 — 去取个外卖、快速复习笔记或休息一下'
  return '🚶 小憩 — 伸展一下，喝杯水，活动颈椎'
}

function computeSlots(courses) {
  if (!courses.length) return []
  const sorted = [...courses].sort((a, b) => timeToMin(a.startTime) - timeToMin(b.startTime))
  const slots = []
  const DAY_START = 7 * 60 + 30  // 07:30

  const firstStart = timeToMin(sorted[0].startTime)
  if (firstStart - DAY_START >= 30) {
    const dur = firstStart - DAY_START
    slots.push({ type: 'gap', startTime: minToTime(DAY_START), endTime: sorted[0].startTime, duration: dur, durationText: durationText(dur), suggestion: gapSuggestion(dur) })
  }

  sorted.forEach((course, i) => {
    slots.push({ type: 'course', ...course })
    if (i < sorted.length - 1) {
      const gapStart = timeToMin(course.endTime)
      const gapEnd = timeToMin(sorted[i + 1].startTime)
      const dur = gapEnd - gapStart
      if (dur >= 10) {
        slots.push({ type: 'gap', startTime: course.endTime, endTime: sorted[i + 1].startTime, duration: dur, durationText: durationText(dur), suggestion: gapSuggestion(dur) })
      }
    }
  })

  return slots
}

Page({
  data: {
    statusBarHeight: 20,
    navHeight: 88,
    navBarHeight: 100,
    tabBarBottom: 80,
    days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    currentDay: 0,
    todayIndex: 0,
    courses: [],
    todaySlots: [],
    todayCourseCount: 0,
    showAddModal: false,
    newCourseName: '',
    newCourseRoom: '',
    newCourseStart: '08:00',
    newCourseEnd: '09:40',
    newCourseColor: 'primary',
    newCourseDay: 0,
    colorOptions: [
      { value: 'primary',   label: '蓝色' },
      { value: 'secondary', label: '橙色' },
      { value: 'tertiary',  label: '绿色' }
    ],
    safeAreaBottom: 0,
    showAIPlan: false,
    aiPlan: '',
    aiLoading: false,
    planEvents: []
  },

  onLoad() {
    try {
      const sys = wx.getWindowInfo()
      const sb = sys.statusBarHeight || 20
      const navContentPx = Math.ceil(88 * (sys.screenWidth || 375) / 750)
      this.setData({ statusBarHeight: sb, navHeight: sb + navContentPx + 4 })
    } catch (e) {}

    this.setData({
      navBarHeight: app.globalData.navBarHeight || 100,
      tabBarBottom: app.globalData.tabBarBottom || 80,
      safeAreaBottom: app.globalData.safeAreaBottom || 0
    })

    let courses = wx.getStorageSync('courses')
    if (!Array.isArray(courses) || courses.length === 0) {
      courses = DEFAULT_COURSES
      wx.setStorageSync('courses', courses)
    }

    const today = new Date().getDay()
    const todayIndex = today === 0 ? 6 : today - 1

    this.setData({ courses, currentDay: todayIndex, todayIndex }, () => this._refreshSlots())
  },

  _refreshSlots() {
    const { courses, currentDay } = this.data
    const dayCourses = courses.filter(c => c.dayOfWeek === currentDay)
    const todaySlots = computeSlots(dayCourses)
    this.setData({ todaySlots, todayCourseCount: dayCourses.length })
  },

  onDaySwitch(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ currentDay: idx }, () => this._refreshSlots())
  },

  onBack() {
    wx.navigateBack()
  },

  onAddCourse() {
    this.setData({
      showAddModal: true,
      newCourseName: '',
      newCourseRoom: '',
      newCourseStart: '08:00',
      newCourseEnd: '09:40',
      newCourseColor: 'primary',
      newCourseDay: this.data.currentDay
    })
  },

  onCancelAdd() {
    this.setData({ showAddModal: false })
  },

  preventClose() {},

  onNameInput(e) { this.setData({ newCourseName: e.detail.value }) },
  onRoomInput(e) { this.setData({ newCourseRoom: e.detail.value }) },
  onStartInput(e) { this.setData({ newCourseStart: e.detail.value }) },
  onEndInput(e)   { this.setData({ newCourseEnd: e.detail.value }) },

  onColorSelect(e) { this.setData({ newCourseColor: e.currentTarget.dataset.val }) },
  onDaySelect(e)   { this.setData({ newCourseDay: e.currentTarget.dataset.idx }) },

  onConfirmAdd() {
    const { newCourseName, newCourseRoom, newCourseStart, newCourseEnd, newCourseColor, newCourseDay } = this.data
    const name = app.sanitize(newCourseName)
    if (!name) { wx.showToast({ title: '请输入课程名', icon: 'none' }); return }
    if (!/^\d{2}:\d{2}$/.test(newCourseStart) || !/^\d{2}:\d{2}$/.test(newCourseEnd)) {
      wx.showToast({ title: '时间格式 HH:MM', icon: 'none' }); return
    }
    if (timeToMin(newCourseEnd) <= timeToMin(newCourseStart)) {
      wx.showToast({ title: '结束时间须晚于开始时间', icon: 'none' }); return
    }
    const newCourse = {
      id: Date.now(),
      name,
      room: app.sanitize(newCourseRoom) || '待定',
      dayOfWeek: newCourseDay,
      startTime: newCourseStart,
      endTime: newCourseEnd,
      color: COLORS.includes(newCourseColor) ? newCourseColor : 'primary'
    }
    const courses = [...this.data.courses, newCourse]
    wx.setStorageSync('courses', courses)
    this.setData({ courses, showAddModal: false }, () => this._refreshSlots())
    wx.showToast({ title: '课程已添加', icon: 'success' })
    wx.vibrateShort({ type: 'light' })
  },

  onDeleteCourse(e) {
    const id = Number(e.currentTarget.dataset.id)
    wx.showModal({
      title: '删除课程',
      content: '确定删除这门课程？',
      confirmColor: '#e11d48',
      success: (res) => {
        if (!res.confirm) return
        const courses = this.data.courses.filter(c => c.id !== id)
        wx.setStorageSync('courses', courses)
        this.setData({ courses }, () => this._refreshSlots())
        wx.showToast({ title: '已删除', icon: 'success' })
      }
    })
  },

  onAIPlan() {
    const { courses, currentDay, days } = this.data
    const dayCourses = courses.filter(c => c.dayOfWeek === currentDay)
      .sort((a, b) => timeToMin(a.startTime) - timeToMin(b.startTime))

    if (dayCourses.length === 0) {
      wx.showToast({ title: '今天没有课程哦', icon: 'none' }); return
    }

    const scheduleText = dayCourses.map(c =>
      `${c.startTime}-${c.endTime} ${c.name}（${c.room}）`
    ).join('、')

    const slots = computeSlots(dayCourses)
    const gaps = slots.filter(s => s.type === 'gap')
    const gapText = gaps.length
      ? gaps.map(g => `${g.startTime}-${g.endTime}（${g.durationText}）`).join('、')
      : '课程之间几乎没有空档'

    this.setData({ showAIPlan: true, aiLoading: true, aiPlan: '', planEvents: [] })
    wx.request({
      url: `${app.globalData.apiBase}/api/events`,
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        if (res.statusCode === 200 && res.data && Array.isArray(res.data.events)) {
          this.setData({ planEvents: res.data.events.slice(0, 5) })
        }
      },
      fail: () => {}
    })

    const streak = wx.getStorageSync('streakDays') || 0
    const checkins = wx.getStorageSync('statCheckins') || 0
    const tasksDone = wx.getStorageSync('statTasks') || 0
    const hour = new Date().getHours()
    const period = hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上'
    const systemPrompt = `你是「智校·AI生活助手」的时间管理顾问，当前时段：${period}。
根据用户课程表和课间空档，给出具体可执行的碎片时间建议，200字以内，用emoji增加可读性。
可引导用户使用 App 内功能：
- 有空档 ≥30min → 建议去「互助」页接任务赚学分
- 未打卡 → 建议去「健康」页完成今日情绪打卡
- 有长空档 → 建议去「树洞」写心情或「脉动」看活动
格式：每个空档单独一行，前面标注时间段。`
    const _d = new Date(); const todayCheckedIn = !!wx.getStorageSync(`checkin_${_d.getFullYear()}_${_d.getMonth()}_${_d.getDate()}`)
    const userPrompt = `${days[currentDay]}课程：${scheduleText}。课间空档：${gapText}。用户信息：连续打卡${streak}天，累计${checkins}次，今日${todayCheckedIn ? '已' : '未'}打卡，完成互助任务${tasksDone}个。`

    app.callAI({
      systemPrompt,
      userPrompt,
      maxTokens: 350,
      onSuccess: (reply) => {
        const cleaned = (reply || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/^#+\s*/gm, '').trim()
        this.setData({ aiPlan: cleaned || '同学，今天课程很满！记得课间补充水分、活动颈椎，每节课后做5分钟伸展。善用午休时间快速小憩，下午精力会更好。加油！💪', aiLoading: false })
      },
      onFail: () => {
        const fallback = gaps.map(g => `${g.startTime}-${g.endTime} ${g.suggestion}`).join('\n')
        this.setData({
          aiPlan: `📅 今日空档规划：\n\n${fallback || '今天课程安排较满，注意每节课间起身活动。'}`,
          aiLoading: false
        })
      }
    })
  },

  onPlanEventTap(e) {
    const { name, time, loc } = e.currentTarget.dataset
    wx.showModal({
      title: '📍 活动详情',
      content: `「${name}」\n\n⏰ ${time}\n📍 ${loc}\n\n要把这个活动加入今日日程吗？`,
      showCancel: true,
      cancelText: '稍后再说',
      confirmText: '加入日程',
      success(res) {
        if (res.confirm) wx.showToast({ title: '已加入日程 ✅', icon: 'success' })
      }
    })
  },
  onCloseAIPlan() {
    this.setData({ showAIPlan: false })
  }
})
