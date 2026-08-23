'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import VulnerabilityAnalysisTab from '../components/VulnerabilityAnalysisTab';
import DockerSandboxTab from '../components/DockerSandboxTab';
import ReportsTab from '../components/ReportsTab';
import ErrorNotificationModal from '../components/ErrorNotificationModal';
import { ModelInfo, Investigation, StageType, Vulnerability } from '../lib/types';
import { LLMErrorDetails, LLMProvider } from '../lib/llm/types';
import { loadAllModels, getStoredSettings } from '../lib/llm/gateway';
import { runClientInvestigation } from '../lib/agents/orchestrator';
import { FileSearch, Server, FileCheck2, Activity } from 'lucide-react';

export default function MissionControlPage() {
  const [activeTab, setActiveTab] = useState<'vulnerability' | 'docker' | 'reports'>('vulnerability');

  // Models & Connectivity State
  const [models, setModels] = useState<ModelInfo[]>([
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', size: 'Recommended', description: 'Google Gemini 2.5 Flash', is_default: true },
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', size: 'Advanced Pro', description: 'Google Gemini 3.1 Pro Preview', is_default: false },
    { id: 'gemma4:e2b', name: 'gemma4:e2b', size: '5.1B', description: 'Gemma 4 e2b', is_default: false },
    { id: 'demo-gemma-4', name: 'Gemma 4 Demo', size: 'Sim', description: 'Offline Demo Simulation', is_default: false },
  ]);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);
  const [isOllamaConnected, setIsOllamaConnected] = useState<boolean>(false);
  const [ollamaError, setOllamaError] = useState<string | undefined>();

  // Settings & Error Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeError, setActiveError] = useState<LLMErrorDetails | null>(null);

  // Investigation & Execution State
  const [activeInvestigation, setActiveInvestigation] = useState<Investigation | null>(null);
  const [isLoadingInvestigation, setIsLoadingInvestigation] = useState<boolean>(false);
  const [manualScript, setManualScript] = useState<string>('');

  // Load models on mount & restore stored provider/model
  const loadModels = async () => {
    setIsLoadingModels(true);
    try {
      const stored = getStoredSettings();
      if (stored.selectedProvider) {
        setSelectedProvider(stored.selectedProvider);
      }
      if (stored.selectedModel) {
        setSelectedModel(stored.selectedModel);
      }

      const { models: loadedModels, isOllamaConnected: conn, ollamaError: err } = await loadAllModels(stored);
      if (loadedModels && loadedModels.length > 0) {
        setModels(loadedModels);
        setIsOllamaConnected(conn);
        setOllamaError(err);
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

  // Listen for global LLM error events and open settings triggers
  useEffect(() => {
    const handleLLMError = (e: Event) => {
      const customEvent = e as CustomEvent<LLMErrorDetails>;
      if (customEvent.detail) {
        setActiveError(customEvent.detail);
      }
    };

    const handleOpenSettings = () => {
      setIsSettingsOpen(true);
    };

    window.addEventListener('aisploitable:llm_error', handleLLMError);
    window.addEventListener('aisploitable:open_settings', handleOpenSettings);

    return () => {
      window.removeEventListener('aisploitable:llm_error', handleLLMError);
      window.removeEventListener('aisploitable:open_settings', handleOpenSettings);
    };
  }, []);

  // Handle Starting Autonomous Investigation (Pure Client-Side Orchestration)
  const handleStartInvestigation = async (
    inputText: string,
    sourceUrl?: string,
    customVuln?: Vulnerability,
    customScript?: string
  ) => {
    setIsLoadingInvestigation(true);
    setManualScript(customScript || '');
    setActiveTab('docker'); // Automatically switch to Tab 2 to watch the live dual containers

    // Initialize blank investigation object
    const initialInv: Investigation = {
      id: 'inv-' + Math.random().toString(36).substring(2, 9),
      target_cve: sourceUrl || 'Autonomous Triage',
      raw_input_text: inputText,
      created_at: new Date().toISOString(),
      current_stage: 'INTAKE',
      progress: 10,
      model_used: selectedModel,
      logs: [],
      techniques: [],
      attacker_logs: '',
      victim_logs: '',
      terminal_output: '',
      evidence_events: [],
    };
    setActiveInvestigation(initialInv);

    try {
      await runClientInvestigation(
        {
          input_text: inputText,
          source_url: sourceUrl,
          model: selectedModel,
          custom_vulnerability: customVuln,
          custom_script: customScript,
        },
        (eventType, data) => {
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
        }
      );
    } catch (err: any) {
      console.error('Investigation execution error:', err);
      setIsLoadingInvestigation(false);
    }
  };

  const handleScriptGenerated = (script: string) => {
    setManualScript(script);
  };

  const handleSwitchToDemo = () => {
    setSelectedProvider('demo');
    setSelectedModel('demo-gemma-4');
    setActiveError(null);
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
        selectedProvider={selectedProvider}
        onSelectProvider={setSelectedProvider}
        isLoadingModels={isLoadingModels}
        onRefreshModels={loadModels}
        isOllamaConnected={isOllamaConnected}
        ollamaError={ollamaError}
        isSettingsOpen={isSettingsOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onCloseSettings={() => setIsSettingsOpen(false)}
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

          {/* Right Stage Indicator */}
          {activeInvestigation && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-[#dadce0] rounded-xl text-xs text-[#5f6368]">
              <Activity className="w-3.5 h-3.5 text-[#1a73e8] animate-pulse" />
              <span className="font-semibold text-[#202124]">
                Stage: {activeInvestigation.current_stage}
              </span>
              <span>({activeInvestigation.progress}%)</span>
            </div>
          )}
        </div>

        {/* Tab 1: Intake & Vulnerability Analysis */}
        {activeTab === 'vulnerability' && (
          <VulnerabilityAnalysisTab
            selectedModel={selectedModel}
            onStartInvestigation={handleStartInvestigation}
            isLoading={isLoadingInvestigation}
            onScriptGenerated={handleScriptGenerated}
          />
        )}

        {/* Tab 2: Docker Sandbox Execution & Side-by-Side Terminals */}
        {activeTab === 'docker' && (
          <DockerSandboxTab
            investigation={activeInvestigation}
            isLoading={isLoadingInvestigation}
            manualScript={manualScript}
            onScriptChange={setManualScript}
            selectedModel={selectedModel}
            onStartInvestigation={handleStartInvestigation}
          />
        )}

        {/* Tab 3: Security Findings Hub & Executive Report */}
        {activeTab === 'reports' && (
          <ReportsTab activeInvestigation={activeInvestigation} />
        )}
      </main>

      {/* Global LLM Error Notification Modal */}
      <ErrorNotificationModal
        errorDetails={activeError}
        onClose={() => setActiveError(null)}
        onOpenSettings={() => {
          setActiveError(null);
          setIsSettingsOpen(true);
        }}
        onSwitchToDemo={handleSwitchToDemo}
      />
    </div>
  );
}
