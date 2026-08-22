'use client';

import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText,
  Copy,
  Check,
  Download,
  FileDown,
  Calendar,
  Sparkles,
  Eye,
  FileCode,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { exportReportElementToPdf } from '../lib/pdfExport';

interface MarkdownReportRendererProps {
  reportMarkdown?: string;
  cveId?: string | null;
  title?: string;
  severity?: string;
  cvssScore?: number;
  verdict?: string;
  createdAt?: string;
  modelUsed?: string;
  className?: string;
}

export default function MarkdownReportRenderer({
  reportMarkdown = '',
  cveId,
  title,
  severity = 'HIGH',
  cvssScore,
  verdict = 'CONFIRMED VULNERABLE',
  createdAt,
  modelUsed = 'gemma4:e2b',
  className = '',
}: MarkdownReportRendererProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!reportMarkdown) {
    return (
      <div className="bg-white border border-[#dadce0] rounded-2xl p-12 text-center shadow-google-card flex flex-col items-center justify-center space-y-3 min-h-[300px]">
        <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center animate-pulse">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#5f6368]">Security Triage Report Pending</h3>
        <p className="text-xs text-[#80868b] max-w-sm leading-relaxed">
          The autonomous triage report is being generated. Executive summaries, MITRE ATT&CK mappings, and remediation actions will appear upon completion.
        </p>
      </div>
    );
  }

  // Copy full markdown
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download .md file
  const handleDownloadMarkdown = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberTriage_${cveId || 'Report'}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export clean PDF document file directly
  const handleExportPdf = async () => {
    if (!reportRef.current || isExportingPdf) return;

    try {
      setIsExportingPdf(true);
      await exportReportElementToPdf(reportRef.current, {
        cveId,
        title,
      });
    } catch (err) {
      console.error('Failed to generate PDF document:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]';
      case 'HIGH':
        return 'bg-[#feefe3] text-[#c26401] border-[#fedfc8]';
      case 'MEDIUM':
        return 'bg-[#fef7e0] text-[#b06000] border-[#fce8b2]';
      case 'LOW':
        return 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]';
      default:
        return 'bg-[#f1f3f4] text-[#5f6368] border-[#dadce0]';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Action Header Bar */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#f1f3f4] p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode('formatted')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'formatted'
                ? 'bg-white text-[#1a73e8] shadow-sm'
                : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Rendered Report</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              viewMode === 'raw'
                ? 'bg-white text-[#1a73e8] shadow-sm'
                : 'text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Raw Markdown</span>
          </button>
        </div>

        {/* Right: Export & Copy Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#dadce0] hover:border-[#1a73e8] text-[#3c4043] flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="Copy Raw Markdown to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#1e8e3e]" /> : <Copy className="w-3.5 h-3.5 text-[#5f6368]" />}
            <span>{copied ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#f8f9fa] text-[#1a73e8] flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="Download as Markdown (.md) File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .MD</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] disabled:bg-[#8ab4f8] text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            title="Generate and Download PDF Document"
          >
            {isExportingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>{isExportingPdf ? 'Generating PDF...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main Report Container (Rendered Document / PDF Target) */}
      <div
        ref={reportRef}
        className="bg-white border border-[#dadce0] rounded-2xl p-6 sm:p-8 shadow-google-card"
      >
        {/* Executive Header Banner */}
        <div className="pb-6 border-b border-[#dadce0] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#202124] text-white font-mono text-[11px] font-bold tracking-wide">
                SOC CLASSIFICATION: RESTRICTED
              </span>
              <span className="text-[#80868b] font-mono text-[11px]">
                TLP:AMBER+STRICT
              </span>
            </div>
            <div className="flex items-center gap-2 text-[#5f6368] font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-[#80868b]" />
              <span>{createdAt || new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full border border-[#d2e3fc]">
                  {cveId || 'CVE-ADVISORY'}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadgeClass(severity)}`}>
                  {severity.toUpperCase()} {cvssScore !== undefined ? `(CVSS ${cvssScore})` : ''}
                </span>
                <span className="text-xs font-bold text-[#1e8e3e] bg-[#e6f4ea] px-2.5 py-0.5 rounded-full border border-[#ceead6] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {verdict}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#202124] tracking-tight">
                {title || 'Security Triage & Empirical Verification Report'}
              </h1>
            </div>

            <div className="flex items-center gap-2 bg-[#f8f9fa] border border-[#dadce0] p-2.5 rounded-xl text-xs font-mono text-[#5f6368] self-start md:self-auto">
              <Sparkles className="w-4 h-4 text-[#1a73e8]" />
              <div>
                <div className="text-[10px] text-[#80868b] uppercase font-bold">Analysis Engine</div>
                <div className="font-semibold text-[#202124]">{modelUsed}</div>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode: Raw Markdown */}
        {viewMode === 'raw' ? (
          <div className="mt-6">
            <pre className="whitespace-pre-wrap font-mono text-xs bg-[#f8f9fa] p-5 rounded-xl border border-[#dadce0] text-[#202124] overflow-x-auto leading-relaxed max-h-[700px] overflow-y-auto">
              {reportMarkdown}
            </pre>
          </div>
        ) : (
          /* View Mode: Rendered Rich Markdown Document */
          <div className="mt-6 space-y-6 text-[#202124] leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl sm:text-2xl font-bold text-[#202124] pb-2 border-b border-[#f1f3f4] mt-6 mb-4 flex items-center gap-2" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-base sm:text-lg font-bold text-[#1a73e8] pb-1.5 border-b border-[#e8f0fe] mt-6 mb-3 flex items-center gap-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-sm sm:text-base font-bold text-[#202124] mt-4 mb-2" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-xs sm:text-sm text-[#3c4043] leading-relaxed mb-3" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-outside pl-5 space-y-1.5 text-xs sm:text-sm text-[#3c4043] mb-4" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-outside pl-5 space-y-1.5 text-xs sm:text-sm text-[#3c4043] mb-4 font-sans" {...props} />
                ),
                li: ({ node, children, ...props }) => (
                  <li className="leading-relaxed pl-1" {...props}>
                    {children}
                  </li>
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold text-[#202124]" {...props} />
                ),
                hr: ({ node, ...props }) => (
                  <hr className="my-6 border-[#e8eaed]" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-[#1a73e8] bg-[#f8faff] p-3.5 rounded-r-xl my-4 text-xs sm:text-sm text-[#3c4043] italic shadow-sm" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-4 rounded-xl border border-[#dadce0] shadow-sm">
                    <table className="min-w-full divide-y divide-[#dadce0] text-xs text-left" {...props} />
                  </div>
                ),
                thead: ({ node, ...props }) => (
                  <thead className="bg-[#f8f9fa] text-[#202124] font-bold" {...props} />
                ),
                tbody: ({ node, ...props }) => (
                  <tbody className="divide-y divide-[#f1f3f4] bg-white" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="px-4 py-2.5 font-bold uppercase text-[11px] text-[#5f6368] tracking-wider" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="px-4 py-2.5 text-[#3c4043]" {...props} />
                ),
                code: ({ node, className, children, ...props }) => {
                  const isInline = !className && typeof children === 'string' && !children.includes('\n');
                  if (isInline) {
                    return (
                      <code className="bg-[#f1f3f4] text-[#d93025] font-mono text-[11px] px-1.5 py-0.5 rounded border border-[#dadce0]" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <div className="relative group my-3">
                      <div className="bg-[#202124] text-[#e8eaed] p-4 rounded-xl font-mono text-xs overflow-x-auto border border-[#3c4043] shadow-inner">
                        <code {...props}>{children}</code>
                      </div>
                    </div>
                  );
                },
              }}
            >
              {reportMarkdown}
            </ReactMarkdown>
          </div>
        )}

        {/* Official Report Footer */}
        <div className="mt-8 pt-4 border-t border-[#f1f3f4] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#80868b] font-mono gap-2">
          <span>CyberTriage AI • Automated Evidence-Driven Verification Ledger</span>
          <span>Verified in Docker Ephemeral Sandbox Lab</span>
        </div>
      </div>
    </div>
  );
}
