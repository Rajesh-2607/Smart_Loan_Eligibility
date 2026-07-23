"""
ORM Models — Loan Application & Recommendation Audit Log tables.
"""
import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from database import Base


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id               = Column(Integer, primary_key=True, index=True)
    reference_id     = Column(String(32), unique=True, index=True)
    customer_name    = Column(String(100))
    income           = Column(Float)
    existing_emis    = Column(Float)
    credit_score     = Column(Integer)
    loan_amount      = Column(Float)
    tenure_months    = Column(Integer)
    fixed_deposit    = Column(Float, default=0.0)
    loan_purpose     = Column(String(100))
    requested_product_id = Column(String(100))
    created_at       = Column(DateTime, default=datetime.datetime.utcnow)


class RecommendationLog(Base):
    __tablename__ = "recommendation_logs"

    id                   = Column(Integer, primary_key=True, index=True)
    log_ref_id           = Column(String(32), unique=True, index=True)
    customer_name        = Column(String(100))
    requested_product    = Column(String(200))
    recommended_product  = Column(String(200))
    interest_savings_apr = Column(Float, default=0.0)
    total_interest_saved = Column(Float, default=0.0)
    approval_probability = Column(Float, default=0.0)
    status               = Column(String(50))          # Matched | Direct Approved
    ai_explanation       = Column(Text, nullable=True)
    llm_model_used       = Column(String(100), nullable=True)
    created_at           = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def timestamp(self):
        return self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else ""
