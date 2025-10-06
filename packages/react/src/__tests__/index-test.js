import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import React from 'react'

import { ParallelProvider, PassportButton } from '../index'

const ParallelMock = {
  getProfile: (cb, _eb) => cb({}),
  getLoginStatus: (cb) => cb({}),
  subscribe: () => null,
  unsubscribe: () => null,
  _appendLoadContext: () => null,
}

const wrapRender = async (parallel, _children) => {
  await act(async () => {
    await render(
      <ParallelProvider parallel={Promise.resolve(parallel)}>
        <PassportButton />
      </ParallelProvider>,
    )
  })
}

test('A button to be rendered if Parallel is set', async () => {
  await wrapRender(ParallelMock, <PassportButton />)
  const anchor = screen.getByRole('button')
  expect(anchor.querySelector('img').alt).toBe('Parallel Markets login button')
})

test('No button to be rendered if Parallel is not set', async () => {
  await wrapRender(null, <PassportButton />)
  expect(screen.queryByRole('button')).toBeNull()
})

test('A warning should be displayed if loadParallel was never called', async () => {
  const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
  await act(async () => {
    await render(<PassportButton />)
  })

  expect(console.warn).toHaveBeenCalledTimes(1)
  const expected = 'You must call loadParallel and place the result in a <ParallelProvider parallel={result}> wrapper'
  expect(consoleWarnMock).toHaveBeenLastCalledWith(expected)
  consoleWarnMock.mockRestore()
})
