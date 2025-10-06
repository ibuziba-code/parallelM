import { Parallel, ParallelConfig } from './types'

export * from './types'

const V2_URL = 'https://app.parallelmarkets.com/sdk/v2/parallel.js'
let parallelPromise: Promise<Parallel | null> | undefined
let loadCalled = false

const findScript = () => {
  const scriptNodes = document.querySelectorAll(`script[src^="${V2_URL}"]`)

  return scriptNodes.length > 0 ? scriptNodes[0] : undefined
}

const addScript = () => {
  const script = document.createElement('script')
  script.src = V2_URL

  const headOrBody = document.head || document.body
  if (!headOrBody) throw new Error('Parallel JS cannot be added to page with no <head/> or <body/> element')

  headOrBody.appendChild(script)
  return script
}

const loadScript = () => {
  // Load parallel script at most once
  if (parallelPromise !== undefined) return parallelPromise

  parallelPromise = new Promise((resolve, reject) => {
    // if we were imported on a server immediately return
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }

    if (window.Parallel) {
      resolve(window.Parallel)
      return
    }

    try {
      let script = findScript()
      if (!script) script = addScript()

      script.addEventListener('load', () => {
        if (window.Parallel) {
          resolve(window.Parallel)
        } else {
          reject(new Error('Parallel JS SDK is not available'))
        }
      })

      script.addEventListener('error', () => {
        reject(new Error('Failed to load Parallel JS SDK'))
      })
    } catch (error) {
      reject(error)
    }
  })

  return parallelPromise
}

export const loadParallel = (config: ParallelConfig): Promise<Parallel | null> => {
  if (loadCalled) {
    const error = new Error('You cannot call loadParallel more than once')
    return Promise.reject(error)
  }

  loadCalled = true

  return loadScript().then((Parallel) => {
    if (!Parallel) return Promise.resolve(null)

    return new Promise((resolve) => {
      // Resolve the initialized Parallel object upon init
      const onInit = () => resolve(Parallel)
      // The `raw_config` option lets you pass in extra values that aren't described in the ParallelConfig type
      // such as upcoming features that are being tested.
      const baseConfig = config.raw_config ?? {}
      const rawlessConfig = { ...config }
      delete rawlessConfig.raw_config
      const parallelConfig = { ...baseConfig, ...rawlessConfig }
      Parallel.init({ ...parallelConfig, on_init: onInit })
      Parallel._appendLoadContext(`${process.env.PACKAGE_NAME} ${process.env.PACKAGE_VERSION}`)
    })
  })
}

// Wait a tick and then try to load the script. This is done
// to load the SDK upon library import.
Promise.resolve()
  .then(() => loadScript())
  .catch(console.warn)
