# ClauseAI – Intelligent Legal Contract Risk Analysis

**ClauseAI** is an enterprise-grade AI-powered legal contract analysis platform that automatically identifies risk clauses, extracts key entities, generates redline suggestions, and provides perspective-aware explanations—all in real-time.

**Deployed link** - [genesis-legality-ai-ugt2.vercel.app](https://genesis-legality-ai-ugt2.vercel.app/)

**Backend (FastAPI)** - https://genesis-legality-ai-1.onrender.com

---

## 🎯 Overview

ClauseAI combines advanced NLP, machine learning, and LLM-powered explainability to help legal teams, vendors, and enterprises:

- **Rapidly analyze** contracts (PDF, DOCX, images with OCR)
- **Identify risk clauses** with context-specific explanations
- **Extract entities** (dates, amounts, parties, locations)
- **Generate redline suggestions** to mitigate risks
- **Leverage multiple perspectives** (vendor, buyer, employer, employee)
- **Access historical analysis** with version comparison

---

## ⚡ Quick Start

### Backend (FastAPI)

```bash
cd backend\backend\
# (optional) create and activate a virtualenv
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies (if you have a requirements.txt, prefer that):
pip install fastapi uvicorn python-dotenv python-multipart openai

# Start the API server (runs on http://localhost:8000)
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

Notes:

- The FastAPI app expects an environment file at `backend/backend/Risk_logic/.env` for `OPENAI_API_KEY` (if used). See [backend/backend/app.py](backend/backend/app.py) for the environment-loading behavior.

### Frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Open the app at the URL printed by Vite (usually http://localhost:5173).

---

## 🚀 Key Features

### Core Analysis Engine
- **Contract Ingestion**: Support for PDF, DOCX, and scanned documents (OCR)
- **Clause Segmentation**: Intelligent parsing of document structure
- **Entity Extraction**: Automatic identification of critical contract elements
- **Risk Classification**: ML-driven categorization of risk levels (High/Medium/Low)
- **LLM-Powered Explanations**: Context-aware risk explanations via OpenAI

### Smart Redlining
- Automated suggested redlines for identified risks
- Perspective-aware recommendations (vendor vs. buyer)
- Fallback rules when LLM is unavailable
- Example wording for clause improvements

### Perspective Engine
Analyze the same contract from different viewpoints:
- **Vendor**: Focus on payment terms, liability, confidentiality
- **Buyer**: Focus on warranties, performance, remedies
- **Employer**: Focus on non-compete, IP, confidentiality
- **Employee**: Focus on compensation, termination, mobility

### User-Friendly Interface
- **React + Vite Frontend**: Fast, modern UI for contract upload and analysis
- **Interactive Dashboard**: View results, navigate clauses, export reports
- **History Tracking**: Access previous analyses and compare versions

---

## 📋 Architecture

```
ClauseAI
├── Backend (FastAPI)
│   ├── app.py - REST API endpoints
│   ├── Risk_logic/ - Core analysis pipeline
│   │   ├── ingestion/ - File parsing (PDF, DOCX, images)
│   │   ├── segmentation/ - Clause extraction & structuring
│   │   ├── classification/ - Clause type detection
│   │   ├── ner/ - Named entity recognition
│   │   ├── risk/ - Risk detection & scoring
│   │   ├── intelligence/ - Contract analyzer orchestration
│   │   └── explainability/ - LLM-powered explanations
│   └── services/ - Business logic layer
│
└── Frontend (React + Vite)
    ├── src/
    │   ├── components/ - Reusable UI components
    │   ├── utils/ - Helper functions & storage
    │   ├── types.ts - TypeScript interfaces
    │   └── App.tsx - Main application
    └── package.json
```

---

## 📊 Analysis Pipeline

```
1. Document Ingestion
   ↓
2. Text Extraction (OCR if needed)
   ↓
3. Clause Segmentation
   ↓
4. Clause Classification
   ↓
5. Entity Extraction
   ↓
6. Risk Detection & Scoring
   ↓
7. LLM-Powered Explanations (optional)
   ↓
8. Redline Generation
   ↓
9. Report Assembly (Executive Summary, Statistics, Recommendations)
```

---

## 🛠️ Getting Started

### Prerequisites

- **Python**: 3.9+
- **Node.js**: 16+ (npm or yarn)
- **OpenAI API Key**: (Optional, for LLM-powered explanations)
- **Tesseract OCR**: For scanning support

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/ClauseAI.git
cd ClauseAI
```

#### 2. Backend Setup
```bash
cd backend/backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.\.venv\Scripts\activate

# Or activate (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file for OpenAI key (optional)
echo "OPENAI_API_KEY=your_key_here" > Risk_logic/.env

# Start server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173` (Vite default)

---

## 📡 API Endpoints

### Analyze Contract
**POST** `/analyze`

Upload a contract and get risk analysis.

**Parameters:**
- `file` (FormData): Contract file (PDF, DOCX, or image)
- `perspective` (string): Analysis perspective (`vendor`, `buyer`, `employer`, `employee`)

**Example:**
```bash
curl -X POST "http://localhost:8000/analyze" \
  -F "file=@contract.pdf" \
  -F "perspective=vendor"
```

**Response:**
```json
{
  "status": "SUCCESS",
  "summary": {
    "overall_risk_level": "MEDIUM",
    "clause_type_breakdown": {
      "Indemnification": 2,
      "Confidentiality": 1,
      "Liability": 1
    }
  },
  "explanations": {
    "executive_summary": "...",
    "statistics": {
      "total_clauses": 12,
      "high_risk": 2,
      "medium_risk": 3,
      "low_risk": 7,
      "total_issues": 5
    },
    "issues": [
      {
        "clause_id": "10",
        "clause_type": "Indemnification",
        "risk_level": "HIGH",
        "summary": "...",
        "why_risky": "...",
        "recommendation": "...",
        "redline_suggestion": "..."
      }
    ],
    "overall_recommendations": ["..."]
  }
}
```

---

## 🔧 Configuration

### Backend Environment Variables

Create `backend/backend/Risk_logic/.env`:

```env
# OpenAI Configuration (optional)
OPENAI_API_KEY=sk_your_key_here

# Perspective Preferences (optional)
DEFAULT_PERSPECTIVE=vendor

# Risk Thresholds (optional)
HIGH_RISK_THRESHOLD=75
MEDIUM_RISK_THRESHOLD=40
```

### Frontend Configuration

Edit `frontend/vite.config.ts` for API endpoint:

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
})
```

---

## 📦 Dependencies

### Backend
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **OpenAI** - LLM integration
- **pdf2image, PyPDF2, pdfplumber** - PDF processing
- **pytesseract, Pillow** - OCR and image handling
- **python-docx** - DOCX parsing
- **Pydantic** - Data validation

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

---

## 📖 Usage Examples

### Example 1: Upload and Analyze a Contract
1. Open frontend at `http://localhost:5173`
2. Click "Upload Contract"
3. Select a PDF or DOCX file
4. Choose analysis perspective
5. View results with risk highlights and redline suggestions

