import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { loadParallel } from '@parallelmarkets/vanilla'
import { ParallelProvider, PassportButton, useParallel } from '@parallelmarkets/react'

// replace the client_id with your client id
const scopes = ['profile', 'accreditation_status']
const parallel = loadParallel({ client_id: 'VpbHft3b8bbKTv2LyaUVS', environment: 'demo', flow_type: 'overlay', scopes })

const ProfileBox = () => {
  const { loginStatus, getProfile } = useParallel()
  const [profileResponse, setProfileResponse] = useState(null)

  useEffect(() => {
    // if the user is now connected, then fetch profile info
    if (loginStatus?.status === 'connected' && getProfile) {
      getProfile().then(setProfileResponse)
    }
  }, [loginStatus, getProfile])

  if (!profileResponse) return null

  const { profile } = profileResponse
  const name =
    profileResponse.type === 'individual'
      ? `${profile.first_name} ${profile.last_name} <${profile.email}>`
      : `${profile.name} (business)`
  return <h3>{name}</h3>
}

const ConnectionDetails = () => {
  const { parallel, loginStatus } = useParallel()

  // we may render before the loginStatus is available
  if (!loginStatus) return null

  // if we got the status, but it's not connected, show the connection button
  if (loginStatus.status !== 'connected') return <PassportButton />

  return (
    <>
      <h2>Connection successful!</h2>
      <ProfileBox />
      <div id='response-details'>
        <h3>Authentication Response Parameters:</h3>
        <ul>
          {Object.entries(loginStatus.authResponse).map(([key, value], i) => (
            <li key={i}>
              <b>{key}:</b> {value}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={parallel.logout}>Log Out</button>
    </>
  )
}

const App = () => (
  <ParallelProvider parallel={parallel}>
    <ConnectionDetails />
  </ParallelProvider>
)

const app = document.getElementById('main')
const root = createRoot(app)
root.render(<App />)
