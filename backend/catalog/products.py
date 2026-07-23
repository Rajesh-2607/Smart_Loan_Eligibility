# Bank Loan Catalog & Eligibility Rules Engine

PRODUCTS = [
    {
        "id": "secured_fd_loan",
        "name": "Secured Overdraft / Loan Against Fixed Deposit",
        "category": "Secured",
        "interest_rate_apr": 7.5,
        "processing_fee_pct": 0.0,
        "max_tenure_months": 60,
        "min_credit_score": 550,
        "max_dti_pct": 75,
        "requires_collateral": True,
        "collateral_type": "Fixed Deposit",
        "collateral_coverage": 0.90, # Can borrow up to 90% of FD value
        "description": "Secured against your existing Fixed Deposit. Instant approval, lower interest rate, zero processing fee, and no liquidation of FD required.",
        "benefits": [
            "Estimated 4.0% to 6.3% lower interest vs unsecured personal loan",
            "99% approval probability if FD covers requested loan amount",
            "Zero pre-payment penalty & zero processing fee",
            "FD continues earning full interest rate"
        ]
    },
    {
        "id": "gold_secured_loan",
        "name": "Gold / Asset-Backed Express Loan",
        "category": "Secured",
        "interest_rate_apr": 8.2,
        "processing_fee_pct": 0.5,
        "max_tenure_months": 36,
        "min_credit_score": 600,
        "max_dti_pct": 65,
        "requires_collateral": True,
        "collateral_type": "Gold / Valuables",
        "collateral_coverage": 0.75,
        "description": "Quick liquid capital backed by physical gold or pledged assets with flexible repayment options.",
        "benefits": [
            "Lower interest rates than unsecured personal loans",
            "Fast 2-hour disbursement",
            "Minimal documentation required"
        ]
    },
    {
        "id": "pre_approved_express",
        "name": "Pre-Approved Instant Digital Loan",
        "category": "Unsecured",
        "interest_rate_apr": 10.5,
        "processing_fee_pct": 1.0,
        "max_tenure_months": 48,
        "min_credit_score": 750,
        "max_dti_pct": 45,
        "requires_collateral": False,
        "collateral_type": None,
        "collateral_coverage": 0.0,
        "description": "Exclusive pre-approved instant disbursal loan for existing bank customers with clean credit track records.",
        "benefits": [
            "100% paperless instant credit",
            "Discounted interest rate for prime credit scores",
            "Flexible tenure up to 48 months"
        ]
    },
    {
        "id": "balance_transfer_consolidation",
        "name": "Debt Consolidation & Balance Transfer Loan",
        "category": "Consolidation",
        "interest_rate_apr": 9.9,
        "processing_fee_pct": 0.75,
        "max_tenure_months": 60,
        "min_credit_score": 670,
        "max_dti_pct": 60,
        "requires_collateral": False,
        "collateral_type": None,
        "collateral_coverage": 0.0,
        "description": "Consolidate existing high-interest EMIs into a single manageable lower-rate monthly payment.",
        "benefits": [
            "Reduces monthly EMI obligation by up to 35%",
            "Single streamlined repayment date",
            "Top-up credit available"
        ]
    },
    {
        "id": "standard_personal_loan",
        "name": "Unsecured Express Personal Loan",
        "category": "Unsecured",
        "interest_rate_apr": 13.8,
        "processing_fee_pct": 2.0,
        "max_tenure_months": 60,
        "min_credit_score": 680,
        "max_dti_pct": 50,
        "requires_collateral": False,
        "collateral_type": None,
        "collateral_coverage": 0.0,
        "description": "Standard unsecured personal loan for general financial needs.",
        "benefits": [
            "No collateral security required",
            "Multi-purpose usage"
        ]
    },
    {
        "id": "loan_against_property",
        "name": "Loan Against Property (LAP)",
        "category": "Secured",
        "interest_rate_apr": 8.9,
        "processing_fee_pct": 1.0,
        "max_tenure_months": 120,
        "min_credit_score": 620,
        "max_dti_pct": 60,
        "requires_collateral": True,
        "collateral_type": "Real Estate / Property",
        "collateral_coverage": 0.65,
        "description": "Unlock high-ticket capital against residential or commercial property with extended tenures.",
        "benefits": [
            "High loan amounts with long repayment tenures up to 10 years",
            "Substantially lower EMI payments"
        ]
    }
]

