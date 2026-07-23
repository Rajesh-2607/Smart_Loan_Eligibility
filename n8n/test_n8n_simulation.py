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
parent_dir = os.path.dirname(base_dir)
sys.path.append(os.path.join(parent_dir, "backend"))

from ocr.parser import parse_document, PRESET_DOCUMENTS
from ml.predictor import predictor
from catalog.products import evaluate_catalog
from llm.explainer import generate_recommendation_explanation

def run_n8n_simulation():
    load_dotenv()
    print("=" * 80)
    print("🔄 N8N WORKFLOW AUTOMATION SIMULATOR")
    print("   Workflow File: n8n/loan_workflow.json")
    print("=" * 80)

    # NODE 1: Webhook Trigger (Incoming Document Payload)
    print("\n📍 NODE 1: WEBHOOK TRIGGER [loan-application-webhook]")
    print("-" * 80)
    preset_key = "john_doe_fd"
    print(f"📥 Received Webhook Payload with Document Preset: '{preset_key}'")

    # NODE 2: PaddleOCR Extraction Node (POST /api/documents/upload)
    print("\n📍 NODE 2: PADDLEOCR EXTRACTION NODE (POST /api/documents/upload)")
    print("-" * 80)
    ocr_response = {
        "status": "success",
        "ocr_result": PRESET_DOCUMENTS[preset_key]
    }
    extracted_data = ocr_response["ocr_result"]["parsed_data"]
    print(f"📄 Document Type:    {ocr_response['ocr_result']['document_type']}")
    print(f"🎯 OCR Confidence:   {ocr_response['ocr_result']['ocr_confidence'] * 100}%")
    print(f"📊 Extracted Data:   {json.dumps(extracted_data, indent=2)}")

    # NODE 3: ML & Catalog Matcher Node (POST /api/evaluate)
    print("\n📍 NODE 3: ML & CATALOG MATCHER NODE (POST /api/evaluate)")
    print("-" * 80)
    
    # Map OCR extracted fields to evaluation schema
    applicant_profile = {
        "customer_name": extracted_data.get("customer_name", "John Doe"),
        "income": extracted_data.get("monthly_income", 75000),
        "annual_inc": extracted_data.get("monthly_income", 75000) * 12,
        "existing_emis": extracted_data.get("existing_emis", 12000),
        "credit_score": extracted_data.get("credit_score", 750),
        "existing_loans": 1,
        "loan_amount": 500000,
        "fixed_deposit": extracted_data.get("fixed_deposit", 500000),
        "savings": extracted_data.get("savings_balance", 150000),
        "requested_product_id": "standard_personal_loan"
    }

    ml_prediction = predictor.predict_approval(applicant_profile)
    eval_result = evaluate_catalog(applicant_profile)
    ai_explanation = generate_recommendation_explanation(eval_result)

    evaluate_response = {
        "applicant": eval_result["applicant"],
        "ml_risk_assessment": ml_prediction,
        "requested_product": eval_result["requested_product"],
        "recommended_product": eval_result["recommended_product"],
        "comparison": eval_result["comparison"],
        "ai_explanation": ai_explanation
    }

    print(f"🤖 ML Approval Odds:   {ml_prediction['approval_probability']}% ({ml_prediction['risk_category']})")
    print(f"📌 Requested Product: {eval_result['requested_product']['name']}")
    print(f"🎯 Recommended Match: {eval_result['recommended_product']['name']}")
    print(f"💵 Interest Savings:   {eval_result['comparison']['interest_savings_apr']}% APR (₹{eval_result['comparison']['total_interest_saved']:,.0f} saved)")
    print(f"🧠 LLM Engine:         {ai_explanation['llm_model']}")

    # NODE 4: Email Recommendation Report (Send email report)
    print("\n📍 NODE 4: EMAIL RECOMMENDATION REPORT NODE (n8n-nodes-base.emailSend)")
    print("-" * 80)
    
    cust_name = applicant_profile["customer_name"]
    email_subject = f"Your Personalized Smart Loan Recommendation Report - {cust_name}"
    email_body = (
        f"Dear {cust_name},\n\n"
        f"Our AI recommendation engine matched you to: {evaluate_response['recommended_product']['name']}.\n\n"
        f"Estimated Interest Saved: {evaluate_response['comparison']['interest_savings_apr']}% APR (Total: ₹{evaluate_response['comparison']['total_interest_saved']:,.0f})\n"
        f"Approval Odds: {evaluate_response['recommended_product']['approval_probability']}%\n\n"
        f"AI Explanation:\n"
        f"{evaluate_response['ai_explanation']['summary']}"
    )

    print(f"📧 EMAIL SUBJECT: {email_subject}")
    print("\n✉️  EMAIL CONTENT BODY:")
    print("-" * 80)
    print(email_body)
    print("=" * 80)
    print("✅ N8N WORKFLOW AUTOMATION PIPELINE EXECUTED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    run_n8n_simulation()
