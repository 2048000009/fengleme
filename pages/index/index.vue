<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { login, getUserInfo, setToken, getToken, isLogin } from '@/api'
import { getCheckinStats, doCheckin } from '@/api'
import { storage } from '@/utils/storage'
import taskSystem from '@/utils/taskSystem'

const isCheckedIn = ref(false)
const showCertification = ref(false)
const certificationText = ref('')
const currentQuote = ref('')
const loading = ref(false)
const userInfo = ref<any>(null)
const checkinStats = ref<any>(null)
const checkinResult = ref<any>(null)
const showCelebration = ref(false)
const celebrationType = ref<'normal' | 'week' | 'month' | 'hundred'>('normal')

const CACHE_KEY = 'checkin_cache_data'
const CACHE_DATE_KEY = 'checkin_cache_date'

const checkinQuotes = [
  '签到成功！今天的你，比昨天更疯了一点 🎉',
  '恭喜签到！发疯的路上，你从不孤单 💪',
  '签到完成！今天也要元气满满地发疯哦 ✨',
  '签到成功！你的疯度已+1，继续加油 🚀',
  '签到啦！生活不易，发疯叹气 😤',
  '今日签到达成！你离疯魔在世又近了一步 😈',
  '打卡完成！今天也是优秀的一天 🌟',
  '又成功活过一天！恭喜你 🎊',
  '签到！你的坚持令人感动 😭',
  '发疯签到完毕，继续保持这种状态 🔥',
  '打卡！今天的你特别帅气/美丽 😎',
  '签到成功！今天又是充满希望的一天 ☀️',
  '又来签到了？你真的很执着啊 😏',
  '不错嘛！今天也没忘记来发疯 👍',
  '签到完成！今天的KPI已达成 ✓',
  '打卡！为了证明自己还顽强地活着 💀',
  '又活过了一天！给自己点个赞吧 👍',
  '签到！今天的疯狂指数爆表 📊',
  '打卡成功！今天的你无可替代 🌟'
]

