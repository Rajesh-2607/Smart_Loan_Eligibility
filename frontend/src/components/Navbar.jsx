import React, { useState } from 'react';
import { ShieldCheck, FileText, BarChart3, UserCheck, Layers, Sparkles, Menu, X, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onSelectPreset }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'customer_portal', label: 'Customer Portal', subtitle: 'Module 1', icon: FileText },
    { id: 'evaluator', label: 'Smart Matcher', subtitle: 'AI Engine', icon: Sparkles },
    { id: 'ocr', label: 'Document OCR', subtitle: 'PaddleOCR', icon: FileText },
    { id: 'compare', label: 'Catalog Matrix', subtitle: 'Comparison', icon: Layers },
    { id: 'admin', label: 'Underwriter Admin', subtitle: 'Audit Logs', icon: BarChart3 },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-indigo-100 shadow-sm shadow-indigo-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('customer_portal')}>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-300"></div>
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-300">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 font-outfit">LoanPulse</span>
                <span className="text-[11px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 badge-glow-emerald shimmer-badge">
                  <Activity className="w-3 h-3 animate-pulse" /> Live System
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">Smart Loan Eligibility & AI Recommendation Engine</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTabClick(t.id)}
                  className={`relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200/60'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-sm'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-2">
            <div className="grid grid-cols-1 gap-2">
              {tabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleTabClick(t.id)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
