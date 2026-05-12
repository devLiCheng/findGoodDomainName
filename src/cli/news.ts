// CLI tool for managing news articles
// Usage: bun run src/cli/news.ts <command> [args]

const BASE_URL = process.env.ADMIN_API_URL || 'http://localhost:3000'
const TOKEN = process.env.ADMIN_TOKEN || 'admin-secret-change-me'

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
}

async function create(title: string, slug: string, content: string, summary?: string) {
  const resp = await fetch(`${BASE_URL}/api/news/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ title, slug, content, summary: summary || '' }),
  })
  const data = await resp.json()
  console.log(JSON.stringify(data, null, 2))
}

async function update(id: number, title: string, content: string, summary?: string) {
  const resp = await fetch(`${BASE_URL}/api/news/update`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id, title, content, summary: summary || '' }),
  })
  const data = await resp.json()
  console.log(JSON.stringify(data, null, 2))
}

async function remove(id: number) {
  const resp = await fetch(`${BASE_URL}/api/news/delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ id }),
  })
  const data = await resp.json()
  console.log(JSON.stringify(data, null, 2))
}

async function list(page = 1, limit = 10) {
  const resp = await fetch(`${BASE_URL}/api/news/list?page=${page}&limit=${limit}`)
  const data = await resp.json()
  console.log(JSON.stringify(data, null, 2))
}

const command = process.argv[2]
switch (command) {
  case 'create': {
    const [title, slug, content, summary] = [process.argv[3], process.argv[4], process.argv[5], process.argv[6]]
    if (!title || !slug || !content) {
      console.log('Usage: bun run src/cli/news.ts create <title> <slug> <content> [summary]')
      process.exit(1)
    }
    await create(title, slug, content, summary)
    break
  }
  case 'update': {
    const id = parseInt(process.argv[3] || '')
    const [title, content, summary] = [process.argv[4], process.argv[5], process.argv[6]]
    if (!id || !title || !content) {
      console.log('Usage: bun run src/cli/news.ts update <id> <title> <content> [summary]')
      process.exit(1)
    }
    await update(id, title, content, summary)
    break
  }
  case 'delete': {
    const id = parseInt(process.argv[3] || '')
    if (!id) {
      console.log('Usage: bun run src/cli/news.ts delete <id>')
      process.exit(1)
    }
    await remove(id)
    break
  }
  case 'list': {
    const page = parseInt(process.argv[3] || '1')
    await list(page)
    break
  }
  default:
    console.log(`
News management CLI
Usage: bun run src/cli/news.ts <command> [args]

Commands:
  create <title> <slug> <content> [summary]  - Create a news article
  update <id> <title> <content> [summary]     - Update a news article
  delete <id>                                - Delete a news article
  list [page]                                - List news articles (default page 1)

Environment:
  ADMIN_API_URL  - API base URL (default: http://localhost:3000)
  ADMIN_TOKEN    - Admin auth token (default: admin-secret-change-me)
`)
}