const certificationQuotes = [
  '欢迎加入疯友联盟，从今天起你就是我们的人了 🤝',
  '疯友认证成功！持证上岗，合法发疯 📜',
  '恭喜你成为正式疯友，发疯许可证已生效 🎫',
  '新人报道！从现在开始你就是一名合格的疯友了 🎉',
  '欢迎入坑！这里没有正常人，只有更疯的人 😜',
  '恭喜加入！你的发疯之旅正式开始 🚀',
  '首次认证通过！你已经是个有身份的疯友了 💳',
  '新成员解锁！准备好迎接每天的疯狂了吗？🎮',
  '欢迎光临！疯了么大家庭又多了一位人才 🌟',
  '入盟成功！从此以后你可以光明正大地发疯了 ✨',
  '认证完成！你已获得"初级疯友"荣誉称号 🏅',
  '太棒了！第1次签到就选择了我们，眼光不错 👀',
  '首战告捷！第一次就成功了，好兆头！🎊',
  '新朋友你好！以后我们就是一起发疯的伙伴了 🤝',
  '欢迎新手！这里是你每天释放压力的秘密基地 🏰',
  '初次见面！请多关照，我们一起快乐发疯 😄',
  '新人入队！从今天开始记录你的每一步成长 📈',
  '第一签完成！万事开头难，你已经迈出第一步 💪',
  '欢迎光临！希望你在这里找到属于自己的快乐 ✨',
  '认证成功！从今天起你就是一名光荣的疯友了 🎖️',
  '太好了！又有一位小伙伴加入了我们的大家庭 👋',
  '初次签到！感谢选择"疯了么"，我们会对你负责的 😎',
  '新人报到！准备好开启你的发疯之旅了吗？🎒',
  '欢迎新成员！这里的每一天都值得期待 🌟',
  '首签达成！你的发疯档案已经建立 📁',
  '初次见面！以后每天这个时间我们不见不散 ⏰',
  '认证通过！你现在已经是一个有"证"的人了 😂',
  '欢迎加入！让我们一起在发疯的路上越走越远 🛤️',
  '新朋友你好！愿你在疯友院找到归属感 🏠',
  '首签完成！感谢信任，我们一定不负所托 🙏',
  '新人解锁！从今天起你拥有了专属的发疯身份 🆔',
  '欢迎来到！这里是专属于疯友们的快乐星球 🪐',
  '初次认证！你已经正式成为"疯了么"的一员啦 🎉',
  '新成员你好！希望每天的签到能让你开心一笑 😊',
  '首签成功！这一天值得被纪念，因为你是新的开始 🎯',
  '欢迎入伙！以后这里就是你每天必来的地方 📍',
  '新人驾到！准备好接收每日份的快乐能量了吗？⚡',
  '初次见面！很高兴认识你这位未来的超级疯友 🌟',
  '认证完毕！你现在已经是我们的人了，跑不掉了 😜',
  '欢迎新伙伴！让我们一起把发疯进行到底 🔥',
  '第一签！良好的开端是成功的一半，继续加油 💪',
  '新人你好！愿"疯了么"能成为你每天的小确幸 ☺️',
  '首签达成！感谢你的到来，让今天变得更有意义 ✨',
  '欢迎加入！从今往后，我们就是一条绳上的蚂蚱了 🐜',
  '新成员报到！以后每天这个时候记得来找我们哦 🕐',
  '初次签到！你选择了我们，我们必定让你不后悔 👍',
  '欢迎光临！这里有最懂你的疯友们等着你 👋',
  '认证成功！从此以后你的每一次签到都有人见证 📸',
  '新人入列！准备好和全国疯友一起快乐发疯了吗？🎊',
  '首签完成！这一天将被载入你的发疯史册 📖',
  '欢迎到来！希望"疯了么"能成为你每天的习惯 ☕',
  '初次见面！以后我们就是天天见的老熟人了 😆',
  '认证通过！你现在已经拥有了专属的疯友编号 #️⃣',
  '欢迎新朋友！让我们一起创造更多疯狂的回忆 🎬',
  '第一签！万事开头难，但你已经做到了！厉害 🏆',
  '新人你好！愿你在这里找到属于自己的小天地 🌍',
  '首签达成！感谢相遇，未来的日子请多指教 🙇',
  '欢迎入盟！从今天起你就是"疯了么"的一份子 ❤️',
  '新成员解锁！准备好开启你的专属发疯模式了吗？🎮',
  '初次认证！你已经正式踏入发疯的新世界 🌐',
  '欢迎光临！这里有你从未体验过的签到乐趣 🎡',
  '首签成功！感谢选择相信，我们定不负所望 🤝',
  '新人报到！从今天起你的人生多了一份快乐源泉 ⛲',
  '初次见面！很高兴认识这位未来的资深疯友 🌟',
  '认证完成！你现在已经是一个有"身份"的疯友了 😏',
  '欢迎加入！让我们一起把每一天都过得精彩纷呈 🎇',
  '新朋友你好！愿每天的签到都能给你带来好心情 ☀️',
  '首签达成！这一天标志着你新生活的开始 🆕',
  '欢迎来到！这里是治愈不开心最好的地方 💊',
  '新人驾到！准备好接收来自疯友们的热情了吗？🔥',
  '初次签到！你迈出了勇敢的第一步，为你鼓掌 👏👏',
  '欢迎入伙！以后这里就是你每天释放天性的地方 🦋',
  '新成员你好！让我们一起书写属于你的发疯传奇 📝',
  '首签完成！感谢你的勇气，选择尝试新事物 💫',
  '欢迎光临！愿"疯了么"能陪伴你度过每一个日子 🗓️',
  '初次见面！以后我们就是风雨同舟的好伙伴 ☂️',
  '认证成功！从今天起你就有了组织，不再孤单了 🤗',
  '欢迎新伙伴！让我们一起在发疯的道路上越走越远 🛣️',
  '第一签！好的开始是成功的一半，继续加油哦 💪',
  '新人你好！愿你在疯友院找到属于你的位置 🎯',
  '首签达成！感谢你的信任，这份信任弥足珍贵 💎',
  '欢迎加入！让我们一起把平凡的日子过得不平凡 ✨',
  '新成员解锁！准备好迎接属于你的精彩人生了吗？🌈',
  '初次认证！你已经正式成为"疯了么"家族的一员啦 👨‍👩‍👧‍👦',
  '欢迎到来！这里有最温暖、最有趣的疯友等你 👋',
  '首签成功！这一天值得被铭记，因为一切从这里开始 🎬',
  '欢迎入坑！警告：本APP可能导致过度上瘾、频繁傻笑等副作用 😂',
  '新人报到！准备好接受每天来自疯友们的关爱了吗？💝',
  '初次见面！以后我们就是天天见的老铁了 🤜',
  '认证完毕！你现在已经是我们重点保护对象了 😎',
  '欢迎新朋友！让我们一起把发疯变成一种生活方式 🎪',
  '第一签！千里之行始于足下，你已经踏出了第一步 🦶',
  '新人你好！愿"疯了么"能成为你每天最期待的时光 ⭐',
  '首签完成！感谢你的到来，让今天变得与众不同 🎁',
  '欢迎入盟！从今往后我们就是同一条船上的人了 ⛵',
  '新成员解锁！准备好开启你的专属疯狂之旅了吗？🗺',
  '初次签到！你已经成功激活了你的发疯基因 🧬',
  '欢迎光临！这里有最懂你的疯友们一直陪着你 👫',
  '首签达成！感谢相遇，未来的路我们一起走 🛤️',
  '欢迎加入！让我们一起把每一天都变成值得纪念的日子 📅',
  '新人驾到！准备好感受来自疯友们的热情了吗？🔥',
  '初次见面！很高兴认识这位未来的传奇疯友 🏅',
  '认证通过！你现在已经拥有了进入疯友圈的入场券 🎟️',
  '欢迎新伙伴！让我们一起创造更多美好的疯狂回忆 🎞️',
  '第1签！良好的开端是成功的一半，你已经很棒了 🥇',
  '新人你好！愿"疯了么"能成为你每天的小确幸和小惊喜 🎁',
  '首签成功！感谢选择，我们一定会让你爱上这里 💕',
  '欢迎来到！这里是专属于疯友们的快乐星球 🪐',
  '初次见面！以后我们就是天天见的老熟人了 😆',
  '认证成功！从今天起你就是"疯了么"的官方认证疯友了 👮',
  '欢迎入伙！以后这里就是你每天必须打卡的地方 📍',
  '新成员你好！准备好接收每日份的快乐能量了吗？⚡',
  '首签完成！这一天将被载入你的个人发疯史册 📖',
  '欢迎光临！希望"疯了么"能成为你生活中的一抹亮色 🌈',
  '新人解锁！从今天起你拥有了专属的发疯身份 🆔',
  '初次认证！你已经正式踏入发疯的新世界 🌐',
  '欢迎到来！这里有最懂你的疯友们在等你 👋',
  '首签成功！感谢你的勇气，选择尝试新事物 💫',
  '欢迎加入！让我们一起把每一天都过得精彩纷呈 🎇',
  '新朋友你好！愿每天的签到都能给你带来好心情 ☀️',
  '首签达成！这一天标志着你新生活的开始 🆕',
  '欢迎来到！这里是治愈不开心的最佳去处 💊',
  '新人驾到！准备好接收来自疯友们的热情了吗？🔥',
  '初次签到！你迈出了勇敢的第一步，为你鼓掌 👏👏',
  '欢迎入伙！以后这里就是你每天释放天性的地方 🦋',
  '新成员你好！让我们一起书写属于你的发疯传奇 📝',
  '首签完成！感谢你的信任，这份信任弥足珍贵 💎',
  '欢迎光临！愿"疯了么"能陪伴你度过每一个日子 🗓️',
  '初次见面！以后我们就是风雨同舟的好伙伴 ☂️',
  '认证成功！从今天起你就有了组织，不再孤单了 🤗',
  '欢迎新伙伴！让我们一起在发疯的道路上越走越远 🛣️',
  '第一签！好的开始是成功的一半，继续加油哦 💪',
  '新人你好！愿你在疯友院找到属于你的位置 🎯',
  '首签达成！感谢你的信任，这份信任弥足珍贵 💎'
]

