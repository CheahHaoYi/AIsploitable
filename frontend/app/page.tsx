'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import VulnerabilityAnalysisTab from '../components/VulnerabilityAnalysisTab';
import DockerSandboxTab from '../components/DockerSandboxTab';
import ReportsTab from '../components/ReportsTab';
import { ModelInfo, Investigation, StageType, Vulnerability } from '../lib/types';
import { fetchModels, startInvestigation } from '../lib/api';
import { InvestigationWebSocket } from '../lib/websocket';
import { FileSearch, Server, FileCheck2, Activity, Sparkles, Terminal } from 'lucide-react';

export default function MissionControlPage() {
  const [activeTab, setActiveTab] = useState<'vulnerability' | 'docker' | 'reports'>('vulnerability');

  // Models State
  const [models, setModels] = useState<ModelInfo[]>([
    { id: 'gemma4:e2b', name: 'gemma4:e2b', size: '5.1B', description: 'Gemma 4 e2b (Default)', is_default: true },
    { id: 'gemma4:e4b', name: 'gemma4:e4b', size: '8.0B', description: 'Gemma 4 e4b (Deep Reasoning)', is_default: false },
  ]);
  const [selectedModel, setSelectedModel] = useState<string>('gemma4:e2b');
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);

  // Investigation & Execution State
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation | null>(null);
  const [isLoadingInvestigation, setIsLoadingInvestigation] = useState<boolean>(false);
  const [manualScript, setManualScript] = useState<string>('');

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

  // Handle Starting Autonomous Investigation
  const handleStartInvestigation = async (
    inputText: string,
    sourceUrl?: string,
    customVuln?: Vulnerability,
    customScript?: string
  ) => {
    setIsLoadingInvestigation(true);
    setManualScript(customScript || '');
    setActiveTab('docker'); // Automatically switch to Tab 2 to watch the live Docker containers!

    try {
      const newInv = await startInvestigation({
        input_text: inputText,
        source_url: sourceUrl,
        model: selectedModel,
        custom_vulnerability: customVuln,
        custom_script: customScript,
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
            case 'SCRIPT':
              updated.generated_script = data.script;
              setManualScript(data.script);
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

        if (eventType === 'STATUS' && (data.stage === 'COMPLETED' || data.stage === 'ERROR')) {
          setIsLoadingInvestigation(false);
        }
      });
    } catch (err: any) {
      console.error('Investigation error:', err);
      setIsLoadingInvestigation(false);
    }
  };

  const handleScriptGenerated = (script: string) => {
    setManualScript(script);
    // Keep user on Tab 1 so they can review, clarify, and customize before launching verification
  };

  const isExecuting =
    isLoadingInvestigation ||
    activeInvestigation?.current_stage === 'SANDBOX' ||
    activeInvestigation?.current_stage === 'EXECUTE' ||
    activeInvestigation?.current_stage === 'GENERATE_SCRIPT';

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-[#1a73e8] selection:text-white font-sans">
      {/* Top Navbar */}
      <Header
        models={models}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        isLoadingModels={isLoadingModels}
        onRefreshModels={loadModels}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Navigation 3-Tabs Bar */}
        <div className="bg-[#f8f9fa] border border-[#dadce0] p-1.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            {/* Tab 1: Vulnerability Analysis */}
            <button
              onClick={() => setActiveTab('vulnerability')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'vulnerability'
                  ? 'bg-white text-[#1a73e8] shadow-sm border border-[#dadce0]'
                  : 'text-[#5f6368] hover:text-[#202124] hover:bg-white/60'
              }`}
            >
              <FileSearch className="w-4 h-4 text-[#1a73e8]" />
              <span>1. Vulnerability Analysis</span>
            </button>

            {/* Tab 2: Docker Containers (Side-by-Side) */}
            <button
              onClick={() => setActiveTab('docker')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative ${
                activeTab === 'docker'
                  ? 'bg-white text-[#1a73e8] shadow-sm border border-[#dadce0]'
                  : 'text-[#5f6368] hover:text-[#202124] hover:bg-white/60'
              }`}
            >
              <Server className="w-4 h-4 text-[#34a853]" />
              <span>2. Docker Sandbox (Side-by-Side)</span>
              {isExecuting && (
                <span className="w-2 h-2 rounded-full bg-[#1e8e3e] animate-ping absolute -top-1 -right-1"></span>
              )}
            </button>

            {/* Tab 3: Reports Ledger */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-white text-[#1a73e8] shadow-sm border border-[#dadce0]'
                  : 'text-[#5f6368] hover:text-[#202124] hover:bg-white/60'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-[#ea4335]" />
              <span>3. Reports & Findings Hub</span>
              {activeInvestigation?.report_markdown && (
                <span className="w-2 h-2 rounded-full bg-[#34a853]"></span>
              )}
            </button>
          </div>

          {/* Quick SOC Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white border border-[#dadce0] rounded-xl text-[11px] font-mono text-[#5f6368]">
            <span className="flex items-center gap-1 font-semibold text-[#1a73e8]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Model: {selectedModel}</span>
            </span>
          </div>
        </div>

        {/* Tab 1 Content: Vulnerability Analysis (Kept in DOM to preserve all user input & state) */}
        <div className={activeTab === 'vulnerability' ? 'block' : 'hidden'}>
          <VulnerabilityAnalysisTab
            onStartInvestigation={handleStartInvestigation}
            isLoading={isLoadingInvestigation}
            selectedModel={selectedModel}
            onScriptGenerated={handleScriptGenerated}
            onSwitchToDockerTab={() => setActiveTab('docker')}
          />
        </div>

        {/* Tab 2 Content: Docker Sandbox Output Side-by-Side & Script Stream */}
        <div className={activeTab === 'docker' ? 'block' : 'hidden'}>
          <DockerSandboxTab
            investigation={activeInvestigation}
            manualScript={manualScript}
            selectedModel={selectedModel}
            onSwitchToReportsTab={() => setActiveTab('reports')}
          />
        </div>

        {/* Tab 3 Content: Reports Master-Detail View */}
        <div className={activeTab === 'reports' ? 'block' : 'hidden'}>
          <ReportsTab
            activeReportMarkdown={activeInvestigation?.report_markdown}
            activeInvestigationId={activeInvestigation?.id}
          />
        </div>
      </main>

      {/* Clean SOC Footer */}
      <footer className="border-t border-[#dadce0] bg-[#f8f9fa] py-4 px-6 text-center text-xs text-[#5f6368] mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CyberTriage AI (AIsploitable) — Local Security Verification Platform</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1e8e3e]"></span>
              <span>Local Gemma Connected</span>
            </span>
            <span>•</span>
            <span>Docker Dual-Container Sandbox</span>
            <span>•</span>
            <span>MITRE ATT&CK / ATLAS RAG</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
