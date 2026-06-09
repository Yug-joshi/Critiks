# ============================================================
# Critiks Backend Starter
# Run this from the project root: d:\Projects\Python\Critiks\
# Usage: .\start_backend.ps1
# ============================================================

Write-Host "Activating virtual environment (backend\venv)..." -ForegroundColor Cyan
.\backend\venv\Scripts\Activate.ps1

Write-Host "Starting Critiks FastAPI backend on http://localhost:8000" -ForegroundColor Green
Set-Location backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
