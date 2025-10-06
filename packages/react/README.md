# Parallel Markets JavaScript React Components

![CI Status](https://github.com/parallel-markets/parallel-js/workflows/ci/badge.svg)
[![npm version](https://img.shields.io/npm/v/@parallelmarkets/react.svg?style=flat-square)](https://www.npmjs.com/package/@parallelmarkets/react)

This library provides a loading wrapper for the [Parallel Markets JavaScript SDK](https://developer.parallelmarkets.com/docs/javascript) with React components.

For a quick start, check out [the example React app](https://github.com/parallel-markets/parallel-js/tree/master/examples/react-webpack).

## Installation

Use `npm` to install the Parallel JS SDK module and this React library:

```sh
$> npm install --save @parallelmarkets/react @parallelmarkets/vanilla
```

## ParallelProvider

The `ParallelProvider` allows you to use our hooks and access the Parallel object in any nested component. Render a ParallelProvider at the root of your React app so that it is available everywhere you need it.

To use the `ParallelProvider`, call [loadParallel from `@parallelmarkets/vanilla`](https://www.npmjs.com/package/@parallelmarkets/vanilla) with your [configuration options](https://developer.parallelmarkets.com/docs/javascript/configuration).
The `loadParallel` function asynchronously loads the parallel.js script and initializes a Parallel object. Pass the returned Promise to `ParallelProvider`.

```js
import { loadParallel } from '@parallelmarkets/vanilla'
import { ParallelProvider } from '@parallelmarkets/react'

// Start loading the parallel library with the given configuration information. Make sure
// you call this outside of a component's render to avoid recreating a `Parallel` object
// on every render. Also - you should not "await" the resulting promise, just pass directly
// to the ParallelProvider in the "parallel" property
const parallel = loadParallel({ client_id: '123', environment: 'demo', flow_type: 'overlay' })

const App = () => (
  <ParallelProvider parallel={parallel}>
    <YourRootComponent />
  </ParallelProvider>
)

const app = document.getElementById('main')
const root = createRoot(app)
root.render(<App />)
```

> [!NOTE]
> To best leverage Parallel's fraud detection, include the call to `loadParallel` across your app/site. This allows Parallel to detect suspicious behavior that may be indicative of fraud as users interact with your website.

With `ParallelProvider` in place, you can use the `useParallel` hook in any component to get access to a number of useful properties and functions:

- `parallel`: This provides access to the [full JS SDK](https://developer.parallelmarkets.com/docs/javascript/sdk)
- `loginStatus`: The current login status of the user. This is the result of a call to [`getLoginStatus()`](https://developer.parallelmarkets.com/docs/javascript/sdk), which may be null initially until a call to the API finishes.
- `getProfile()`: A function that returns a `Promise` that will be resolved with profile information (from a call to the [Profile API](https://developer.parallelmarkets.com/docs/server/profile-api))
- `login()`: A shortcut to `parallel.login()`
- `logout()`: A shortcut to `parallel.logout()`
- `error`: Any error that resulted from getting the current login status on load

For instance:

## Initiating a Parallel Flow

This is a more complete example, showing use of the `useParallel` hook in a child component. Additionally, this example shows use of the `PassportButton` component, that, when clicked, initiates a Parallel flow. You can simply call `parallel.login()` as an alternative to showing the `PassportButton` component.

```js
import { loadParallel } from '@parallelmarkets/vanilla'
import { ParallelProvider, useParallel, PassportButton } from '@parallelmarkets/react'

const ParallelProfile = () => {
  // the parallel variable provides access to the full SDK available at
  // https://developer.parallelmarkets.com/docs/javascript/sdk
  const { parallel, loginStatus } = useParallel()

  // we may render before the loginStatus is available
  if (!loginStatus) return null

  return (
    <>
      <h1>Status: {loginStatus.status}</h2>
      {/* Only show the login button if the user hasn't logged in yet */}
      {loginStatus.status !== 'connected' ? (
        <PassportButton />
      ) : (
        <button onClick={parallel.logout}>Log Out</button>
      )}
    </>
  )
}

// start loading the parallel library with the given configuration information
// the resulting promise will be passed to the ParallelProvider
const parallel = loadParallel({ client_id: '123', environment: 'demo', flow_type: 'overlay' })

const App = () => (
  <ParallelProvider parallel={parallel}>
    <ParallelProfile />
  </ParallelProvider>
)

const root = createRoot(document.getElementById('main'))
root.render(<App />)
```

## Getting the Parallel ID

The result of any successful authentication event will include an [`authResponse`](https://developer.parallelmarkets.com/docs/javascript/events#event-callback-argument) field that indicates the status of the handoff. Once the status is `connected`, you can call the [`getProfile()`](https://developer.parallelmarkets.com/docs/javascript/sdk) function to get the Parallel ID for the user or business that completed the flow (along with other profile information). The ID can then be saved to your backend so your servers can make ongoing calls to get/update information for the user/business.

Here's an example of a few lines you can add to the example above if you want to send the profile information (including Parallel ID) to your backend.

```js
const ParallelIDSaver = () => {
  const { loginStatus, getProfile } = useParallel()

  useEffect(() => {
    if (loginStatus?.status !== 'connected') return

    // Call your backend to save the resulting ID to your backend so your server
    // can make ongoing calls to get/update information for this user/business.
    // In this example, your server would just save the resulting Parallel ID in
    // the profile information POSTed alongside the other investor profile information
    // you have stored on your backend.
    getProfile().then((profile) => {
      // assuming that getInvestorId() returns your unique ID for the user/business
      const body = JSON.stringify({ profile, internalId: getInvestorId() })
      fetch('/save-parallel-id', { method: 'POST', body })
    })
  }, [])

  // if the user hasn't connected yet or the library isn't yet loaded, we can't
  // show anything yet
  if (loginStatus?.status !== 'connected') return null

  return <p>Thanks for providing your information!</p>
}
```

## Embed Flow Type

While the "overlay" and "redirect" `flow_type` options will work fine with React, the "embed" option will not. React recreates elements on render/re-render, causing any children iframe elements to be recreated, which results in reloading the URL in the `src` attribute. This causes a reload of the Parallel experience within the iframe, which is not an ideal experience for users.

[This issue on React’s Github](https://github.com/facebook/react/issues/858) has more info about the effect. Any movement of the `iframe` element in the DOM (including recreating, as React does) will produce a re-fetching of the `src` URL of the `iframe`, resulting in a re-render of the Parallel experience.

We strongly recommend using the "overlay" `flow_type` if you're using React.
