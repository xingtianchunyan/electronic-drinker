const BRIDGE_URL = 'http://127.0.0.1:8787'

export async function triggerVoiceBridge(): Promise<void> {
  const res = await fetch(`${BRIDGE_URL}/voice`, { method: 'POST' })
  if (!res.ok) throw new Error('语音桥接未启动')
}
