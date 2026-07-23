import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, TrendingDown, ShieldCheck, DollarSign, 
  ArrowRight, FileCheck, Info, Award, HelpCircle, Layers, Calendar, ChevronRight, Check, Star
} from 'lucide-react';

export default function RecommendationDashboard({ evaluation, onOpenCompare, onApplyProduct }) {
  const [applied, setApplied] = useState(false);
  if (!evaluation) return null;

  const { recommended_product, requested_product, comparison, ai_explanation, ml_risk_assessment, applicant } = evaluation;

  const handleApply = () => {
    setApplied(true);
    if (onApplyProduct) {
      onApplyProduct(recommended_product);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner: Interest Savings Highlight */}
      {comparison.is_better_match && (
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-indigo-950/40 to-slate-950 shadow-xl shadow-emerald-500/10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 badge-glow-emerald shrink-0">
                <TrendingDown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-mono tracking-wider font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Smart Redirect Match
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Interest Savings</span>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 font-outfit mt-1">
                  Save {comparison.interest_savings_apr}% Annual APR (₹{comparison.total_interest_saved.toLocaleString()} Total Interest Saved)
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Application redirected from <span className="line-through text-slate-500 font-bold">{requested_product.name} ({requested_product.interest_rate_apr}%)</span> to <span className="text-emerald-400 font-extrabold">{recommended_product.name} ({recommended_product.interest_rate_apr}%)</span> based on collateral assets.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenCompare}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-700 transition-all flex items-center gap-2 shrink-0 shadow-md"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Catalog Matrix</span>
            </button>
          </div>
        </div>
      )}

      {/* Recommended Product Hero Card */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-slate-50/90 relative overflow-hidden space-y-6 shadow-2xl">
        
        {/* Glow accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold border border-emerald-500/30 flex items-center gap-1.5 badge-glow-emerald">
                <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" /> #1 Recommended Option
              </span>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-mono font-semibold border border-indigo-500/20">
                {recommended_product.category}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-outfit mt-2">
              {recommended_product.name}
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed max-w-xl">{recommended_product.description}</p>
          </div>

          {/* Approval Odds Meter Circle */}
          <div className="flex items-center space-x-4 bg-white/90 p-4 rounded-2xl border border-slate-200 shadow-inner">
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-500 block uppercase font-bold">Approval Odds</span>
              <span className="text-3xl font-black text-emerald-400 font-outfit">
                {recommended_product.approval_probability}%
              </span>
              <span className="text-[10px] text-emerald-300 block font-bold">+ {comparison.approval_delta_pct}% vs baseline</span>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center bg-emerald-950/60 text-emerald-400 font-black text-base shadow-lg shadow-emerald-500/20 font-outfit">
              {recommended_product.approval_probability >= 80 ? "HIGH" : "MED"}
            </div>
          </div>
        </div>

        {/* Product Stats Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="bg-white/90 p-4 rounded-xl border border-slate-200 hover:border-emerald-500/30 transition-all">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Interest Rate (APR)</span>
            <span className="text-2xl font-black text-emerald-400 font-outfit">{recommended_product.interest_rate_apr}%</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Fixed Annual APR</span>
          </div>

          <div className="bg-white/90 p-4 rounded-xl border border-slate-200 hover:border-indigo-500/30 transition-all">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Monthly EMI</span>
            <span className="text-2xl font-black text-indigo-400 font-outfit">₹{recommended_product.emi.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">{applicant.tenure_months || 36} Months Tenure</span>
          </div>

          <div className="bg-white/90 p-4 rounded-xl border border-slate-200 hover:border-purple-500/30 transition-all">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Total Interest</span>
            <span className="text-2xl font-black text-purple-400 font-outfit">₹{recommended_product.total_interest.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Total Finance Cost</span>
          </div>

          <div className="bg-white/90 p-4 rounded-xl border border-slate-200 hover:border-sky-500/30 transition-all">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Processing Fee</span>
            <span className="text-2xl font-black text-sky-400 font-outfit">
              {recommended_product.processing_fee === 0 ? "₹0 (WAIVED)" : `₹${recommended_product.processing_fee.toLocaleString()}`}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">{recommended_product.processing_fee_pct}% Upfront Fee</span>
          </div>

        </div>

        {/* Benefits Grid */}
        <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider font-mono">Product Advantages & Features</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {recommended_product.benefits.map((b, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-slate-800 font-semibold">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gemini Explainable AI Card */}
        <div className="glass-card p-5 rounded-xl border border-indigo-500/40 bg-indigo-950/30 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">
                Gemini Explainable AI Recommendation Rationale
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{ai_explanation.llm_model}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
            {ai_explanation.summary}
          </p>
        </div>

        {/* Application CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Bank Decision Engine Verified. Pre-approved for digital disbursement.</span>
          </div>

          <button
            onClick={handleApply}
            disabled={applied}
            className={`px-8 py-3.5 rounded-xl font-bold text-sm text-slate-900 transition-all shadow-xl flex items-center gap-2 ${
              applied
                ? 'bg-emerald-600 cursor-default shadow-emerald-600/20'
                : 'bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-purple-500 shadow-indigo-600/30'
            }`}
          >
            {applied ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-900" />
                <span>Application Submitted & Logged!</span>
              </>
            ) : (
              <>
                <span>Apply for Recommended Product</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}

