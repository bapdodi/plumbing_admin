// @vitest-environment jsdom
import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { refreshAccessToken } from './client'

describe('admin token refresh', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('coalesces concurrent refreshes into one request', async () => {
    localStorage.setItem('admin_refresh_token', 'refresh-token')
    const post = vi.spyOn(axios, 'post').mockResolvedValue({
      data: { data: { token: 'new-token', refreshToken: 'new-refresh' } },
    })

    const [first, second] = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
    ])

    expect(first).toBe('new-token')
    expect(second).toBe('new-token')
    expect(post).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('admin_token')).toBe('new-token')
  })
})
