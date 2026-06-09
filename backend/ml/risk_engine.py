import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import shap

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "trained_models")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODELS_DIR, "risk_model.pkl")
EXPLAINER_PATH = os.path.join(MODELS_DIR, "shap_explainer.pkl")

class RiskEngine:
    def __init__(self):
        self.model = None
        self.explainer = None
        self.feature_columns = ['income', 'debt', 'loan_amount', 'age', 'employment_years', 'dti', 'loan_to_income', 'monthly_obligation']
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        if os.path.exists(EXPLAINER_PATH):
            self.explainer = joblib.load(EXPLAINER_PATH)

    def train(self, dataset_path: str):
        df = pd.read_csv(dataset_path)
        
        # Ensure we have a target column (e.g. 'default')
        if 'default' not in df.columns:
            # If no target, create synthetic target for demonstration purposes
            df['default'] = np.where(df['dti'] > 0.4, 1, 0)
            
        X = df[self.feature_columns]
        y = df['default']
        
        # Fill missing values if any
        X = X.fillna(X.median())
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)
        
        # Evaluate
        preds = self.model.predict(X_test)
        print("Accuracy:", accuracy_score(y_test, preds))
        
        # Setup SHAP Explainer
        self.explainer = shap.TreeExplainer(self.model)
        
        # Save model
        joblib.dump(self.model, MODEL_PATH)
        joblib.dump(self.explainer, EXPLAINER_PATH)
        
        return True

    def predict(self, application_data: dict):
        if self.model is None:
            raise ValueError("Model is not trained yet.")
            
        # Convert to DataFrame
        df = pd.DataFrame([application_data])
        
        # Feature Engineering if missing
        if 'dti' not in df.columns or pd.isna(df['dti'].iloc[0]):
            df['dti'] = df['debt'] / (df['income'] if df['income'].iloc[0] > 0 else 1)
        if 'loan_to_income' not in df.columns or pd.isna(df['loan_to_income'].iloc[0]):
            df['loan_to_income'] = df['loan_amount'] / (df['income'] if df['income'].iloc[0] > 0 else 1)
        if 'monthly_obligation' not in df.columns or pd.isna(df['monthly_obligation'].iloc[0]):
            df['monthly_obligation'] = df['debt'] / 12
            
        X = df[self.feature_columns]
        
        # Fill missing with zeros as fallback
        X = X.fillna(0)
        
        probability = self.model.predict_proba(X)[0][1] # Probability of class 1 (default)
        risk_level = "HIGH" if probability > 0.7 else "MEDIUM" if probability > 0.4 else "LOW"
        
        # Explain Prediction using SHAP
        shap_values = self.explainer.shap_values(X)
        # Random Forest SHAP returns list of arrays for binary classification. Index 1 is for positive class.
        if isinstance(shap_values, list):
            vals = shap_values[1][0]
        elif len(shap_values.shape) == 3:
            vals = shap_values[0][:, 1]
        else:
            vals = shap_values[0]
            
        feature_importance = pd.DataFrame(list(zip(X.columns, vals)), columns=['feature', 'importance'])
        feature_importance['abs_importance'] = feature_importance['importance'].abs()
        feature_importance = feature_importance.sort_values(by='abs_importance', ascending=False)
        
        # Get top 3 factors driving the risk
        top_factors = []
        for _, row in feature_importance.head(3).iterrows():
            direction = "High" if row['importance'] > 0 else "Low"
            # Format nicely, e.g., "High dti"
            feature_name = row['feature'].replace('_', ' ').title()
            top_factors.append(f"{direction} {feature_name}")
            
        return {
            "default_probability": round(float(probability), 2),
            "risk_level": risk_level,
            "top_factors": top_factors
        }

    def predict_batch(self, df: pd.DataFrame):
        if self.model is None:
            # Fallback mock if model isn't trained
            return None
            
        df_eval = df.copy()
        
        # Feature Engineering if missing
        if 'dti' not in df_eval.columns and 'debt' in df_eval.columns and 'income' in df_eval.columns:
            df_eval['dti'] = df_eval['debt'] / df_eval['income'].replace(0, 1)
        if 'loan_to_income' not in df_eval.columns and 'loan_amount' in df_eval.columns and 'income' in df_eval.columns:
            df_eval['loan_to_income'] = df_eval['loan_amount'] / df_eval['income'].replace(0, 1)
        if 'monthly_obligation' not in df_eval.columns and 'debt' in df_eval.columns:
            df_eval['monthly_obligation'] = df_eval['debt'] / 12
            
        # Ensure all columns exist
        for col in self.feature_columns:
            if col not in df_eval.columns:
                df_eval[col] = 0
                
        X = df_eval[self.feature_columns]
        # Only fill numeric medians safely
        for col in X.columns:
            if X[col].isnull().any():
                med = X[col].median()
                X[col] = X[col].fillna(med if not pd.isna(med) else 0)
                
        probabilities = self.model.predict_proba(X)[:, 1]
        
        # Risk Categories
        low_risk = int(sum(probabilities <= 0.4))
        medium_risk = int(sum((probabilities > 0.4) & (probabilities <= 0.7)))
        high_risk = int(sum(probabilities > 0.7))
        
        # Probability Distribution Bins (<10%, 10-20%, 20-30%, 30-40%, 40-50%, >50%)
        dist = [
            int(sum(probabilities <= 0.1)),
            int(sum((probabilities > 0.1) & (probabilities <= 0.2))),
            int(sum((probabilities > 0.2) & (probabilities <= 0.3))),
            int(sum((probabilities > 0.3) & (probabilities <= 0.4))),
            int(sum((probabilities > 0.4) & (probabilities <= 0.5))),
            int(sum(probabilities > 0.5))
        ]
        
        # Global Feature Importance (Mean Absolute SHAP values)
        shap_values = self.explainer.shap_values(X)
        if isinstance(shap_values, list):
            vals = shap_values[1]
        elif len(np.array(shap_values).shape) == 3:
            vals = shap_values[:, :, 1]
        else:
            vals = shap_values
            
        mean_abs_shap = np.abs(vals).mean(axis=0)
        
        # Normalize between 0 and 1
        max_shap = mean_abs_shap.max() if mean_abs_shap.max() > 0 else 1
        normalized_shap = mean_abs_shap / max_shap
        
        feature_importance = [
            {"feature": col.replace('_', ' ').title(), "importance": round(float(imp), 2)}
            for col, imp in zip(self.feature_columns, normalized_shap)
        ]
        feature_importance = sorted(feature_importance, key=lambda x: x["importance"], reverse=True)[:5]
        
        return {
            "totalScored": len(df),
            "riskCategories": [low_risk, medium_risk, high_risk],
            "probabilityDistribution": dist,
            "featureImportance": feature_importance
        }

    def detect_fraud_anomalies(self, df: pd.DataFrame):
        df_eval = df.copy()
        
        # Ensure minimum features for anomaly detection
        required_cols = ['income', 'debt', 'loan_amount']
        for col in required_cols:
            if col not in df_eval.columns:
                df_eval[col] = 0
                
        # Fill missing values
        X = df_eval[required_cols]
        for col in X.columns:
            if X[col].isnull().any():
                med = X[col].median()
                X[col] = X[col].fillna(med if not pd.isna(med) else 0)
                
        # Unsupervised Anomaly Detection using Isolation Forest
        # contamination sets the expected proportion of outliers (e.g. 2%)
        iso_forest = IsolationForest(contamination=0.02, random_state=42)
        
        # Fit and predict (-1 means anomaly, 1 means normal)
        predictions = iso_forest.fit_predict(X)
        anomaly_scores = iso_forest.decision_function(X) # lower score means more anomalous
        
        # Normalize anomaly scores to a 0-1 "fraud score" (1 being highest risk of fraud)
        # decision_function typically returns values between -0.5 and 0.5
        # we invert it so higher score = more anomalous
        inverted_scores = -anomaly_scores
        min_score = inverted_scores.min()
        max_score = inverted_scores.max()
        if max_score > min_score:
            fraud_scores = (inverted_scores - min_score) / (max_score - min_score)
        else:
            fraud_scores = np.zeros(len(inverted_scores))
            
        alerts = []
        for i, is_anomaly in enumerate(predictions):
            if is_anomaly == -1: # It's an outlier
                score = round(float(fraud_scores[i]), 2)
                # Determine reason dynamically
                row = X.iloc[i]
                reasons = []
                if row.get('income', 0) > 150000 and row.get('loan_amount', 0) < 5000:
                    reasons.append("High income requesting suspiciously low loan")
                if row.get('debt', 0) == 0 and row.get('loan_amount', 0) > 50000:
                    reasons.append("Zero debt history with large loan request")
                if not reasons:
                    reasons.append("Mathematical anomaly detected in standard distribution")
                
                alerts.append({
                    "original_index": i,
                    "score": score,
                    "reason": " | ".join(reasons)
                })
                
        # Sort alerts by score descending
        alerts = sorted(alerts, key=lambda x: x["score"], reverse=True)
        return alerts

risk_engine = RiskEngine()
