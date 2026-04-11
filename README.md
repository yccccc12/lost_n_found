# Campus Lost & Found

## 🎒 The problem

Every year, campuses manage thousands of high-value lost items—laptops, phones, wallets. Typical systems lean on centralized Web2 databases or spreadsheets. That creates real **trust gaps** and leaves universities exposed if records are changed by a rogue insider or a fraudster.

That shows up as disputed ownership, weak accountability, and no dependable way to prove who rightfully owns an item. In short, campuses lack a **transparent, verifiable system of record** for lost property.

## ✅ The solution

We built a **frictionless Web2.5 stack** (Next.js, FastAPI, MongoDB) meant for real deployment. Students sign in with a **university email**—no wallets and no crypto literacy required.

When an item is reported, we track its physical lifecycle with a simple **state machine**: **Lost → Found → Claimed**. We also support the inverse **Found → Claimed** path for direct claims.

Each action is tied to an **authenticated university identity**, which gives you:

- **Accountability** for every interaction  
- **Less fraud** through identity linkage  
- A **smooth UX** for non-technical users  

The design favors usability and practicality so real campus communities will actually adopt it.

## ⛓️ DCAI L3 integration

To make records hard to alter in secret, we use an **on-chain notarization** model. On each meaningful change, the backend **hashes the event payload** and issues a **JSON-RPC** call to the **DCAI L3 testnet**, anchoring the transition on-chain as a **tamper-evident, timestamped** record.

Blockchain is used **selectively**: not waved in users’ faces, but working in the background to strengthen **trust, transparency, and coordination**.

## 💡 Why it matters

We are not only tracking objects—we are building **digital trust infrastructure** for real-world assets. No architecture can physically stop every bad actor, but ours makes it much harder to act **anonymously** or **erase evidence**: claims stay tied to a **verified identity** and to an **immutable ledger**.

That yields a **cryptographic chain of custody**, stronger **fraud deterrence**, and a **solid audit trail** for disputes. Pairing real-world identity with blockchain-backed immutability improves outcomes for **students and institutions** while keeping the product easy to use.

That lines up with **BGA’s** vision of blockchain for real-world impact—**transparent, accountable systems**, **practical deployable tools**, and **more trust in everyday processes**.

**In one line:** every state transition is **hashed** and **anchored on DCAI L3** via the **OperatorRegistry** contract, producing a permanent, verifiable record bound to authenticated identities—**immutable by design**, **auditable by anyone**, and **built for real adoption**.

---

## What this application does

- **Browse listings** — View reported **lost** and **found** items with filters so people can search for a match before or after filing a report.
- **Report an item** — Submit a **lost-item** or **found-item** report through guided flows so the item enters the shared campus inventory.
- **Records** — List all reports and **open a record by ID** to see full detail, status (e.g. lost, found, claimed), and related actions the product supports (such as claim or match flows where implemented).
- **Authentication** — **Login** (and related session handling) so protected actions and personal views can be tied to a user when the backend requires it.
- **AI helpers** — Server routes can **parse or enrich** report-style input using configured AI services to speed up structured data entry.
- **Trust / verification** — The product explains **hashed receipts** and verification in the UI; on-chain behavior depends on your deployment and backend configuration.

For local development, point the Next.js app at your API by setting **`BACKEND_ENDPOINT`** (see `.env.example`).

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