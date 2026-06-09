import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import IsolationForest

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "trained_models")
os.makedirs(MODELS_DIR, exist_ok=True)

FRAUD_MODEL_PATH = os.path.join(MODELS_DIR, "fraud_model.pkl")

class FraudEngine:
    def __init__(self):
        self.model = None
        self.feature_columns = ['income', 'debt', 'loan_amount', 'age', 'employment_years', 'dti', 'loan_to_income']
        self._load_model()

    def _load_model(self):
        if os.path.exists(FRAUD_MODEL_PATH):
            self.model = joblib.load(FRAUD_MODEL_PATH)

    def train(self, dataset_path: str):
        df = pd.read_csv(dataset_path)
        
        # Ensure we have required columns
        available_cols = [c for c in self.feature_columns if c in df.columns]
        X = df[available_cols]
        
        # Fill missing values
        X = X.fillna(X.median())
        
        # Isolation Forest for Anomaly Detection (Fraud)
        self.model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
        self.model.fit(X)
        
        # Save model
        joblib.dump(self.model, FRAUD_MODEL_PATH)
        
        return True

    def predict(self, application_data: dict):
        if self.model is None:
            raise ValueError("Fraud model is not trained yet.")
            
        df = pd.DataFrame([application_data])
        
        # Feature Engineering if missing
        if 'dti' not in df.columns or pd.isna(df['dti'].iloc[0]):
            df['dti'] = df['debt'] / (df['income'] if df['income'].iloc[0] > 0 else 1)
        if 'loan_to_income' not in df.columns or pd.isna(df['loan_to_income'].iloc[0]):
            df['loan_to_income'] = df['loan_amount'] / (df['income'] if df['income'].iloc[0] > 0 else 1)
            
        X = df[self.feature_columns]
        X = X.fillna(0)
        
        # IsolationForest returns -1 for outliers (fraud) and 1 for inliers (normal)
        prediction = self.model.predict(X)[0]
        
        # We can also get an anomaly score (negative values mean more anomalous)
        decision_score = self.model.decision_function(X)[0]
        
        # Normalize the score somewhat to a 0-1 range roughly, 
        # where higher is more fraudulent. (IsolationForest scores usually range roughly -0.5 to 0.5)
        # Using a simple sigmoid mapping or linear shift for demonstration:
        fraud_score = max(0, min(1, 0.5 - decision_score))
        
        return {
            "fraud_score": round(float(fraud_score), 2),
            "flagged": bool(prediction == -1)
        }

fraud_engine = FraudEngine()
