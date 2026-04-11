# Campus Lost & Found

## ⚠️ Important: Backend Cold Start (READ THIS)

The backend is deployed on **Render.com** and may experience a **cold start delay**. This means:

- The backend can take **2-3 minutes** to fully initialize when first accessed
- The frontend may load before the backend is ready, causing API errors
- This is normal behavior for free-tier services on Render

### How to Activate the Backend

Before using the application demo, **activate the backend** by visiting:

```
https://lost-n-found-yynf.onrender.com
```

**Wait 2-3 minutes** for the page to load completely. Once the backend is active, you can use the full application.

### If You See API Errors:

1. **Check Backend Status**: Visit `https://lost-n-found-yynf.onrender.com` 
2. **Wait**: If it's loading, wait 2-3 minutes for initialization
3. **Retry**: Once active, refresh the frontend application

---

## Project Tech Stack

- **Frontend**: Next.js with React, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Deployment**: Render.com

---

## Project Structure

- `backend/` — FastAPI Python backend with routes for items, auth, AI, and notifications
- `app/` — Next.js frontend with pages for browsing, reporting, and user records
- `components/` — React components for UI
- `lib/` — Utility functions and helpers
- `public/` — Static assets