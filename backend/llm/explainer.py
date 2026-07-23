"""
LLM Explainability Service — Smart Loan Eligibility Engine
Model: OpenAI GPT-4o  |  Fallback: Template (when API key is missing)
"""
import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root (two levels up from this file)
load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()


# ── Prompt builder ────────────────────────────────────────────────────────────

def _build_prompt(eval_result: dict) -> tuple[str, str]:
    req  = eval_result.get("requested_product", {})
    rec  = eval_result.get("recommended_product", {})
    comp = eval_result.get("comparison", {})
    app  = eval_result.get("applicant", {})

    payload = {
        "applicant": {
            "monthly_income": app.get("income", 0),
            "credit_score":   app.get("credit_score", 0),
            "fixed_deposit":  app.get("fixed_deposit", 0),
            "existing_emis":  app.get("existing_emis", 0),
            "dti_pct":        app.get("dti_pct", 0),
        },
        "requested_product": {
            "name":                req.get("name"),
            "interest_rate_apr":   req.get("interest_rate_apr"),
            "approval_probability": req.get("approval_probability"),
        },
        "recommended_product": {
            "name":                rec.get("name"),
            "interest_rate_apr":   rec.get("interest_rate_apr"),
            "approval_probability": rec.get("approval_probability"),
            "requires_collateral": rec.get("requires_collateral"),
        },
        "savings_metrics": {
            "interest_savings_apr":  comp.get("interest_savings_apr", 0),
            "total_interest_saved":  comp.get("total_interest_saved", 0),
            "approval_delta_pct":    comp.get("approval_delta_pct", 0),
        },
    }

    system = (
        "You are a Senior FinTech Banking Advisor AI. "
        "Given a customer's loan evaluation result, explain clearly in plain English "
        "why the recommended loan product is better than the one they requested. "
        "Highlight: lower interest rate, approval probability improvement, and financial safety. "
        "Return ONLY a valid JSON object with this exact schema:\n"
        '{"summary": "<Markdown explanation string>", '
        '"key_takeaways": ["<point 1>", "<point 2>", "<point 3>", "<point 4>"]}'
    )
    user = f"Loan Evaluation Data:\n{json.dumps(payload, indent=2)}"
    return system, user


# ── OpenAI GPT-4o ─────────────────────────────────────────────────────────────

def _call_gpt4o(eval_result: dict) -> dict | None:
    if not OPENAI_API_KEY:
        return None
    try:
        import openai
        client  = openai.OpenAI(api_key=OPENAI_API_KEY)
        system, user = _build_prompt(eval_result)
        response = client.chat.completions.create(
            model="gpt-4o",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user",   "content": user},
            ],
            temperature=0.7,
            max_tokens=600,
        )
        result = json.loads(response.choices[0].message.content)
        return {
            "summary":       result.get("summary", ""),
            "key_takeaways": result.get("key_takeaways", []),
            "llm_model":     "OpenAI GPT-4o",
        }
    except Exception as e:
        print(f"⚠️  GPT-4o API error: {e}")
        return None


# ── Template fallback ─────────────────────────────────────────────────────────

def _template_fallback(eval_result: dict) -> dict:
    req  = eval_result.get("requested_product", {})
    rec  = eval_result.get("recommended_product", {})
    comp = eval_result.get("comparison", {})
    app  = eval_result.get("applicant", {})

    fd          = app.get("fixed_deposit", 0)
    cs          = app.get("credit_score", 750)
    saved_apr   = comp.get("interest_savings_apr", 0)
    saved_total = comp.get("total_interest_saved", 0)
    delta       = comp.get("approval_delta_pct", 0)

    if rec.get("id") == "secured_fd_loan" and req.get("id") != "secured_fd_loan":
        summary = (
            f"🎯 **Smart Secured Redirect**: You requested *{req.get('name')}* at "
            f"**{req.get('interest_rate_apr')}% APR** (approval: {req.get('approval_probability')}%). "
            f"Our engine detected a **Fixed Deposit of ₹{fd:,.0f}** in your profile. "
            f"By pledging this FD, your rate drops to **{rec.get('interest_rate_apr')}% APR**, "
            f"saving you **₹{saved_total:,.0f}** in total interest over your tenure. "
            f"Approval jumps to **{rec.get('approval_probability')}%** — near-guaranteed, zero processing fee."
        )
    elif saved_apr > 0:
        summary = (
            f"💡 **Better Rate Found**: *{rec.get('name')}* offers **{rec.get('interest_rate_apr')}% APR** "
            f"vs your requested {req.get('interest_rate_apr')}%, saving **₹{saved_total:,.0f}** in interest. "
            f"Approval odds: **{rec.get('approval_probability')}%** (+{delta}% boost)."
        )
    else:
        summary = (
            f"✅ **Direct Best Match**: *{rec.get('name')}* is the optimal product for your profile. "
            f"With a credit score of **{cs}**, you qualify at **{rec.get('interest_rate_apr')}% APR** "
            f"with **{rec.get('approval_probability')}% approval probability**."
        )

    return {
        "summary": summary,
        "key_takeaways": [
            f"APR Savings: {saved_apr}% lower annual interest rate vs requested product",
            f"Approval Boost: +{delta}% higher bank approval probability",
            f"Total Interest Saved: ₹{saved_total:,.0f} over the full loan tenure",
            "Set OPENAI_API_KEY in .env to enable GPT-4o AI explanations",
        ],
        "llm_model": "Template Fallback (Set OPENAI_API_KEY in .env)",
    }


# ── Public entry point ────────────────────────────────────────────────────────

def generate_recommendation_explanation(eval_result: dict) -> dict:
    """
    Calls OpenAI GPT-4o for AI-generated financial reasoning.
    Falls back to template if OPENAI_API_KEY is not set.
    """
    result = _call_gpt4o(eval_result)
    return result if result else _template_fallback(eval_result)
