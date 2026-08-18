// @vitest-environment jsdom
import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from '../api/client'
import { useAdminList } from './useAdminList'

vi.mock('../api/client', () => ({ default: { get: vi.fn() } }))

function Probe({ path }) {
  const { data } = useAdminList(path, { page: 0, size: 20 })
  return <span>{data?.totalPages ?? '-'}</span>
}

describe('useAdminList', () => {
  beforeEach(() => api.get.mockReset())

  it('uses server totalPages and cancels the superseded request', async () => {
    api.get.mockResolvedValue({ data: { data: { content: [], totalPages: 7 } } })
    const view = render(<Probe path="/admin/buildings/page" />)
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(1))
    const firstSignal = api.get.mock.calls[0][1].signal

    view.rerender(<Probe path="/admin/vendors/page" />)
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))

    expect(firstSignal.aborted).toBe(true)
    await waitFor(() => expect(view.getByText('7')).toBeTruthy())
  })
})
