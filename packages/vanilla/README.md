# Parallel Markets JavaScript SDK ES Module

![CI Status](https://github.com/parallel-markets/parallel-js/workflows/ci/badge.svg)
[![npm version](https://img.shields.io/npm/v/@parallelmarkets/vanilla.svg?style=flat-square)](https://www.npmjs.com/package/@parallelmarkets/vanilla)

This library provides a loading wrapper for the [Parallel Markets JavaScript SDK](https://developer.parallelmarkets.com/docs/javascript) as an ES module.

For a quick start, check out [the example app](https://github.com/parallel-markets/parallel-js/tree/master/examples/webpack).

## Installation

Use `npm` to install the Parallel JS SDK module:

```sh
$> npm install --save @parallelmarkets/vanilla
```

## Usage

The `loadParallel` function returns a promise that resolves once the SDK is loaded and ready. See below for an example using the `async/await` syntax in vanilla JavaScript.

```js
import { loadParallel } from '@parallelmarkets/vanilla'

// load the parallel library with the given configuration information
const parallel = await loadParallel({ client_id: '123', environment: 'demo' })

// any element with the "parallel-login-button" class will render a button
parallel.showButton()

// at this point, all of the SDK functions can be called - i.e.,
// parallel.login(), parallel.subscribe(), etc.
```

Once the library is loaded, you can immediately utilize [the SDK](https://developer.parallelmarkets.com/docs/javascript/sdk).

### Initiating a Parallel Flow

After the Parallel SDK has been initialized (via `loadParallel()`), you can show a Parallel button or explicitly initiate a flow.

To automatically load a Parallel Passport button on your page, just follow these steps:

1. Add the HTML class `parallel-login-button` to the parent element where you want the button to appear.
1. Call `showButton()`, which will then find any elements with that class and render a login button child element for each.

For instance, to add a "Parallel Passport" button somewhere on your page:

```html
<div class="parallel-login-button"></div>
```

```js
import { loadParallel } from '@parallelmarkets/vanilla'

// wait for the loading to finish before calling any functions
const parallel = await loadParallel({ client_id: '123', environment: 'demo', flow_type: 'overlay' })

parallel.showButton()
```

Alternatively, you can provide your own button or link and call `Parallel.login()` when you're ready to send the user into an authentication flow. For instance:

```html
<a href="#" onClick="showParallelFlow()">Log in with Parallel </a>
```

```js
import { loadParallel } from '@parallelmarkets/vanilla'

// wait for the loading to finish before calling any functions
const parallel = await loadParallel({ client_id: '123', environment: 'demo', flow_type: 'overlay' })

const showParallelFlow = () => {
  parallel.login()
}
```

Upon completion, the user will be on the same page on your site where the authentication flow was initiated regardless of [`flow_type`](https://developer.parallelmarkets.com/docs/javascript/configuration). This must be the same URL as the `redirect_uri` you provided when your account was first set up. This URL must match only for the initial authentication process. After that, you can call the `getLoginStatus()` and `getProfile()` functions on any page in your domain that has the Parallel Javascript SDK loaded.

### Getting the Parallel ID

The result of any successful authentication event will include an [`authResponse`](https://developer.parallelmarkets.com/docs/javascript/events#event-callback-argument) field that indicates the status of the handoff. Once the status is `connected`, you can call the [`getProfile()`](https://developer.parallelmarkets.com/docs/javascript/sdk) function to get the Parallel ID for the user or business that completed the flow (along with other profile information). The ID can then be saved to your backend so your servers can make ongoing calls to get/update information for the user/business.

Here's an example of a few lines you can add to the example above if you want to send the profile information (including Parallel ID) to your backend.

```js
parallel.subscribe('auth.login', () => {
  parallel.getProfile((profile) => {
    // example showing structure of the profile information
    console.log("Here's the profile info:", profile)

    // Call your backend to save the resulting ID to your backend so your server
    // can make ongoing calls to get/update information for this user/business.
    // In this example, your server would just save the resulting Parallel ID in
    // the profile information POSTed alongside the other investor profile information
    // you have stored on your backend.  For example, assuming that getInvestorId() returns
    // your unique ID for the user/business:
    const body = JSON.stringify({ profile, internalId: getInvestorId() })
    fetch('/save-parallel-id', { method: 'POST', body })
  })
})
```
