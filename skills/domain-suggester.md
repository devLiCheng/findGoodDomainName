# Skill: Domain Suggester (Main)

## Purpose
基于用户输入的关键字，利用 DeepSeek V4 Pro 大模型生成高潜力域名建议，并检查域名注册状态，最终返回分类展示的域名列表及推荐理由。

## Workflow
1. 接收用户输入的关键字（支持多个关键字，逗号或空格分隔）
2. 调用 DeepSeek V4 Pro 生成域名创意建议（含推荐理由）
3. 对每个建议的域名执行 DNS 查询判断注册状态
4. 分类整理结果：未注册（高潜力）/ 已注册（可参考）
5. 返回结构化 JSON 给前端渲染

## Sub-skills
- `deepseek-integration`: 负责与 DeepSeek V4 Pro API 通信
- `domain-checker`: 负责域名注册状态检测

## API Endpoints
- `POST /api/suggest` - 提交关键字，返回域名建议列表
- `GET /api/health` - 健康检查

## Input Schema
```json
{
  "keywords": ["ai", "tool", "platform"],
  "count": 10
}
```

## Output Schema
```json
{
  "suggestions": [
    {
      "domain": "aitoolkit.io",
      "available": true,
      "reason": "简洁有力，ai+toolkit组合直观表达产品功能，适合SaaS产品",
      "tld": ".io"
    }
  ],
  "registered": [
    {
      "domain": "aitools.com",
      "reason": "行业标杆域名，已被注册但可作为竞品参考"
    }
  ]
}
```

## Tech Stack
- Runtime: Bun
- Framework: Hono
- LLM: DeepSeek V4 Pro (deepseek-chat model)
- Frontend: Vanilla HTML + CSS + JS
