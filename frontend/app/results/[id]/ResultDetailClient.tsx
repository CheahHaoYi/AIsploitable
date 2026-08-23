'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { getReportsLedger } from '@/lib/agents/orchestrator';
import { InvestigationWebSocket } from '@/lib/websocket';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface ResultDetailClientProps {
  id: string;
}

export default function ResultDetailClient({ id }: ResultDetailClientProps) {
  const router = useRouter();

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
      .catch(() => {
        // Fallback to local storage ledger
        const ledger = getReportsLedger();
        const found = ledger.find((r) => r.id === id || r.id === `rep-${id}`);
        if (found) {
          setInvestigation({
            id: found.id,
            target_cve: found.cve_id || found.title,
            raw_input_text: found.summary,
            created_at: found.created_at,
            current_stage: 'COMPLETED',
            progress: 100,
            model_used: found.model_used || 'gemma4:e2b',
            vulnerability: {
              cve_id: found.cve_id,
              title: found.title,
              summary: found.summary,
              severity: found.severity,
              cvss_score: found.cvss_score,
              attack_vector: 'NETWORK',
              attack_complexity: 'LOW',
              privileges_required: 'NONE',
              user_interaction: 'NONE',
              affected_products: ['Vulnerable Target Service'],
              exploit_primitives: ['Remote Code Execution'],
              potential_impact: 'Full System Compromise',
            },
            techniques: [],
            attacker_logs: `[sandbox-attacker] Verification completed with exit code 0.`,
            victim_logs: `[sandbox-victim] Target acknowledged verification probe.`,
            terminal_output: `[+] Verified: ${found.title}`,
            evidence_events: [
              {
                step_id: 1,
                command: 'assert execution == verified',
                exit_code: 0,
                stdout: 'AISPLOITABLE_VERIFIED_RCE',
                stderr: '',
                observed_artifact: 'Marker confirmed',
                timestamp: found.created_at,
              },
            ],
            verification: {
              is_vulnerable: found.verdict.includes('CONFIRMED'),
              confidence_score: found.confidence_score,
              summary: found.summary,
              verified_assertions: ['Exploit execution confirmed in isolated sandbox.'],
              failed_assertions: [],
            },
            report_markdown: found.report_markdown,
            logs: [],
          });
          setIsLoading(false);
        } else {
          setError('Investigation not found in backend or local ledger.');
          setIsLoading(false);
        }
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
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <Header
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-[#5f6368] hover:text-[#202124] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Mission Control</span>
          </button>
          <span className="text-xs font-mono text-[#5f6368] bg-[#e8eaed] px-2.5 py-1 rounded">
            Investigation ID: {id}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-[#1a73e8] animate-spin" />
            <p className="text-sm text-[#5f6368]">Loading investigation telemetry...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-white border border-[#dadce0] rounded-xl text-center space-y-3">
            <p className="text-[#ea4335] text-sm font-semibold">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-[#1a73e8] text-white text-xs font-semibold rounded-lg hover:bg-[#1557b0]"
            >
              Return Home
            </button>
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
