import React from 'react'
import { renderHook, act, waitFor, waitForNextUpdate } from '@testing-library/react'
import { useParallel, ParallelProvider } from '../index'

const TestAccount = { id: 'test' }

const ParallelMock = {
  getProfile: (cb, _eb) => cb(TestAccount),
  getLoginStatus: (cb) => cb({ status: 'connected' }),
  subscribe: () => null,
  unsubscribe: () => null,
  _appendLoadContext: () => null,
  login: () => 'login mock',
  logout: () => 'logout mock',
}

const ParallelMockWithLoginError = {
  ...ParallelMock,
  getLoginStatus: (cb) => cb({ error: 'test error' }),
}

describe('The useParallel hook', () => {
  test('returns the resolved Parallel client from the context', async () => {
    const wrapper = ({ children }) => (
      <ParallelProvider parallel={Promise.resolve(ParallelMock)}>{children}</ParallelProvider>
    )
    const { result } = renderHook(() => useParallel(), { wrapper })

    // The Provider takes a Promise for the Parallel client, so we wait until its loaded
    await waitFor(() => expect(result.current).toMatchObject({ isLoaded: true }))

    // make sure the hook returns the expected shape
    expect(result.current).toMatchObject({
      isLoaded: true,
      parallel: ParallelMock,
      error: undefined,
      loginStatus: { status: 'connected' },
      getProfile: expect.any(Function),
      login: ParallelMock.login,
      logout: ParallelMock.logout,
    })
  })

  test('wraps a Promise around the getProfile callback', async () => {
    const wrapper = ({ children }) => (
      <ParallelProvider parallel={Promise.resolve(ParallelMock)}>{children}</ParallelProvider>
    )
    const { result } = renderHook(() => useParallel(), { wrapper })

    await waitFor(() => expect(result.current).toMatchObject({ isLoaded: true }))
    act(() => {
      // the getProfile Promise resolves with the user account fetched by the getProfile() callback in the Parallel client
      result.current.getProfile().then((profile) => {
        expect(profile).toMatchObject(TestAccount)
      })
    })
  })

  test('indicates a login error', async () => {
    const wrapper = ({ children }) => (
      <ParallelProvider parallel={Promise.resolve(ParallelMockWithLoginError)}>{children}</ParallelProvider>
    )
    const { result } = renderHook(() => useParallel(), { wrapper })

    // wait to load with an error status
    await waitFor(() => expect(result.current).toMatchObject({ error: 'test error' }))
    expect(result.current).toMatchObject({
      isLoaded: true,
      error: 'test error',
      loginStatus: { error: 'test error' },
    })
  })
})
