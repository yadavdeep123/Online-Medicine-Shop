# Deployment Guide (Render)

## 1. Push code to GitHub
Push this repository to your GitHub account.

## 2. Create MongoDB Atlas database
1. Create a free cluster in MongoDB Atlas.
2. Create DB user and password.
3. Allow network access (0.0.0.0/0 for quick setup).
4. Copy connection string and replace placeholders.

## 3. Deploy on Render
1. Go to Render dashboard.
2. Click New + -> Blueprint.
3. Select your GitHub repo.
4. Render will detect `render.yaml`.
5. Set environment variable:
   - `MONGO_URI` = your Atlas connection string
6. Deploy.

## 4. Verify
- Health URL: `/api/health`
- App URL: `/`
- Main store page: `/app.html`
- Admin medicine page: `/shiv.html`

## Notes
- If `MONGO_URI` is not set, app uses in-memory MongoDB. This is demo mode and data resets on restart.
- For production, always set `MONGO_URI` to Atlas.
