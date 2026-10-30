# ai-project-platform

## Run locally

The app has a Vite frontend, an Express/MySQL API, and a FastAPI AI service. Start each in a separate terminal:

1. Create the MySQL database and tables by running [`server/src/db/schema.sql`](./server/src/db/schema.sql) in MySQL.
2. Copy `server/.env.example` to `server/.env` and set the MySQL credentials and a private `JWT_SECRET`.
3. Start the API:

   ```powershell
   cd server
   npm install
   npm run dev
   ```

   The API listens on `http://localhost:5000` by default, matching the frontend's API URL.
4. From `ai-service`, create the Python environment, install the dependencies, and create `.env` from `.env.example` on first setup. Set `ANTHROPIC_API_KEY` in `.env` to your own key (do not put real keys in `.env.example`), then start the AI service:

   ```powershell
   cd ai-service
   python -m venv venv
   .\venv\Scripts\python.exe -m pip install -r requirements.txt
   Copy-Item .env.example .env
   .\venv\Scripts\uvicorn.exe main:app --reload --port 8000
   ```
5. Start the frontend:

   ```powershell
   cd client
   npm install
   npm run dev
   ```