### Example 2: Analyze via CLI
```bash
cd backend/backend/Risk_logic
python main.py --file /path/to/contract.pdf --perspective vendor
```

### Example 3: Batch Processing
```python
from services.analyzer import analyze_batch

files = ["contract1.pdf", "contract2.pdf"]
results = analyze_batch(files, perspective="vendor")
```

---

## 🔒 Security & Privacy

- **No data storage**: Analyzed contracts are processed in-memory by default
- **API authentication**: Implement JWT/OAuth for production use
- **CORS protection**: Configure allowed origins in `app.py`
- **Input validation**: All uploads validated for file type and size
- **Rate limiting**: Recommended for production deployment

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend/backend/Risk_logic
pytest acceptance_test.py -v
pytest test_llm_pipeline.py -v
```

### Run Frontend Tests
```bash
cd frontend
npm run test
```

---

## 🚢 Deployment

### Docker Deployment

**Create Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/backend ./
CMD ["gunicorn", "app:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

**Build and Run:**
```bash
docker build -t clauseai-backend .
docker run -p 8000:8000 -e OPENAI_API_KEY=sk_... clauseai-backend
```

### Production Setup (Linux/Ubuntu)

```bash
# Install dependencies
sudo apt-get install python3.11 python3-pip tesseract-ocr

# Setup systemd service
sudo cp clauseai.service /etc/systemd/system/
sudo systemctl enable clauseai
sudo systemctl start clauseai
```

---

## 📚 Project Structure

```
├── README_CLAUSEAI.md (this file)
├── backend/
│   └── backend/
│       ├── app.py
│       ├── requirements.txt
│       ├── start.sh
│       └── Risk_logic/
│           ├── ingestion/
│           ├── segmentation/
│           ├── classification/
│           ├── ner/
│           ├── risk/
│           ├── intelligence/
│           └── explainability/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   ├── types.ts
│   │   └── App.tsx
│   └── package.json
└── docs/ (optional)
    ├── API.md
    ├── CONTRIBUTING.md
    └── ARCHITECTURE.md
```

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and commit: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Contribution Guidelines
- Follow PEP 8 (Python) and ESLint config (JavaScript)
- Add tests for new features
- Update documentation
- Use meaningful commit messages

---

## 📝 License

This project is licensed under the **MIT License** – see [LICENSE](LICENSE) file for details.

---

## 🤖 AI & LLM Integration

ClauseAI uses OpenAI's GPT models for:
- **Risk explanation generation** - Natural language explanations of why clauses are risky
- **Redline suggestion refinement** - Context-aware recommended wording
- **Executive summary creation** - High-level contract overviews

**Note:** All LLM calls are optional. The system has fallback rule-based explanations when OpenAI is unavailable or disabled.

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.9+

# Check dependencies
pip install -r requirements.txt

# Clear cache
rm -rf __pycache__ .pytest_cache

# Restart
uvicorn app:app --reload
```

### OCR Not Working
```bash
# Install Tesseract (Ubuntu/Debian)
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract

# Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
```

### Frontend Can't Connect to Backend
```bash
# Check CORS in app.py
# Verify backend is running on http://localhost:8000
# Check frontend proxy config in vite.config.ts
```

---

## 📞 Support & Contact

- **Issues**: Open a GitHub issue for bugs or features
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@clauseai.dev (if applicable)
- **Documentation**: See `backend/README.md` and `frontend/README.md`

---

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [React Documentation](https://react.dev)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Legal Tech Best Practices](https://example.com)

---

## 🗂️ Additional Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [API Documentation](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Contributing Guide](docs/CONTRIBUTING.md)

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Status**: Active Development

---

Made with ❤️ by the ClauseAI Team
