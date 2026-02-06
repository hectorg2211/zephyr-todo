# Todo App

A todo app with **drag-and-drop** reordering and **AI features** (natural-language task extraction and “break down” into subtasks). Built with React, TypeScript, Vite, and Tailwind CSS.

## Run locally

### Prerequisites

- **Node.js** 18+ (20+ recommended)
- **pnpm** (recommended) or npm

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up the API key (for AI features)

Copy the example env file and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env` and set your key:

```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

> AI features (“Add with AI” and “Break down”) need this key. The rest of the app works without it.

### 3. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## What you can do

- **Add tasks** – Type in the first input and click Add.
- **Add with AI** – Describe tasks in plain language (e.g. “Buy milk, call mom, book flight”); the app turns them into separate todos.
- **Reorder** – Drag the ⋮⋮ handle on a task to move it.
- **Complete** – Check the box to mark a task done.
- **Break down** – Click “Break down” on a task to split it into subtasks via AI.
- **Delete** – Remove a task with the Delete button.

Todos are stored in your browser (localStorage).

---

## Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `pnpm dev`     | Start dev server (with API proxy)   |
| `pnpm build`   | Type-check and build for production |
| `pnpm preview` | Serve the built app (Vite)          |
| `pnpm start`   | Serve built app + API (run after `pnpm build`) |
| `pnpm lint`    | Run ESLint                          |

**Production:** Run `pnpm build` then `pnpm start`. The app is served from `dist/` and the OpenAI API from the same server (key stays server-side).

---

## Tech stack

- **React** 19, **TypeScript**, **Vite** 7
- **Tailwind CSS** 4
- **@dnd-kit** for drag-and-drop
- **OpenAI** API (server-side only) for AI features

## Environment variables

This app follows the right split for secrets vs public config.

### Private (server only) – no `ZE_PUBLIC_`

| Variable           | Where to set it                    | Used in                |
|-------------------|------------------------------------|------------------------|
| `OPENAI_API_KEY`  | `.env` locally; **backend host** when deployed | `server/openai-api.mjs` only |

- **Never** use `ZE_PUBLIC_` for API keys, auth tokens, or any secret.
- The key is only read in Node (`process.env.OPENAI_API_KEY`) in `server/`. The frontend never sees it.
- **Local:** put `OPENAI_API_KEY` in `.env` (see “Run locally” above).
- **When the frontend is on Zephyr:** you run the API yourself (e.g. Railway, Render, Fly.io). Set `OPENAI_API_KEY` in that service’s environment, not in Zephyr. Zephyr only serves the static frontend and does not run your Node server.

### Public (safe in the client)

| Variable              | Purpose                         | When to set          |
|-----------------------|---------------------------------|----------------------|
| `ZE_PUBLIC_API_URL`   | Backend URL when app is on Zephyr | Zephyr env overrides |
| `VITE_API_URL`        | Same, for local or custom builds | `.env` or build env  |

Use these only for the **URL** of your API (e.g. `https://your-api.railway.app`), so the frontend knows where to call. No secrets here.

**Summary:**  
Frontend (Zephyr or local) → calls your API → API uses `OPENAI_API_KEY` on the server. The key stays on the backend; the frontend only needs the backend URL when it’s not same-origin.

## Zephyr Cloud

The project includes `vite-plugin-zephyr` for deploying to Zephyr Cloud. See [Zephyr Cloud docs](https://docs.zephyr-cloud.io).

## Learn more

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
