const express = require('express')
const https = require('https')
const router = express.Router()

const AI_API_KEY  = process.env.AI_API_KEY  || ''
const AI_MODEL    = process.env.AI_MODEL    || 'MiniMax-M2.5'
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.edgefn.net/v1'

const SYSTEM_PROMPT = `你是「智校·AI生活助手」里的 AI 搭子，专为中国大学生设计。
你了解校园日常：课程、食堂、社团活动、自习室、心理健康、时间管理。
回复风格：简洁温暖、口语化，适当使用 emoji，全程使用中文，不超过 150 字。
如果需要多条建议，用①②③列出，不要 markdown 格式。`

function callMiniMax(messages, maxTokens, temperature) {
  const urlObj = new URL(AI_BASE_URL + '/chat/completions')
  const payload = JSON.stringify({
    model: AI_MODEL,
    messages,
    max_tokens: maxTokens || 400,
    temperature: temperature || 0.8
  })
  const options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`,
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 12000
  }
  return new Promise((resolve, reject) => {
    const req = https.request(options, (resHttp) => {
      let data = ''
      resHttp.on('data', chunk => { data += chunk })
      resHttp.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          const choice = parsed.choices && parsed.choices[0]
          if (!choice) return reject(new Error('No choices in response: ' + data.slice(0, 200)))
          resolve((choice.message || choice.delta || {}).content || '')
        } catch (e) { reject(e) }
      })
    })
    req.on('timeout', () => { req.destroy(); reject(new Error('MiniMax request timed out')) })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], systemPrompt = '', maxTokens = 400, temperature = 0.8 } = req.body
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required and must be a non-empty string' })
    }
    if (message.length > 500) {
      return res.status(400).json({ error: 'message too long (max 500 chars)' })
    }
    if (!Array.isArray(history)) {
      return res.status(400).json({ error: 'history must be an array' })
    }

    const sysContent = systemPrompt && systemPrompt.trim() ? systemPrompt.trim() : SYSTEM_PROMPT
    const msgs = [
      { role: 'system', content: sysContent },
      ...history
        .filter(m => m && ['user', 'bot', 'assistant'].includes(m.role) && m.content)
        .map(m => ({ role: m.role === 'bot' ? 'assistant' : m.role, content: String(m.content).slice(0, 1000) })),
      { role: 'user', content: message }
    ]

    if (!AI_API_KEY) {
      console.warn('[AI] AI_API_KEY not set in .env')
      return res.status(503).json({ error: 'AI API key not configured' })
    }

    const raw = await callMiniMax(msgs, maxTokens, temperature)
    let reply = raw
      .replace(/<think>[\s\S]*?<\/think>/gi, '')  // closed <think> blocks
      .replace(/<think>[\s\S]*/gi, '')              // unclosed <think> (no </think>)
      .trim()
    if (!reply) {
      console.warn('[AI] Reply empty after stripping think block, raw length:', raw.length)
      return res.status(502).json({ error: 'AI returned empty response after thinking' })
    }
    return res.json({ reply, source: 'minimax' })
  } catch (err) {
    console.error('[AI] MiniMax request failed:', err.message)
    res.status(502).json({ error: 'AI service error: ' + err.message })
  }
})

module.exports = router
