const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function api(path, token, options = {}) {
  return fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  }).then(async response => {
    const body = await response.json()
    if (!response.ok) throw new Error(body.message || 'Something went wrong')
    return body
  })
}
