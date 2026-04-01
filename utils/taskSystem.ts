import storage from './storage'
import { STORAGE_KEYS } from './constants'

export type TaskType = 'daily' | 'achievement' | 'challenge'
export type PointsSource = 'signIn' | 'test' | 'emergency' | 'share' | 'riskTest'

export interface DailyTask {
  id: string
  name: string
  description: string
  icon: string
  crazyPoints: number
  completed: boolean
}

export interface AchievementTask {
  id: string
  name: string
  description: string
  icon: string
  crazyPoints: number
  current: number
  target: number
  unlocked: boolean
}

export interface ChallengeTask {
  id: string
  name: string
  description: string
  icon: string
  crazyPoints: number
  startTime?: string
  endTime?: string
  completed: boolean
  available: boolean
}

export interface DailyTasksData {
  date: string
  signedIn: boolean
  usedEmergency: boolean
  completedMoodTest: boolean
  completedRiskTest: boolean
  shared: boolean
  totalEarned: number
}

export interface AchievementData {
  emergencyCount: number
  testCount: number
  riskTestCount: number
  continuousSignIn: number
  maxContinuousSignIn: number
  totalCrazyPoints: number
}

export interface PointsHistoryItem {
  date: string
  points: number
  source: PointsSource
}

export interface PointsSourceStat {
  source: PointsSource
  label: string
  icon: string
  count: number
  percentage: number
}

export interface TaskSystemData {
  dailyTasks: DailyTasksData
  achievementData: AchievementData
  pointsHistory: PointsHistoryItem[]
  rankingRewards: {
    lastClaimedDate: string
    claimedRanks: number[]
    weeklyClaimed: boolean
    monthlyClaimed: boolean
  }
}

const TASK_KEY = STORAGE_KEYS.TASK_SYSTEM_DATA

const defaultDailyTasks: DailyTasksData = {
  date: '',
  signedIn: false,
  usedEmergency: false,
  completedMoodTest: false,
  completedRiskTest: false,
  shared: false,
  totalEarned: 0
}

const defaultAchievementData: AchievementData = {
  emergencyCount: 0,
  testCount: 0,
  riskTestCount: 0,
  continuousSignIn: 0,
  maxContinuousSignIn: 0,
  totalCrazyPoints: 0
}

const defaultRankingRewards = {
  lastClaimedDate: '',
  claimedRanks: [] as number[],
  weeklyClaimed: false,
  monthlyClaimed: false
}

