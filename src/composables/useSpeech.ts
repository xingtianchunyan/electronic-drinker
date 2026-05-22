import { ref } from 'vue'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    AudioContext: typeof AudioContext
    webkitAudioContext: typeof AudioContext
  }
}

// 语音识别
export function useSpeechRecognition() {
  const isListening = ref(false)
  const transcript = ref('')
  const error = ref<string | null>(null)

  let recognition: any = null

  function initRecognition(): boolean {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      error.value = '浏览器不支持语音识别'
      return false
    }

    recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      isListening.value = true
      error.value = null
    }

    recognition.onresult = (event: any) => {
      transcript.value = event.results[0][0].transcript
    }

    recognition.onerror = (event: any) => {
      error.value = `语音识别错误: ${event.error}`
      isListening.value = false
    }

    recognition.onend = () => {
      isListening.value = false
    }

    return true
  }

  function start() {
    if (!recognition && !initRecognition()) {
      return
    }
    transcript.value = ''
    error.value = null
    try {
      recognition.start()
    } catch (e) {
      error.value = '启动语音识别失败'
    }
  }

  function stop() {
    if (recognition) {
      try {
        recognition.stop()
      } catch {
        // ignore
      }
    }
    isListening.value = false
  }

  return {
    isListening,
    transcript,
    error,
    start,
    stop
  }
}

// 音频录制
export function useAudioRecorder() {
  const isRecording = ref(false)
  const recordedBlob = ref<Blob | null>(null)
  const error = ref<string | null>(null)

  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      chunks = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        recordedBlob.value = new Blob(chunks, { type: 'audio/webm' })
        // 停止所有轨道
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      isRecording.value = true
      error.value = null
    } catch (e) {
      error.value = '无法访问麦克风'
      isRecording.value = false
    }
  }

  function stop() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
    isRecording.value = false
  }

  return {
    isRecording,
    recordedBlob,
    error,
    start,
    stop
  }
}

// 检查浏览器支持
export function checkBrowserSupport() {
  return {
    speechRecognition: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    speechSynthesis: !!window.speechSynthesis,
    audioContext: !!(window.AudioContext || window.webkitAudioContext)
  }
}
