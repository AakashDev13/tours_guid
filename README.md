# Wanderly - Tourist Guide Web App

A MERN-style tourist guide. Visitors can search and filter destinations, read attractions and tips, and see reviews. Logged-in users can post reviews and save favorites. Admins can add and delete destinations.

**Stack:** React 18 (Vite) + HTML/CSS · Node.js + Express 4 · MongoDB (Mongoose) · JWT auth (bcrypt password hashing)

## Project structure

```
tourist-guide/
├── server/
│   ├── server.js            # app entry, middleware, route mounting
│   ├── seed.js              # sample data + demo accounts
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # User, Destination, Review
│   ├── middleware/          # auth (JWT), error handling, asyncHandler
│   └── routes/              # auth, destinations, reviews, users
└── client/
    ├── index.html
    ├── vite.config.js       # dev proxy: /api -> http://localhost:5000
    └── src/
        ├── main.jsx, App.jsx, api.js, constants.js, index.css
        ├── context/AuthContext.jsx
        ├── components/      # Navbar, DestinationCard, StarRating, ReviewSection, ...
        └── pages/           # Home, Destinations, DestinationDetail, Favorites, Login, Register, AdminAddDestination
```

## Prerequisites

- **Node.js 18 or newer** (check with `node -v`)
- **MongoDB**, either installed locally or a free MongoDB Atlas cluster (see Step 1)

## Step 1 - Set up the database

Pick **one** option.

### Option A: Local MongoDB

1. Install MongoDB Community Edition from https://www.mongodb.com/try/download/community
2. Start the service:
   - **Windows:** it runs as a service after install. Otherwise open Services and start "MongoDB Server".
   - **macOS (Homebrew):** `brew tap mongodb/brew && brew install mongodb-community` then `brew services start mongodb-community`
   - **Linux (systemd):** `sudo systemctl start mongod`
3. Your connection string is:
   ```
   mongodb://127.0.0.1:27017/tourist_guide
   ```

   You do not need to create the database by hand. MongoDB creates `tourist_guide` the first time data is written (the seed script in Step 3 does this).

### Option B: MongoDB Atlas (cloud, free tier)

1. Create an account at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster.
2. **Database Access** → Add a database user (username + password). Remember them.
3. **Network Access** → Add IP Address → add your current IP (or `0.0.0.0/0` for testing only).
4. **Database** → Connect → Drivers → copy the connection string and add the database name:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tourist_guide?retryWrites=true&w=majority
   ```

   If your password has special characters (`@`, `#`, `/`), URL-encode them.

## Step 2 - Configure and install the backend

```bash
cd tourist-guide/server
cp .env.example .env        # Windows: copy .env.example .env
```

Open `server/.env` and set:

```
PORT=5000
MONGO_URI=<your connection string from Step 1>
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Generate a strong secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Then install packages:

```bash
npm install
```

## Step 3 - Load sample data

```bash
npm run seed
```

This **clears** the users, destinations and reviews collections and inserts 8 destinations plus two accounts:

| Role  | Email              | Password  |
| ----- | ------------------ | --------- |
| Admin | admin@wanderly.com | Admin@123 |
| User  | demo@wanderly.com  | Demo@123  |

Change these passwords before putting the app anywhere public.

## Step 4 - Run the backend

```bash
npm run dev      # auto-restarts on changes (nodemon)
# or: npm start
```

You should see `MongoDB connected` and `API running on http://localhost:5000`. Quick check: open http://localhost:5000/api/health, which should return `{"status":"ok"}`.

## Step 5 - Run the frontend

In a **second terminal**:

```bash
cd tourist-guide/client
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` calls to port 5000, so no extra CORS setup is needed in development.

## How JWT auth works here

1. `POST /api/auth/register` or `/api/auth/login` returns `{ token, user }`.
2. The React app saves the token in `localStorage` and sends `Authorization: Bearer <token>` on every request (see `client/src/api.js`).
3. The `protect` middleware verifies the token and loads the user; `adminOnly` checks `role === 'admin'`.
4. On page reload, the app calls `GET /api/auth/me` to restore the session.

Passwords are hashed with bcrypt and never returned by the API. New sign-ups always get the `user` role. Only the seed script creates an admin.

## API reference

| Method | Endpoint                                    | Auth        | Description                                                                                      |
| ------ | ------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| POST   | `/api/auth/register`                      | -           | Create account                                                                                   |
| POST   | `/api/auth/login`                         | -           | Log in                                                                                           |
| GET    | `/api/auth/me`                            | User        | Current user                                                                                     |
| GET    | `/api/destinations`                       | -           | List. Query: `q`, `category`, `budget`, `sort` (rating/newest/name), `page`, `limit` |
| GET    | `/api/destinations/:id`                   | -           | One destination                                                                                  |
| POST   | `/api/destinations`                       | Admin       | Create                                                                                           |
| PUT    | `/api/destinations/:id`                   | Admin       | Update                                                                                           |
| DELETE | `/api/destinations/:id`                   | Admin       | Delete (also removes its reviews and favorites)                                                  |
| GET    | `/api/destinations/:id/reviews`           | -           | List reviews                                                                                     |
| POST   | `/api/destinations/:id/reviews`           | User        | Create or update your review (one per user)                                                      |
| DELETE | `/api/destinations/:id/reviews/:reviewId` | Owner/Admin | Delete a review                                                                                  |
| GET    | `/api/users/favorites`                    | User        | Saved destinations                                                                               |
| POST   | `/api/users/favorites/:destinationId`     | User        | Toggle favorite                                                                                  |

## Production build (optional)

```bash
cd client && npm run build      # outputs client/dist
```

Serve `client/dist` from any static host and point it at your API. In that case set `CLIENT_URL` on the server to the site's origin, and change `BASE` in `client/src/api.js` to your API's full URL.

## Troubleshooting

- **`MongoDB connection failed`:** the MongoDB service is not running, `MONGO_URI` is wrong, or (Atlas) your IP is not in Network Access.
- **`Missing MONGO_URI or JWT_SECRET`:** `server/.env` does not exist or is empty.
- **Login works but pages show 401:** the token expired or `JWT_SECRET` changed. Log in again.
- **Images show a placeholder:** the Unsplash image URLs in the seed data failed to load (offline or a removed photo). Edit `image` values in `seed.js` and re-seed.
- **Port already in use:** change `PORT` in `.env` and update the proxy target in `client/vite.config.js`.

## Ideas for extending it

- Edit-destination form for admins (the `PUT` endpoint already exists)
- Image upload with Multer or Cloudinary
- Trip itinerary planner per user
- Map view with Leaflet
