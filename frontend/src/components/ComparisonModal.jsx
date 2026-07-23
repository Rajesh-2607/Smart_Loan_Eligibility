import React from 'react';
import { CheckCircle2, TrendingDown, Layers, X, ShieldAlert, Award, Star, Check } from 'lucide-react';

export default function ComparisonModal({ evaluation, onClose }) {
  if (!evaluation) return null;
  const { all_options, requested_product, recommended_product } = evaluation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 space-y-6 shadow-2xl my-8 relative overflow-hidden">
        
        {/* Glow Line Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 badge-glow-indigo">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-outfit">Bank Loan Product Catalog Evaluation Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluating customer financial profile against all 6 bank catalog loan products ranked by AI approval probability.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase bg-slate-50 font-bold">
                <th className="p-3.5">Rank / Product</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">APR Rate</th>
                <th className="p-3.5">Approval Likelihood</th>
                <th className="p-3.5">Monthly EMI</th>
                <th className="p-3.5">Total Interest</th>
                <th className="p-3.5">Match Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {all_options.map((prod, index) => {
                const isRecommended = prod.id === recommended_product.id;
                const isRequested = prod.id === requested_product.id;

                return (
                  <tr
                    key={prod.id}
                    className={`transition-all ${
                      isRecommended
                        ? 'bg-indigo-50 font-bold text-slate-900 border-l-4 border-l-emerald-400'
                        : isRequested
                        ? 'bg-slate-50 text-slate-600'
                        : 'hover:bg-white/40 text-slate-500'
                    }`}
                  >
                    {/* Rank & Name */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs font-mono shrink-0 ${
                          isRecommended ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30' : 'bg-slate-100 text-slate-500'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 block text-sm font-outfit">{prod.name}</span>
                          {prod.requires_collateral && (
                            <span className="text-[10px] text-cyan-400 block font-mono font-bold">Secured by: {prod.collateral_type}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-white text-slate-600 text-[11px] font-mono border border-slate-200">
                        {prod.category}
                      </span>
                    </td>

                    {/* APR */}
                    <td className="p-3.5">
                      <span className={`font-mono text-sm font-black ${isRecommended ? 'text-emerald-400' : 'text-slate-800'}`}>
                        {prod.interest_rate_apr}%
                      </span>
                    </td>

                    {/* Approval Bar */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-20 bg-white rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className={`h-2 rounded-full ${
                              prod.approval_probability >= 80 ? 'bg-emerald-400' : prod.approval_probability >= 60 ? 'bg-amber-400' : 'bg-rose-500'
                            }`}
                            style={{ width: `${prod.approval_probability}%` }}
                          ></div>
                        </div>
                        <span className="font-bold font-mono text-xs text-slate-800">{prod.approval_probability}%</span>
                      </div>
                    </td>

                    {/* EMI */}
                    <td className="p-3.5 font-mono font-bold text-indigo-400 text-sm">
                      ₹{prod.emi.toLocaleString()}
                    </td>

                    {/* Total Interest */}
                    <td className="p-3.5 font-mono text-purple-300 font-semibold">
                      ₹{prod.total_interest.toLocaleString()}
                    </td>

                    {/* Match Badge */}
                    <td className="p-3.5">
                      {isRecommended && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/40 flex items-center gap-1 w-fit badge-glow-emerald">
                          <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" /> Best Fit
                        </span>
                      )}
                      {isRequested && !isRecommended && (
                        <span className="px-2.5 py-1 rounded-full bg-white text-slate-500 text-[10px] font-bold border border-slate-200 w-fit block">
                          Requested
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer CTA */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-xs text-slate-900 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/30"
          >
            Close Matrix View
          </button>
        </div>

      </div>
    </div>
  );
}

