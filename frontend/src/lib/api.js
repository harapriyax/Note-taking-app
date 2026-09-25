const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const MAX_RETRIES = 2
const RETRY_DELAY = 1000

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function api(path, token, options = {}) {
  const url = `${API_ROOT}${path}`
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  }

  let lastError = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, config)
      const body = await response.json()

      if (!response.ok) {
        // Don't retry 4xx client errors (except 429 rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(body.message || `Request failed with status ${response.status}`)
        }
        throw new Error(body.message || `Server error ${response.status}`)
      }

      return body
    } catch (err) {
      lastError = err

      // Don't retry on client errors
      if (err.message && !err.message.includes('Server error') && !err.message.includes('fetch')) {
        throw err
      }

      // Wait before retrying (exponential backoff)
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY * Math.pow(2, attempt))
      }
    }
  }

  throw lastError || new Error('Request failed after retries')
}

// Convenience methods
export const apiGet = (path, token) => api(path, token, { method: 'GET' })
export const apiPost = (path, token, data) => api(path, token, { method: 'POST', body: JSON.stringify(data) })
export const apiPut = (path, token, data) => api(path, token, { method: 'PUT', body: JSON.stringify(data) })
export const apiDelete = (path, token) => api(path, token, { method: 'DELETE' })