const dailyQuotes = [
  '又活了一天，你真棒！继续坚持 💪',
  '今天的你也成功证明了自己还活着 ✨',
  '签到完成！距离成为疯魔在世又近了一步 🚀',
  '不错不错，今天也是个合格的疯友 😎',
  '连续发疯中...你的毅力令人敬佩 🔥',
  '今天的你比昨天更疯了一点，进步！📈',
  '又是元气满满的一天，继续保持 🌟',
  '签到打卡！生活不易，发完继续 😤',
  '今日份的发疯已完成，明天见 👋',
  '打卡成功！今天的KPI已完成 ✓',
  '又来签到了？你真的很执着啊 😏',
  '坚持就是胜利！你已经连续发疯N天了 🏆',
  '今天的你依然活力四射！冲鸭！💨',
  '签到！为了证明自己还顽强地活着 💀',
  '不错嘛，今天也没忘记来发疯 👍',
  '又是充满希望的一天！继续加油哦 ☀️',
  '你来了！说明今天还没放弃治疗 🏥',
  '打卡！今天的疯度值已充值到账 📱',
  '准时到达！你是时间管理大师 ⏰',
  '今天的你看起来精神不错嘛 😺',
  '又来啦？真是个勤奋的疯友 🐝',
  '签到完成！今天的你比昨天更强壮了 💪',
  '棒呆！今天的你完全没有偷懒呢 🎯',
  '今天的签到任务圆满结束！撒花 🌸',
  '又活过了一天！给自己点个赞吧 👍',
  '今天的疯狂指数：⭐⭐⭐⭐⭐',
  '打卡！距离下次发疯还有24小时 ⏳',
  '今天的你格外迷人呢～ 😏',
  '签到成功！你是最棒的疯友！不接受反驳 🙅‍♂️',
  '今天的你状态满分！继续冲冲冲！💨',
  '又见面了老朋友！今天也要开心哦 😄',
  '打卡！今天的疯言疯语已加载完毕 📝',
  '今天的你：可爱 + 疯狂 = 完美 😍',
  '签到！今天的你依然是那个最靓的崽 🐣',
  '又来报道了？你真的是个狠人 😎',
  '今天的签到成就：活着！并且很疯！🎖️',
  '打卡成功！今天的你值得被表扬 🏆',
  '今天的你：满血复活！继续战斗！⚔️',
  '又一天过去了，你还在坚持！佩服！🫡',
  '签到！今天的疯度余额充足 💰',
  '今天的你看起来心情不错呀 😊',
  '打卡！今天也是个值得纪念的日子 📅',
  '又来了！你对发疯是真爱吧 ❤️',
  '签到完成！今天的你比想象中更强大 💫',
  '今天的你：虽然疯但很有型 😎',
  '打卡！今天的你散发着自信的光芒 ✨',
  '又见面了！今天也要做最疯的那个崽 🐺',
  '签到成功！今天的你无可替代 🌟',
  '今天的你：疯得很有节奏感 🎵',
  '打卡！今天也是元气满满的一天 ☀️',
  '又来啦？你真的超爱这个APP吧 😂',
  '签到完成！今天的你特别有魅力 💃',
  '今天的你：疯并快乐着 😆',
  '打卡！今天的你值得被全世界宠爱 🌍',
  '又一天！你对签到的执念令人动容 😭',
  '签到成功！今天的你闪闪发光 ✨',
  '今天的你：越疯越快乐 🎉',
  '打卡！今天也是值得庆祝的一天 🎊',
  '又来了！你真的是签到达人 🏅',
  '签到完成！今天的你无人能敌 🥇',
  '今天的你：疯得刚刚好 😌',
  '打卡！今天的你充满了正能量 ➕',
  '又见面！今天的你看起来超棒的 👏',
  '签到成功！今天的你光芒万丈 🌟',
  '今天的你：疯得很有态度 😏',
  '打卡！今天也是精彩的一天 🎬',
  '又来啦！你真的是个超级疯友 🦸‍♀️',
  '签到完成！今天的你完美无瑕 💎',
  '今天的你：疯得很有品味 🍷',
  '打卡！今天也是美好的一天 🌈',
  '又一天！你对发疯的热情永不减退 🔥',
  '签到成功！今天的你无与伦比 👑',
  '今天的你：疯得很有水平 📈',
  '打卡！今天也是值得骄傲的一天 🎗️'
]

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

