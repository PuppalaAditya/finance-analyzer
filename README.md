## AI-Powered Financial Analysis Platform

An intelligent financial dashboard and analysis web application for extracting, parsing, and analyzing financial PDF reports (like Annual Reports and 10-Ks). It features document chatting, company comparisons, and visualizes key metrics (P&L, Capital Structure, Margins) via an interactive dashboard.

### 1. Prerequisites

Before installing the project on a new PC, ensure you have the following installed:
- **Python 3.10+** (Added to your system PATH)
- **Node.js 18+** and `npm`
- **Git** (to clone the repository)

### 2. Backend Setup (FastAPI & AI)

1. Open your terminal/command prompt and navigate to the project directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   **Windows:**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
   **Mac/Linux:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Note: This application uses `pdfplumber` for robust, native Python PDF extraction, bypassing strict Windows DLL or Java requirements).*

4. Set up your environment variables. Create a `.env` file in the **root directory** of the project (one level above `backend`) and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=models/gemini-2.5-flash
   GEMINI_EMBEDDING_MODEL=models/text-embedding-004
   LOG_LEVEL=INFO
   ENV=development
   ```

5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   *The backend API will be available at `http://localhost:8000`.*

### 3. Frontend Setup (React & Vite)

1. Open a **new** terminal/command prompt window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install the Node modules:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. The React UI will automatically launch. If it doesn't, open your browser and navigate to **`http://localhost:3000`**.

### Usage Guide
- **Analyzer:** Upload a financial PDF (like an Annual Report) to instantly extract key metrics and generate an AI-powered executive summary and insights.
- **Dashboard:** After uploading a report, visit the Dashboard to view interactive visual trends including P&L Momentum, Profit Margin Trends, Capital Structure, and Liability Structure.
- **AI Chat:** Chat directly with the uploaded PDF to ask specific financial questions.
- **Compare:** Upload two different company reports to generate a side-by-side comparative analysis.

