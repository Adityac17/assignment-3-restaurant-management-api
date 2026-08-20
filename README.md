# Restaurant Management API

RESTful API for restaurants, menu items, and JWT user authentication.
Node.js · Express · MongoDB (Mongoose) · JWT · bcryptjs

## Setup

```bash
npm install
cp .env.example .env      # then fill in MONGODB_URI and JWT_SECRET
npm start                 # or: npm run dev  (node --watch)
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | no (default 5000, this project uses 4000) | HTTP port |
| `NODE_ENV` | no | `development` / `production` |
| `MONGODB_URI` | **yes** | MongoDB connection string |
| `JWT_SECRET` | **yes** | Signing secret for JWTs |
| `CORS_ORIGIN` | no (default `*`) | Allowed CORS origin |

The server exits at startup if `MONGODB_URI` or `JWT_SECRET` is missing.

## Project structure

```
├── config/db.js              MongoDB connection + connection events
├── models/                   User, Restaurant, MenuItem schemas
├── routes/                   auth, restaurants, menu routers
├── controllers/              request handling + validation
├── middleware/               auth, logging, error handling
├── utils/                    ApiError, asyncHandler, response helpers
├── app.js                    Express app wiring
├── server.js                 entry point, env checks, graceful shutdown
└── postman_collection.json   importable Postman collection
```

## Response format

Success:
```json
{ "data": { }, "message": "Success", "status": 200 }
```

Error:
```json
{ "error": "Restaurant not found", "status": 404 }
```

## Authentication

`POST /login` returns a JWT valid for 24 hours. Send it on protected routes as:

```
Authorization: Bearer <token>
```

Passwords are hashed with bcryptjs (10 salt rounds) in a Mongoose pre-save hook and
are never returned in any response.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | – | Welcome message |
| POST | `/register` | – | Register a user (`username`, `email`, `password`) |
| POST | `/login` | – | Login with `email` (or `username`) + `password` → token |
| GET | `/restaurants` | – | List restaurants, paginated |
| GET | `/restaurants/top` | – | Top 5 restaurants by rating (desc) |
| GET | `/restaurants/:id` | – | Single restaurant |
| POST | `/restaurants` | ✅ | Create restaurant |
| PUT | `/restaurants/:id` | ✅ | Update restaurant |
| DELETE | `/restaurants/:id` | ✅ | Delete restaurant + its menu items |
| GET | `/restaurants/:id/menu` | – | Menu items for a restaurant |
| POST | `/restaurants/:id/menu` | ✅ | Add menu item |
| PUT | `/menu/:id` | ✅ | Update menu item |
| DELETE | `/menu/:id` | ✅ | Delete menu item |

### Query parameters on `GET /restaurants`

`page` (default 1), `limit` (default 10, max 100), `city`, `cuisine`.
The response carries `{ restaurants, pagination: { page, limit, total, pages } }`.

`/restaurants/top` is declared before `/restaurants/:id` so it is not captured by the
`:id` parameter.

## Validation rules

- `username` ≥ 3 chars, unique; `email` unique and format-checked; `password` ≥ 6 chars.
- Restaurant: `name`, `city`, `address`, `cuisine` required and non-blank; `rating` 0–5.
- Menu item: `name` required and non-blank; `price` numeric and non-negative.
- Blank / whitespace-only strings are rejected with 400.

## Status codes

| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 400 | Validation error, duplicate key, malformed ObjectId |
| 401 | Missing, malformed, invalid, or expired token; bad credentials |
| 404 | Resource or route not found |
| 500 | Unhandled server error (details logged, not exposed) |

## Behaviour notes

- Every request is logged as `[ISO_TIMESTAMP] METHOD PATH`.
- Login returns the same `Invalid credentials` message for an unknown user and a wrong
  password, so account existence is not leaked.
- Deleting a restaurant cascades to its menu items; the response reports how many were
  removed.
- All database access uses `async/await`; read-only queries use `.lean()`.
- `SIGINT` / `SIGTERM` close the HTTP server and the Mongo connection before exit.

## Testing

Import `postman_collection.json` into Postman. The login request stores the returned
token in the `token` collection variable, so the protected requests authenticate
automatically. Set the `baseUrl` variable (default `http://localhost:4000`).
