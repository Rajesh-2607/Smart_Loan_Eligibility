import os
import sys
import json
from dotenv import load_dotenv

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

base_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(base_dir)

from ml.predictor import predictor
from catalog.products import evaluate_catalog
from llm.explainer import generate_recommendation_explanation

def run_ml_to_llm_pipeline_test():
    load_dotenv()
    print("=" * 80)
    print("🚀 END-TO-END PIPELINE: ML PREDICTOR ➔ RECOMMENDATION CATALOG ➔ LLM EXPLAINER")
    print("=" * 80)

    # 1. Incoming Applicant Profile
    applicant = {
        "customer_name": "John Doe",
        "income": 75000,
        "annual_inc": 900000,
        "existing_emis": 12000,
        "credit_score": 750,
        "existing_loans": 1,
        "loan_amount": 500000,
        "tenure_months": 36,
        "loan_purpose": "personal",
        "savings": 150000,
        "fixed_deposit": 500000,
        "requested_product_id": "standard_personal_loan"
    }

    print("\n1️⃣ STEP 1: APPLICANT INPUT PROFILE")
    print("-" * 80)
    print(f"👤 Customer: {applicant['customer_name']}")
    print(f"💰 Monthly Income: ₹{applicant['income']:,} | Fixed Deposit: ₹{applicant['fixed_deposit']:,}")
    print(f"📊 Credit Score: {applicant['credit_score']} | Requested Loan: ₹{applicant['loan_amount']:,}")

    # 2. Run ML Approval Predictor
    print("\n2️⃣ STEP 2: ML MODEL INFERENCE (XGBoost Pipeline)")
    print("-" * 80)
    ml_output = predictor.predict_approval(applicant)
    print(f"🤖 ML Approval Odds: {ml_output['approval_probability']}%")
    print(f"🛡️  Risk Rating:       {ml_output['risk_category']}")
    print(f"📈 DTI Ratio:          {ml_output['dti_ratio_pct']}%")
    print(f"🔒 FD Coverage:        {ml_output['fd_coverage_pct']}%")

    # 3. Run Recommendation Engine Catalog
    print("\n3️⃣ STEP 3: RECOMMENDATION ENGINE EVALUATION")
    print("-" * 80)
    catalog_result = evaluate_catalog(applicant)
    rec_prod = catalog_result['recommended_product']
    req_prod = catalog_result['requested_product']
    comp = catalog_result['comparison']

    print(f"📌 Requested Product:   {req_prod['name']} ({req_prod['interest_rate_apr']}% APR | Approval: {req_prod['approval_probability']}%)")
    print(f"🎯 Recommended Product: {rec_prod['name']} ({rec_prod['interest_rate_apr']}% APR | Approval: {rec_prod['approval_probability']}%)")
    print(f"💵 Total Interest Saved: ₹{comp['total_interest_saved']:,.0f} over tenure")
    print(f"📈 Approval Delta:       +{comp['approval_delta_pct']}% higher odds")

    # 4. Pass ML & Catalog Output into LLM Explainer (GPT-4o)
    print("\n4️⃣ STEP 4: LLM EXPLAINABLE AI OUTPUT (GPT-4o)")
    print("-" * 80)
    llm_output = generate_recommendation_explanation(catalog_result)

    print(f"🧠 LLM Engine: {llm_output['llm_model']}")
    print("\n📝 Generated Financial Reasoning (Summary):")
    print("-" * 80)
    print(llm_output['summary'])
    print("-" * 80)
    print("\n📌 Key Takeaways:")
    for takeaway in llm_output.get('key_takeaways', []):
        print(f"  • {takeaway}")
    print("=" * 80)

if __name__ == "__main__":
    run_ml_to_llm_pipeline_test()
