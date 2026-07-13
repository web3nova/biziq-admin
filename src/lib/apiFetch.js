import { API_BASE } from './apiConfig'

function clearAuthAndRedirect() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('adminUser')
  window.location.replace('/login')
}

let refreshPromise = null

async function tryRefresh() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const newToken = data?.data?.accessToken || data?.accessToken
    if (!newToken) return null
    localStorage.setItem('accessToken', newToken)
    return newToken
  } catch {
    return null
  }
}

/**
 * Thin fetch wrapper: injects Authorization, retries once on 401 via refresh,
 * logs out and redirects to /login if refresh also fails.
 */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('accessToken')
  if (!token) return new Response(JSON.stringify({}), { status: 401 })

  const { noRedirect, ...fetchOptions } = options
  const makeRequest = (accessToken) => {
    const headers = {
      accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(fetchOptions.headers || {}),
    }
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`
    return fetch(url, { ...fetchOptions, headers })
  }

  let res = await makeRequest(token)

  if (res.status === 401) {
    if (noRedirect) return res
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => { refreshPromise = null })
    }
    const newToken = await refreshPromise
    if (newToken) {
      res = await makeRequest(newToken)
      if (res.status !== 401) return res
    }
    clearAuthAndRedirect()
    return new Promise(() => {})
  }

  return res
}
