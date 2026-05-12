# Sub-skill: Domain Checker

## Purpose
检测域名的注册状态，判断域名是否可用（未被注册）。

## Strategy
使用 ICANN 标准的 RDAP (Registration Data Access Protocol) 协议查询域名注册状态。

### RDAP 流程
1. 从 IANA 获取 RDAP bootstrap 数据 (`https://data.iana.org/rdap/dns.json`)，将 TLD 映射到 RDAP 服务器
2. 缓存 bootstrap 数据避免重复请求
3. 查询对应 TLD 的 RDAP 服务器：`GET {server}/domain/{domain}`
4. HTTP 404 → 域名未注册（可用）
5. HTTP 200 → 域名已注册

### 降级策略
- 如果 TLD 不在 RDAP bootstrap 中 → 使用 Google DNS API 作为降级方案
- 如果 RDAP 查询超时或返回异常状态码 → 降级到 DNS 查询
- 内置常见 TLD 的 RDAP 服务器作为备用（com, net, org, app, dev, ai, io, co 等）

## 局限性
- 部分 ccTLD 可能不支持 RDAP，会降级到 DNS
- RDAP 服务商可能有频率限制
- 极少情况下 RDAP 返回陈旧数据

## Interface
```typescript
async function checkDomain(domain: string): Promise<boolean>
// returns: true = available (not registered), false = registered
```