const isCacheValid = (): boolean => {
  const cacheDate = storage.get(CACHE_DATE_KEY)
  return cacheDate === getTodayDate()
}

const saveToCache = (data: any): void => {
  storage.set(CACHE_KEY, data)
  storage.set(CACHE_DATE_KEY, getTodayDate())
}

const loadFromCache = (): any | null => {
  if (!isCacheValid()) {
    return null
  }
  return storage.get(CACHE_KEY)
}

const loadData = async (forceRefresh: boolean = false) => {
  try {
    if (!forceRefresh) {
      const cachedData = loadFromCache()
      if (cachedData) {
        checkinStats.value = cachedData.stats
        isCheckedIn.value = cachedData.isCheckedIn
        userInfo.value = cachedData.userInfo
      }
    }
    
    if (isLogin()) {
      const userRes = await getUserInfo()
      userInfo.value = userRes.data
      
      const statsRes = await getCheckinStats()
      checkinStats.value = statsRes.data
      isCheckedIn.value = statsRes.data.isCheckedIn
      
      saveToCache({
        stats: statsRes.data,
        isCheckedIn: statsRes.data.isCheckedIn,
        userInfo: userRes.data
      })
    } else {
      const anonymousData = storage.get('fengleme_anonymous_data')
      if (anonymousData) {
        checkinStats.value = {
          continuousDays: anonymousData.continuousDays || 0,
          totalDays: anonymousData.totalDays || 0,
          crazyPoints: anonymousData.crazyPoints || 0,
          level: anonymousData.level || '初入疯途',
          isCheckedIn: anonymousData.isCheckedIn || false
        }
        isCheckedIn.value = anonymousData.isCheckedIn || false
      } else {
        checkinStats.value = {
          continuousDays: 0,
          totalDays: 0,
          crazyPoints: 0,
          level: '初入疯途',
          isCheckedIn: false
        }
        isCheckedIn.value = false
      }
      
      saveToCache({
        stats: checkinStats.value,
        isCheckedIn: false,
        userInfo: null
      })
    }
  } catch (e) {
    console.error('加载数据失败', e)
    if (!checkinStats.value) {
      const cachedData = loadFromCache()
      if (cachedData) {
        checkinStats.value = cachedData.stats
        isCheckedIn.value = cachedData.isCheckedIn
      }
    }
  }
}

