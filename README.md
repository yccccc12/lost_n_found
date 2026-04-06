# Campus Lost & Found — Backend Setup

## 1) Clone the repository

```bash
git clone https://github.com/yccccc12/lost_n_found.git
cd campus-lost-and-found
```

## 2) Install backend dependencies

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate

pip install -r requirements.txt
```

## 3) Run the backend locally
Make sure you are in the backend directory
```bash
python main.py
```

*Remark*
- Backend runs locally at `http://localhost:8000` (or the port shown in the terminal).
- Access `http://localhost:8000/docs` to view the FastAPI Terminal Endpoint
- Once the code is push to github, it will be deployed using render.

## 4) Set up the frontend (Next.js)

From the project root directory:

```bash
npm install
```

### Running the frontend locally

```bash
npm run dev
```

- The frontend will run locally at `http://localhost:3000` by default.
- Make sure your backend (`python main.py`) is running on its default port (`http://localhost:8000`) unless you have set a different value.
- If you need to customize backend connections, create a `.env` file in the root directory and set `BACKEND_ENDPOINT=http://localhost:8000` (or your backend URL).
- Both frontend and backend must be running for full app functionality.

## 5) Project Structure

- `backend/` — FastAPI Python backend
- others - NextJS Frontend