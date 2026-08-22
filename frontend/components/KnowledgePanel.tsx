'use client';

import React from 'react';
import { Technique } from '../lib/types';
import { Database, ShieldCheck, Tag, Info, Cpu, Sparkles } from 'lucide-react';

interface KnowledgePanelProps {
  techniques: Technique[];
}

export default function KnowledgePanel({ techniques }: KnowledgePanelProps) {
  if (!techniques || techniques.length === 0) {
    return (
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-google-card flex flex-col items-center justify-center text-center min-h-[220px]">
        <Database className="w-10 h-10 text-[#bdc1c6] mb-2 animate-pulse" />
        <h3 className="text-sm font-semibold text-[#5f6368]">Threat Intelligence RAG Pending</h3>
        <p className="text-xs text-[#80868b] max-w-xs mt-1">
          MITRE ATT&CK & ATLAS techniques will be indexed and retrieved dynamically based on vulnerability telemetry.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-google-card">
      <div className="flex items-center justify-between pb-4 border-b border-[#f1f3f4]">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#1a73e8]" />
          <h3 className="font-bold text-base text-[#202124]">Threat Intelligence (ATT&CK / ATLAS)</h3>
        </div>
        <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] font-bold px-2.5 py-1 rounded-full border border-[#d2e3fc]">
          {techniques.length} Techniques Mapped
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {techniques.map((tech) => (
          <div
            key={tech.id}
            className="p-4 rounded-xl border border-[#dadce0] hover:border-[#1a73e8] bg-[#f8f9fa] hover:bg-white transition-all shadow-sm group space-y-2.5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    tech.is_atlas
                      ? 'bg-[#fce8e6] text-[#c5221f] border border-[#f5c2c7]'
                      : 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]'
                  }`}
                >
                  {tech.id}
                </span>
                <span className="font-semibold text-sm text-[#202124]">{tech.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e8eaed] text-[#3c4043] border border-[#dadce0]">
                  {tech.is_atlas ? 'MITRE ATLAS (AI)' : 'MITRE ATT&CK'}
                </span>
                {tech.tactic_name && (
                  <span className="text-[11px] bg-white border border-[#dadce0] text-[#5f6368] px-2 py-0.5 rounded-full font-medium">
                    {tech.tactic_name}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-center">
                <span className="text-[11px] text-[#5f6368]">Match:</span>
                <div className="w-16 bg-[#e8eaed] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-[#1a73e8] h-full"
                    style={{ width: `${Math.round((tech.confidence || 0.8) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-[#3c4043]">
                  {Math.round((tech.confidence || 0.8) * 100)}%
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[#5f6368] leading-relaxed">
              {tech.description}
            </p>

            {/* Why Retrieved Rationale */}
            {tech.why_retrieved && (
              <div className="p-2.5 bg-[#ffffff] border border-[#d2e3fc] rounded-lg text-xs flex items-start gap-2 text-[#202124]">
                <Sparkles className="w-4 h-4 text-[#1a73e8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1a73e8]">Mapping Rationale: </span>
                  <span className="text-[#3c4043]">{tech.why_retrieved}</span>
                </div>
              </div>
            )}

            {/* Detection Opportunities */}
            {tech.detection_opportunities && tech.detection_opportunities.length > 0 && (
              <div className="p-2 bg-[#f1f3f4] border border-[#dadce0] rounded-lg text-[11px] text-[#3c4043] flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#188038] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#202124]">Detection Strategy: </strong>
                  <span>{tech.detection_opportunities[0]}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
