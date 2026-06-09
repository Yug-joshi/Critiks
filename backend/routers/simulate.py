from fastapi import APIRouter, HTTPException
from models import ScenarioSimulateRequest, ScenarioSimulateResponse
from ml.risk_engine import risk_engine

router = APIRouter()

@router.post("/simulate", response_model=ScenarioSimulateResponse)
async def simulate_scenario(request: ScenarioSimulateRequest):
    try:
        # We need a dummy application data structure to pass to the engine, using average values for the rest
        app_data = {
            "income": request.income,
            "debt": request.debt,
            "loan_amount": request.loan_amount,
            "age": 35, # default
            "employment_years": 5, # default
        }
        
        prediction = risk_engine.predict(app_data)
        
        return {
            "risk_probability": prediction["default_probability"],
            "risk_level": prediction["risk_level"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")
