import { expect, test } from '@jest/globals'
import { loadParallel } from '../index'
import { ParallelConfig } from '../types'

declare global {
  interface Window {
    config: ParallelConfig
  }
}

global.window.Parallel = {
  init: ({ on_init, ...params }: ParallelConfig) => {
    window.config = params
    on_init?.()
  },
  getLoginStatus: () => null,
  getProfile: () => null,
  login: () => null,
  logout: () => null,
  unsubscribe: () => null,
  subscribe: () => null,
  showButton: () => null,
  hideButton: () => null,
  subscribeWithButton: () => null,
  _appendLoadContext: () => null,
  _codeVersion: 'test',
  api: () => null,
  get _config() {
    return window.config
  },
}

test('Configuration is set correctly', async () => {
  const parallel = await loadParallel({
    client_id: 'test',
    flow_type: 'overlay',
  })
  expect(parallel?._config).toEqual(window.config)
})
