# Todo App

A todo app with **drag-and-drop** reordering and **AI features** (natural-language task extraction and "break down" into subtasks). Built with React, TypeScript, Vite, and Tailwind CSS.

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

> AI features ("Add with AI" and "Break down") need this key. The rest of the app works without it.

### 3. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## What you can do

- **Add tasks** – Type in the first input and click Add.
- **Add with AI** – Describe tasks in plain language (e.g. "Buy milk, call mom, book flight"); the app turns them into separate todos.
- **Reorder** – Drag the ⋮⋮ handle on a task to move it.
- **Complete** – Check the box to mark a task done.
- **Break down** – Click "Break down" on a task to split it into subtasks via AI.
- **Delete** – Remove a task with the Delete button.

Todos are stored in your browser (localStorage).

> **Deployed app:** The frontend is hosted on [Zephyr](https://docs.zephyr-cloud.io); the API runs on [Render](https://render.com). The server may take a few seconds to spin up after inactivity, so the first use of an AI feature ("Add with AI" or "Break down") might feel slow until it wakes up.

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

## Deployment

- **Frontend** – Deployed with [Zephyr Cloud](https://docs.zephyr-cloud.io) using `vite-plugin-zephyr`.
- **Server (API)** – Deployed on [Render](https://render.com). After a period of inactivity the Node server can go to sleep; the first request that uses the AI features ("Add with AI" or "Break down") may take a few seconds while Render spins the server back up.

---

## Tech stack

- **React** 19, **TypeScript**, **Vite** 7
- **Tailwind CSS** 4
- **@dnd-kit** for drag-and-drop
- **OpenAI** API (server-side only) for AI features

## Architecture

The OpenAI API key is used only on the server (`server/openai-api.mjs`); the frontend never receives it. The deployed frontend (Zephyr) talks to the API (Render); for local development, the dev server proxies API requests so the key stays server-side.

## Learn more

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
