'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import IntakeForm from '../components/IntakeForm';
import InvestigationTimeline from '../components/InvestigationTimeline';
import VulnerabilityCard from '../components/VulnerabilityCard';
import KnowledgePanel from '../components/KnowledgePanel';
import AttackGraph from '../components/AttackGraph';
import Terminal from '../components/Terminal';
import EvidencePanel from '../components/EvidencePanel';
import ReportViewer from '../components/ReportViewer';
import DirectPromptView from '../components/DirectPromptView';
import { ModelInfo, Investigation, StageType } from '../lib/types';
import { fetchModels, startInvestigation, sendDirectPrompt } from '../lib/api';
import { InvestigationWebSocket } from '../lib/websocket';
import { ShieldCheck, Activity, Terminal as TerminalIcon, Sparkles } from 'lucide-react';

export default function MissionControlPage() {
  const [models, setModels] = useState<ModelInfo[]>([
    { id: 'gemma4:e2b', name: 'gemma4:e2b', size: '5.1B', description: 'Gemma 4 e2b', is_default: true },
    { id: 'gemma4:e4b', name: 'gemma4:e4b', size: '8.0B', description: 'Gemma 4 e4b', is_default: false },
  ]);
  const [selectedModel, setSelectedModel] = useState<string>('gemma4:e2b');
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);

  // Investigation State
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation | null>(null);
  const [isLoadingInvestigation, setIsLoadingInvestigation] = useState<boolean>(false);

  // Direct Prompt State
  const [directPromptResponse, setDirectPromptResponse] = useState<string>('');
  const [isDirectPromptActive, setIsDirectPromptActive] = useState<boolean>(false);
  const [isDirectStreaming, setIsDirectStreaming] = useState<boolean>(false);

  const wsRef = useRef<InvestigationWebSocket | null>(null);

  // Load models on mount
  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const data = await fetchModels();
      if (data && data.length > 0) {
        setModels(data);
        const defaultMod = data.find((m) => m.is_default) || data[0];
        setSelectedModel(defaultMod.id);
      }
    } catch (e) {
      console.error('Failed to fetch models:', e);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Handle Starting Investigation
  const handleStartInvestigation = async (inputText: string, sourceUrl?: string) => {
    setIsLoadingInvestigation(true);
    setIsDirectPromptActive(false);

    try {
      const newInv = await startInvestigation({
        input_text: inputText,
        source_url: sourceUrl,
        model: selectedModel,
      });

      setActiveInvestigation(newInv);

      // Connect WebSocket for live updates
      if (wsRef.current) {
        wsRef.current.close();
      }

      wsRef.current = new InvestigationWebSocket(newInv.id, (eventType, data) => {
        setActiveInvestigation((prev) => {
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

        if (eventType === 'STATUS' && (data.stage === 'COMPLETED' || data.stage === 'ERROR')) {
          setIsLoadingInvestigation(false);
        }
      });
    } catch (err: any) {
      console.error('Investigation error:', err);
      setIsLoadingInvestigation(false);
    }
  };

  // Handle Direct Prompt Routing
  const handleDirectPrompt = async (promptText: string) => {
    setIsDirectPromptActive(true);
    setIsDirectStreaming(true);
    setDirectPromptResponse('');

    try {
      const res = await sendDirectPrompt({
        prompt: promptText,
        model: selectedModel,
      });
      setDirectPromptResponse(res.response || 'No response returned from model.');
    } catch (err: any) {
      setDirectPromptResponse(`Error routing prompt to Ollama: ${err.message || err}`);
    } finally {
      setIsDirectStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#1a73e8] selection:text-white">
      {/* Google-styled Header */}
      <Header
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        isLoadingModels={isLoadingModels}
        onRefreshModels={loadModels}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero Banner with Clean Google Aesthetic */}
        <div className="border border-[#dadce0] rounded-2xl p-6 bg-gradient-to-r from-[#ffffff] via-[#f8f9fa] to-[#ffffff] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1a73e8] uppercase tracking-wider bg-[#e8f0fe] px-2.5 py-0.5 rounded-full">
                  Autonomous Cyber Security Platform
                </span>
                <span className="text-xs text-[#5f6368] font-mono">MITRE ATT&CK + ATLAS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
                Vulnerability Triage & Verification Command Center
              </h1>
              <p className="text-sm text-[#5f6368] max-w-3xl leading-relaxed">
                Ingest CVE advisories or incident telemetry. Gemma autonomous agents query local threat intelligence RAG, formulate attack hypotheses, execute isolated sandbox PoCs, and synthesize executive verification reports.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <div className="bg-white border border-[#dadce0] rounded-xl px-3.5 py-2 text-xs shadow-sm">
                <span className="text-[#5f6368] block font-medium">Target LLM:</span>
                <span className="font-mono font-bold text-[#1a73e8]">{selectedModel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Intake Form */}
        <IntakeForm
          onSubmitInvestigation={handleStartInvestigation}
          onSubmitDirectPrompt={handleDirectPrompt}
          isLoading={isLoadingInvestigation}
        />

        {/* Direct Prompt View if triggered */}
        {isDirectPromptActive && (
          <DirectPromptView
            model={selectedModel}
            response={directPromptResponse}
            isStreaming={isDirectStreaming}
            onClose={() => setIsDirectPromptActive(false)}
          />
        )}

        {/* Active Investigation Live Workspace */}
        {activeInvestigation && (
          <div className="space-y-6 pt-2">
            {/* Timeline Stepper */}
            <InvestigationTimeline
              currentStage={activeInvestigation.current_stage}
              progress={activeInvestigation.progress}
            />

            {/* Attack Graph */}
            <AttackGraph
              plan={activeInvestigation.attack_plan}
              currentStage={activeInvestigation.current_stage}
            />

            {/* Grid: Vulnerability Card + Threat Intel Knowledge Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VulnerabilityCard vulnerability={activeInvestigation.vulnerability} />
              <KnowledgePanel techniques={activeInvestigation.techniques} />
            </div>

            {/* Grid: Live Sandbox Terminal + Evidence Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Terminal
                output={activeInvestigation.terminal_output}
                isExecuting={
                  activeInvestigation.current_stage === 'SANDBOX' ||
                  activeInvestigation.current_stage === 'EXECUTE'
                }
              />
              <EvidencePanel
                evidenceEvents={activeInvestigation.evidence_events}
                verification={activeInvestigation.verification}
              />
            </div>

            {/* Final Synthesized Report Viewer */}
            <ReportViewer reportMarkdown={activeInvestigation.report_markdown} />
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-[#dadce0] bg-[#f8f9fa] py-4 px-6 text-center text-xs text-[#5f6368]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CyberTriage AI (AIsploitable) — Local Security Verification</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1e8e3e]"></span>
              <span>Ollama Connected</span>
            </span>
            <span>•</span>
            <span>MITRE ATT&CK & ATLAS RAG</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
