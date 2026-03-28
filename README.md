## Financial Decoder AI

AI-powered financial intelligence web application for analysing Indian financial PDF reports, chatting with documents, comparing companies and visualising key metrics.

### 1. Backend setup

- **Requirements**: Python 3.10+, Java (for Tabula / Camelot if table extraction is enabled).

```bash
cd financial-decoder-ai/backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create and edit `.env` in the project root (already scaffolded):

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=models/gemini-1.5-flash
GEMINI_EMBEDDING_MODEL=models/text-embedding-004
LOG_LEVEL=INFO
ENV=development
```

Run the backend:

```bash
cd financial-decoder-ai/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

FastAPI will be available at `http://localhost:8000` (health check: `GET /health`).

### 2. Frontend setup

- **Requirements**: Node.js 18+ and npm or pnpm.

```bash
cd financial-decoder-ai/frontend
npm install
npm run dev
```

The React UI will run at `http://localhost:3000`.

### 3. Core API endpoints

- **Upload financial document**

```bash
curl -X POST "http://localhost:8000/api/upload" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample_report.pdf"
```

- **Financial analysis**

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "raw_text": "....",
    "tables": [[{"col1": "value"}]],
    "metrics": {"revenue": 1000.0}
  }'
```

- **Chat with document (RAG)**

```bash
curl -X POST "http://localhost:8000/api/chat" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "question=What are the key risks discussed?" \
  -F "file=@sample_report.pdf"
```

- **Compare financial reports**

```bash
curl -X POST "http://localhost:8000/api/compare" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "company_a=Company One" \
  -F "company_b=Company Two" \
  -F "file_a=@company_one.pdf" \
  -F "file_b=@company_two.pdf"
```

- **Dashboard data**

```bash
curl "http://localhost:8000/api/dashboard"
```

These endpoints are consumed by the React frontend pages: Analyzer, AI Chat, Compare and Dashboard.

