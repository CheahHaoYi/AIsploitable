'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Search,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Cpu,
  ExternalLink,
  Filter,
  Layers,
} from 'lucide-react';
import { ReportSummary } from '../lib/types';
import { fetchReports } from '../lib/api';

interface ReportsTabProps {
  activeReportMarkdown?: string;
  activeInvestigationId?: string;
}

export default function ReportsTab({
  activeReportMarkdown,
  activeInvestigationId,
}: ReportsTabProps) {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReports();
      setReports(data);
      if (data && data.length > 0 && !selectedReportId) {
        setSelectedReportId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeReportMarkdown]);

  // If there's an active investigation with a report, ensure it's selected or added
  useEffect(() => {
    if (activeInvestigationId && activeReportMarkdown) {
      loadReports();
    }
  }, [activeInvestigationId, activeReportMarkdown]);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      (r.cve_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity =
      severityFilter === 'ALL' || r.severity.toUpperCase() === severityFilter.toUpperCase();
    return matchesSearch && matchesSeverity;
  });

  const selectedReport =
    reports.find((r) => r.id === selectedReportId) || (reports.length > 0 ? reports[0] : null);

  const handleCopy = () => {
    if (!selectedReport?.report_markdown) return;
    navigator.clipboard.writeText(selectedReport.report_markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedReport?.report_markdown) return;
    const blob = new Blob([selectedReport.report_markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CyberTriage_${selectedReport.cve_id || 'Report'}_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityBadgeColor = (sev: string) => {
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
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-4 shadow-google-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reports by CVE ID, title, or summary keyword..."
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8] focus:bg-white transition-all text-[#202124]"
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                severityFilter === sev
                  ? 'bg-[#1a73e8] border-[#1a73e8] text-white shadow-sm'
                  : 'bg-white border-[#dadce0] text-[#5f6368] hover:bg-[#f8f9fa]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Master-Detail Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Master List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#5f6368] uppercase tracking-wider">
              Reports Ledger ({filteredReports.length})
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[700px] pr-1">
            {filteredReports.map((r) => {
              const isSelected = r.id === selectedReport?.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-md ring-2 ring-[#1a73e8]/20'
                      : 'bg-white border-[#dadce0] hover:border-[#bdc1c6] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-[#1a73e8]">
                      {r.cve_id || 'CVE-ADVISORY'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadgeColor(
                        r.severity
                      )}`}
                    >
                      {r.severity} ({r.cvss_score})
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#202124] line-clamp-1 mb-1">
                    {r.title}
                  </h4>
                  <p className="text-[11px] text-[#5f6368] line-clamp-2 leading-relaxed mb-3">
                    {r.summary}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#5f6368] border-t border-[#f1f3f4] pt-2">
                    <div className="flex items-center gap-1 font-semibold text-[#1e8e3e]">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{r.verdict}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[#80868b]">
                      {r.created_at.slice(0, 10)}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredReports.length === 0 && (
              <div className="bg-white border border-[#dadce0] rounded-2xl p-8 text-center text-[#80868b] space-y-2">
                <FileText className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs">No reports match the search filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane: Report Content Renderer (8 cols) */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-google-card space-y-6">
              {/* Header Bar with Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f1f3f4]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full">
                      {selectedReport.cve_id || 'CVE-TARGET'}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadgeColor(
                        selectedReport.severity
                      )}`}
                    >
                      {selectedReport.severity} (CVSS {selectedReport.cvss_score})
                    </span>
                    <span className="text-xs font-bold text-[#1e8e3e] bg-[#e6f4ea] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {selectedReport.verdict}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[#202124] tracking-tight pt-1">
                    {selectedReport.title}
                  </h2>

                  <div className="flex items-center gap-3 text-xs text-[#5f6368] pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#80868b]" />
                      <span>{selectedReport.created_at}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-[#1a73e8]" />
                      <span className="font-mono">{selectedReport.model_used}</span>
                    </span>
                  </div>
                </div>

                {/* Export & Copy Actions */}
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#dadce0] hover:border-[#1a73e8] text-[#3c4043] flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#1e8e3e]" /> : <Copy className="w-3.5 h-3.5 text-[#5f6368]" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MD</span>
                  </button>
                </div>
              </div>

              {/* Rendered Markdown Report View */}
              <div className="prose prose-sm max-w-none text-[#202124] space-y-4 leading-relaxed font-sans">
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm bg-[#f8f9fa] p-6 rounded-2xl border border-[#dadce0] text-[#202124] leading-relaxed max-h-[600px] overflow-y-auto scrollbar-thin">
                  {selectedReport.report_markdown}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#dadce0] rounded-2xl p-12 text-center shadow-google-card flex flex-col items-center justify-center space-y-3 min-h-[400px]">
              <FileText className="w-12 h-12 text-[#bdc1c6] opacity-50" />
              <h3 className="font-bold text-sm text-[#5f6368]">No Report Selected</h3>
              <p className="text-xs text-[#80868b]">
                Select a report from the ledger on the left to view full findings and remediation actions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
