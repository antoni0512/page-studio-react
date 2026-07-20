# Page Studio

React + Vite page editor and public business page with an Express API and PostgreSQL persistence.

## Run locally

```powershell
npm install
npm start
```

Open the URL shown by Vite, normally:

- Editor: http://localhost:5173/studio
- Public page: http://localhost:5173/p/luna-interior-design

## Render deployment (single Web Service)

Create a Render PostgreSQL database, then create one Node Web Service from this repository.

```text
Build Command: npm ci && npm run build
Start Command: npm run server
```

Set these environment variables on the Web Service:

```text
DATABASE_URL=<Render PostgreSQL Internal Database URL>
NODE_VERSION=22.18.0
NODE_ENV=production
```

The Express server serves both the API and the compiled React application, so
`VITE_API_BASE_URL` should be left unset for this deployment. Render's free Web
Service filesystem is ephemeral, so files uploaded to `server/uploads` do not
persist across restarts, spin-downs, or deployments.
