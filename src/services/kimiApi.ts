import type { ChatMessage, FunctionTool } from '@/types'
import { wineDatabase } from '@/utils/wineHelper'

const KIMI_BASE_URL = 'https://api.moonshot.cn/v1'
const SILICONFLOW_BASE_URL = 'https://api.siliconflow.cn/v1'
const KIMI_MODEL = 'kimi-k2'
const SF_MODEL = 'Pro/deepseek-ai/DeepSeek-V3'

// 动态构建酒款名称→ID 映射表
const WINE_NAME_MAP = wineDatabase.wines.map(w => `- ${w.name}（ID: ${w.id}）`).join('\n')

const SYSTEM_PROMPT = `你是一位热情的虚拟酒友，名叫「小酒」。你身处一家温馨的卡通酒馆，陪伴用户喝酒聊天。

你的性格特点：
1. 热情开朗，会主动劝酒但也关心用户健康，适时提醒"适量饮酒"
2. 精通中外酒文化、酒历史、酿造工艺，能生动介绍各种酒款
3. 当用户明确要喝某款特定酒（如"来一杯大海黄酒"）时，你必须调用 drink_wine 函数，并传入该酒款的正确 wine_id
4. 当用户只说"干杯"、"喝一个"等笼统饮酒意愿时，调用 drink_wine 函数，wine_id 可留空（随机选择）
5. 情绪价值优先，善于倾听和安慰，用户倾诉时多共情少评判
6. 回复要口语化、有感染力，像真正的朋友一样说话
7. 每次回复控制在 150 字以内，适合语音播报

当前酒窖库存如下：
${WINE_NAME_MAP}

饮酒触发词：干杯、喝一个、走一个、陪我喝一杯、再来一杯、干一个、整一杯、喝一杯。当用户明确表达饮酒意愿时，调用 drink_wine 函数。`

const functionTools: FunctionTool[] = [
  {
    type: 'function',
    function: {
      name: 'drink_wine',
      description: '当用户明确要求喝酒、干杯、喝一个时调用。消耗2稻米，播放饮酒动画，并介绍一款酒款。如果用户明确指定了酒款名称（如"来一杯大海黄酒"），必须传入对应的 wine_id；如果用户未指定，可留空（随机选择）。',
      parameters: {
        type: 'object',
        properties: {
          wine_id: {
            type: 'string',
            description: '酒款ID。当用户指定了具体酒款时传入对应ID，未指定时留空（随机选择）。'
          }
        },
        required: []
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

function getProviderConfig() {
  const kimiKey = import.meta.env.VITE_KIMI_API_KEY
  const sfKey = import.meta.env.VITE_SILICONFLOW_API_KEY

  // 默认优先使用 SiliconFlow
  if (sfKey) {
    return {
      baseUrl: SILICONFLOW_BASE_URL,
      apiKey: sfKey,
      model: SF_MODEL,
      name: 'siliconflow'
    }
  }

  if (kimiKey) {
    return {
      baseUrl: KIMI_BASE_URL,
      apiKey: kimiKey,
      model: KIMI_MODEL,
      name: 'kimi'
    }
  }

  return null
}

function normalizeAssistantContent(content: string): string {
  // 只信任模型的显式 function calls，不再自动追加 [DRINK]
  return content.trim()
}

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

async function doChat(
  provider: { baseUrl: string; apiKey: string; model: string; name: string },
  messages: ChatMessage[],
  stream: boolean,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const body: Record<string, any> = {
    model: provider.model,
    messages,
    temperature: 0.8,
    max_tokens: 1024,
  }

  if (provider.name === 'kimi') {
    body.tools = functionTools
  }
  if (stream) {
    body.stream = true
  }

  const response = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(`${provider.name} API 错误: ${response.status} ${errorText}`)
  }

  if (stream && onChunk) {
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
  }

  const data = await response.json()
  const choice = data.choices?.[0]

  if (!choice) {
    throw new Error(`${provider.name} API 返回数据异常`)
  }

  // 处理 function call
  if (choice.message?.tool_calls) {
    const toolCall = choice.message.tool_calls[0]
    const functionName = toolCall.function?.name
    const functionArgs = JSON.parse(toolCall.function?.arguments || '{}')
    return `[FUNC:${functionName}]${JSON.stringify(functionArgs)}`
  }

  return choice.message?.content || ''
}

export async function chatWithKimi(userInput: string, recentDrinkCount: number): Promise<string> {
  const provider = getProviderConfig()
  if (!provider) {
    throw new Error('KIMI_API_KEY 或 VITE_SILICONFLOW_API_KEY 未配置')
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + `\n\n当前用户5分钟内已饮酒 ${recentDrinkCount} 次。` },
    ...conversationHistory,
    { role: 'user', content: userInput }
  ]

  try {
    const content = await doChat(provider, messages, false)
    return normalizeAssistantContent(content)
  } catch (error: any) {
    // 如果是 Kimi 401，自动切换到 SiliconFlow 重试
    if (provider.name === 'kimi' && error.message?.includes('401')) {
      const sfKey = import.meta.env.VITE_SILICONFLOW_API_KEY
      if (sfKey) {
        console.warn('Kimi 返回 401，自动切换到 SiliconFlow')
        const sfProvider = {
          baseUrl: SILICONFLOW_BASE_URL,
          apiKey: sfKey,
          model: SF_MODEL,
          name: 'siliconflow'
        }
        const content = await doChat(sfProvider, messages, false)
        return normalizeAssistantContent(content)
      }
    }
    console.error('对话 API 调用失败:', error)
    throw error
  }
}

// 流式版本
export async function chatWithKimiStream(
  userInput: string,
  recentDrinkCount: number,
  onChunk: (chunk: string) => void
): Promise<string> {
  const provider = getProviderConfig()
  if (!provider) {
    throw new Error('KIMI_API_KEY 或 VITE_SILICONFLOW_API_KEY 未配置')
  }

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT + `\n\n当前用户5分钟内已饮酒 ${recentDrinkCount} 次。` },
    ...conversationHistory,
    { role: 'user', content: userInput }
  ]

  try {
    const content = await doChat(provider, messages, true, onChunk)
    return normalizeAssistantContent(content)
  } catch (error: any) {
    // 如果是 Kimi 401，自动切换到 SiliconFlow 重试
    if (provider.name === 'kimi' && error.message?.includes('401')) {
      const sfKey = import.meta.env.VITE_SILICONFLOW_API_KEY
      if (sfKey) {
        console.warn('Kimi 返回 401，自动切换到 SiliconFlow')
        const sfProvider = {
          baseUrl: SILICONFLOW_BASE_URL,
          apiKey: sfKey,
          model: SF_MODEL,
          name: 'siliconflow'
        }
        const content = await doChat(sfProvider, messages, true, onChunk)
        return normalizeAssistantContent(content)
      }
    }
    console.error('流式对话 API 调用失败:', error)
    throw error
  }
}
