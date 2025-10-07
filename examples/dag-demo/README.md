# Digital Ascension Group - Parallel Markets SDK Demo

A clean, simple demonstration of Parallel Markets SDK integration styled for Digital Ascension Group.

## Features

- **Clean Design**: Professional family office aesthetic inspired by DAG's branding
- **SDK Integration**: Real Parallel Markets JavaScript SDK with button integration
- **Multiple Flow Types**: Toggle between Overlay, Redirect, and Embed flows
- **Event Handling**: Demonstrates login/logout event subscriptions
- **Profile Management**: Shows how to retrieve and save user profiles

## Quick Start

### Option 1: Simple HTTP Server (Python)

```bash
cd dag-simple
python3 -m http.server 8000
```

Then open: http://localhost:8000

### Option 2: Simple HTTP Server (Node.js)

```bash
cd dag-simple
npx serve
```

### Option 3: Open Directly

Simply open `index.html` in your browser (some SDK features may be limited without a server).

## Configuration

Before using with real data, update the client ID in `index.html`:

```javascript
window.Parallel.init({
    client_id: 'YOUR_ACTUAL_CLIENT_ID',  // Replace this
    environment: 'production',            // Change to 'production' for live
    flow_type: currentFlowType,
    scopes: ['profile', 'accreditation_status', 'identity']
});
```

## SDK Flow Types

1. **Overlay** (Recommended): Modal overlay on the same page
2. **Redirect**: Redirects to Parallel Markets, then back
3. **Embed**: Embeds verification in an iframe

Toggle between flows using the buttons on the page.

## What the SDK Does

The Parallel Markets SDK handles:
- ✓ KYC (Know Your Customer) verification
- ✓ Accreditation status checking
- ✓ KYB (Know Your Business) for entities
- ✓ AML screening
- ✓ Document verification
- ✓ Liveness detection

**You don't need to build these flows** - they're all handled by Parallel Markets!

## Event Handling

The demo shows how to handle SDK events:

```javascript
// Login event
Parallel.subscribe('auth.login', function(response) {
    console.log('User logged in');
    // Get profile and save to your backend
});

// Logout event
Parallel.subscribe('auth.logout', function() {
    console.log('User logged out');
});
```

## Integration with Your Backend

After a user logs in, save their Parallel ID:

```javascript
Parallel.getProfile(function(profile) {
    // profile.id is the Parallel Markets ID
    // Save this to your database to link users
    saveToYourBackend(profile.id);
});
```

## Customization

### Colors (DAG Branding)
- Navy: `#0A1628`
- Gold: `#C9A961`
- Cream: `#F5F1E8`

### Fonts
- Headings: Playfair Display
- Body: Montserrat

## Demo vs Production

**Demo Mode:**
- Use `environment: 'demo'`
- Test with sample data
- No real verification

**Production Mode:**
- Use `environment: 'production'`
- Real verification
- Requires valid client ID from Parallel Markets

## Learn More

- [Parallel Markets SDK Docs](https://developer.parallelmarkets.com/docs/javascript)
- [Parallel Markets Dashboard](https://app.parallelmarkets.com)
- [iCapital](https://www.icapital.com)

---

**Built for Digital Ascension Group**
Identity Verification by Parallel Markets | An iCapital Company
