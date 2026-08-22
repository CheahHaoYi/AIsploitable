'use client';

import React from 'react';
import { Investigation } from '../lib/types';
import InvestigationTimeline from './InvestigationTimeline';
import DualTerminal from './DualTerminal';
import ScriptStreamViewer from './ScriptStreamViewer';
import AttackGraph from './AttackGraph';
import VulnerabilityCard from './VulnerabilityCard';
import KnowledgePanel from './KnowledgePanel';
import EvidencePanel from './EvidencePanel';
import { Server, Shield, Sparkles, Terminal, Activity, ArrowRight } from 'lucide-react';

interface DockerSandboxTabProps {
  investigation: Investigation | null;
  manualScript?: string;
  isStreamingScript?: boolean;
  selectedModel: string;
  onSwitchToReportsTab?: () => void;
}

export default function DockerSandboxTab({
  investigation,
  manualScript,
  isStreamingScript = false,
  selectedModel,
  onSwitchToReportsTab,
}: DockerSandboxTabProps) {
  if (!investigation && !manualScript) {
    return (
      <div className="bg-white border border-[#dadce0] rounded-2xl p-12 text-center shadow-google-card flex flex-col items-center justify-center space-y-4 min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shadow-inner">
          <Server className="w-8 h-8" />
        </div>
        <div className="space-y-1 max-w-md">
          <h3 className="font-bold text-base text-[#202124]">
            No Active Sandbox Container Session
          </h3>
          <p className="text-xs text-[#5f6368] leading-relaxed">
            Trigger an autonomous triage run or stream a PoC script from Tab 1 to observe real-time side-by-side Docker container execution and telemetry.
          </p>
        </div>
      </div>
    );
  }

  const isExecuting =
    investigation?.current_stage === 'SANDBOX' ||
    investigation?.current_stage === 'EXECUTE' ||
    investigation?.current_stage === 'GENERATE_SCRIPT';

  const scriptToDisplay = investigation?.generated_script || manualScript;

  return (
    <div className="space-y-6">
      {/* Top Banner Status Bar */}
      <div className="bg-gradient-to-r from-[#1a73e8]/10 via-[#ffffff] to-[#34a853]/10 border border-[#dadce0] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a73e8] text-white flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-[#202124]">
                Docker Sandbox Isolation Lab
              </h2>
              <span className="text-[10px] bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full font-mono font-semibold">
                Bridge: 172.20.0.0/24
              </span>
            </div>
            <p className="text-xs text-[#5f6368]">
              Dual-container execution topology: <span className="font-mono text-[#1a73e8]">Attacker Agent</span> ➔ <span className="font-mono text-[#34a853]">Victim Node</span>
            </p>
          </div>
        </div>

        {investigation?.report_markdown && onSwitchToReportsTab && (
          <button
            onClick={onSwitchToReportsTab}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#34a853] hover:bg-[#2d9249] text-white flex items-center gap-1.5 shadow-sm transition-all active:scale-95 self-start sm:self-auto"
          >
            <span>View Generated Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Investigation Stepper Timeline */}
      {investigation && (
        <InvestigationTimeline
          currentStage={investigation.current_stage}
          progress={investigation.progress}
        />
      )}

      {/* Gemma PoC Script Stream Viewer */}
      {scriptToDisplay && (
        <ScriptStreamViewer
          script={scriptToDisplay}
          isStreaming={isStreamingScript || investigation?.current_stage === 'GENERATE_SCRIPT'}
          modelUsed={investigation?.model_used || selectedModel}
        />
      )}

      {/* Side-by-Side Dual Container Terminals */}
      <DualTerminal
        attackerLogs={investigation?.attacker_logs || (manualScript ? '[sandbox-attacker-node] Script loaded. Standby for network trigger...\n' : '')}
        victimLogs={investigation?.victim_logs || (manualScript ? '[sandbox-victim-target] Daemon listening on 0.0.0.0:8080 (VulnerableEngine/3.2)\n' : '')}
        compositeLogs={investigation?.terminal_output}
        isExecuting={isExecuting}
      />

      {/* Attack Graph */}
      {investigation?.attack_plan && (
        <AttackGraph
          plan={investigation.attack_plan}
          currentStage={investigation.current_stage}
        />
      )}

      {/* Structured Threat Intel & Evidence */}
      {investigation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {investigation.vulnerability && (
            <VulnerabilityCard vulnerability={investigation.vulnerability} />
          )}
          {investigation.techniques && investigation.techniques.length > 0 && (
            <KnowledgePanel techniques={investigation.techniques} />
          )}
        </div>
      )}

      {/* Evidence & Verification Inspector */}
      {investigation && (
        <EvidencePanel
          evidenceEvents={investigation.evidence_events}
          verification={investigation.verification}
        />
      )}
    </div>
  );
}
