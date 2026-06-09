import os
import shutil
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
from services.data_engine import process_csv

logger = logging.getLogger(__name__)

router = APIRouter()

DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "datasets")

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    # Save the uploaded file
    file_path = os.path.join(DATASETS_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Process the CSV (clean, engineer features)
    try:
        success, result, missing_fields = process_csv(file_path)
    except Exception as exc:
        logger.exception("Unhandled exception in process_csv")
        raise HTTPException(status_code=500, detail=f"Unexpected server error: {str(exc)}")

    if not success:
        # Validation failure - not a server error, use 422 Unprocessable Entity
        logger.warning("CSV rejected: %s", result)
        raise HTTPException(status_code=422, detail=result)
        
    return {
        "message": "File uploaded and processed successfully", 
        "filename": file.filename, 
        "processed_file": result,
        "missing_fields": missing_fields
    }
