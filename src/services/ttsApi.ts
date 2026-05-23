// TTS 服务 - 优先浏览器原生语音合成，硅基流动备用

const TTS_BASE_URL = 'https://api.siliconflow.cn/v1/audio/speech'
const DEFAULT_VOICE_FEMALE = 'fnlp/MOSS-TTSD-v0.5:anna'
const DEFAULT_VOICE_MALE = 'fnlp/MOSS-TTSD-v0.5:alex'

let currentAudio: HTMLAudioElement | null = null

/** 根据性别获取对应 voice */
function getSiliconFlowVoice(gender: 'female' | 'male'): string {
  return gender === 'male' ? DEFAULT_VOICE_MALE : DEFAULT_VOICE_FEMALE
}

/** 过滤 emoji 和零宽字符，避免 TTS 读出奇怪符号 */
function sanitizeForTTS(text: string): string {
  return text
    .replace(/[\uD83C-\uD83E][\uDC00-\uDFFF]/g, '')
    .replace(/[\u2600-\u26FF]/g, '')
    .replace(/[\u2700-\u27BF]/g, '')
    .replace(/[\uFE00-\uFE0F]/g, '')
    .replace(/\u200D/g, '')
    .trim()
}

/** 文本情感化预处理：加语气词、短句化、让语音更自然 */
function emotionText(text: string): string {
  return text
    // 把生硬的句号在某些地方变成逗号+停顿感
    .replace(/。/g, '，')
    // 把连续逗号整理
    .replace(/，，/g, '，')
    // 句尾加适当的语气词（随机，增加变化）
    .replace(/，$/g, () => {
      const particles = ['呢', '啊', '啦', '哟', '哈']
      return '，' + particles[Math.floor(Math.random() * particles.length)]
    })
    // 在"吧""呢"前加短暂停顿
    .replace(/([呢啊啦吧哟哈])/g, '，$1')
    // 把过长的逗号链整理
    .replace(/，，/g, '，')
    .trim()
}

export async function speak(text: string, gender: 'female' | 'male' = 'female'): Promise<void> {
  const cleanText = sanitizeForTTS(text)
  if (!cleanText) return

  // 文本情感化处理
  const emotionalText = emotionText(cleanText)

  // 优先使用浏览器原生语音合成
  if (window.speechSynthesis) {
    try {
      await speakNative(emotionalText, gender)
      return
    } catch (e) {
      console.warn('原生语音合成失败，尝试 SiliconFlow:', e)
    }
  }

  // 备用：SiliconFlow API
  const apiKey = import.meta.env.VITE_SILICONFLOW_API_KEY
  if (!apiKey) {
    console.warn('SILICONFLOW_API_KEY 未配置，跳过语音合成')
    return
  }

  // 停止之前的播放
  stopSpeaking()

  try {
    const response = await fetch(TTS_BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'fnlp/MOSS-TTSD-v0.5',
        input: emotionalText,
        voice: getSiliconFlowVoice(gender),
        response_format: 'mp3',
        speed: gender === 'male' ? 0.9 : 1.05
      })
    })

    if (!response.ok) {
      throw new Error(`TTS API 错误: ${response.status}`)
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudio = audio

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url)
        currentAudio = null
        resolve()
      }
      audio.onerror = () => {
        URL.revokeObjectURL(url)
        currentAudio = null
        reject(new Error('音频播放失败'))
      }
      audio.play().catch(reject)
    })
  } catch (error) {
    console.error('语音合成失败:', error)
    throw error
  }
}

export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}

export function isSpeaking(): boolean {
  return currentAudio !== null && !currentAudio.paused
}

/** 根据 gender 选择浏览器原生 voice */
function getNativeVoice(gender: 'female' | 'male'): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  const zhVoices = voices.filter(v => v.lang.startsWith('zh'))
  if (zhVoices.length === 0) return null

  // 优先根据 name 判断性别
  const femalePatterns = /female|girl|woman|xiaoxiao|xiaoyi|xiulan|晓晓|晓伊|晓涵|云希/i
  const malePatterns = /male|boy|man|yunxi|yunyang|yunjian|云扬|云健/i

  if (gender === 'female') {
    const v = zhVoices.find(v => femalePatterns.test(v.name))
    if (v) return v
  } else {
    const v = zhVoices.find(v => malePatterns.test(v.name))
    if (v) return v
  }

  //  fallback：第一个中文 voice
  return zhVoices[0]
}

// 浏览器原生语音合成
export function speakNative(text: string, gender: 'female' | 'male' = 'female'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('浏览器不支持语音合成'))
      return
    }

    // 取消之前的发声
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'

    // 选择 voice
    const voice = getNativeVoice(gender)
    if (voice) utterance.voice = voice

    // 根据性别调整参数
    if (gender === 'male') {
      utterance.rate = 0.88   // 稍慢，沉稳
      utterance.pitch = 0.82  // 偏低
    } else {
      utterance.rate = 1.05   // 稍快，活泼
      utterance.pitch = 1.12  // 偏高
    }

    utterance.onend = () => resolve()
    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') {
        resolve()
      } else {
        reject(new Error('语音合成失败'))
      }
    }

    window.speechSynthesis.speak(utterance)
  })
}

/** 预加载浏览器 voice 列表（Chrome 需要用户交互后加载） */
export function preloadVoices(): void {
  if (!window.speechSynthesis) return
  if (window.speechSynthesis.getVoices().length > 0) return
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices()
  }
}