const getCelebrationType = (continuousDays: number, totalDays: number): 'normal' | 'week' | 'month' | 'hundred' => {
  if (totalDays === 100 || totalDays % 100 === 0) return 'hundred'
  if (continuousDays >= 30) return 'month'
  if (continuousDays >= 7 && continuousDays % 7 === 0) return 'week'
  return 'normal'
}

const showCelebrationEffect = (type: 'normal' | 'week' | 'month' | 'hundred') => {
  celebrationType.value = type
  showCelebration.value = true
  
  setTimeout(() => {
    showCelebration.value = false
  }, 3000)
}

const checkIn = async () => {
  if (isCheckedIn.value) return
  
  loading.value = true
  try {
    if (isLogin()) {
      const res = await doCheckin()
      checkinResult.value = res.data
      isCheckedIn.value = true
      
      taskSystem.completeTask('signIn')
      
      checkinStats.value.continuousDays = res.data.continuousDays
      checkinStats.value.totalDays = res.data.totalDays
      checkinStats.value.crazyPoints = res.data.crazyPoints
      checkinStats.value.level = res.data.level
      
      saveToCache({
        stats: checkinStats.value,
        isCheckedIn: true,
        userInfo: userInfo.value
      })
      
      const celebType = getCelebrationType(res.data.continuousDays, res.data.totalDays)
      setTimeout(() => showCelebrationEffect(celebType), 500)
    } else {
      const anonymousData = storage.get('fengleme_anonymous_data') || {
        continuousDays: 0,
        totalDays: 0,
        crazyPoints: 0,
        level: '初入疯途',
        isCheckedIn: false,
        lastCheckinDate: ''
      }
      
      const today = new Date().toISOString().split('T')[0]
      let continuousDays = anonymousData.continuousDays
      if (anonymousData.lastCheckinDate) {
        const lastDate = new Date(anonymousData.lastCheckinDate)
        const todayDate = new Date(today)
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          continuousDays++
        } else if (diffDays > 1) {
          continuousDays = 1
        }
      } else {
        continuousDays = 1
      }
      
      const points = 15
      const newData = {
        continuousDays,
        totalDays: anonymousData.totalDays + 1,
        crazyPoints: anonymousData.crazyPoints + points,
        level: getAnonymousLevel(anonymousData.crazyPoints + points),
        isCheckedIn: true,
        lastCheckinDate: today
      }
      
      storage.set('fengleme_anonymous_data', newData)
      
      checkinResult.value = {
        continuousDays: newData.continuousDays,
        totalDays: newData.totalDays,
        crazyPoints: newData.crazyPoints,
        level: newData.level,
        points,
        message: `连续签到${newData.continuousDays}天！`,
        todayRank: Math.floor(Math.random() * 100) + 1
      }
      
      isCheckedIn.value = true
      checkinStats.value = {
        ...checkinStats.value,
        continuousDays: newData.continuousDays,
        totalDays: newData.totalDays,
        crazyPoints: newData.crazyPoints,
        level: newData.level,
        isCheckedIn: true
      }
      
      saveToCache({
        stats: checkinStats.value,
        isCheckedIn: true,
        userInfo: null
      })
      
      const celebType = getCelebrationType(newData.continuousDays, newData.totalDays)
      setTimeout(() => showCelebrationEffect(celebType), 500)
    }
    
    const randomCertIndex = Math.floor(Math.random() * certificationQuotes.length)
    const randomDailyIndex = Math.floor(Math.random() * dailyQuotes.length)
    
    if (checkinResult?.totalDays === 1 || checkinStats?.totalDays === 0) {
      certificationText.value = certificationQuotes[randomCertIndex]
    } else {
      certificationText.value = dailyQuotes[randomDailyIndex]
    }
    
    const randomQuoteIndex = Math.floor(Math.random() * checkinQuotes.length)
    currentQuote.value = checkinQuotes[randomQuoteIndex]
    
    showCertification.value = true
  } catch (e) {
    console.error('签到失败', e)
  } finally {
    loading.value = false
  }
}

