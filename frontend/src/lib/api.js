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
          const err = new Error(body.message || `Request failed with status ${response.status}`)
          err.code = body.code
          err.status = response.status
          throw err
        }
        const err = new Error(body.message || `Server error ${response.status}`)
        err.status = response.status
        throw err
      }

      return body
    } catch (err) {
      lastError = err

      // Don't retry on client errors
      if (err.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
        throw err
      }
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
export const searchNotesApi = (token, query, params = {}) => {
  const q = encodeURIComponent(query || '')
  let url = `/notes/search?q=${q}`
  if (params.category && params.category !== 'All') url += `&category=${encodeURIComponent(params.category)}`
  if (params.trashed) url += `&trashed=${params.trashed}`
  return apiGet(url, token)
}
export const togglePinNoteApi = (token, noteId) => apiPut(`/notes/${noteId}/pin`, token, {})

/**
 * Upload multiple files directly to S3 using pre-signed URLs
 * @param {File[]} files - Array of browser File objects
 * @param {string} token - User auth Bearer token
 * @param {Function} [onFileProgress] - Callback (fileIndex, percent, fileId)
 * @returns {Promise<Array>} List of uploaded attachment objects
 */
export async function uploadAttachments(files, token, onFileProgress) {
  if (!files || files.length === 0) return []

  // 1. Request pre-signed URLs in batch from backend
  const payload = {
    files: Array.from(files).map((f) => ({
      fileName: f.name,
      fileType: f.type || (f.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      fileSize: f.size,
    })),
  }

  const res = await apiPost('/uploads/presigned-url', token, payload)
  if (!res.uploads || !Array.isArray(res.uploads)) {
    throw new Error('Failed to obtain S3 upload authorization')
  }

  // 2. Upload each file directly to S3 in parallel
  const fileArray = Array.from(files)
  const uploadPromises = res.uploads.map((uploadMeta, index) => {
    const file = fileArray[index]

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', uploadMeta.uploadUrl, true)
      xhr.setRequestHeader('Content-Type', uploadMeta.fileType)

      if (xhr.upload && onFileProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            onFileProgress(index, percent, uploadMeta.id)
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            id: uploadMeta.id,
            name: uploadMeta.originalName || uploadMeta.fileName,
            fileName: uploadMeta.fileName,
            type: uploadMeta.type, // 'image' | 'pdf'
            mimeType: uploadMeta.fileType,
            size: uploadMeta.fileSize,
            url: uploadMeta.fileUrl,
            key: uploadMeta.key,
            createdAt: uploadMeta.createdAt,
          })
        } else {
          reject(new Error(`S3 upload failed (${xhr.status}) for ${file.name}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error(`Network error during S3 upload of ${file.name}`))
      }

      xhr.send(file)
    })
  })

  return await Promise.all(uploadPromises)
}
