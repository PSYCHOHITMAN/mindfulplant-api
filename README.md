# Mindful Plant CBT — API

The REST API backing the [Mindful Plant CBT](PSYCHOHITMAN/MindfulPlantCBT) Android app. A small
Node.js/Express service handling authentication and thought-record storage/sync, matching
the API design scoped in the app's Part 1 Planning and Design document.

**Live URL:** `https://mindfulplant-api.onrender.com`

## Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | – | Health check — returns a plain-text confirmation the service is up |
| POST | `/register` | – | Create an account. Body: `{ fullName, email, password }` → returns `{ userId, fullName, email, token }` |
| POST | `/login` | – | Body: `{ email, password }` → same response shape as register |
| POST | `/change-password` | Bearer token | Body: `{ currentPassword, newPassword }` → `{ success: true }`. Added during implementation to satisfy the app's "change settings" core requirement — not in the original 3-route Part 1 scope |
| POST | `/records` | Bearer token | Upserts a thought record (matched on `recordId`, so re-sending an already-synced record is safe). Body matches the `ThoughtRecordDto` shape → `{ recordId, success }` |
| GET | `/records` | Bearer token | Returns all thought records for the authenticated user, newest first |

All request/response bodies are JSON. Authenticated routes expect `Authorization: Bearer <token>`,
where the token is the JWT returned by `/register` or `/login`.

## Error handling

- Passwords are hashed with bcrypt before storage — never stored or logged in plain text.
- A catch-all 404 handler and a global Express error middleware guarantee every response is
  JSON, even for unmatched routes or malformed request bodies — the Android client's JSON
  parser never has to deal with an HTML error page.
- `unhandledRejection`/`uncaughtException` listeners log unexpected failures clearly in
  Render's logs rather than dying silently.
- MongoDB connection-loss events are logged for runtime visibility.

## Project structure

```
├── server.js              # Express app setup, error handling, Mongo connection
├── models/
│   ├── User.js             # fullName, email, passwordHash
│   └── ThoughtRecord.js     # recordId, userId, situation, automaticThought,
│                            # distortionType, balancedReframe, moodBefore/After, createdAt
├── middleware/
│   └── auth.js              # JWT verification, attaches req.userId
└── routes/
    ├── auth.js               # /register, /login, /change-password
    └── records.js            # /records (GET + POST)
```

## Running locally

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` — your MongoDB Atlas connection string (must include a database name,
     e.g. `.../mindfulplantcbt?...`)
   - `JWT_SECRET` — any long random string
   - `PORT` — optional, defaults to 3000
3. `npm start` (or `npm run dev` to auto-restart on file changes)
4. Visit `http://localhost:3000` — you should see "MindfulPlantCBT API is running."

## Deployment (Render)

Deployed as a Render Web Service:
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Environment variables:** `MONGODB_URI`, `JWT_SECRET` (set in Render's dashboard, never
  committed)

**Known limitation of the free tier:** the service sleeps after a period of inactivity, so the
first request after idling can take 30–60 seconds while it wakes up.

Also note: MongoDB Atlas Network Access must allow connections from anywhere (`0.0.0.0/0`),
since Render's outbound IPs aren't fixed.
