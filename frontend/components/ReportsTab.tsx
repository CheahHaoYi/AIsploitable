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
import { Investigation, ReportSummary } from '../lib/types';
import { fetchReports } from '../lib/api';
import MarkdownReportRenderer from './MarkdownReportRenderer';

interface ReportsTabProps {
  activeReportMarkdown?: string;
  activeInvestigationId?: string;
  activeInvestigation?: Investigation | null;
}

export default function ReportsTab({
  activeReportMarkdown,
  activeInvestigationId,
  activeInvestigation,
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
    a.download = `AIsploitable_${selectedReport.cve_id || 'Report'}_${new Date().toISOString().slice(0, 10)}.md`;
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
            <MarkdownReportRenderer
              reportMarkdown={selectedReport.report_markdown}
              cveId={selectedReport.cve_id}
              title={selectedReport.title}
              severity={selectedReport.severity}
              cvssScore={selectedReport.cvss_score}
              verdict={selectedReport.verdict}
              createdAt={selectedReport.created_at}
              modelUsed={selectedReport.model_used}
            />
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
