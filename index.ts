import app from './src/app'

const port = Number(process.env.PORT) || 3000

export default {
  port,
  fetch: app.fetch,
}

console.log(`Server running at http://localhost:${port}`)
