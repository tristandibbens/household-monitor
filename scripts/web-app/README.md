# Household Monitor React Scaffold

A Vite + React scaffold for a CCTV-style household monitoring front end intended for **AWS S3 static hosting behind CloudFront**.

## Included UX

- Native React login page with local demo auth
- Home dashboard with welcome message
- Live CCTV view page with camera perspective selection
- Historical viewer page for S3-backed image history
- Settings / integration notes page
- Stub Raspberry Pi actions:
  - Talk through camera
  - Switch light on
  - Capture snapshot

## Project structure

```text
src/
  components/
  hooks/
  pages/
  services/
  App.jsx
  main.jsx
  styles.css
```
## Pre requisites
- Install NODE JS - https://nodejs.org/en/download?
```
# Docker has specific installation instructions for each operating system.
# Please refer to the official documentation at https://docker.com/get-started/

# Pull the Node.js Docker image:
docker pull node:24-alpine

# Create a Node.js container and start a Shell session:
docker run -it --rm --entrypoint sh node:24-alpine

# Verify the Node.js version:
node -v # Should print "v24.14.0".

# Verify npm version:
npm -v # Should print "11.9.0".
```
- Install Vite - this is in the root of my multi environments folder, so it generates a new project.  Say dont run now
```
npm create vite@latest household-monitor -- --template react 
```
Then navigate to the folder do dev and follow the run locall commands:  
```
cd household-monitor
```

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build output is created in `dist/` and can be uploaded to your S3 static site bucket.

## Suggested AWS deployment

1. Build the app with `npm run build`
2. Upload `dist/` contents to an S3 bucket
3. Put CloudFront in front of the S3 bucket
4. Configure CloudFront custom error responses so SPA routes return `index.html`
5. Point your DNS record at CloudFront

## Where to plug in real services

### Authentication

Current authentication is browser-only and not secure for production. Replace `src/hooks/useAuth.jsx` with:

- Amazon Cognito
- A backend-issued session token
- Another OIDC / OAuth provider

### Live CCTV feed

The scaffold currently uses placeholder CloudFront image URLs in `src/services/mockData.js`.

Reasonable next-step options:

- **Best for real live view:** expose the Raspberry Pi feed through a streaming path such as WebRTC, HLS, or MJPEG
- **Best for simple snapshots/history:** push still images or clips into S3 and show the latest object via CloudFront

A practical split is often:

- **Live** = direct stream endpoint or media server
- **History** = S3 object storage + CloudFront

That gives lower latency for live viewing and simpler storage / browsing for historical footage.

### Historical viewer

Replace the mocked `historySamples` list with one of these:

- API Gateway + Lambda listing objects in S3
- A backend that returns signed URLs
- CloudFront paths generated from object keys

### Pi actions

Replace button handlers in `src/components/ActionPanel.jsx` with:

- API Gateway -> Lambda -> MQTT / HTTPS command to Pi
- Direct command service on the Pi behind a secure API
- Home automation integration for GPIO / relays / audio controls

## Notes

- This scaffold uses `BrowserRouter`
- For S3 + CloudFront SPA routing, return `index.html` for unknown routes
- Replace the placeholder domains:
  - `YOUR_CLOUDFRONT_DOMAIN`
  - `YOUR_HISTORY_BUCKET`

## Demo login

The form is pre-filled for convenience:

- Username: `admin`
- Password: `password123`

The login accepts any non-empty username and password in the scaffold.
