from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import time

# ✅ Correct relative import
from .Risk_logic.intelligence.contract_analyzer import analyze_contract

app = FastAPI()

# ✅ CORS (needed for React)
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

    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print("⚙️ Starting analysis...")

    # ✅ CORRECT function call
    result = analyze_contract(
        file_path=file_path,
        perspective=perspective
    )

    end = time.time()
    print(f"⏱️ Total analysis time: {end - start:.2f} seconds")

    return result
