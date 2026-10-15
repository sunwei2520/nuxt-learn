export default defineEventHandler(() => {
  return {
    message: 'Hello from Nuxt server!',
    timestamp: new Date().toISOString()
  }
})
