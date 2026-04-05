# 智校·AI生活助手 — Backend API

Express API server for the 「智校·AI生活助手」 WeChat Mini Program.

> 基于微信小程序的AI校园生活服务平台，围绕大学生时间管理、健康状态与校园服务需求，实现“轻应用 + 智能服务”的融合创新。

## Quick Start

```bash
cd backend
npm install
cp .env.example .env
npm run dev     # development (auto-reload)
# or
npm start       # production
```

Server runs at **http://localhost:3000**

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/ai/chat` | AI chat reply |
| GET | `/api/tasks` | List helper tasks |
| POST | `/api/tasks` | Publish a task |
| PATCH | `/api/tasks/:id/accept` | Accept a task |
| PATCH | `/api/tasks/:id/complete` | Mark task as completed |
| GET | `/api/posts` | List sanctuary posts |
| POST | `/api/posts` | Publish a post |
| PATCH | `/api/posts/:id` | Update aiReply / image |
| PATCH | `/api/posts/:id/like` | Toggle like |
| GET | `/api/events` | List campus events |
| GET | `/api/wellness` | Get wellness data |
| POST | `/api/wellness/checkin` | Record emotion check-in |
| POST | `/api/wellness/meditation` | Record meditation session |

## AI Chat

- **Without `OPENAI_API_KEY`**: Uses a built-in rule-based campus assistant (works offline)
- **With `OPENAI_API_KEY`**: Routes requests through OpenAI GPT with campus context system prompt, falls back to local if API fails

## Mini Program Configuration

In `app.js`, set `apiBase` to your server address:
```js
globalData: {
  apiBase: 'http://localhost:3000'   // local development
  // apiBase: 'https://your-domain.com'  // production
}
```

> **Note**: In WeChat DevTools, enable "不校验合法域名" for local HTTP development.
