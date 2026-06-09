from fastapi import APIRouter

router = APIRouter()

@router.post("/fraud")
async def detect_fraud():
    return {"message": "Fraud endpoint"}
