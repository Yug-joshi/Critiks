import os
import pandas as pd
from fastapi import APIRouter
from typing import List
from pydantic import BaseModel
from ml.risk_engine import risk_engine

router = APIRouter()

DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "datasets")

class StatsResponse(BaseModel):
    totalLoans: int
    highRiskAccounts: int
    fraudAlerts: int
    avgDti: float
    chartLabels: List[str]
    chartDataLoans: List[int]
    chartDataRisk: List[int]
    missingFields: List[str]

@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    # Attempt to load the latest processed dataset. If none, use german_credit_data_mapped
    try:
        # Find all processed files
        processed_files = [f for f in os.listdir(DATASETS_DIR) if f.endswith("_processed.csv")]
        
        if processed_files:
            # Sort by modification time to get the newest upload
            processed_files.sort(key=lambda x: os.path.getmtime(os.path.join(DATASETS_DIR, x)), reverse=True)
            latest_file = os.path.join(DATASETS_DIR, processed_files[0])
        else:
            latest_file = os.path.join(DATASETS_DIR, "german_credit_data_mapped.csv")
            
        df = pd.read_csv(latest_file)
        
        total_loans = len(df)
        
        # Calculate high risk accounts using the model if available, else fallback
        high_risk = 0
        if 'dti' in df.columns:
            avg_dti = round(df['dti'].mean() * 100, 1)
            high_risk = len(df[df['dti'] > 0.4]) # simplistic metric
        else:
            avg_dti = 34.2
            
        fraud_alerts = 0
        if 'fraud_flagged' in df.columns:
            fraud_alerts = len(df[df['fraud_flagged'] == 1])
        elif total_loans > 0:
            fraud_alerts = int(total_loans * 0.01) # Mock 1% fraud
            
        # Generate real chart data based on Age Distribution
        age_bins = [17, 25, 35, 45, 55, 100]
        age_labels = ['18-25', '26-35', '36-45', '46-55', '56+']
        
        if 'Age' in df.columns or 'age' in df.columns:
            age_col = 'Age' if 'Age' in df.columns else 'age'
            df['age_group'] = pd.cut(df[age_col], bins=age_bins, labels=age_labels, right=True)
            age_counts = df['age_group'].value_counts().reindex(age_labels, fill_value=0)
            chart_data_loans = age_counts.tolist()
            
            # High risk count per age group
            if 'dti' in df.columns:
                risk_counts = df[df['dti'] > 0.4]['age_group'].value_counts().reindex(age_labels, fill_value=0)
                chart_data_risk = risk_counts.tolist()
            else:
                chart_data_risk = [int(x * 0.15) for x in chart_data_loans]
        else:
            chart_data_loans = [0] * len(age_labels)
            chart_data_risk = [0] * len(age_labels)

        required_fields = ['income', 'debt', 'loan_amount', 'age', 'employment_years']
        csv_cols = [str(c).lower() for c in df.columns]
        missing_fields = [f for f in required_fields if f not in csv_cols]

        return {
            "totalLoans": total_loans,
            "highRiskAccounts": high_risk,
            "fraudAlerts": fraud_alerts,
            "avgDti": avg_dti,
            "chartLabels": age_labels,
            "chartDataLoans": chart_data_loans,
            "chartDataRisk": chart_data_risk,
            "missingFields": missing_fields
        }
    except Exception as e:
        print("Error calculating stats:", e)
        # Fallback to mock data if dataset parsing fails
        return {
            "totalLoans": 12450,
            "highRiskAccounts": 342,
            "fraudAlerts": 18,
            "avgDti": 34.2,
            "chartLabels": ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            "chartDataLoans": [1100, 1150, 1180, 1200, 1220, 1245],
            "chartDataRisk": [210, 240, 290, 280, 310, 342],
            "missingFields": []
        }

class ApplicationResponse(BaseModel):
    id: str
    income: float
    debt: float
    loan_amount: float
    age: int
    employment_years: int
    dti: float
    risk_level: str
    fraud_flagged: bool

@router.get("/applications", response_model=List[ApplicationResponse])
async def get_applications():
    # Return mock applications for the UI
    mock_data = [
        {
            "id": "APP-1001",
            "income": 75000,
            "debt": 15000,
            "loan_amount": 25000,
            "age": 35,
            "employment_years": 8,
            "dti": 0.20,
            "risk_level": "LOW",
            "fraud_flagged": False
        },
        {
            "id": "APP-1002",
            "income": 45000,
            "debt": 30000,
            "loan_amount": 50000,
            "age": 28,
            "employment_years": 3,
            "dti": 0.66,
            "risk_level": "HIGH",
            "fraud_flagged": False
        },
        {
            "id": "APP-1003",
            "income": 120000,
            "debt": 10000,
            "loan_amount": 80000,
            "age": 42,
            "employment_years": 15,
            "dti": 0.08,
            "risk_level": "LOW",
            "fraud_flagged": False
        },
        {
            "id": "APP-1004",
            "income": 30000,
            "debt": 25000,
            "loan_amount": 30000,
            "age": 24,
            "employment_years": 1,
            "dti": 0.83,
            "risk_level": "HIGH",
            "fraud_flagged": True
        },
        {
            "id": "APP-1005",
            "income": 60000,
            "debt": 20000,
            "loan_amount": 15000,
            "age": 31,
            "employment_years": 5,
            "dti": 0.33,
            "risk_level": "MEDIUM",
            "fraud_flagged": False
        }
    ]
    return mock_data

