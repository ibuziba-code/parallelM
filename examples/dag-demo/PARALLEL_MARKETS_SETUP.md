# Parallel Markets Client Configuration

## Current Configuration

**Client Name:** Success, Inc. (DAG Demo)
**Client ID:** `iEGTAGAgN4dGVjHgc2c86`
**Environment:** Demo
**Redirect URI:** `http://localhost:8080/`

## Allowed Scopes

- ✅ `profile` - Access to user profile information
- ✅ `identity` - Identity verification data
- ✅ `accreditation_status` - Accreditation verification status

## Flow Types Configured

All three flow types work with the same redirect URI:

### 1. Overlay Flow (Recommended)
- Modal popup over your site
- Best user experience
- Uses: `http://localhost:8080/`

### 2. Redirect Flow
- Full page redirect to Parallel Markets
- Better for mobile
- Uses: `http://localhost:8080/`

### 3. Embed Flow
- Inline iframe integration
- Seamless integration
- Uses: `http://localhost:8080/`

## Testing URLs

**Local Development:**
- http://localhost:8080/ ✅

**Production:**
If you need to deploy to production, add these redirect URIs in the Parallel Markets dashboard:
- `https://yourdomain.com/`
- `https://www.yourdomain.com/`

## Adding Additional Redirect URIs

If you need to test on different ports or domains:

1. Go to [Parallel Markets Dashboard](https://app.parallelmarkets.com)
2. Navigate to: Settings → JavaScript Clients
3. Click on "Success, Inc. (DAG Demo)"
4. Click "Edit" next to Redirect URI
5. Add additional URIs (one per line):
   ```
   http://localhost:8080/
   http://localhost:3000/
   https://yourdomain.com/
   ```

## Security Notes

⚠️ **Client Secret:** `SBZvUqunXQ1peSAORDGZUKQb92D9f4y5sGrjnky4lVuf7`

- **DO NOT** commit this to public repositories
- Only needed for server-side OAuth flows
- JavaScript SDK only needs the Client ID (public)

## Current Implementation

The demo dynamically constructs the redirect URI:

```javascript
redirect_uri: window.location.origin + window.location.pathname
```

This ensures:
- ✅ Works on any configured domain
- ✅ Matches the URL in the browser
- ✅ No hardcoded URLs

## Troubleshooting

### Error: "redirect_uri was not found"

**Solution:** Make sure you're accessing the demo at exactly `http://localhost:8080/` (with the trailing slash)

### Error: "client_id invalid"

**Solution:** Double-check the client ID in the code matches the dashboard

### Button not appearing

**Solution:**
1. Check browser console for errors
2. Make sure you're running on a server (not file://)
3. Clear browser cache and hard refresh

## Contact

For issues with credentials or API access:
- Email: support@parallelmarkets.com
- Dashboard: https://app.parallelmarkets.com
