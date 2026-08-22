'use client';

import React from 'react';
import MarkdownReportRenderer from './MarkdownReportRenderer';

interface ReportViewerProps {
  reportMarkdown?: string;
  cveId?: string | null;
  title?: string;
  severity?: string;
  cvssScore?: number;
  verdict?: string;
  modelUsed?: string;
}

export default function ReportViewer({
  reportMarkdown,
  cveId,
  title,
  severity,
  cvssScore,
  verdict,
  modelUsed
}: ReportViewerProps) {
  return (
    <MarkdownReportRenderer
      reportMarkdown={reportMarkdown}
      cveId={cveId}
      title={title}
      severity={severity}
      cvssScore={cvssScore}
      verdict={verdict}
      modelUsed={modelUsed}
    />
  );
}
