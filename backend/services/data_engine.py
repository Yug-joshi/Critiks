import pandas as pd
import numpy as np
import os
from typing import Tuple, List

DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "datasets")

def process_csv(filepath: str) -> Tuple[bool, str, List[str]]:
    """
    Cleans missing values, removes duplicates, and engineers features.
    Also returns a list of missing required fields.
    """
    try:
        df = pd.read_csv(filepath)
        # Standardize column names (lowercase, strip whitespace)
        df.columns = [str(c).lower().strip() for c in df.columns]
        
        # Map known variations to the standard expected column names
        # Covers: german_credit_data, loan_approval, Loan-Prediction, and common variants
        aliases = {
            # employment
            'years_employed': 'employment_years',
            'yrs_employed': 'employment_years',
            'yr_employed': 'employment_years',
            'employed_years': 'employment_years',
            'work_experience': 'employment_years',
            # loan amount
            'loan': 'loan_amount',
            'amount': 'loan_amount',
            'credit amount': 'loan_amount',   # german_credit_data
            'loanamount': 'loan_amount',       # Loan-Prediction (after lower)
            'loan_amt': 'loan_amount',
            # income
            'salary': 'income',
            'applicantincome': 'income',       # Loan-Prediction
            'annual_income': 'income',
            'gross_income': 'income',
            # debt
            'total_debt': 'debt',
            'liabilities': 'debt',
            'outstanding_debt': 'debt',
            # age (german_credit_data has 'Age' → lowered to 'age', which IS 'age' — no alias needed)
            'client_age': 'age',
            'applicant_age': 'age',
        }
        df.rename(columns=aliases, inplace=True)
        
        required_fields = ['income', 'debt', 'loan_amount', 'age', 'employment_years']
        csv_cols = df.columns.tolist()
        missing_fields = [f for f in required_fields if f not in csv_cols]
        
        # Warn but DO NOT hard-reject — let the file through and report missing fields
        # Only reject if the file is completely useless (0 usable columns)
        usable = [f for f in required_fields if f in csv_cols]
        if len(usable) == 0:
            return False, f"File rejected: None of the required columns were found. Expected at least one of: {', '.join(required_fields)}. Found columns: {', '.join(csv_cols[:10])}", missing_fields

            
        # Hardening: Check for high percentage of missing values in the existing columns
        existing_critical_cols = [f for f in required_fields if f in csv_cols]
        for col in existing_critical_cols:
            missing_pct = df[col].isnull().sum() / len(df)
            if missing_pct > 0.3:
                return False, f"File rejected: Column '{col}' is missing {missing_pct*100:.1f}% of its values. The limit is 30%.", missing_fields
        
        # 1. Clean Missing Values
        # Numeric columns: fill with median
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
        
        # Categorical columns: fill with mode
        categorical_cols = df.select_dtypes(exclude=[np.number]).columns
        for col in categorical_cols:
            if not df[col].mode().empty:
                df[col] = df[col].fillna(df[col].mode()[0])

        # 2. Remove Duplicates
        df = df.drop_duplicates()

        # 3. Feature Engineering
        # Calculate DTI (Debt-to-Income)
        if 'debt' in df.columns and 'income' in df.columns:
            # Avoid division by zero
            df['income'] = df['income'].replace(0, 1)
            df['dti'] = df['debt'] / df['income']

        # Calculate Loan-to-Income
        if 'loan_amount' in df.columns and 'income' in df.columns:
            df['loan_to_income'] = df['loan_amount'] / df['income']
            
        # Calculate Monthly Obligation
        if 'debt' in df.columns:
            df['monthly_obligation'] = df['debt'] / 12

        # Save processed data
        processed_filepath = filepath.replace(".csv", "_processed.csv")
        df.to_csv(processed_filepath, index=False)
        
        return True, processed_filepath, missing_fields
    except Exception as e:
        return False, str(e), []
