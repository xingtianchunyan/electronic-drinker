// 严格饮酒触发词检测
// 只匹配完整短语，不匹配单字 "喝"

const DRINK_TRIGGERS = [
  '干杯',
  '喝一个',
  '走一个',
  '陪我喝一杯',
  '再来一杯',
  '干一个',
  '整一杯',
  '喝一杯'
]

export function isDrinkIntent(text: string): boolean {
  if (!text || typeof text !== 'string') return false
  return DRINK_TRIGGERS.some(trigger => text.includes(trigger))
}