const getTodayString = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const getWeekStartDate = () => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek
  const weekStart = new Date(now.setDate(diff))
  return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`
}

class TaskSystem {
  private data: TaskSystemData = {
    dailyTasks: { ...defaultDailyTasks },
    achievementData: { ...defaultAchievementData },
    pointsHistory: [],
    rankingRewards: { ...defaultRankingRewards }
  }

  constructor() {
    this.loadData()
  }

  private loadData() {
    const savedData = storage.get<TaskSystemData>(TASK_KEY)
    if (savedData) {
      this.data = {
        ...this.data,
        ...savedData,
        dailyTasks: { ...defaultDailyTasks, ...savedData.dailyTasks },
        achievementData: { ...defaultAchievementData, ...savedData.achievementData },
        rankingRewards: { ...defaultRankingRewards, ...savedData.rankingRewards }
      }
    }
    this.checkAndResetDaily()
    this.checkAndResetWeekly()
    this.checkAndResetMonthly()
  }

  private saveData() {
    storage.set(TASK_KEY, this.data)
  }

  private checkAndResetDaily() {
    const today = getTodayString()
    if (this.data.dailyTasks.date !== today) {
      this.data.dailyTasks = {
        date: today,
        signedIn: false,
        usedEmergency: false,
        completedMoodTest: false,
        completedRiskTest: false,
        shared: false,
        totalEarned: 0
      }
      this.saveData()
    }
  }

  private checkAndResetWeekly() {
    const weekStart = getWeekStartDate()
    const lastClaimedDate = this.data.rankingRewards.lastClaimedDate
    
    if (lastClaimedDate && lastClaimedDate < weekStart) {
      this.data.rankingRewards.weeklyClaimed = false
      this.saveData()
    }
  }

  private checkAndResetMonthly() {
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const lastClaimedDate = this.data.rankingRewards.lastClaimedDate
    
    if (lastClaimedDate && lastClaimedDate < monthStart) {
      this.data.rankingRewards.monthlyClaimed = false
      this.saveData()
    }
  }

  private addPointsHistory(points: number, source: PointsSource) {
    const today = getTodayString()
    this.data.pointsHistory.unshift({
      date: today,
      points,
      source
    })
    this.data.pointsHistory = this.data.pointsHistory.slice(0, 365)
  }

  getDailyTasks(): DailyTask[] {
    this.checkAndResetDaily()
    return [
      {
        id: 'signIn',
        name: '每日签到',
        description: '完成今日签到',
        icon: '📝',
        crazyPoints: 15,
        completed: this.data.dailyTasks.signedIn
      },
      {
        id: 'emergency',
        name: '紧急中心',
        description: '使用紧急中心功能',
        icon: '🚨',
        crazyPoints: 5,
        completed: this.data.dailyTasks.usedEmergency
      },
      {
        id: 'moodTest',
        name: '疯情测试',
        description: '完成一次疯情指数测试',
        icon: '🧠',
        crazyPoints: 10,
        completed: this.data.dailyTasks.completedMoodTest
      },
      {
        id: 'riskTest',
        name: '风险自检',
        description: '完成一次疯险自检',
        icon: '⚠️',
        crazyPoints: 15,
        completed: this.data.dailyTasks.completedRiskTest
      },
      {
        id: 'share',
        name: '分享快乐',
        description: '分享内容给好友',
        icon: '📤',
        crazyPoints: 5,
        completed: this.data.dailyTasks.shared
      }
    ]
  }

  getAchievementTasks(): AchievementTask[] {
    const d = this.data.achievementData
    return [
      {
        id: 'emergency10',
        name: '急救新手',
        description: '使用紧急中心10次',
        icon: '🌱',
        crazyPoints: 30,
        current: d.emergencyCount,
        target: 10,
        unlocked: d.emergencyCount >= 10
      },
      {
        id: 'emergency50',
        name: '急救达人',
        description: '使用紧急中心50次',
        icon: '🌿',
        crazyPoints: 80,
        current: d.emergencyCount,
        target: 50,
        unlocked: d.emergencyCount >= 50
      },
      {
        id: 'emergency100',
        name: '急救大师',
        description: '使用紧急中心100次',
        icon: '🌳',
        crazyPoints: 150,
        current: d.emergencyCount,
        target: 100,
        unlocked: d.emergencyCount >= 100
      },
      {
        id: 'test10',
        name: '测试新手',
        description: '完成疯情测试10次',
        icon: '📝',
        crazyPoints: 30,
        current: d.testCount,
        target: 10,
        unlocked: d.testCount >= 10
      },
      {
        id: 'test50',
        name: '测试达人',
        description: '完成疯情测试50次',
        icon: '📚',
        crazyPoints: 80,
        current: d.testCount,
        target: 50,
        unlocked: d.testCount >= 50
      },
      {
        id: 'signIn7',
        name: '连续签到7天',
        description: '连续签到7天',
        icon: '🔥',
        crazyPoints: 50,
        current: d.continuousSignIn,
        target: 7,
        unlocked: d.continuousSignIn >= 7
      },
      {
        id: 'signIn30',
        name: '连续签到30天',
        description: '连续签到30天',
        icon: '💎',
        crazyPoints: 150,
        current: d.continuousSignIn,
        target: 30,
        unlocked: d.continuousSignIn >= 30
      },
      {
        id: 'riskTest10',
        name: '风险意识',
        description: '完成风险自检10次',
        icon: '⚠️',
        crazyPoints: 50,
        current: d.riskTestCount,
        target: 10,
        unlocked: d.riskTestCount >= 10
      }
    ]
  }

  getChallengeTasks(): ChallengeTask[] {
    const hour = new Date().getHours()
    const isWeekend = [0, 6].includes(new Date().getDay())

    return [
      {
        id: 'nightOwl',
        name: '夜猫子',
        description: '在22:00-02:00期间完成任务',
        icon: '🦉',
        crazyPoints: 20,
        completed: false,
        available: hour >= 22 || hour < 2
      },
      {
        id: 'earlyBird',
        name: '早起鸟',
        description: '在6:00-9:00期间签到',
        icon: '🐦',
        crazyPoints: 15,
        completed: false,
        available: hour >= 6 && hour < 9
      },
      {
        id: 'weekend',
        name: '周末放松',
        description: '在周末完成任意测试',
        icon: '🎉',
        crazyPoints: 25,
        completed: false,
        available: isWeekend
      }
    ]
  }

  completeTask(taskId: string): number {
    this.checkAndResetDaily()
    let earnedPoints = 0
    let source: PointsSource = 'signIn'

    switch (taskId) {
      case 'signIn':
        if (!this.data.dailyTasks.signedIn) {
          const today = getTodayString()
          const lastDate = this.data.dailyTasks.date
          
          if (lastDate && lastDate !== today) {
            const lastDateObj = new Date(lastDate)
            const todayDateObj = new Date(today)
            const diffDays = Math.floor((todayDateObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24))
            
            if (diffDays > 1) {
              this.data.achievementData.continuousSignIn = 0
            }
          }
          
          this.data.dailyTasks.signedIn = true
          let basePoints = 15
          
          const continuousDays = this.data.achievementData.continuousSignIn
          if (continuousDays >= 100) {
            basePoints = Math.floor(basePoints * 1.3)
          } else if (continuousDays >= 30) {
            basePoints = Math.floor(basePoints * 1.2)
          } else if (continuousDays >= 7) {
            basePoints = Math.floor(basePoints * 1.1)
          }
          
          earnedPoints += basePoints
          source = 'signIn'
          this.data.achievementData.continuousSignIn++
          this.data.achievementData.maxContinuousSignIn = Math.max(
            this.data.achievementData.maxContinuousSignIn,
            this.data.achievementData.continuousSignIn
          )
        }
        break
      case 'emergency':
        if (!this.data.dailyTasks.usedEmergency) {
          this.data.dailyTasks.usedEmergency = true
          earnedPoints += 5
          source = 'emergency'
          this.data.achievementData.emergencyCount++
        }
        break
      case 'moodTest':
        if (!this.data.dailyTasks.completedMoodTest) {
          this.data.dailyTasks.completedMoodTest = true
          earnedPoints += 10
          source = 'test'
          this.data.achievementData.testCount++
        }
        break
      case 'riskTest':
        if (!this.data.dailyTasks.completedRiskTest) {
          this.data.dailyTasks.completedRiskTest = true
          earnedPoints += 15
          source = 'riskTest'
          this.data.achievementData.riskTestCount++
        }
        break
      case 'share':
        if (!this.data.dailyTasks.shared) {
          this.data.dailyTasks.shared = true
          earnedPoints += 5
          source = 'share'
        }
        break
    }

    if (earnedPoints > 0) {
      this.data.dailyTasks.totalEarned += earnedPoints
      this.data.achievementData.totalCrazyPoints += earnedPoints
      this.addPointsHistory(earnedPoints, source)
      this.saveData()
    }

    return earnedPoints
  }

  getDailyEarned(): number {
    this.checkAndResetDaily()
    return this.data.dailyTasks.totalEarned
  }

  getTotalCrazyPoints(): number {
    return this.data.achievementData.totalCrazyPoints
  }

  getPointsHistory(): PointsHistoryItem[] {
    return this.data.pointsHistory
  }

  getWeeklyPoints(): number {
    const weekStart = getWeekStartDate()
    return this.data.pointsHistory
      .filter(item => item.date >= weekStart)
      .reduce((sum, item) => sum + item.points, 0)
  }

  getMonthlyPoints(): number {
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    return this.data.pointsHistory
      .filter(item => item.date >= monthStart)
      .reduce((sum, item) => sum + item.points, 0)
  }

  getDailyPoints(): number {
    const today = getTodayString()
    return this.data.pointsHistory
      .filter(item => item.date === today)
      .reduce((sum, item) => sum + item.points, 0)
  }

  getWeeklyTrend(): { date: string; dayName: string; points: number }[] {
    const result: { date: string; dayName: string; points: number }[] = []
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const dayIndex = date.getDay()

      const dayPoints = this.data.pointsHistory
        .filter(item => item.date === dateStr)
        .reduce((sum, item) => sum + item.points, 0)

      result.push({
        date: dateStr,
        dayName: dayNames[dayIndex],
        points: dayPoints
      })
    }

    return result
  }

  getPointsSourceStats(): PointsSourceStat[] {
    const sourceMap: Record<PointsSource, { label: string; icon: string; count: number }> = {
      signIn: { label: '签到', icon: '📝', count: 0 },
      test: { label: '测试', icon: '🧠', count: 0 },
      emergency: { label: '紧急中心', icon: '🚨', count: 0 },
      share: { label: '分享', icon: '📤', count: 0 },
      riskTest: { label: '风险自检', icon: '⚠️', count: 0 }
    }

    this.data.pointsHistory.forEach(item => {
      if (sourceMap[item.source]) {
        sourceMap[item.source].count += item.points
      }
    })

    const total = Object.values(sourceMap).reduce((sum, s) => sum + s.count, 0)

    return Object.entries(sourceMap)
      .filter(([_, data]) => data.count > 0)
      .map(([source, data]) => ({
        source: source as PointsSource,
        label: data.label,
        icon: data.icon,
        count: data.count,
        percentage: total > 0 ? Math.round((data.count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
  }

  getAchievementProgress(): { current: number; target: number; percentage: number }[] {
    const achievements = this.getAchievementTasks()
    return achievements.map(a => ({
      current: a.current,
      target: a.target,
      percentage: Math.min(100, Math.round((a.current / a.target) * 100))
    }))
  }

  getContinuousSignInDays(): number {
    return this.data.achievementData.continuousSignIn
  }

  resetDaily() {
    this.checkAndResetDaily()
  }

  claimDailyRankingReward(rank: number): number {
    const today = getTodayString()
    if (this.data.rankingRewards.lastClaimedDate === today) {
      return 0
    }
    
    if (this.data.rankingRewards.claimedRanks.includes(rank)) {
      return 0
    }
    
    let rewardPoints = 0
    if (rank === 1) rewardPoints = 50
    else if (rank === 2) rewardPoints = 40
    else if (rank === 3) rewardPoints = 30
    else if (rank <= 10) rewardPoints = 20
    else if (rank <= 50) rewardPoints = 10
    else if (rank <= 100) rewardPoints = 5
    
    if (rewardPoints > 0) {
      this.data.rankingRewards.claimedRanks.push(rank)
      this.data.rankingRewards.lastClaimedDate = today
      this.data.achievementData.totalCrazyPoints += rewardPoints
      this.addPointsHistory(rewardPoints, 'signIn')
      this.saveData()
    }
    
    return rewardPoints
  }

  claimWeeklyRankingReward(rank: number): { success: boolean; points: number; title: string } {
    if (this.data.rankingRewards.weeklyClaimed) {
      return { success: false, points: 0, title: '已领取' }
    }
    
    if (rank > 100) {
      return { success: false, points: 0, title: '未达标' }
    }
    
    let rewardPoints = 0
    let title = ''
    
    if (rank === 1) {
      rewardPoints = 200
      title = '疯王'
    } else if (rank <= 10) {
      rewardPoints = 100
      title = '疯界精英'
    } else if (rank <= 100) {
      rewardPoints = 50
      title = '疯界新星'
    }
    
    if (rewardPoints > 0) {
      this.data.rankingRewards.weeklyClaimed = true
      this.data.achievementData.totalCrazyPoints += rewardPoints
      this.addPointsHistory(rewardPoints, 'signIn')
      this.saveData()
      return { success: true, points: rewardPoints, title }
    }
    
    return { success: false, points: 0, title: '未达标' }
  }

  claimMonthlyRankingReward(rank: number): { success: boolean; points: number; title: string } {
    if (this.data.rankingRewards.monthlyClaimed) {
      return { success: false, points: 0, title: '已领取' }
    }
    
    if (rank > 10) {
      return { success: false, points: 0, title: '未达标' }
    }
    
    let rewardPoints = 0
    let title = ''
    
    if (rank === 1) {
      rewardPoints = 500
      title = '疯王'
    } else if (rank <= 3) {
      rewardPoints = 300
      title = '疯界王者'
    } else if (rank <= 10) {
      rewardPoints = 150
      title = '疯界守护者'
    }
    
    if (rewardPoints > 0) {
      this.data.rankingRewards.monthlyClaimed = true
      this.data.achievementData.totalCrazyPoints += rewardPoints
      this.addPointsHistory(rewardPoints, 'signIn')
      this.saveData()
      return { success: true, points: rewardPoints, title }
    }
    
    return { success: false, points: 0, title: '未达标' }
  }

  getRankingRewardStatus(rank: number) {
    const today = getTodayString()
    const canClaimDaily = this.data.rankingRewards.lastClaimedDate !== today && 
                         !this.data.rankingRewards.claimedRanks.includes(rank)
    
    let dailyReward = 0
    if (rank === 1) dailyReward = 50
    else if (rank === 2) dailyReward = 40
    else if (rank === 3) dailyReward = 30
    else if (rank <= 10) dailyReward = 20
    else if (rank <= 50) dailyReward = 10
    else if (rank <= 100) dailyReward = 5
    
    let weeklyReward = 0
    let weeklyTitle = ''
    if (rank === 1) {
      weeklyReward = 200
      weeklyTitle = '疯王'
    } else if (rank <= 10) {
      weeklyReward = 100
      weeklyTitle = '疯界精英'
    } else if (rank <= 100) {
      weeklyReward = 50
      weeklyTitle = '疯界新星'
    }
    
    let monthlyReward = 0
    let monthlyTitle = ''
    if (rank === 1) {
      monthlyReward = 500
      monthlyTitle = '疯王'
    } else if (rank <= 3) {
      monthlyReward = 300
      monthlyTitle = '疯界王者'
    } else if (rank <= 10) {
      monthlyReward = 150
      monthlyTitle = '疯界守护者'
    }
    
    return {
      daily: {
        canClaim: canClaimDaily,
        points: dailyReward,
        claimed: this.data.rankingRewards.lastClaimedDate === today
      },
      weekly: {
        canClaim: !this.data.rankingRewards.weeklyClaimed && rank <= 100,
        points: weeklyReward,
        title: weeklyTitle,
        claimed: this.data.rankingRewards.weeklyClaimed
      },
      monthly: {
        canClaim: !this.data.rankingRewards.monthlyClaimed && rank <= 10,
        points: monthlyReward,
        title: monthlyTitle,
        claimed: this.data.rankingRewards.monthlyClaimed
      }
    }
  }
}

export const taskSystem = new TaskSystem()
export default taskSystem
