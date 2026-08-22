'use client';

import React from 'react';
import { EvidenceEvent, VerificationResult } from '../lib/types';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, FileCheck, Layers } from 'lucide-react';

interface EvidencePanelProps {
  evidenceEvents: EvidenceEvent[];
  verification?: VerificationResult;
}

export default function EvidencePanel({
  evidenceEvents,
  verification,
}: EvidencePanelProps) {
  if (!evidenceEvents || evidenceEvents.length === 0) {
    return (
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-google-card flex flex-col items-center justify-center text-center min-h-[220px]">
        <ShieldCheck className="w-10 h-10 text-[#bdc1c6] mb-2 animate-pulse" />
        <h3 className="text-sm font-semibold text-[#5f6368]">Evidence Collection Pending</h3>
        <p className="text-xs text-[#80868b] max-w-xs mt-1">
          Sandbox command execution events and verified state artifacts will be logged here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-google-card space-y-5">
      {/* Verification Verdict Banner if present */}
      {verification && (
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            verification.is_vulnerable
              ? 'bg-[#fce8e6] border-[#ea4335] text-[#202124]'
              : 'bg-[#e6f4ea] border-[#34a853] text-[#202124]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                verification.is_vulnerable ? 'bg-[#ea4335]' : 'bg-[#34a853]'
              }`}
            >
              {verification.is_vulnerable ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base">
                  {verification.is_vulnerable ? 'CONFIRMED VULNERABLE' : 'UNEXPLOITABLE / MITIGATED'}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-[#dadce0]">
                  Confidence: {Math.round(verification.confidence_score * 100)}%
                </span>
              </div>
              <p className="text-xs text-[#5f6368] mt-0.5">{verification.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f4]">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#1a73e8]" />
          <h3 className="font-bold text-base text-[#202124]">Observed Evidence & Telemetry</h3>
        </div>
        <span className="text-xs bg-[#f8f9fa] border border-[#dadce0] text-[#5f6368] px-2.5 py-1 rounded-full font-medium">
          {evidenceEvents.length} Artifacts Captured
        </span>
      </div>

      {/* Evidence Events List */}
      <div className="space-y-3">
        {evidenceEvents.map((ev, idx) => (
          <div
            key={ev.id || idx}
            className="p-4 rounded-xl border border-[#dadce0] bg-[#f8f9fa] space-y-2 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#1a73e8]">#{idx + 1}</span>
                <span className="font-semibold text-[#202124]">{ev.container_name}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    ev.exit_code === 0
                      ? 'bg-[#e6f4ea] text-[#1e8e3e]'
                      : 'bg-[#fce8e6] text-[#ea4335]'
                  }`}
                >
                  Exit Code: {ev.exit_code}
                </span>
              </div>
              <span className="text-[10px] text-[#80868b] font-mono">{ev.timestamp}</span>
            </div>

            {/* Command Executed */}
            <div className="bg-[#202124] text-[#81c995] font-mono p-2 rounded-lg break-all">
              $ {ev.command}
            </div>

            {/* Observed Artifacts */}
            {ev.observed_artifacts && ev.observed_artifacts.length > 0 && (
              <div className="mt-2">
                <span className="font-semibold text-[#3c4043] block mb-1">Observed Artifacts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {ev.observed_artifacts.map((art, aIdx) => (
                    <span
                      key={aIdx}
                      className="bg-white border border-[#ceead6] text-[#137333] px-2 py-0.5 rounded-md font-mono text-[11px] flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#1e8e3e]" />
                      <span>{art}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
