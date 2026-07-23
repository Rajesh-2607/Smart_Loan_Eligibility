import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CustomerPortal from './components/CustomerPortal';
import DocumentUploader from './components/DocumentUploader';
import ProfileForm from './components/ProfileForm';
import RecommendationDashboard from './components/RecommendationDashboard';
import ComparisonModal from './components/ComparisonModal';
import AdminDashboard from './components/AdminDashboard';
import { evaluateLoan, PRESET_DOCUMENTS } from './services/api';
import { Sparkles, ShieldCheck, FileText, ArrowRight, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('customer_portal'); // 'customer_portal' | 'evaluator' | 'ocr' | 'compare' | 'admin'
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Applicant Profile State
  const [applicant, setApplicant] = useState({
    customer_name: "John Doe",
    income: 75000,
    existing_emis: 12000,
    credit_score: 750,
    existing_loans: 1,
    loan_amount: 500000,
    tenure_months: 36,
    loan_purpose: "Personal / General Expenses",
    savings: 150000,
    fixed_deposit: 500000,
    requested_product_id: "standard_personal_loan"
  });

  // Evaluation Results State
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);

  // Run evaluation on mount or when trigger clicked
  const runEvaluation = async (profileToUse = applicant) => {
    setIsEvaluating(true);
    const result = await evaluateLoan(profileToUse);
    setEvaluation(result);
    setIsEvaluating(false);
  };

  useEffect(() => {
    runEvaluation(applicant);
  }, []);

  const handleSelectPreset = (key) => {
    if (PRESET_DOCUMENTS[key]) {
      const doc = PRESET_DOCUMENTS[key].parsed_data;
      const updated = {
        ...applicant,
        customer_name: doc.customer_name,
        income: doc.monthly_income,
        existing_emis: doc.existing_emis,
        credit_score: doc.credit_score,
        fixed_deposit: doc.fixed_deposit,
        savings: doc.savings_balance,
        requested_product_id: "standard_personal_loan"
      };
      setApplicant(updated);
      runEvaluation(updated);
    }
  };

  const handleOcrExtracted = (parsedData) => {
    const updated = {
      ...applicant,
      customer_name: parsedData.customer_name,
      income: parsedData.monthly_income,
      existing_emis: parsedData.existing_emis,
      credit_score: parsedData.credit_score,
      fixed_deposit: parsedData.fixed_deposit,
      savings: parsedData.savings_balance
    };
    setApplicant(updated);
    runEvaluation(updated);
  };

  const handleApplyProduct = (product) => {
    const newLog = {
      id: `REC-${1000 + auditLogs.length + 1}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      customer_name: applicant.customer_name,
      requested_product: evaluation.requested_product.name,
      recommended_product: product.name,
      interest_savings_apr: evaluation.comparison.interest_savings_apr,
      total_interest_saved: evaluation.comparison.total_interest_saved,
      approval_probability: product.approval_probability,
      status: evaluation.comparison.is_better_match ? "Matched" : "Direct Approved"
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleForwardedCustomerRequest = (forwardedData) => {
    if (forwardedData && forwardedData.customer_request) {
      const req = forwardedData.customer_request;
      const updated = {
        ...applicant,
        customer_name: req.customer_name || applicant.customer_name,
        loan_amount: req.loan_amount || applicant.loan_amount,
        loan_purpose: req.loan_purpose || applicant.loan_purpose,
        income: req.validated_profile?.monthly_income || applicant.income,
        existing_emis: req.validated_profile?.monthly_emis || applicant.existing_emis
      };
      setApplicant(updated);
      runEvaluation(updated);
      setActiveTab('evaluator');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4ff] text-slate-900 flex flex-col font-sans">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 0: CUSTOMER PORTAL (MODULE 1) */}
        {activeTab === 'customer_portal' && (
          <CustomerPortal
            applicant={applicant}
            onForwardComplete={handleForwardedCustomerRequest}
          />
        )}

        {/* TAB 1: SMART MATCHER & EVALUATOR */}
        {activeTab === 'evaluator' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Profile Input & Sliders */}
              <div className="lg:col-span-5 space-y-6">
                <ProfileForm
                  applicant={applicant}
                  onChange={setApplicant}
                  onEvaluate={() => runEvaluation(applicant)}
                  onReset={() => {
                    const clean = {
                      customer_name: "Applicant",
                      income: 75000,
                      existing_emis: 12000,
                      credit_score: 750,
                      existing_loans: 0,
                      loan_amount: 500000,
                      tenure_months: 36,
                      loan_purpose: "Personal / General Expenses",
                      savings: 100000,
                      fixed_deposit: 0,
                      requested_product_id: "standard_personal_loan"
                    };
                    setApplicant(clean);
                    runEvaluation(clean);
                  }}
                />
              </div>

              {/* Right Column: AI Recommendation Dashboard */}
              <div className="lg:col-span-7 space-y-6">
                {isEvaluating ? (
                  <div className="glass-panel p-16 rounded-2xl text-center space-y-4 border border-indigo-100">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-indigo-600 font-semibold animate-pulse">
                      Evaluating 6 Bank Catalog Loan Products against Customer Asset Profile...
                    </p>
                  </div>
                ) : (
                  <RecommendationDashboard
                    evaluation={evaluation}
                    onOpenCompare={() => setShowCompareModal(true)}
                    onApplyProduct={handleApplyProduct}
                  />
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENT OCR */}
        {activeTab === 'ocr' && (
          <DocumentUploader
            onOcrExtracted={handleOcrExtracted}
          />
        )}

        {/* TAB 3: CATALOG MATRIX */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-outfit">Bank Loan Product Catalog Matrix</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side-by-side evaluation of all bank products against current customer profile.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('evaluator')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-200"
              >
                Back to Evaluator
              </button>
            </div>
            <ComparisonModal evaluation={evaluation} onClose={() => setActiveTab('evaluator')} />
          </div>
        )}

        {/* TAB 4: BANK UNDERWRITER ADMIN */}
        {activeTab === 'admin' && (
          <AdminDashboard auditLogs={auditLogs} />
        )}

      </main>

      {/* Comparison Modal Overlay (When triggered from evaluator tab) */}
      {showCompareModal && (
        <ComparisonModal
          evaluation={evaluation}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-indigo-100 bg-white py-6 text-center text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-500">© 2026 Smart Loan Eligibility & Recommendation Engine | FinTech & BFSI Banking Solution</p>
        <p className="text-[11px] text-slate-400">Powered by FastAPI · XGBoost ML Model · PaddleOCR · OpenAI GPT-4o</p>
      </footer>

    </div>
  );
}
