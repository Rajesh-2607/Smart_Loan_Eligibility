import React, { useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  DollarSign, 
  Briefcase, 
  Sparkles,
  FileCheck,
  RefreshCw,
  Send,
  Building,
  Sliders,
  Check,
  ChevronRight,
  Shield,
  Clock
} from 'lucide-react';
import { validateCustomerDocuments, forwardCustomerRequest } from '../services/api';

export default function CustomerPortal({ applicant, onForwardComplete, onSelectPreset }) {
  // Input States
  const [loanAmount, setLoanAmount] = useState(applicant.loan_amount || 500000);
  const [loanPurpose, setLoanPurpose] = useState(applicant.loan_purpose || "Personal / General Expenses");
  const [salarySlipFile, setSalarySlipFile] = useState({
    name: "Salary_Slip_July2026.pdf",
    size: "1.2 MB",
    uploaded: true,
    type: "Salary Slip"
  });
  const [bankStatementFile, setBankStatementFile] = useState({
    name: "Bank_Statement_6Months.pdf",
    size: "3.4 MB",
    uploaded: true,
    type: "Bank Statement"
  });

  // Process States
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Output States
  const [isForwarding, setIsForwarding] = useState(false);
  const [forwardedResult, setForwardedResult] = useState(null);

  // Determine current wizard step (1, 2, or 3)
  const currentStep = forwardedResult ? 3 : validationResult ? 2 : 1;

  // Handle Upload
  const handleSalaryFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setSalarySlipFile({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploaded: true,
          type: "Salary Slip"
        });
        setIsUploading(false);
        setValidationResult(null);
      }, 600);
    }
  };

  const handleBankFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        setBankStatementFile({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          uploaded: true,
          type: "Bank Statement"
        });
        setIsUploading(false);
        setValidationResult(null);
      }, 600);
    }
  };

  // Run Document Validation
  const handleValidateDocuments = async () => {
    setIsValidating(true);
    const payload = {
      customer_name: applicant.customer_name || "John Doe",
      salary_slip_name: salarySlipFile.name,
      bank_statement_name: bankStatementFile.name,
      loan_amount: Number(loanAmount),
      loan_purpose: loanPurpose,
      income: applicant.income,
      existing_emis: applicant.existing_emis,
      credit_score: applicant.credit_score,
      fixed_deposit: applicant.fixed_deposit
    };

    const res = await validateCustomerDocuments(payload);
    setTimeout(() => {
      setValidationResult(res);
      setIsValidating(false);
    }, 700);
  };

  // Submit & Forward Request
  const handleForwardRequest = async () => {
    setIsForwarding(true);
    const payload = {
      customer_name: applicant.customer_name || "John Doe",
      salary_slip_name: salarySlipFile.name,
      bank_statement_name: bankStatementFile.name,
      loan_amount: Number(loanAmount),
      loan_purpose: loanPurpose,
      income: applicant.income,
      existing_emis: applicant.existing_emis,
      credit_score: applicant.credit_score,
      fixed_deposit: applicant.fixed_deposit
    };

    const res = await forwardCustomerRequest(payload);
    setTimeout(() => {
      setForwardedResult(res);
      setIsForwarding(false);
    }, 800);
  };

  // Handle Preset Switching
  const handlePresetSelect = (presetKey) => {
    if (onSelectPreset) {
      onSelectPreset(presetKey);
    }
    setValidationResult(null);
    setForwardedResult(null);
  };

  return (
    <div className="space-y-8">

      {/* Module Title Banner & 3-Step Wizard Timeline */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-white relative overflow-hidden space-y-6">
        
        {/* Glow Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2 badge-glow-indigo">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Module 1 – Customer Portal
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">
              Loan Application & Document Intake
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl">
              Upload your financial documents, specify loan amount, run automated document verification, and forward your profile for instant AI product matching.
            </p>
          </div>
        </div>

        {/* 3-Step Wizard Visual Progress Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
          
          {/* Step 1 */}
          <div className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
            currentStep >= 1
              ? 'bg-indigo-950/60 border-indigo-500/40 text-slate-900'
              : 'bg-slate-50/40 border-slate-200 text-slate-500'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep >= 1 ? 'bg-indigo-600 text-slate-900 shadow-lg shadow-indigo-600/40' : 'bg-white text-slate-500'
            }`}>
              1
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold block font-outfit">1. Inputs & Docs</span>
              <span className="text-[10px] text-slate-500 block">Salary & Bank Upload</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
            currentStep >= 2
              ? 'bg-indigo-950/60 border-indigo-500/40 text-slate-900'
              : 'bg-slate-50/40 border-slate-200 text-slate-500'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep >= 2 ? 'bg-indigo-600 text-slate-900 shadow-lg shadow-indigo-600/40' : 'bg-white text-slate-500'
            }`}>
              2
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold block font-outfit">2. Document Audit</span>
              <span className="text-[10px] text-slate-500 block">OCR Verification</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
            currentStep >= 3
              ? 'bg-emerald-950/60 border-emerald-500/40 text-slate-900'
              : 'bg-slate-50/40 border-slate-200 text-slate-500'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              currentStep >= 3 ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/40' : 'bg-white text-slate-500'
            }`}>
              3
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold block font-outfit">3. Forward Request</span>
              <span className="text-[10px] text-slate-500 block">Smart Match Queue</span>
            </div>
          </div>

        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INPUTS & PROCESS */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: INPUTS (Loan Amount, Purpose, Uploads) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-6">
            
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-outfit flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Step 1: Application Specifications
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Specify loan requirements and upload proof of income</p>
              </div>
              <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/20 font-semibold">
                Phase 1
              </span>
            </div>

            {/* Loan Amount Slider & Quick Pills */}
            <div className="space-y-3 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Requested Loan Amount
                </label>
                <span className="text-base font-mono font-black text-indigo-400">
                  ₹{Number(loanAmount).toLocaleString()}
                </span>
              </div>

              <input
                type="range"
                min="50000"
                max="2500000"
                step="25000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />

              <div className="flex flex-wrap gap-2 pt-1">
                {[100000, 300000, 500000, 1000000, 1500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setLoanAmount(amt)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                      loanAmount === amt 
                        ? 'bg-indigo-600 text-slate-900 font-bold shadow-md shadow-indigo-600/30' 
                        : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
                    }`}
                  >
                    ₹{(amt / 100000).toFixed(0)} Lakh
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Purpose Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-purple-400" /> Loan Purpose / Category
              </label>
              <select
                value={loanPurpose}
                onChange={(e) => setLoanPurpose(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-medium transition-all"
              >
                <option value="Personal / General Expenses">Personal / General Expenses</option>
                <option value="Debt Consolidation & Balance Transfer">Debt Consolidation & Balance Transfer</option>
                <option value="Home Improvement & Renovation">Home Improvement & Renovation</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Business Expansion & Working Capital">Business Expansion & Working Capital</option>
                <option value="Vehicle / Auto Purchase">Vehicle / Auto Purchase</option>
                <option value="Higher Education">Higher Education</option>
              </select>
            </div>

            {/* Document Upload Dropzones (Salary Slip & Bank Statement) */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono block">
                Required Document Attachments
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Salary Slip Card */}
                <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-500/60 rounded-xl p-4 transition-all bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold">
                      Salary Slip
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-outfit">Salary Slip (Recent 3 Months)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Verified Monthly Pay Stub</p>
                  </div>

                  {salarySlipFile.uploaded ? (
                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-slate-800 font-semibold truncate">{salarySlipFile.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{salarySlipFile.size}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-400">No file uploaded</p>
                  )}

                  <label className="block w-full text-center cursor-pointer px-3 py-2 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all">
                    <span>{salarySlipFile.uploaded ? "Replace Salary Slip" : "Upload Salary Slip"}</span>
                    <input type="file" onChange={handleSalaryFileUpload} accept=".pdf,.png,.jpg" className="hidden" />
                  </label>
                </div>

                {/* Bank Statement Card */}
                <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-500/60 rounded-xl p-4 transition-all bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Building className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                      Bank Statement
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 font-outfit">Bank Statement (6 Months)</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Monthly Cash Flow Audit</p>
                  </div>

                  {bankStatementFile.uploaded ? (
                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs text-slate-800 font-semibold truncate">{bankStatementFile.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0">{bankStatementFile.size}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-400">No file uploaded</p>
                  )}

                  <label className="block w-full text-center cursor-pointer px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all">
                    <span>{bankStatementFile.uploaded ? "Replace Bank Statement" : "Upload Bank Statement"}</span>
                    <input type="file" onChange={handleBankFileUpload} accept=".pdf,.png,.jpg" className="hidden" />
                  </label>
                </div>

              </div>
            </div>

          </div>

          {/* SECTION 2: PROCESS (Validate Documents) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-outfit flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Step 2: Automated Verification Audit
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">PaddleOCR Extraction & Cross-Document Financial Integrity Check</p>
              </div>

              <button
                onClick={handleValidateDocuments}
                disabled={isValidating || !salarySlipFile.uploaded || !bankStatementFile.uploaded}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 shrink-0"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Audit...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Validate Documents</span>
                  </>
                )}
              </button>
            </div>

            {/* Validation Outcome Card */}
            {validationResult ? (
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-emerald-500/40 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 font-outfit block">Documents Verified & Authenticated</span>
                      <span className="text-[11px] text-emerald-400 font-mono">100% Format Integrity Confirmed</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                    Score: {(validationResult.salary_slip.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/90 p-3.5 rounded-xl border border-slate-800/90">
                    <span className="text-slate-500 block text-[11px]">Salary Slip Audit</span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">
                      {validationResult.salary_slip.verified_employer}
                    </span>
                    <span className="text-emerald-400 font-mono text-xs block mt-1 font-bold">
                      ₹{validationResult.salary_slip.verified_monthly_income.toLocaleString()} / month
                    </span>
                  </div>

                  <div className="bg-white/90 p-3.5 rounded-xl border border-slate-800/90">
                    <span className="text-slate-500 block text-[11px]">Bank Statement Audit</span>
                    <span className="font-bold text-slate-900 text-sm block mt-0.5">
                      {validationResult.bank_statement.verified_bank}
                    </span>
                    <span className="text-amber-400 font-mono text-xs block mt-1 font-bold">
                      ₹{validationResult.bank_statement.verified_monthly_emis.toLocaleString()} / month EMIs
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Cross-Doc Pay Stub Match</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>Bank Digital Watermark</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <span>Click <strong className="text-indigo-300">"Validate Documents"</strong> above to extract metrics and check digital signatures.</span>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: OUTPUT (Customer Request Forwarding Card) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 relative overflow-hidden space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"></div>

            <div className="border-b border-slate-200 pb-4">
              <span className="text-xs font-mono uppercase text-indigo-400 font-bold tracking-wider block mb-1">
                Step 3: Underwriter Queue Intake
              </span>
              <h3 className="text-xl font-bold text-slate-900 font-outfit">Forward Customer Application</h3>
              <p className="text-xs text-slate-500 mt-1">
                Transmit validated documents directly into the AI Recommendation & Matching Pipeline.
              </p>
            </div>

            {/* Status Output Card */}
            {forwardedResult ? (
              <div className="space-y-4 bg-gradient-to-b from-indigo-950/60 to-slate-950 p-5 rounded-2xl border border-emerald-500/40 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 badge-glow-emerald">
                    <Send className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      {forwardedResult.status}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 font-outfit mt-0.5">
                      Application Forwarded Successfully
                    </h4>
                    <span className="text-xs text-slate-500 font-mono">Ref ID: {forwardedResult.request_id}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Applicant:</span>
                    <span className="font-bold text-slate-900">{forwardedResult.customer_request.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Forwarded Loan Amount:</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      ₹{forwardedResult.customer_request.loan_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Selected Category:</span>
                    <span className="text-slate-800 font-medium">{forwardedResult.customer_request.loan_purpose}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Attached Pay Files:</span>
                    <span className="text-emerald-400 font-semibold">2 Verified Documents</span>
                  </div>
                </div>

                <div className="bg-indigo-950/80 p-3.5 rounded-xl border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
                  <span className="font-bold block text-indigo-300">Intake Milestone Reached:</span>
                  <p className="text-[11px] text-indigo-200/90 leading-relaxed">
                    Your application data and extracted asset indicators are now ready for real-time XGBoost probability calculation.
                  </p>
                </div>

                <button
                  onClick={() => onForwardComplete && onForwardComplete(forwardedResult)}
                  className="w-full py-3.5 rounded-xl font-bold text-xs text-slate-900 bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
                >
                  <span>Proceed to AI Smart Matcher</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <span className="text-slate-600 font-bold block font-outfit">Intake Summary Draft:</span>
                  <div className="flex justify-between text-slate-500">
                    <span>Applicant Name:</span>
                    <span className="text-slate-900 font-semibold">{applicant.customer_name || "John Doe"}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Requested Loan Amount:</span>
                    <span className="text-indigo-400 font-mono font-bold">₹{Number(loanAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Loan Purpose:</span>
                    <span className="text-slate-800 font-medium">{loanPurpose}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Uploaded Files:</span>
                    <span className="text-emerald-400 font-semibold">Salary Slip & Bank Statement</span>
                  </div>
                </div>

                <button
                  onClick={handleForwardRequest}
                  disabled={isForwarding || !salarySlipFile.uploaded || !bankStatementFile.uploaded}
                  className="w-full py-4 rounded-xl font-bold text-sm text-slate-900 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isForwarding ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Forwarding Customer Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit & Forward Customer Request</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

