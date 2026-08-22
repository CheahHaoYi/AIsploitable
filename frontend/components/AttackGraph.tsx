'use client';

import React from 'react';
import { StageType, AttackPlan } from '../lib/types';
import { Network, ArrowRight, ShieldAlert, Cpu, Terminal, CheckCircle2, Target } from 'lucide-react';

interface AttackGraphProps {
  plan?: AttackPlan;
  currentStage: StageType;
}

export default function AttackGraph({ plan, currentStage }: AttackGraphProps) {
  const getStepStatus = (index: number) => {
    const stageOrder: StageType[] = ['INTAKE', 'ANALYZE', 'RETRIEVE', 'PLAN', 'SANDBOX', 'EXECUTE', 'VERIFY', 'REPORT', 'COMPLETED'];
    const currentIdx = stageOrder.indexOf(currentStage);

    if (currentStage === 'COMPLETED' || currentIdx > index + 2) return 'completed';
    if (currentIdx === index + 2) return 'active';
    return 'pending';
  };

  const NODES = [
    { id: 'vuln', label: 'Vulnerability Root', sub: 'CVE Advisory Intake', icon: ShieldAlert },
    { id: 'access', label: 'Initial Access', sub: 'MITRE ATT&CK T1190', icon: Target },
    { id: 'exploit', label: 'Exploit Primitive', sub: 'Payload Formulation', icon: Cpu },
    { id: 'sandbox', label: 'Sandbox Target', sub: 'Docker Isolated Node', icon: Terminal },
    { id: 'evidence', label: 'Verified Evidence', sub: 'Empirical Telemetry', icon: CheckCircle2 },
  ];

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-google-card">
      <div className="flex items-center justify-between pb-4 border-b border-[#f1f3f4]">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-[#1a73e8]" />
          <h3 className="font-bold text-base text-[#202124]">Reactive Attack Path & Verification Graph</h3>
        </div>
        <span className="text-xs text-[#5f6368] font-mono">Dynamic State Tracker</span>
      </div>

      {plan?.hypothesis && (
        <div className="mt-3 text-xs bg-[#f8f9fa] border border-[#dadce0] p-3 rounded-xl text-[#3c4043]">
          <strong className="text-[#202124]">Test Hypothesis:</strong> {plan.hypothesis}
        </div>
      )}

      {/* Visual node chain */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3 overflow-x-auto py-2">
        {NODES.map((node, idx) => {
          const status = getStepStatus(idx);
          const Icon = node.icon;

          return (
            <React.Fragment key={node.id}>
              <div
                className={`flex-1 w-full md:w-auto min-w-[140px] p-3.5 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                  status === 'completed'
                    ? 'bg-[#e6f4ea] border-[#34a853] shadow-sm'
                    : status === 'active'
                    ? 'bg-[#e8f0fe] border-[#1a73e8] ring-4 ring-[#1a73e8]/15 shadow-md'
                    : 'bg-[#f8f9fa] border-[#dadce0]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                    status === 'completed'
                      ? 'bg-[#34a853] text-white'
                      : status === 'active'
                      ? 'bg-[#1a73e8] text-white animate-pulse'
                      : 'bg-[#e8eaed] text-[#5f6368]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#202124] block">{node.label}</span>
                <span className="text-[10px] text-[#5f6368] block mt-0.5">{node.sub}</span>
              </div>

              {idx < NODES.length - 1 && (
                <div className="hidden md:flex text-[#dadce0] items-center justify-center shrink-0">
                  <ArrowRight className="w-4 h-4 text-[#80868b]" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
