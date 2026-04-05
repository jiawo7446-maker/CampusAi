const https = require('https')

const API_KEY  = process.env.AI_API_KEY  || ''
const MODEL    = process.env.AI_MODEL    || 'MiniMax-M2.5'
const BASE_URL = process.env.AI_BASE_URL || 'https://api.edgefn.net/v1'

/**
 * Call MiniMax-M2.5 and return the reply string.
 * @param {Array}  messages   - OpenAI-format message array
 * @param {number} maxTokens
 * @param {number} temperature
 * @returns {Promise<string>}
 */
function callAI(messages, maxTokens = 400, temperature = 0.8) {
  if (!API_KEY) return Promise.reject(new Error('AI_API_KEY not set'))
  const urlObj = new URL(BASE_URL + '/chat/completions')
  const payload = JSON.stringify({ model: MODEL, messages, max_tokens: maxTokens, temperature })
  const options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Length': Buffer.byteLength(payload)
    },
    timeout: 12000
  }
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', c => { data += c })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          const choice = parsed.choices && parsed.choices[0]
          if (!choice) return reject(new Error('No choices: ' + data.slice(0, 150)))
          const raw = (choice.message || choice.delta || {}).content || ''
          const reply = raw
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/<think>[\s\S]*/gi, '')
            .trim()
          if (!reply) return reject(new Error('AI returned empty response after stripping think block'))
          resolve(reply)
        } catch (e) { reject(e) }
      })
    })
    req.on('timeout', () => { req.destroy(); reject(new Error('AI request timed out')) })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

module.exports = { callAI }
