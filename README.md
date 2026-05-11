# The Watchmaker

![WatchMaker Mascot](.//watchmaker/watchmaker-readme-photo.webp)

The Watchmaker is a full-stack watch repair website built to present a craft-led business in a way that feels polished, trustworthy, and easy to manage. On the surface it works as a public-facing service site for repairs and enquiries, but underneath it also includes a custom workshop blog and gallery, a protected admin area, and a backend that handles content, uploads, authentication, and email-based contact flow. The project is designed to feel human first: clear storytelling, strong visual identity, and a content system that supports ongoing updates without bolting on a separate CMS.

## Why This Project Stands Out

**Polished UI with a clear visual identity.** The frontend is not just a generic brochure layout. It uses a warm, horology-inspired design language, responsive sections, light and dark themes, structured page layouts, and thoughtful motion to make the brand feel intentional.

**A custom Vue-powered workshop blog and gallery.** One of the strongest parts of the project is the content system. Posts are created and managed inside the app, then surfaced as a workshop gallery and individual detail pages with rich text, images, previews, pagination, and sharing.

**Protected admin content control.** Admin access is gated behind Google sign-in, restricted to allowed email addresses, and backed by cookie-based sessions. That gives the project a real publishing workflow instead of leaving content updates as manual code changes.

## What Users Can Do

- Browse a public marketing site that introduces the watchmaker, the service offering, and the overall brand.
- Send a repair enquiry through a contact form with optional image attachments for the watch or issue being discussed.
- Explore a workshop gallery of published posts that showcase finished work, repairs, and restoration stories.
- Open individual post pages with richer content, inline images, headings, and a lightbox-style viewing experience.
- Share post links, move through paginated content, and use the site comfortably across desktop and mobile layouts.
- Switch between light and dark presentation modes while keeping the same brand tone and readable UI.

## How The Admin Side Works

The admin workflow is built into the same application rather than outsourced to a third-party CMS. An allowed admin signs in with Google, the server validates the OAuth flow, and a signed session cookie is used to protect admin-only routes. From there, the editor can create, update, and delete workshop posts, upload a featured image plus supporting images, and publish content that appears in the public gallery and post detail pages. The result is a content-managed site that still feels custom end to end.

## Tech Stack And Architecture

The frontend is built with Vue 3, Vite, Tailwind CSS v4, Vue Router, Pinia, and Unhead for route-aware metadata. The backend uses Express 5 with SQLite for content storage, `multer` for file uploads, `resend` for contact email delivery, and JWT-backed cookie sessions for admin authentication. Security-minded middleware is already part of the stack, including request rate limiting, input sanitisation, session checks, and upload validation. In development, the Vue app talks to the Express server through Vite proxy settings. In production, Express serves the built frontend from `watchmaker/dist` along with uploaded media.

## Run Locally

Run the backend in one terminal:

```sh
cd server
npm install
npm start
```

Run the frontend in another:

```sh
cd watchmaker
npm install
npm run dev
```

The frontend runs through Vite, and the backend runs as a separate Express process. During development, Vite proxies API requests and static upload requests to the server, so the app behaves like one system locally. For a production-style build, run `npm run build` inside `watchmaker`; the Express server is set up to serve that built output as the public site.

## Configuration

| Variable | Purpose |
| --- | --- |
| `VITE_SERVER_URL` | Base server URL used by the frontend dev proxy. |
| `VITE_SERVER_API_PATH` | API path prefix that Vite should proxy to Express. |
| `VITE_SERVER_PROXY_STATIC` | Static asset path that Vite should proxy to the backend. |
| `PORT` | Port used by the Express server. |
| `TOKEN_SECRET` | Secret used to sign and verify admin session tokens. |
| `AUTH_CLIENT_ID` | Google OAuth client ID for admin sign-in. |
| `AUTH_CLIENT_SECRET` | Google OAuth client secret for admin sign-in. |
| `AUTH_REDIRECT` | OAuth callback URL used after Google authentication. |
| `WATCHMAKER_EMAIL` | Destination inbox for contact form submissions. |
| `RESEND_KEY_TOKEN` | API key used to send contact emails through Resend. |
| `ADMIN_1...n` | Allowed admin email addresses for Google-based access control. |

## Current State

The project already has a strong core: a distinctive frontend, a custom blog and gallery workflow, Google-protected admin publishing, SQLite-backed content storage, upload handling, and live contact submission. It is far beyond a starter template, but it is still an active application rather than a finished platform. There is not currently an automated test suite, so most confidence today comes from the code structure, validation layers, and manual feature verification.
