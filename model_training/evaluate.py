import os
import sys
import pickle
import numpy as np

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

def evaluate_lendingclub_model(model_path=None):
    """
    Evaluates sample applicant profiles using trained Kaggle LendingClub model features.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    if model_path is None or not os.path.exists(model_path):
        for candidate in [model_path, "model_training/loan_model.pkl", os.path.join(base_dir, "loan_model.pkl"), "loan_model.pkl"]:
            if candidate and os.path.exists(candidate):
                model_path = candidate
                break

    if not model_path or not os.path.exists(model_path):
        print(f"❌ Trained model file not found. Run 'python model_training/train.py' first.")
        return

    with open(model_path, 'rb') as f:
        data = pickle.load(f)
        pipeline = data["pipeline"]

    test_applicants = [
        {
            "name": "John Doe (FD Holder)",
            "loan_amnt": 500000, "annual_inc": 900000, "emp_length_years": 5,
            "home_ownership_numeric": 3, "grade_numeric": 1, "int_rate": 7.5, "dti": 16.0,
            "fico_score": 750, "installment": 15553, "verification_numeric": 2.0, "fixed_deposit": 500000
        },
        {
            "name": "Sarah Connor (High DTI)",
            "loan_amnt": 400000, "annual_inc": 540000, "emp_length_years": 2,
            "home_ownership_numeric": 1, "grade_numeric": 4, "int_rate": 13.8, "dti": 53.3,
            "fico_score": 620, "installment": 13620, "verification_numeric": 1.0, "fixed_deposit": 0
        },
        {
            "name": "Alex Mercer (Super Prime)",
            "loan_amnt": 600000, "annual_inc": 1560000, "emp_length_years": 10,
            "home_ownership_numeric": 2, "grade_numeric": 1, "int_rate": 7.8, "dti": 18.0,
            "fico_score": 820, "installment": 18700, "verification_numeric": 2.0, "fixed_deposit": 800000
        }
    ]

    print("🔍 Kaggle LendingClub Model Predictions:")
    print("=" * 70)

    feature_names = data.get("feature_names", None)
    for app in test_applicants:
        monthly_inc = app['annual_inc'] / 12
        fd_ratio = app['fixed_deposit'] / (app['loan_amnt'] + 1)
        inst_ratio = app['installment'] / (monthly_inc + 1)

        row_vals = [
            app['loan_amnt'], app['annual_inc'], monthly_inc, app['emp_length_years'],
            app['home_ownership_numeric'], app['grade_numeric'], app['int_rate'], app['dti'],
            app['fico_score'], app['installment'], app['verification_numeric'], app['fixed_deposit'],
            fd_ratio, inst_ratio
        ]

        if feature_names:
            import pandas as pd
            features = pd.DataFrame([row_vals], columns=feature_names)
        else:
            features = np.array([row_vals])

        probs = pipeline.predict_proba(features)[0]
        approval_prob = round(float(probs[1]) * 100, 1)

        risk = "Low Risk" if approval_prob >= 80 else "Moderate Risk" if approval_prob >= 55 else "High Risk"

        print(f"👤 Applicant: {app['name']}")
        print(f"   Approval Odds: {approval_prob}% | Risk Rating: {risk}")
        print(f"   FICO Score: {app['fico_score']} | DTI: {app['dti']}% | FD Asset: ₹{app['fixed_deposit']:,}")
        print("-" * 70)

if __name__ == "__main__":
    evaluate_lendingclub_model()