const getAnonymousLevel = (points: number): string => {
  if (points >= 1000) return '疯魔在世'
  if (points >= 500) return '疯癫大师'
  if (points >= 200) return '半疯半癫'
  if (points >= 100) return '初露疯芒'
  if (points >= 50) return '疯途新秀'
  return '初入疯途'
}

const closeCertification = () => {
  showCertification.value = false
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData(true)
})
</script>

<template>
  <view class="container">
    <view v-if="showCelebration" class="celebration-overlay" :class="celebrationType">
      <view v-if="celebrationType === 'hundred'" class="celebration-content hundred">
        <text class="celebration-emoji">🎊</text>
        <text class="celebration-title">百疯老人！</text>
        <text class="celebration-desc">累计签到达到100天里程碑！</text>
        <view class="confetti-container">
          <view class="confetti" v-for="i in 20" :key="i" :style="{ left: (i * 5) + '%', animationDelay: (i * 0.1) + 's' }"></view>
        </view>
      </view>
      <view v-else-if="celebrationType === 'month'" class="celebration-content month">
        <text class="celebration-emoji">💎</text>
        <text class="celebration-title">月度疯魔！</text>
        <text class="celebration-desc">连续签到30天！太强了！</text>
        <view class="fireworks">
          <view class="firework" v-for="i in 8" :key="i" :style="{ '--angle': (i * 45) + 'deg' }"></view>
        </view>
      </view>
      <view v-else-if="celebrationType === 'week'" class="celebration-content week">
        <text class="celebration-emoji">🔥</text>
        <text class="celebration-title">周周不落！</text>
        <text class="celebration-desc">连续签到7天！坚持就是胜利！</text>
      </view>
      <view v-else class="celebration-content normal">
        <text class="celebration-emoji">🎉</text>
        <text class="celebration-title">签到成功！</text>
      </view>
    </view>

    <view class="main-section">
      <view 
        class="checkin-btn" 
        :class="{ 'checked': isCheckedIn }"
        @click="checkIn"
      >
        <view class="btn-inner">
          <image v-if="!isCheckedIn" class="btn-logo" src="/logo1.png" mode="aspectFit"></image>
          <template v-else>
            <text class="btn-icon-text">🤪</text>
            <text class="btn-label">{{ loading ? '签到中...' : '已发疯' }}</text>
          </template>
        </view>
        <text v-if="!isCheckedIn" class="btn-text">疯批签到</text>
      </view>
    </view>

    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ checkinStats?.continuousDays || 0 }}</text>
        <text class="stat-label">连续发疯天数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-number">{{ checkinStats?.crazyPoints || 0 }}</text>
        <text class="stat-label">累计疯度</text>
      </view>
    </view>

    <view class="info-card">
      <view class="info-header">
        <text class="info-title">发疯指南</text>
      </view>
      <view class="info-content">
        <text class="info-line">每日点击按钮完成发疯签到</text>
        <text class="info-line">连续2天未签到，即刻自动联系紧急联系人</text>
      </view>
    </view>

    <view class="certification-mask" v-if="showCertification" @click="closeCertification">
      <view class="checkin-result-modal" @click.stop>
        <!-- 顶部 -->
        <view class="result-header">
          <image class="result-logo" src="/logo1.png" mode="aspectFit"></image>
        </view>
        
        <!-- 主标题 -->
        <text class="result-title">🎉 签到成功！</text>
        <text class="result-subtitle">{{ certificationText }}</text>
        
        <!-- 数据卡片 -->
        <view class="data-card">
          <view class="data-row">
            <view class="data-item">
              <text class="data-value">{{ checkinResult?.level || '初入疯途' }}</text>
              <text class="data-label">当前等级</text>
            </view>
            <view class="data-divider"></view>
            <view class="data-item highlight">
              <text class="data-value">+{{ checkinResult?.points || 0 }}</text>
              <text class="data-label">获得疯度</text>
            </view>
            <view class="data-divider"></view>
            <view class="data-item">
              <text class="data-value">{{ checkinStats?.continuousDays || 0 }}</text>
              <text class="data-label">连续天数</text>
            </view>
          </view>
          
          <view class="progress-info">
            <text class="progress-text">{{ checkinResult?.message || '' }}</text>
            <text class="rank-text">你是今日第 {{ checkinResult?.todayRank || 1 }} 个发疯的疯友</text>
          </view>
        </view>
        
        <!-- 疯言疯语 -->
        <view class="quote-box">
          <text class="quote-icon">💬</text>
          <text class="quote-text">{{ currentQuote }}</text>
        </view>
        
        <!-- 关闭按钮 -->
        <view class="close-btn" @click="closeCertification">
          <text class="close-btn-text">收下 🤪</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #F5F5F7;
  display: flex;
  flex-direction: column;
  padding: 0;
  padding-top: calc(60rpx + constant(safe-area-inset-top));
  padding-top: calc(60rpx + env(safe-area-inset-top));
  padding-bottom: 120rpx;
}

