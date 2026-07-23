import React, { useState } from 'react';
import { BarChart3, ShieldCheck, FileSpreadsheet, CheckCircle2, TrendingDown, Users, Sliders, Database, ArrowUpRight, Search, Filter } from 'lucide-react';
import { PRODUCTS_CATALOG } from '../services/api';

export default function AdminDashboard({ auditLogs }) {
  const [catalog, setCatalog] = useState(PRODUCTS_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');

  // Fallback demo audit logs if none recorded yet
  const logsToDisplay = auditLogs.length > 0 ? auditLogs : [
    {
      id: "REC-1008",
      timestamp: "2026-07-23 09:42:10",
      customer_name: "John Doe",
      requested_product: "Unsecured Express Personal Loan",
      recommended_product: "Secured Overdraft / Loan Against Fixed Deposit",
      interest_savings_apr: 6.3,
      total_interest_saved: 48500,
      approval_probability: 98.5,
      status: "Matched"
    },
    {
      id: "REC-1007",
      timestamp: "2026-07-23 09:35:12",
      customer_name: "Sarah Connor",
      requested_product: "Unsecured Express Personal Loan",
      recommended_product: "Debt Consolidation & Balance Transfer Loan",
      interest_savings_apr: 3.9,
      total_interest_saved: 32000,
      approval_probability: 88.0,
      status: "Matched"
    },
    {
      id: "REC-1006",
      timestamp: "2026-07-23 09:10:05",
      customer_name: "Alex Mercer",
      requested_product: "Pre-Approved Instant Digital Loan",
      recommended_product: "Pre-Approved Instant Digital Loan",
      interest_savings_apr: 0.0,
      total_interest_saved: 0,
      approval_probability: 94.0,
      status: "Direct Approved"
    }
  ];

  const filteredLogs = logsToDisplay.filter(log =>
    log.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.recommended_product.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-indigo-50 via-purple-50 to-white relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 mb-2 badge-glow-purple">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Underwriter & Portfolio Analytics
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">Bank Underwriter Control Center</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
              Track real-time recommendation conversions, customer APR savings, and manage eligibility thresholds.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-white/90 px-4 py-2.5 rounded-xl border border-slate-200 text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Matched Redirect Rate</span>
              <span className="text-xl font-black text-emerald-400 font-outfit">66.7%</span>
            </div>
            <div className="bg-white/90 px-4 py-2.5 rounded-xl border border-slate-200 text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-mono font-bold">Avg Customer Savings</span>
              <span className="text-xl font-black text-indigo-400 font-outfit">₹40,250</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-2 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Total Evaluated Applicants</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-3xl font-black text-slate-900 font-outfit">{filteredLogs.length + 14}</span>
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18.5% conversion increase
          </span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-2 hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">FD Asset Pledge Conversion</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400 font-outfit">42.8%</span>
          <span className="text-xs text-slate-500 font-medium">Fixed Deposit secured loans</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-2 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">Avg APR Reduction</span>
            <TrendingDown className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-3xl font-black text-purple-400 font-outfit">5.1% APR</span>
          <span className="text-xs text-slate-500 font-medium">Customer interest savings</span>
        </div>

      </div>

      {/* Decision Audit Log Stream */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-slate-900 font-outfit flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            Decision Audit Stream Log
          </h3>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-mono font-bold shrink-0">
              {filteredLogs.length} Entries
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono uppercase bg-slate-50 font-bold">
                <th className="p-3">Ref ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Applicant Name</th>
                <th className="p-3">Requested Product</th>
                <th className="p-3">Engine Recommendation</th>
                <th className="p-3">APR Savings</th>
                <th className="p-3">Total Savings</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/50 transition-all text-slate-600">
                  <td className="p-3 font-mono font-black text-indigo-400">{log.id}</td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">{log.timestamp}</td>
                  <td className="p-3 font-bold text-slate-900">{log.customer_name}</td>
                  <td className="p-3 text-slate-500 line-through text-[11px]">{log.requested_product}</td>
                  <td className="p-3 font-bold text-emerald-400">{log.recommended_product}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">
                    {log.interest_savings_apr > 0 ? `${log.interest_savings_apr}%` : '-'}
                  </td>
                  <td className="p-3 font-mono font-bold text-purple-300">
                    {log.total_interest_saved > 0 ? `₹${log.total_interest_saved.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'Matched' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white text-slate-600 border border-slate-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catalog Matrix Rules Configurator */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 font-outfit flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          Active Bank Product Rules Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalog.map((prod) => (
            <div key={prod.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-slate-900 text-sm font-outfit">{prod.name}</h4>
                <span className="text-[10px] bg-white text-slate-600 px-2 py-0.5 rounded-full font-mono border border-slate-200 font-bold">
                  {prod.category}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-white/90 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">APR Rate</span>
                  <span className="text-emerald-400 font-black">{prod.interest_rate_apr}%</span>
                </div>

                <div className="bg-white/90 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Min Credit</span>
                  <span className="text-indigo-400 font-black">{prod.min_credit_score}</span>
                </div>

                <div className="bg-white/90 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Max DTI</span>
                  <span className="text-amber-400 font-black">{prod.max_dti_pct}%</span>
                </div>

                <div className="bg-white/90 p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Fee Rate</span>
                  <span className="text-sky-400 font-black">{prod.processing_fee_pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

