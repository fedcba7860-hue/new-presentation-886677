# Skin Decode — fixed database/start configuration

The existing website pages, styling, navigation, account flows, product images, and client-side content have been kept unchanged. The root `package.json` now includes a working `start` script so the project can be started from the project root.

## Run locally

Requires Node.js 22.13+.

```powershell
npm install
npm start
```

Open http://localhost:3000

If port 3000 is already occupied, stop the existing copy of the server or set `PORT=3001` before starting.

## Database persistence on Render

The app uses Node's built-in SQLite (`node:sqlite`). For registrations to persist across Render deploys/restarts, attach a **persistent disk** to the Render web service with mount path `/var/data`. The server will use `/var/data/skin-decode.db` when Render is detected and `/var/data` exists. You can also explicitly set `DATABASE_PATH`.

On the first start with an empty persistent disk, the server copies the bundled `skin-decode.db` once. It does not overwrite a database that already exists on the disk.

Important: Render's filesystem without a persistent disk is ephemeral. Registrations stored only in an old ephemeral deployment cannot be recovered by this code automatically. Export/backup that database before replacing the old deployment if those registrations must be retained.

## Render settings

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Node version: 22.13 or newer
- Add a persistent disk mounted at `/var/data`
