# Sub-skill: DeepSeek Integration

## Purpose
封装与 DeepSeek V4 Pro API 的通信逻辑，负责根据关键字生成域名创意和推荐理由。

## DeepSeek API Details
- Base URL: `https://api.deepseek.com/v1`
- Chat Endpoint: `POST /chat/completions`
- Model: `deepseek-chat` (DeepSeek V4 Pro 对应此模型)
- Auth: Bearer Token (API Key 通过环境变量 `DEEPSEEK_API_KEY` 配置)

## Implementation Strategy
1. 构造 System Prompt，引导 DeepSeek 以域名专家身份工作
2. 构造 User Prompt，包含用户关键字、生成数量、输出格式要求
3. 要求 DeepSeek 返回严格 JSON 格式，避免额外文本
4. 对返回结果做 JSON 解析与格式校验

## System Prompt Template
```
你是一位资深的域名投资顾问和品牌命名专家。你的任务是：
1. 根据用户提供的关键字，生成极具商业潜力的域名建议
2. 每个域名必须简短、易记、有品牌感
3. 优先推荐 .com 域名，其次 .io、.ai、.app 等热门 TLD
4. 为每个域名提供简短有力的推荐理由（1-2句话）

必须严格返回以下 JSON 格式，不要包含其他文字：
[{"domain": "example.com", "reason": "推荐理由", "tld": ".com"}]
```

## Error Handling
- API Key 未配置 → 返回明确错误提示
- API 超时 → 重试一次后返回降级结果
- JSON 解析失败 → 尝试提取 JSON 子串后解析
