'use client';

import React, { useState } from 'react';
import { FileText, Copy, Check, Download, Share2, Sparkles } from 'lucide-react';

interface ReportViewerProps {
  reportMarkdown?: string;
}

export default function ReportViewer({ reportMarkdown }: ReportViewerProps) {
  const [copied, setCopied] = useState(false);

  if (!reportMarkdown) {
    return (
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-google-card flex flex-col items-center justify-center text-center min-h-[220px]">
        <FileText className="w-10 h-10 text-[#bdc1c6] mb-2 animate-pulse" />
        <h3 className="text-sm font-semibold text-[#5f6368]">Security Triage Report Pending</h3>
        <p className="text-xs text-[#80868b] max-w-xs mt-1">
          Final synthesized report with executive summary, MITRE mappings, and remediation will render upon completion.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberTriage_Report_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-google-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f1f3f4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#202124]">Executive Security Report</h3>
            <p className="text-xs text-[#5f6368]">Synthesized with Local Gemma Triage Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#dadce0] hover:border-[#1a73e8] text-[#3c4043] flex items-center gap-1.5 transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#1e8e3e]" /> : <Copy className="w-3.5 h-3.5 text-[#5f6368]" />}
            <span>{copied ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Markdown Content */}
      <div className="mt-6 prose prose-sm max-w-none text-[#202124] space-y-4 leading-relaxed font-sans">
        <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm bg-[#f8f9fa] p-5 rounded-xl border border-[#dadce0] overflow-x-auto text-[#202124]">
          {reportMarkdown}
        </pre>
      </div>
    </div>
  );
}
