# TaskTrack Frontend

Next.js 14 App Router and TypeScript frontend for TaskTrack.

## Local development

1. Install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.
3. Start the app with `npm run dev`.

## Vercel deployment

Import this repository into Vercel with the project root set to the repository root. Set the environment variable `NEXT_PUBLIC_API_URL` to the deployed backend base URL ending in `/api`, for example `https://your-api.onrender.com/api`, then deploy.

The backend must allow the deployed Vercel origin through its `FrontendUrl` setting.