@router.get("/risk-analytics")
async def get_risk_analytics():
    try:
        processed_files = [f for f in os.listdir(DATASETS_DIR) if f.endswith("_processed.csv")]
        if processed_files:
            processed_files.sort(key=lambda x: os.path.getmtime(os.path.join(DATASETS_DIR, x)), reverse=True)
            latest_file = os.path.join(DATASETS_DIR, processed_files[0])
        else:
            latest_file = os.path.join(DATASETS_DIR, "german_credit_data_mapped.csv")
            
        df = pd.read_csv(latest_file)
        
        # Try real ML model first
        batch_results = risk_engine.predict_batch(df)
        if batch_results:
            return batch_results
            
        # Fallback if model not trained
        total_scored = len(df)
        if 'dti' in df.columns:
            low_risk = len(df[df['dti'] <= 0.3])
            medium_risk = len(df[(df['dti'] > 0.3) & (df['dti'] <= 0.4)])
            high_risk = len(df[df['dti'] > 0.4])
        else:
            low_risk = int(total_scored * 0.65)
            medium_risk = int(total_scored * 0.25)
            high_risk = int(total_scored * 0.1)
            
        dist = [
            int(low_risk * 0.4),
            int(low_risk * 0.6),
            int(medium_risk * 0.7),
            int(medium_risk * 0.3),
            int(high_risk * 0.6),
            int(high_risk * 0.4),
        ]
        
        return {
            "totalScored": total_scored,
            "riskCategories": [low_risk, medium_risk, high_risk],
            "probabilityDistribution": dist,
            "featureImportance": []
        }
    except Exception as e:
        print("Error calculating risk analytics:", e)
        return {
            "totalScored": 12400,
            "riskCategories": [65, 25, 10],
            "probabilityDistribution": [1200, 3000, 4500, 2200, 1000, 550],
            "featureImportance": []
        }

@router.get("/fraud-alerts")
async def get_fraud_alerts():
    try:
        processed_files = [f for f in os.listdir(DATASETS_DIR) if f.endswith("_processed.csv")]
        if processed_files:
            processed_files.sort(key=lambda x: os.path.getmtime(os.path.join(DATASETS_DIR, x)), reverse=True)
            latest_file = os.path.join(DATASETS_DIR, processed_files[0])
        else:
            latest_file = os.path.join(DATASETS_DIR, "german_credit_data_mapped.csv")
            
        df = pd.read_csv(latest_file)
        
        alerts = []
        # Use ML to detect anomalies
        detected_anomalies = risk_engine.detect_fraud_anomalies(df)
        
        # We only take top 20 to avoid overwhelming the UI
        for i, anomaly in enumerate(detected_anomalies[:20]):
            idx = anomaly["original_index"]
            row = df.iloc[idx]
            loan_amt = row.get('loan_amount', 500)
            real_id = str(row.get('Unnamed: 0', idx))
            
            alerts.append({
                "id": f"APP-{real_id.zfill(4)}",
                "score": anomaly["score"],
                "reason": anomaly["reason"],
                "status": "Pending Review" if anomaly["score"] < 0.8 else ("Investigating" if anomaly["score"] < 0.95 else "Blocked"),
                "date": f"{i*10} Mins Ago" if i < 6 else "Yesterday",
                "amount": f"₹{int(loan_amt * 80):,}"
            })
            
        if not alerts:
             alerts = [
                { "id": 'APP-NONE', "score": 0.0, "reason": 'No anomalies found in dataset', "status": 'Clean', "date": 'Now', "amount": '₹0' }
             ]
             
        critical = len([a for a in alerts if a['score'] > 0.9])
        investigating = len([a for a in alerts if a['status'] == 'Investigating'])
        resolved = 24
        
        return {
            "alerts": alerts,
            "stats": {
                "critical": critical,
                "investigating": investigating,
                "resolved": resolved,
                "active": len(alerts)
            }
        }
    except Exception as e:
        print("Error getting fraud alerts:", e)
        return {
            "alerts": [],
            "stats": { "critical": 12, "investigating": 6, "resolved": 24, "active": 18 }
        }

