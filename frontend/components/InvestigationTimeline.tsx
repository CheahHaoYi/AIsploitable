'use client';

import React from 'react';
import { StageType } from '../lib/types';
import {
  FileSearch,
  Brain,
  Database,
  Crosshair,
  Server,
  Terminal as TerminalIcon,
  ShieldCheck,
  FileCheck2,
  Check,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface InvestigationTimelineProps {
  currentStage: StageType;
  progress: number;
}

const STAGES: { stage: StageType; label: string; icon: any }[] = [
  { stage: 'INTAKE', label: 'Intake', icon: FileSearch },
  { stage: 'ANALYZE', label: 'Analyze', icon: Brain },
  { stage: 'RETRIEVE', label: 'RAG Intel', icon: Database },
  { stage: 'PLAN', label: 'PoC Plan', icon: Crosshair },
  { stage: 'SANDBOX', label: 'Sandbox', icon: Server },
  { stage: 'EXECUTE', label: 'Execute', icon: TerminalIcon },
  { stage: 'VERIFY', label: 'Verify', icon: ShieldCheck },
  { stage: 'REPORT', label: 'Report', icon: FileCheck2 },
];

export default function InvestigationTimeline({
  currentStage,
  progress,
}: InvestigationTimelineProps) {
  const getStageIndex = (s: StageType) => {
    if (s === 'COMPLETED') return 8;
    if (s === 'ERROR') return -1;
    const idx = STAGES.findIndex((item) => item.stage === s);
    return idx !== -1 ? idx : 0;
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-google-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[#202124]">Investigation Timeline</span>
          <span className="text-xs text-[#5f6368] font-mono">[{currentStage}]</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 bg-[#e8eaed] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                currentStage === 'ERROR'
                  ? 'bg-[#ea4335]'
                  : currentStage === 'COMPLETED'
                  ? 'bg-[#34a853]'
                  : 'bg-[#1a73e8]'
              }`}
              style={{ width: `${Math.min(Math.max(progress, 5), 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-[#3c4043]">{progress}%</span>
        </div>
      </div>

      {/* Stepper container */}
      <div className="relative flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {STAGES.map((step, idx) => {
          const isCompleted = currentIndex > idx || currentStage === 'COMPLETED';
          const isCurrent = currentIndex === idx && currentStage !== 'COMPLETED';
          const isError = currentStage === 'ERROR' && currentIndex === idx;
          const Icon = step.icon;

          return (
            <div key={step.stage} className="flex-1 min-w-[70px] flex flex-col items-center text-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isError
                    ? 'bg-[#fce8e6] border-[#ea4335] text-[#d93025]'
                    : isCompleted
                    ? 'bg-[#e6f4ea] border-[#34a853] text-[#1e8e3e]'
                    : isCurrent
                    ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] shadow-md ring-4 ring-[#1a73e8]/10'
                    : 'bg-[#f8f9fa] border-[#dadce0] text-[#80868b]'
                }`}
              >
                {isError ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-medium whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#1a73e8] font-bold'
                    : isCompleted
                    ? 'text-[#1e8e3e]'
                    : 'text-[#5f6368]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
