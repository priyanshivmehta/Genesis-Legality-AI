Genesis – AI Contract Risk Analyzer 🚀
Introduction

Genesis is an AI-powered contract analysis tool that automatically scans legal documents, identifies risky clauses, and provides negotiation recommendations. Built for rapid triage of NDAs and vendor agreements, the system helps non-lawyers understand contracts before signing.

✨ Key Features

✅ AI Clause Understanding — Extracts and segments legal clauses using OCR + NLP.

✅ Perspective-Aware Analysis — Choose whether you're the Disclosing or Receiving party for tailored risk scoring.

✅ Risk Engine — Highlights high/medium/low risk clauses using domain rules (e.g., liability, indemnity, confidentiality).

✅ Redline Suggestions — Provides suggested wording and negotiation strategies for risky sections.

✅ Executive Summary — Shows contract-level overview for quick judgment.

✅ Local History Storage — Revisit previous analyses without requiring an account or backend database.

🧠 Under the Hood (Tech Stack)
Backend (AI Pipeline)

Python (FastAPI)

OCR (pdfplumber, pytesseract)

NLP (spaCy)

Rule Engine (Custom Risk Rules)

Document Parsing + Clause Segmentation

Frontend

React + TypeScript + Vite

TailwindCSS UI

Local Storage for history

REST API integration

🔌 API Endpoint

POST /analyze

Body (multipart form):

file: PDF / DOCX / Image
perspective: disclosing | receiving


Response:

clause breakdown

risk scores

recommendations

summary & statistics

🚀 Getting Started
Backend Setup
cd backend
python -m venv venv
venv/Scripts/activate
pip install -r requirements.txt
uvicorn app:app --reload

Frontend Setup
cd frontend
npm install
npm run dev


Backend: http://127.0.0.1:8000

Frontend: http://localhost:5173

📜 Use Cases

✔ NDA review before signing
✔ Vendor onboarding
✔ Procurement contract review
✔ Startup legal triage
✔ Redline support for negotiations

🤝 Contributing

Contributions are welcome!

Fork repo

Create feature branch

Submit PR

📝 License

MIT License

🏆 Built For

Contract intelligence & legal risk automation — inspired by platforms like Heather AI and Spellbook.

👥 Team

Nitya Singh — Frontend + Product + Integration

Priyanshi Mehta — AI Pipeline + OCR/NLP + Risk Engine
