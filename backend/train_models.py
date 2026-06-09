import pandas as pd
import numpy as np
import os
import sys

# Add the current directory to sys.path so we can import from ml
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml.risk_engine import risk_engine
from ml.fraud_engine import fraud_engine

DATASETS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "datasets")

def train_risk_model():
    print("Preparing data for Risk Engine from german_credit_data.csv...")
    german_csv = os.path.join(DATASETS_DIR, "german_credit_data.csv")
    df = pd.read_csv(german_csv)
    
    df_mapped = pd.DataFrame()
    df_mapped['age'] = df['Age']
    df_mapped['loan_amount'] = df['Credit amount']
    df_mapped['employment_years'] = (df['Duration'] / 12).round()
    
    np.random.seed(42)
    df_mapped['income'] = df_mapped['loan_amount'] * (1 / 0.3) * np.random.uniform(0.8, 1.2, len(df))
    df_mapped['debt'] = df_mapped['income'] * np.random.uniform(0.2, 0.6, len(df))
    
    df_mapped['dti'] = df_mapped['debt'] / df_mapped['income']
    df_mapped['loan_to_income'] = df_mapped['loan_amount'] / df_mapped['income']
    df_mapped['monthly_obligation'] = df_mapped['debt'] / 12

    mapped_csv_path = os.path.join(DATASETS_DIR, "german_credit_data_mapped.csv")
    df_mapped.to_csv(mapped_csv_path, index=False)
    
    print("Training Risk Engine...")
    risk_engine.train(mapped_csv_path)
    print("Risk Engine Trained!")

def train_fraud_model():
    print("Preparing data for Fraud Engine from creditcard.csv...")
    cc_csv = os.path.join(DATASETS_DIR, "creditcard.csv")
    
    df = pd.read_csv(cc_csv, nrows=50000)
    
    df_mapped = pd.DataFrame()
    df_mapped['loan_amount'] = df['Amount']
    
    np.random.seed(42)
    df_mapped['income'] = df_mapped['loan_amount'] * np.random.uniform(5, 15, len(df)) + 30000
    df_mapped['debt'] = df_mapped['income'] * np.random.uniform(0.1, 0.5, len(df))
    df_mapped['age'] = np.random.randint(18, 70, len(df))
    df_mapped['employment_years'] = np.maximum(0, df_mapped['age'] - 18 - np.random.randint(0, 10, len(df)))
    
    df_mapped['dti'] = df_mapped['debt'] / df_mapped['income']
    df_mapped['loan_to_income'] = df_mapped['loan_amount'] / df_mapped['income']
    df_mapped['monthly_obligation'] = df_mapped['debt'] / 12

    mapped_csv_path = os.path.join(DATASETS_DIR, "creditcard_mapped.csv")
    df_mapped.to_csv(mapped_csv_path, index=False)
    
    print("Training Fraud Engine...")
    fraud_engine.train(mapped_csv_path)
    print("Fraud Engine Trained!")

if __name__ == "__main__":
    train_risk_model()
    train_fraud_model()
    print("All models successfully trained according to their specified datasets.")