.main-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 360rpx 0 40rpx;
}

.checkin-btn {
  width: 360rpx;
  height: 360rpx;
  border-radius: 50%;
  background: #22D7FF;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 40rpx rgba(34, 215, 255, 0.4), 
              0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.checked {
    background: #C0C0C0;
    opacity: 0.6;
    pointer-events: none;
  }
}

.btn-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
}

.btn-icon-text {
  font-size: 80rpx;
  margin-bottom: 8rpx;
}

.btn-logo {
  width: 160rpx;
  height: 160rpx;
  position: absolute;
  top: 90rpx;
}

.btn-label {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 700;
}

.btn-text {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: 700;
  position: absolute;
  bottom: 90rpx;
}

.stats-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 60rpx 80rpx;
  gap: 40rpx;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 56rpx;
  font-weight: 800;
  color: #22D7FF;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #8E8E93;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #E5E5EA;
}

.info-card {
  background: transparent;
  border-radius: 24rpx;
  margin: 60rpx 32rpx 0;
  padding: 32rpx;
  box-shadow: none;
}

.info-header {
  margin-bottom: 16rpx;
}

.info-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1C1C1E;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.info-line {
  font-size: 26rpx;
  color: #8E8E93;
  line-height: 1.6;
}

// 签到结果弹窗（合并版）
.certification-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 40rpx;
}

