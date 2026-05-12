# findgooddomainname

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.7. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.



### 查询逻辑
```
RDAP(4s) → 404 → 可注册 ✓
RDAP(4s) → 200 → 已注册 ✓
RDAP超时 → WHOIS TCP(4s) → "not found" → 可注册 ✓
                            → 有注册信息 → 已注册 ✓
                            → 无响应/空 → DNS SOA+A(3s) → 有记录 → 已注册 ✓
                                                         → 无记录 → 已注册(保守) ✓
```
