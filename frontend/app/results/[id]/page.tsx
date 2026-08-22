'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import InvestigationTimeline from '@/components/InvestigationTimeline';
import VulnerabilityCard from '@/components/VulnerabilityCard';
import KnowledgePanel from '@/components/KnowledgePanel';
import AttackGraph from '@/components/AttackGraph';
import DualTerminal from '@/components/DualTerminal';
import ScriptStreamViewer from '@/components/ScriptStreamViewer';
import EvidencePanel from '@/components/EvidencePanel';
import ReportViewer from '@/components/ReportViewer';
import { ModelInfo, Investigation, StageType } from '@/lib/types';
import { fetchModels, getInvestigation } from '@/lib/api';
import { InvestigationWebSocket } from '@/lib/websocket';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';

export default function ResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || '';

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemma4:e2b');
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<InvestigationWebSocket | null>(null);

  useEffect(() => {
    fetchModels().then((m) => {
      setModels(m);
      const def = m.find((x) => x.is_default) || m[0];
      if (def) setSelectedModel(def.id);
    });
  }, []);

  useEffect(() => {
    if (!id) return;

    setIsLoading(true);
    getInvestigation(id)
      .then((inv) => {
        setInvestigation(inv);
        if (inv.model_used) setSelectedModel(inv.model_used);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Investigation not found');
        setIsLoading(false);
      });

    // Connect WS
    wsRef.current = new InvestigationWebSocket(id, (eventType, data) => {
      setInvestigation((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        switch (eventType) {
          case 'STATUS':
            updated.current_stage = data.stage as StageType;
            updated.progress = data.progress || updated.progress;
            break;
          case 'LOG':
            updated.logs = [...(updated.logs || []), data];
            break;
          case 'VULNERABILITY':
            updated.vulnerability = data;
            break;
          case 'KNOWLEDGE':
            updated.techniques = data.techniques || [];
            break;
          case 'PLAN':
            updated.attack_plan = data;
            break;
          case 'SCRIPT':
            updated.generated_script = data.script;
            break;
          case 'DOCKER_LOG':
            if (data.container === 'attacker') {
              updated.attacker_logs = (updated.attacker_logs || '') + (data.chunk || '');
            } else if (data.container === 'victim') {
              updated.victim_logs = (updated.victim_logs || '') + (data.chunk || '');
            }
            break;
          case 'TERMINAL':
            updated.terminal_output = (updated.terminal_output || '') + (data.chunk || '');
            break;
          case 'EVIDENCE':
            updated.evidence_events = [...(updated.evidence_events || []), data];
            break;
          case 'VERIFICATION':
            updated.verification = data;
            break;
          case 'REPORT':
            updated.report_markdown = data.report;
            break;
          case 'ERROR':
            updated.current_stage = 'ERROR';
            updated.error_message = data.message;
            break;
        }
        return updated;
      });
    });

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [id]);

  const isExecuting =
    investigation?.current_stage === 'SANDBOX' ||
    investigation?.current_stage === 'EXECUTE' ||
    investigation?.current_stage === 'GENERATE_SCRIPT';

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#dadce0] hover:border-[#1a73e8] text-[#3c4043] flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Mission Control</span>
          </button>

          <div className="text-xs text-[#5f6368] font-mono bg-[#f8f9fa] px-3 py-1 rounded-xl border border-[#dadce0]">
            Session ID: <strong className="text-[#1a73e8]">{id}</strong>
          </div>
        </div>

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin mb-3" />
            <p className="text-sm font-semibold text-[#5f6368]">Loading investigation session...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-[#fce8e6] border border-[#ea4335] rounded-2xl text-center text-[#c5221f]">
            <h3 className="font-bold text-base mb-1">Session Not Found</h3>
            <p className="text-xs">{error}</p>
          </div>
        ) : investigation ? (
          <div className="space-y-6">
            <InvestigationTimeline
              currentStage={investigation.current_stage}
              progress={investigation.progress}
            />

            {investigation.generated_script && (
              <ScriptStreamViewer
                script={investigation.generated_script}
                isStreaming={investigation.current_stage === 'GENERATE_SCRIPT'}
                modelUsed={investigation.model_used}
              />
            )}

            {/* Side-by-Side Dual Container Terminals */}
            <DualTerminal
              attackerLogs={investigation.attacker_logs || ''}
              victimLogs={investigation.victim_logs || ''}
              compositeLogs={investigation.terminal_output}
              isExecuting={isExecuting}
            />

            {investigation.attack_plan && (
              <AttackGraph
                plan={investigation.attack_plan}
                currentStage={investigation.current_stage}
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {investigation.vulnerability && (
                <VulnerabilityCard vulnerability={investigation.vulnerability} />
              )}
              {investigation.techniques && investigation.techniques.length > 0 && (
                <KnowledgePanel techniques={investigation.techniques} />
              )}
            </div>

            <EvidencePanel
              evidenceEvents={investigation.evidence_events}
              verification={investigation.verification}
            />

            <ReportViewer reportMarkdown={investigation.report_markdown} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
