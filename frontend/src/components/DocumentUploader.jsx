import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, Sparkles, Database, Code, ShieldCheck } from 'lucide-react';
import { uploadDocument } from '../services/api';

export default function DocumentUploader({ onOcrExtracted }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [extractedData, setExtractedData] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const result = await uploadDocument(file);
      if (result && result.ocr_result) {
        setExtractedData(result.ocr_result);
        if (onOcrExtracted) {
          onOcrExtracted(result.ocr_result.parsed_data);
        }
      }
    } catch (err) {
      console.error("Document parsing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-white relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2 badge-glow-indigo">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> PaddleOCR Financial Extractor
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">Financial Document OCR Extractor</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl">
              Extract salary parameters, debt obligations, and fixed deposit assets from bank statements & salary slips.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="glass-panel p-8 rounded-2xl border-2 border-dashed border-indigo-200 text-center space-y-4 bg-indigo-50/20 hover:bg-indigo-50/50 transition-all relative cursor-pointer group">
        <input type="file" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg,.txt" className="absolute inset-0 opacity-0 cursor-pointer z-10" />
        <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
          <Upload className="w-7 h-7" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-base">Click or Drag Financial Document Here to Parse</h4>
          <p className="text-xs text-slate-500 mt-1">Upload Bank Statement, Salary Slip, or Fixed Deposit Certificate (PDF, PNG, JPG, TXT)</p>
          {fileName && (
            <span className="inline-block mt-3 text-xs font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
              Selected File: {fileName}
            </span>
          )}
        </div>
      </div>

      {/* OCR Processing Scanning Effect */}
      {isProcessing ? (
        <div className="glass-panel p-16 rounded-2xl text-center space-y-4 border border-slate-200 relative overflow-hidden">
          <div className="animate-laser-scan"></div>
          <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-800 font-semibold animate-pulse font-outfit text-base">
            Scanning document text with PaddleOCR Engine & Regex NLP...
          </p>
        </div>
      ) : (
        extractedData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Raw OCR Text Terminal */}
            <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-mono text-slate-600 uppercase tracking-wider font-bold">OCR Raw Text Output</span>
                </div>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono font-bold">
                  OCR Confidence: {(extractedData.ocr_confidence * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed overflow-x-auto whitespace-pre-line h-60">
                {extractedData.extracted_text_preview}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Text blocks normalized & verified against financial schema.</span>
              </p>
            </div>

            {/* Structured Output View */}
            <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-mono text-purple-700 uppercase tracking-wider font-bold">Extracted Financial JSON</span>
                </div>
                <span className="text-xs text-slate-500 font-semibold">{extractedData.document_type}</span>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto h-60">
                <pre>{JSON.stringify(extractedData.parsed_data, null, 2)}</pre>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[11px] text-slate-500 font-medium">Customer</span>
                  <p className="text-sm font-bold text-slate-900 truncate">{extractedData.parsed_data.customer_name}</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <span className="text-[11px] text-slate-500 font-medium">Monthly Salary</span>
                  <p className="text-sm font-bold text-indigo-700">₹{(extractedData.parsed_data.monthly_income || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[11px] text-slate-500 font-medium">FD Assets</span>
                  <p className="text-sm font-bold text-emerald-700">₹{(extractedData.parsed_data.fixed_deposit || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

          </div>
        )
      )}

    </div>
  );
}
