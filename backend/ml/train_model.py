import os
import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

def train_and_save_model(dataset_path="datasets/loan_data.csv", model_output_path="backend/ml/loan_approval_model.pkl"):
    """
    Trains a Random Forest / XGBoost classifier on the loan dataset
    and exports the pipeline to disk.
    """
    if not os.path.exists(dataset_path):
        print(f"Dataset file {dataset_path} not found.")
        return False

    df = pd.read_csv(dataset_path)

    # Feature Engineering
    df['dti_ratio'] = df['existing_emis'] / (df['income'] + 1)
    df['fd_to_loan_ratio'] = df['fixed_deposit'] / (df['loan_amount'] + 1)

    feature_cols = [
        'income', 'credit_score', 'existing_emis', 'existing_loans', 
        'loan_amount', 'savings', 'fixed_deposit', 'dti_ratio', 'fd_to_loan_ratio'
    ]

    X = df[feature_cols]
    y = df['approved']

    model_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
    ])

    model_pipeline.fit(X, y)

    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    with open(model_output_path, 'wb') as f:
        pickle.dump({
            "pipeline": model_pipeline,
            "feature_names": feature_cols
        }, f)

    print(f"Model successfully trained and saved to {model_output_path}")
    return True

if __name__ == "__main__":
    train_and_save_model()
