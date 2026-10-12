import { get, post, put, del } from 'aws-amplify/api'

const API_NAME = 'NoteFlowAPI'
const MAX_RETRIES = 2
const RETRY_DELAY = 1000

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generic API call using Amplify REST API (auto SigV4 signed via Identity Pool).
 * The `token` parameter is kept for backward compatibility but is NOT used —
 * Amplify handles auth automatically via the Identity Pool credentials.
 */
export async function api(path, _token, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  let lastError = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      let restOperation
      const apiOptions = {}

      // Parse body if present
      if (options.body) {
        try {
          apiOptions.body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body
        } catch {
          apiOptions.body = options.body
        }
      }

      // Add query parameters from the path (e.g., /notes?trashed=all)
      const [cleanPath, queryString] = path.split('?')
      if (queryString) {
        const params = new URLSearchParams(queryString)
        apiOptions.queryParams = Object.fromEntries(params.entries())
      }

      const reqPath = `/api${cleanPath}`

      switch (method) {
        case 'GET':
          restOperation = get({ apiName: API_NAME, path: reqPath, options: apiOptions })
          break
        case 'POST':
          restOperation = post({ apiName: API_NAME, path: reqPath, options: apiOptions })
          break
        case 'PUT':
          restOperation = put({ apiName: API_NAME, path: reqPath, options: apiOptions })
          break
        case 'DELETE':
          restOperation = del({ apiName: API_NAME, path: reqPath, options: apiOptions })
          break
        default:
          restOperation = get({ apiName: API_NAME, path: reqPath, options: apiOptions })
      }

      const { body: responseBody } = await restOperation.response
      const data = await responseBody.json()

      if (data.error) {
        const err = new Error(data.message || 'Request failed')
        err.status = data.statusCode || 400
        err.code = data.code
        throw err
      }

      return data
    } catch (err) {
      lastError = err

      // Don't retry on client errors
      if (err.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
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

// Convenience methods — `token` param kept for DashboardPage compatibility but unused
export const apiGet = (path, _token) => api(path, null, { method: 'GET' })
export const apiPost = (path, _token, data) => api(path, null, { method: 'POST', body: JSON.stringify(data) })
export const apiPut = (path, _token, data) => api(path, null, { method: 'PUT', body: JSON.stringify(data) })
export const apiDelete = (path, _token) => api(path, null, { method: 'DELETE' })
export const searchNotesApi = (_token, query, params = {}) => {
  const q = encodeURIComponent(query || '')
  let url = `/notes/search?q=${q}`
  if (params.category && params.category !== 'All') url += `&category=${encodeURIComponent(params.category)}`
  if (params.trashed) url += `&trashed=${params.trashed}`
  return apiGet(url)
}
export const togglePinNoteApi = (_token, noteId) => apiPut(`/notes/${noteId}/pin`, null, {})

/**
 * Upload multiple files directly to S3 using pre-signed URLs.
 * Step 1: Get presigned URLs via Amplify-signed API call.
 * Step 2: PUT files directly to S3 (no auth needed — URLs are pre-signed).
 */
export async function uploadAttachments(files, _token, onFileProgress) {
  if (!files || files.length === 0) return []

  // 1. Request pre-signed URLs in batch from backend (SigV4-signed via Amplify)
  const payload = {
    files: Array.from(files).map((f) => ({
      fileName: f.name,
      fileType: f.type || (f.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      fileSize: f.size,
    })),
  }

  const res = await apiPost('/uploads/presigned-url', null, payload)
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
            type: uploadMeta.type,
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
