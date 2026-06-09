from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ml.explain_engine import report_engine
from sqlalchemy.orm import Session
from database import get_db
import models as db_models
from datetime import datetime

router = APIRouter()

class PortfolioStats(BaseModel):
    total: int
    high_risk: int
    fraud: int

class ReportResponse(BaseModel):
    report_text: str

@router.post("/report", response_model=ReportResponse)
async def generate_report(stats: PortfolioStats, db: Session = Depends(get_db)):
    report_text = report_engine.generate_report({
        'total': stats.total,
        'high_risk': stats.high_risk,
        'fraud': stats.fraud
    })
    
    # Save to database
    db_report = db_models.AIReport(report_text=report_text)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return {"report_text": report_text}

@router.get("/reports")
async def get_reports(db: Session = Depends(get_db)):
    reports = db.query(db_models.AIReport).order_by(db_models.AIReport.created_at.desc()).limit(10).all()
    return [{"id": r.id, "report_text": r.report_text, "created_at": r.created_at} for r in reports]
