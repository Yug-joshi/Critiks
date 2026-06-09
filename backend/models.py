from pydantic import BaseModel
from typing import List
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
import datetime

Base = declarative_base()

class AIReport(Base):
    __tablename__ = "ai_reports"

    id = Column(Integer, primary_key=True, index=True)
    report_text = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LoanApplicationCreate(BaseModel):
    income: float
    debt: float
    loan_amount: float
    age: int
    employment_years: int

class PredictionResponse(BaseModel):
    default_probability: float
    risk_level: str
    top_factors: List[str]

class ScenarioSimulateRequest(BaseModel):
    income: float
    debt: float
    loan_amount: float

class ScenarioSimulateResponse(BaseModel):
    risk_probability: float
    risk_level: str

class NewsItem(BaseModel):
    id: str
    headline: str
    summary: str
    source: str
    sentiment: str
    date: str = ""

class ReportResponse(BaseModel):
    report_text: str