.checkin-result-modal {
  background: #fff;
  border-radius: 28rpx;
  padding: 44rpx 32rpx;
  width: 100%;
  max-width: 580rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-header {
  margin-bottom: 20rpx;
}

.result-logo {
  width: 110rpx;
  height: 110rpx;
}

.result-title {
  font-size: 38rpx;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 8rpx;
}

.result-subtitle {
  font-size: 25rpx;
  color: #888;
  text-align: center;
  line-height: 1.5;
  margin-bottom: 24rpx;
}

.data-card {
  width: 100%;
  background: linear-gradient(135deg, #22D7FF 0%, #00C8EB 100%);
  border-radius: 18rpx;
  padding: 22rpx 20rpx;
  margin-bottom: 20rpx;
}

.data-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: 18rpx;
  border-bottom: 1rpx solid rgba(255,255,255,0.25);
}

.data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  &.highlight .data-value {
    color: #FFD700;
    font-size: 38rpx;
    text-shadow: 0 2rpx 6rpx rgba(255,215,0,0.35);
  }
}

.data-value {
  font-size: 30rpx;
  font-weight: 800;
  color: #fff;
}

.data-label {
  font-size: 21rpx;
  color: rgba(255,255,255,0.85);
  margin-top: 4rpx;
}

.data-divider {
  width: 2rpx;
  height: 46rpx;
  background: rgba(255,255,255,0.25);
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
  padding-top: 14rpx;
}

.progress-text {
  font-size: 23rpx;
  color: #fff;
  font-weight: 600;
}

.rank-text {
  font-size: 21rpx;
  color: rgba(255,255,255,0.9);
}

.quote-box {
  background: #f8f8f8;
  border-radius: 14rpx;
  padding: 18rpx 20rpx;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 20rpx;
}

.quote-icon {
  font-size: 28rpx;
}

.quote-text {
  font-size: 23rpx;
  color: #555;
  text-align: center;
  line-height: 1.6;
}

.close-btn {
  width: 100%;
  height: 84rpx;
  background: linear-gradient(135deg, #FF6B6B 0%, #FF4D4F 100%);
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6rpx 20rpx rgba(255,77,79,0.3);
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.close-btn-text {
  font-size: 29rpx;
  color: #fff;
  font-weight: 700;
}

.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  
  &.normal {
    background: rgba(34, 215, 255, 0.3);
  }
  
  &.week {
    background: rgba(255, 152, 0, 0.3);
  }
  
  &.month {
    background: rgba(156, 39, 176, 0.3);
  }
  
  &.hundred {
    background: rgba(255, 215, 0, 0.4);
  }
}

.celebration-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: celebratePop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.celebration-emoji {
  font-size: 120rpx;
  margin-bottom: 20rpx;
  animation: bounce 1s ease infinite;
}

.celebration-title {
  font-size: 52rpx;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
  margin-bottom: 12rpx;
}

.celebration-desc {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.confetti {
  position: absolute;
  top: -20rpx;
  width: 16rpx;
  height: 16rpx;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border-radius: 50%;
  animation: confettiFall 2s ease-out forwards;
}

.fireworks {
  position: relative;
  width: 400rpx;
  height: 400rpx;
}

.firework {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10rpx;
  height: 10rpx;
  background: radial-gradient(circle, #FFD700, transparent);
  border-radius: 50%;
  transform: rotate(var(--angle)) translateY(-150rpx);
  animation: fireworkBurst 1s ease-out forwards;
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.5); }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30rpx); }
}

@keyframes celebratePop {
  0% { opacity: 0; transform: scale(0.3); }
  50% { transform: scale(1.1); }
  70% { transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes confettiFall {
  0% { 
    opacity: 1; 
    transform: translateY(0) rotate(0deg); 
  }
  100% { 
    opacity: 0; 
    transform: translateY(100vh) rotate(720deg); 
  }
}

@keyframes fireworkBurst {
  0% {
    opacity: 1;
    transform: rotate(var(--angle)) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateY(-200rpx) scale(2);
  }
}

.bounce-in {
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
}

.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
