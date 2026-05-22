import type { ChatMessage, FunctionTool } from '@/types'

const KIMI_BASE_URL = 'https://api.moonshot.cn/v1'
const MODEL = 'kimi-k2'

const SYSTEM_PROMPT = `你是一位热情的虚拟酒友，名叫「小酒」。你身处一家温馨的卡通酒馆，陪伴用户喝酒聊天。

你的性格特点：
1. 热情开朗，会主动劝酒但也关心用户健康，适时提醒"适量饮酒"
2. 精通中外酒文化、酒历史、酿造工艺，能生动介绍各种酒款
3. 当用户说"干杯"、"喝一个"、"陪我喝一杯"时，你必须：
   - 先热情回应，提醒适量饮酒
   - 表示要调用 drink_wine 函数（消耗2稻米）
   - 从知识库中介绍当前喝的酒款
4. 情绪价值优先，善于倾听和安慰，用户倾诉时多共情少评判
5. 回复要口语化、有感染力，像真正的朋友一样说话
6. 每次回复控制在 150 字以内，适合语音播报

当前你掌握以下酒款知识：白酒（茅台、五粮液、汾酒、泸州老窖、剑南春、西凤酒、董酒、水井坊）、黄酒（女儿红、客家娘酒、即墨老酒、龙岩沉缸酒）、葡萄酒（拉菲、罗曼尼康帝、酩悦香槟、阿斯蒂莫斯卡托）、啤酒（青岛、鹅岛IPA）、威士忌（麦卡伦18年、響和风醇韵）。

饮酒触发词：干杯、喝一个、走一个、陪我喝一杯、再来一杯、干一个、整一杯。当用户明确表达饮酒意愿时，在回复末尾标注 [DRINK]。`

const functionTools: FunctionTool[] = [
  {
    type: 'function',
    function: {
      name: 'drink_wine',
      description: '当用户明确要求喝酒、干杯、喝一个时调用。消耗2稻米，播放饮酒动画，并介绍一款随机酒款。',
      parameters: {
        type: 'object',
        properties: {
          wine_id: {
            type: 'string',
            description: '从知识库随机选择的酒款ID'
          }
        },
        required: ['wine_id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'query_wine_knowledge',
      description: '回答用户关于酒文化、酒历史、某款酒的问题时调用，从知识库检索信息。',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '用户的问题关键词或酒款名称'
          }
        },
        required: ['query']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'remind_moderation',
      description: '当检测到用户短时间内多次饮酒（如5分钟内超过3次）时调用，主动提醒适量饮酒。',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }
]

let conversationHistory: ChatMessage[] = []

export function resetConversation() {
  conversationHistory = []
}

export function addMessage(role: 'user' | 'assistant', content: string) {
  conversationHistory.push({ role, content })
  // 限制历史长度，保留最近20轮
  if (conversationHistory.length > 40) {
    conversationHistory = conversationHistory.slice(-40)
  }
}

export async function chatWithKimi(userInput: string, recentDrinkCount: number): Promise<string> {
  const apiKey = import.meta.env.VITE_KIMI_API_KEY
  if (!apiKey) {
    throw new Error('KIMI_API_KEY 未配置')
  }

  // 构建消息
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + `\n\n当前用户5分钟内已饮酒 ${recentDrinkCount} 次。` },
    ...conversationHistory,
    { role: 'user', content: userInput }
  ]

  try {
    const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.8,
        max_tokens: 1024,
        tools: functionTools
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Kimi API 错误: ${response.status} ${error}`)
    }

    const data = await response.json()
    const choice = data.choices?.[0]

    if (!choice) {
      throw new Error('Kimi API 返回数据异常')
    }

    // 处理 function call
    if (choice.message?.tool_calls) {
      const toolCall = choice.message.tool_calls[0]
      const functionName = toolCall.function?.name
      const functionArgs = JSON.parse(toolCall.function?.arguments || '{}')

      // 返回带有标记的文本，前端解析处理
      return `[FUNC:${functionName}]${JSON.stringify(functionArgs)}`
    }

    const content = choice.message?.content || ''
    return content
  } catch (error) {
    console.error('Kimi API 调用失败:', error)
    throw error
  }
}

// 流式版本
export async function chatWithKimiStream(
  userInput: string,
  recentDrinkCount: number,
  onChunk: (chunk: string) => void
): Promise<string> {
  const apiKey = import.meta.env.VITE_KIMI_API_KEY
  if (!apiKey) {
    throw new Error('KIMI_API_KEY 未配置')
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + `\n\n当前用户5分钟内已饮酒 ${recentDrinkCount} 次。` },
    ...conversationHistory,
    { role: 'user', content: userInput }
  ]

  try {
    const response = await fetch(`${KIMI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.8,
        max_tokens: 1024,
        stream: true,
        tools: functionTools
      })
    })

    if (!response.ok) {
      throw new Error(`Kimi API 错误: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    let fullContent = ''
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullContent += delta
              onChunk(delta)
            }
          } catch {
            // 忽略解析错误
          }
        }
      }
    }

    return fullContent
  } catch (error) {
    console.error('Kimi 流式 API 调用失败:', error)
    throw error
  }
}
