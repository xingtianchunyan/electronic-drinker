// TTS 服务 - 优先浏览器原生语音合成，硅基流动备用

const TTS_BASE_URL = 'https://api.siliconflow.cn/v1/audio/speech'
const DEFAULT_VOICE = 'fnlp/MOSS-TTSD-v0.5:anna'

let currentAudio: HTMLAudioElement | null = null

export async function speak(text: string): Promise<void> {
  // 优先使用浏览器原生语音合成
  if (window.speechSynthesis) {
    try {
      await speakNative(text)
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
        input: text,
        voice: DEFAULT_VOICE,
        response_format: 'mp3',
        speed: 1.0
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

// 浏览器原生语音合成
export function speakNative(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('浏览器不支持语音合成'))
      return
    }

    // 取消之前的发声
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 1.0
    utterance.pitch = 1.0

    utterance.onend = () => resolve()
    utterance.onerror = (e) => {
      // 某些浏览器会在正常结束时触发 error，忽略已结束的情况
      if (e.error === 'canceled' || e.error === 'interrupted') {
        resolve()
      } else {
        reject(new Error('语音合成失败'))
      }
    }

    window.speechSynthesis.speak(utterance)
  })
}
