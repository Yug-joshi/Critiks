from fastapi import APIRouter, HTTPException
from models import LoanApplicationCreate, PredictionResponse
from ml.risk_engine import risk_engine

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict_risk(application: LoanApplicationCreate):
    try:
        # Convert pydantic model to dict
        app_data = application.model_dump()
        
        # Predict using ML risk engine
        prediction_result = risk_engine.predict(app_data)
        
        return prediction_result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
