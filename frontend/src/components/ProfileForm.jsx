import React from 'react';
import { DollarSign, ShieldAlert, CreditCard, Award, Building2, Sliders, RefreshCw, User, Sparkles } from 'lucide-react';
import { PRODUCTS_CATALOG } from '../services/api';

export default function ProfileForm({ applicant, onChange, onEvaluate, onReset }) {
  const handleChange = (field, value) => {
    onChange({
      ...applicant,
      [field]: value
    });
  };

  const dti = Math.round(((applicant.existing_emis || 0) / Math.max(applicant.income || 1, 1)) * 100);

  const getDtiBadge = (val) => {
    if (val <= 35) return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: 'Healthy DTI' };
    if (val <= 50) return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', label: 'Moderate DTI' };
    return { color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', label: 'High DTI Burden' };
  };

  const getCibilBadge = (score) => {
    if (score >= 750) return { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: 'Prime Score' };
    if (score >= 650) return { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', label: 'Fair Score' };
    return { color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', label: 'Subprime Risk' };
  };

  const dtiStatus = getDtiBadge(dti);
  const cibilStatus = getCibilBadge(applicant.credit_score || 700);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-6">
      
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 font-outfit flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Financial Profile Inputs
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify assets, income, or credit parameters to evaluate AI recommendations
          </p>
        </div>

        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-850 transition-all font-semibold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Customer Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-indigo-400" /> Applicant Name
          </label>
          <input
            type="text"
            value={applicant.customer_name || ''}
            onChange={(e) => handleChange('customer_name', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
            placeholder="John Doe"
          />
        </div>

        {/* Requested Product Select */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Requested Product
          </label>
          <select
            value={applicant.requested_product_id || 'standard_personal_loan'}
            onChange={(e) => handleChange('requested_product_id', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
          >
            {PRODUCTS_CATALOG.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.interest_rate_apr}% APR)</option>
            ))}
          </select>
        </div>

        {/* Monthly Net Income */}
        <div className="space-y-1.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-600">Monthly Net Income</label>
            <span className="text-xs font-mono text-indigo-400 font-black">₹{(applicant.income || 0).toLocaleString()}</span>
          </div>
          <input
            type="number"
            value={applicant.income}
            onChange={(e) => handleChange('income', Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-bold"
          />
          <input
            type="range"
            min="20000"
            max="300000"
            step="5000"
            value={applicant.income}
            onChange={(e) => handleChange('income', Number(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
          />
        </div>

        {/* Existing EMIs + Live DTI Meter */}
        <div className="space-y-1.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-600">Existing Monthly EMIs</label>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${dtiStatus.color}`}>
              {dti}% DTI ({dtiStatus.label})
            </span>
          </div>
          <input
            type="number"
            value={applicant.existing_emis}
            onChange={(e) => handleChange('existing_emis', Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-bold"
          />
          <input
            type="range"
            min="0"
            max="120000"
            step="2000"
            value={applicant.existing_emis}
            onChange={(e) => handleChange('existing_emis', Number(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
          />
        </div>

        {/* Credit Score Slider */}
        <div className="space-y-1.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-600">CIBIL / FICO Score</label>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${cibilStatus.color}`}>
              {applicant.credit_score} ({cibilStatus.label})
            </span>
          </div>
          <input
            type="range"
            min="500"
            max="850"
            step="10"
            value={applicant.credit_score}
            onChange={(e) => handleChange('credit_score', Number(e.target.value))}
            className="w-full accent-emerald-500 h-2 bg-slate-100 rounded-lg cursor-pointer mt-1"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-0.5">
            <span>500 (Low)</span>
            <span>675 (Average)</span>
            <span>750+ (Prime)</span>
          </div>
        </div>

        {/* Fixed Deposit Assets (Highlight Feature) */}
        <div className="space-y-1.5 bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-500/30">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-emerald-300 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Bank FD Collateral
            </label>
            <span className="text-xs font-mono text-emerald-400 font-black">₹{(applicant.fixed_deposit || 0).toLocaleString()}</span>
          </div>
          <input
            type="number"
            value={applicant.fixed_deposit}
            onChange={(e) => handleChange('fixed_deposit', Number(e.target.value))}
            className="w-full bg-white border border-emerald-500/30 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono font-bold"
          />
          <input
            type="range"
            min="0"
            max="1500000"
            step="25000"
            value={applicant.fixed_deposit}
            onChange={(e) => handleChange('fixed_deposit', Number(e.target.value))}
            className="w-full accent-emerald-400 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
          />
        </div>

        {/* Requested Loan Amount */}
        <div className="space-y-1.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-600">Requested Loan Amount</label>
            <span className="text-xs font-mono text-indigo-400 font-black">₹{(applicant.loan_amount || 0).toLocaleString()}</span>
          </div>
          <input
            type="number"
            value={applicant.loan_amount}
            onChange={(e) => handleChange('loan_amount', Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-bold"
          />
          <input
            type="range"
            min="50000"
            max="2000000"
            step="25000"
            value={applicant.loan_amount}
            onChange={(e) => handleChange('loan_amount', Number(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
          />
        </div>

        {/* Tenure Selection Pills */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-slate-600 block">Repayment Tenure</label>
          <div className="grid grid-cols-4 gap-2">
            {[12, 24, 36, 60].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => handleChange('tenure_months', m)}
                className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                  applicant.tenure_months === m
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 border-indigo-500 text-slate-900 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                {m} Mos ({m / 12} Yr)
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Execute Button */}
      <button
        onClick={onEvaluate}
        className="w-full py-4 rounded-xl font-bold text-sm text-slate-900 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2"
      >
        <Sparkles className="w-4 h-4 text-indigo-300" />
        <span>Run AI Matcher & Calculate Approval Probability</span>
      </button>

    </div>
  );
}

