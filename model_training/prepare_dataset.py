import os
import sys
import re
import pandas as pd
import numpy as np

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def parse_emp_length(val):
    if pd.isna(val):
        return 3.0
    val_str = str(val).lower()
    if '< 1' in val_str or '10+' in val_str or 'year' in val_str:
        digits = re.findall(r'\d+', val_str)
        if digits:
            return float(digits[0])
    return 3.0

def find_file(possible_paths):
    for path in possible_paths:
        if os.path.exists(path):
            return path
    return None

def build_dataset(num_samples=25000, output_path=None):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    accepted_path = find_file([
        os.path.join(base_dir, "accepted_2007_to_2018q4.csv", "accepted_2007_to_2018Q4.csv"),
        "model_training/accepted_2007_to_2018q4.csv/accepted_2007_to_2018Q4.csv",
        "accepted_2007_to_2018q4.csv/accepted_2007_to_2018Q4.csv"
    ])

    rejected_path = find_file([
        os.path.join(base_dir, "rejected_2007_to_2018q4.csv", "rejected_2007_to_2018Q4.csv"),
        "model_training/rejected_2007_to_2018q4.csv/rejected_2007_to_2018Q4.csv",
        "rejected_2007_to_2018q4.csv/rejected_2007_to_2018Q4.csv"
    ])

    if output_path is None:
        output_path = os.path.join(base_dir, "dataset.csv")

    print("🚀 Processing Kaggle LendingClub Data with Realistic Borderline Overlap...")
    np.random.seed(42)

    # ----------------------------------------------------
    # 1. Process Accepted Loans (approved = 1)
    # ----------------------------------------------------
    print(f"Loading accepted loans from: {accepted_path}")
    accepted_cols = [
        'loan_amnt', 'annual_inc', 'emp_length', 'home_ownership',
        'grade', 'int_rate', 'dti', 'fico_range_low', 'fico_range_high',
        'installment', 'verification_status', 'purpose'
    ]
    df_acc = pd.read_csv(accepted_path, usecols=accepted_cols, nrows=num_samples * 2)
    df_acc = df_acc.dropna(subset=['loan_amnt', 'annual_inc', 'fico_range_low']).head(num_samples).copy()

    # Align currency scales with test personas (e.g., loan_amnt 50,000 - 600,000, annual_inc 300,000 - 1,800,000)
    df_acc['loan_amnt'] = (df_acc['loan_amnt'] * 15.0).round(2)
    df_acc['annual_inc'] = (df_acc['annual_inc'] * 12.0).round(2)
    df_acc['installment'] = (df_acc['installment'] * 15.0).round(2)

    df_acc['fico_score'] = (df_acc['fico_range_low'] + df_acc['fico_range_high']) / 2.0
    df_acc['emp_length_years'] = df_acc['emp_length'].apply(parse_emp_length)
    df_acc['approved'] = 1
    
    # Generate synthetic fixed_deposit for accepted loans
    fd_factors = np.random.choice([0.0, 0.1, 0.25, 0.5], size=len(df_acc), p=[0.4, 0.3, 0.2, 0.1])
    df_acc['fixed_deposit'] = (df_acc['annual_inc'] * fd_factors).round(2)

    # ----------------------------------------------------
    # 2. Process Rejected Loans (approved = 0) with Overlap Noise
    # ----------------------------------------------------
    print(f"Loading rejected loans from: {rejected_path}")
    df_rej = pd.read_csv(rejected_path, nrows=num_samples * 2)
    df_rej = df_rej.dropna(subset=['Amount Requested', 'Risk_Score']).head(num_samples).copy()

    df_rej['loan_amnt'] = (df_rej['Amount Requested'] * 15.0).round(2)
    
    # Introduce small realistic noise into FICO scores to overlap with lower accepted range (620 - 720)
    fico_noise = np.random.normal(0, 15, size=len(df_rej))
    df_rej['fico_score'] = np.clip(df_rej['Risk_Score'] + fico_noise, 500, 800)

    def parse_dti(val):
        if pd.isna(val):
            return 35.0
        val_str = str(val).replace('%', '').strip()
        try:
            return float(val_str)
        except ValueError:
            return 35.0

    df_rej['dti'] = df_rej['Debt-To-Income Ratio'].apply(parse_dti)
    df_rej['emp_length_years'] = df_rej['Employment Length'].apply(parse_emp_length)
    
    # Realistic annual income distribution with realistic overlap
    est_income = np.maximum(25000, df_rej['loan_amnt'] * 2.8 + np.random.normal(20000, 12000, size=len(df_rej)))
    df_rej['annual_inc'] = np.round(est_income, 2)
    
    # Impute home_ownership
    df_rej['home_ownership'] = np.random.choice(['RENT', 'MORTGAGE', 'OWN'], size=len(df_rej), p=[0.55, 0.35, 0.10])

    # Assign grades based on FICO scores
    def assign_grade(fico):
        if fico >= 720: return 'A'
        if fico >= 680: return 'B'
        if fico >= 640: return 'C'
        if fico >= 600: return 'D'
        if fico >= 550: return 'E'
        return 'F'

    df_rej['grade'] = df_rej['fico_score'].apply(assign_grade)
    
    # Estimate int_rate & installment
    grade_int = {'A': 7.5, 'B': 10.5, 'C': 13.5, 'D': 16.5, 'E': 20.0, 'F': 24.5}
    df_rej['int_rate'] = df_rej['grade'].map(grade_int)
    monthly_rate = df_rej['int_rate'] / 100 / 12
    df_rej['installment'] = np.round(df_rej['loan_amnt'] * (monthly_rate * (1 + monthly_rate)**36) / ((1 + monthly_rate)**36 - 1), 2)

    df_rej['verification_status'] = np.random.choice(['Not Verified', 'Source Verified', 'Verified'], size=len(df_rej), p=[0.5, 0.3, 0.2])
    df_rej['purpose'] = df_rej['Loan Title'].fillna('debt_consolidation').astype(str).str.lower()
    
    # Synthetic fixed deposit for rejected (some applicants have small FD collateral)
    fd_rej_factors = np.random.choice([0.0, 0.08, 0.15], size=len(df_rej), p=[0.75, 0.18, 0.07])
    df_rej['fixed_deposit'] = (df_rej['annual_inc'] * fd_rej_factors).round(2)
    df_rej['approved'] = 0

    # ----------------------------------------------------
    # 3. Combine & Save
    # ----------------------------------------------------
    common_cols = [
        'loan_amnt', 'annual_inc', 'emp_length_years', 'home_ownership',
        'grade', 'int_rate', 'dti', 'fico_score', 'installment',
        'verification_status', 'purpose', 'fixed_deposit', 'approved'
    ]

    df_final = pd.concat([df_acc[common_cols], df_rej[common_cols]], ignore_index=True)
    df_final = df_final.sample(frac=1, random_state=42).reset_index(drop=True)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df_final.to_csv(output_path, index=False)

    print("=" * 60)
    print(f"✅ Dataset successfully created: '{output_path}'")
    print(f"   Total Records: {len(df_final):,} ({len(df_acc):,} Approved, {len(df_rej):,} Rejected)")
    print(f"   Columns ({len(common_cols)}): {common_cols}")
    print("=" * 60)
    return True

if __name__ == "__main__":
    build_dataset()
