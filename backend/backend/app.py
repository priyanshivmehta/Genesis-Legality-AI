from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import time
from dotenv import load_dotenv   # <-- add this import

env_path = os.path.join(os.path.dirname(__file__), "Risk_logic", ".env")
load_dotenv(env_path)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if OPENAI_API_KEY:
    os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY
else:
    print("❌ OPENAI_API_KEY not found! Add it to your .env file.")

# Correct relative import
from Risk_logic.intelligence.contract_analyzer import analyze_contract

app = FastAPI()

# CORS (needed for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    perspective: str = Form(...)
):
    start = time.time()
    print("📥 File received:", file.filename)
    print("👀 Perspective:", perspective)

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save uploaded file locally
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("⚙️ Starting analysis...")

    # Call analysis module
    result = analyze_contract(
        file_path=file_path,
        perspective=perspective
    )

    end = time.time()
    print(f"⏱️ Total analysis time: {end - start:.2f} seconds")

    return result
