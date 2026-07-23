import os
import pickle
import pandas as pd
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "loan_approval_model.pkl")

class LoanPredictor:
    def __init__(self):
        self.model = None
        self.feature_names = None
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, 'rb') as f:
                    data = pickle.load(f)
                    self.model = data["pipeline"]
                    self.feature_names = data.get("feature_names", None)
                    print(f"[OK] ML Model loaded from '{MODEL_PATH}' | features: {self.feature_names}")
            except Exception as e:
                print(f"[WARN] Error loading pickle model: {e}")
                self.model = None

    def predict_approval(self, applicant):
        income = float(applicant.get('income', 75000))
        annual_inc = float(applicant.get('annual_inc', income * 12 if income < 150000 else income))
        monthly_income = annual_inc / 12.0

        credit_score = float(applicant.get('credit_score', 750))
        existing_emis = float(applicant.get('existing_emis', 12000))
        loan_amount = float(applicant.get('loan_amount', 500000))
        fixed_deposit = float(applicant.get('fixed_deposit', 0))
        emp_length_years = float(applicant.get('emp_length_years', 5.0))
        home_ownership_numeric = float(applicant.get('home_ownership_numeric', 2.0))
        grade_numeric = float(applicant.get('grade_numeric', 2.0))
        int_rate = float(applicant.get('int_rate', 10.5))

        dti_pct = float(applicant.get('dti', (existing_emis / (monthly_income + 1)) * 100))
        installment = float(applicant.get('installment', existing_emis))
        verification_numeric = float(applicant.get('verification_numeric', 2.0))

        fd_to_loan_ratio = fixed_deposit / (loan_amount + 1.0)
        installment_to_inc = installment / (monthly_income + 1.0)

        if self.model and self.feature_names:
            try:
                row_dict = {
                    'loan_amnt': loan_amount,
                    'annual_inc': annual_inc,
                    'monthly_income': monthly_income,
                    'emp_length_years': emp_length_years,
                    'home_ownership_numeric': home_ownership_numeric,
                    'grade_numeric': grade_numeric,
                    'int_rate': int_rate,
                    'dti': dti_pct,
                    'fico_score': credit_score,
                    'installment': installment,
                    'verification_numeric': verification_numeric,
                    'fixed_deposit': fixed_deposit,
                    'fd_to_loan_ratio': fd_to_loan_ratio,
                    'installment_to_inc': installment_to_inc
                }
                X_df = pd.DataFrame([row_dict], columns=self.feature_names)
                probs = self.model.predict_proba(X_df)[0]
                approval_prob = round(float(probs[1]) * 100, 1)
            except Exception as e:
                print(f"⚠️ Prediction pipeline error: {e}. Using heuristic fallback.")
                approval_prob = self._heuristic_probability(credit_score, dti_pct / 100.0, fd_to_loan_ratio)
        else:
            approval_prob = self._heuristic_probability(credit_score, dti_pct / 100.0, fd_to_loan_ratio)

        # Risk Classification
        if approval_prob >= 80:
            risk_category = "Low Risk"
            risk_color = "emerald"
        elif approval_prob >= 55:
            risk_category = "Moderate Risk"
            risk_color = "amber"
        else:
            risk_category = "High Risk"
            risk_color = "rose"

        return {
            "approval_probability": approval_prob,
            "risk_category": risk_category,
            "risk_color": risk_color,
            "dti_ratio_pct": round(dti_pct, 1),
            "fd_coverage_pct": round(fd_to_loan_ratio * 100, 1)
        }

    def _heuristic_probability(self, credit_score, dti_ratio, fd_to_loan_ratio):
        base = 50.0
        if credit_score > 700:
            base += (credit_score - 700) * 0.25
        else:
            base -= (700 - credit_score) * 0.3
        
        if dti_ratio < 0.4:
            base += 15
        elif dti_ratio > 0.6:
            base -= 20

        if fd_to_loan_ratio >= 0.8:
            base = max(base, 96.0)

        return round(max(10.0, min(99.0, base)), 1)

predictor = LoanPredictor()