def calculate_emi(principal, annual_rate_pct, tenure_months):
    """Calculates monthly EMI."""
    if annual_rate_pct <= 0:
        return round(principal / max(tenure_months, 1), 2)
    monthly_rate = (annual_rate_pct / 100) / 12
    emi = principal * monthly_rate * ((1 + monthly_rate)**tenure_months) / (((1 + monthly_rate)**tenure_months) - 1)
    return round(emi, 2)

def evaluate_catalog(applicant):
    """
    Evaluates applicant profile against the catalog, computes approval probabilities,
    interest costs, and identifies the best-fit recommendation.
    """
    income = float(applicant.get('income', 50000))
    existing_emis = float(applicant.get('existing_emis', 0))
    credit_score = int(applicant.get('credit_score', 700))
    loan_amount = float(applicant.get('loan_amount', 500000))
    tenure_months = int(applicant.get('tenure_months', 36))
    fd_amount = float(applicant.get('fixed_deposit', 0))
    requested_product_id = applicant.get('requested_product_id', 'standard_personal_loan')

    # DTI Ratio
    dti_pct = ((existing_emis) / max(income, 1)) * 100

    results = []
    
    for prod in PRODUCTS:
        # Base approval score
        approval_score = 50.0
        
        # Credit Score factor
        if credit_score >= prod['min_credit_score']:
            approval_score += min((credit_score - prod['min_credit_score']) / 2.5, 25)
        else:
            approval_score -= (prod['min_credit_score'] - credit_score) * 0.8
            
        # DTI factor
        if dti_pct <= prod['max_dti_pct']:
            approval_score += 15
        else:
            approval_score -= (dti_pct - prod['max_dti_pct']) * 1.5

        # Collateral / FD factor (Key FinTech logic highlight!)
        is_fd_eligible = False
        if prod['id'] == 'secured_fd_loan':
            if fd_amount >= (loan_amount * 0.8):
                approval_score = 98.5
                is_fd_eligible = True
            elif fd_amount > 0:
                coverage = (fd_amount / loan_amount) * 100
                approval_score += min(coverage * 0.4, 40)

        # Clamp approval score between 10% and 99%
        approval_prob = round(max(10.0, min(99.0, approval_score)), 1)
        
        # Compute EMI & total cost
        emi = calculate_emi(loan_amount, prod['interest_rate_apr'], tenure_months)
        total_repayment = emi * tenure_months
        total_interest = round(total_repayment - loan_amount, 2)
        processing_fee = round((prod['processing_fee_pct'] / 100) * loan_amount, 2)

        results.append({
            **prod,
            "approval_probability": approval_prob,
            "emi": emi,
            "total_interest": total_interest,
            "total_repayment": total_repayment,
            "processing_fee": processing_fee,
            "is_fd_eligible": is_fd_eligible
        })

    # Sort results: Prefer products with high approval odds and lowest interest cost
    sorted_results = sorted(results, key=lambda x: (-x['approval_probability'], x['interest_rate_apr']))
    
    # Identify requested product details
    requested_prod = next((p for p in results if p['id'] == requested_product_id), results[0])
    
    # Identify top recommended alternative
    top_recommendation = sorted_results[0]
    
    # Calculate savings if top recommendation is different or better than requested
    interest_savings_pct = round(requested_prod['interest_rate_apr'] - top_recommendation['interest_rate_apr'], 2)
    annual_interest_saved = round((loan_amount * (interest_savings_pct / 100)), 2)
    total_interest_saved = round(requested_prod['total_interest'] - top_recommendation['total_interest'], 2)
    
    return {
        "applicant": {
            "income": income,
            "existing_emis": existing_emis,
            "credit_score": credit_score,
            "loan_amount": loan_amount,
            "tenure_months": tenure_months,
            "dti_pct": round(dti_pct, 1),
            "fixed_deposit": fd_amount
        },
        "requested_product": requested_prod,
        "recommended_product": top_recommendation,
        "all_options": sorted_results,
        "comparison": {
            "interest_savings_apr": max(0.0, interest_savings_pct),
            "annual_interest_saved": max(0.0, annual_interest_saved),
            "total_interest_saved": max(0.0, total_interest_saved),
            "approval_delta_pct": round(top_recommendation['approval_probability'] - requested_prod['approval_probability'], 1),
            "is_better_match": top_recommendation['id'] != requested_prod['id'] or interest_savings_pct > 0
        }
    }
