// Type declarations for Web Speech API and legacy webkit prefixes
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
    webkitAudioContext: typeof AudioContext
  }
}

export {}
