# Digital Ascension Group - Parallel Markets SDK Demo

A clean, simple demonstration of Parallel Markets SDK integration styled for Digital Ascension Group.

## Features

- **Clean Design**: Professional family office aesthetic inspired by DAG's branding
- **SDK Integration**: Real Parallel Markets JavaScript SDK with button integration
- **Multiple Flow Types**: Toggle between Overlay, Redirect, and Embed flows
- **Event Handling**: Demonstrates login/logout event subscriptions
- **Profile Management**: Shows how to retrieve and save user profiles

## Quick Start

### ⚡ Recommended: Use the Startup Script

```bash
cd examples/dag-demo
./start-demo.sh
```

Then open: **http://localhost:8080**

### Option 1: Python HTTP Server

```bash
cd examples/dag-demo
python3 -m http.server 8080
```

Then open: http://localhost:8080

### Option 2: Node.js Server

```bash
cd examples/dag-demo
npx serve -p 8080
```

### ⚠️ Important Notes

- **Must run on a local server** - Opening the HTML file directly won't work properly
- The demo client ID works with `localhost` URLs
- Use port 8080 for best compatibility
- GitHub Pages (`.github.io` domains) are not supported by the demo client ID

## Configuration

### ⚠️ Client ID Setup Required

The demo currently uses `demo_client_id_overlay` which is configured for `demo.parallelmarkets.com`. To use this demo:

1. **For Testing**: Visit the official demo at [safeharbor.fi/overlay](https://safeharbor.fi/overlay)

2. **For Your Domain**: Contact [Parallel Markets](https://www.parallelmarkets.com/contact) to get client credentials configured for your specific domain (e.g., `yourusername.github.io` or your custom domain)

3. **Update the Code**: Replace the client IDs in `index.html`:

```javascript
const clientIdMap = {
    'overlay': 'YOUR_OVERLAY_CLIENT_ID',   // Replace with your credentials
    'redirect': 'YOUR_REDIRECT_CLIENT_ID',
    'embed': 'YOUR_EMBED_CLIENT_ID'
};
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
