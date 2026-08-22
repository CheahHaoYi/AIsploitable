'use client';

import React, { useState } from 'react';
import {
  Link as LinkIcon,
  FileText,
  HelpCircle,
  Sparkles,
  Send,
  Shield,
  Play,
  RotateCcw,
  BookOpen,
  Check,
  Copy,
  Info,
  Layers,
} from 'lucide-react';
import { streamBlogQuestion, streamScriptGeneration } from '../lib/api';

interface IntakeTabProps {
  onStartInvestigation: (inputText: string, sourceUrl?: string) => void;
  isLoading: boolean;
  selectedModel: string;
  onScriptGenerated?: (script: string) => void;
  onSwitchToDockerTab?: () => void;
}

const PRESET_SCENARIOS = [
  {
    id: 'log4shell',
    cve_id: 'CVE-2021-44228',
    cve_url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-44228',
    title: 'Log4j2 JNDI Remote Code Execution',
    tag: 'RCE / Network',
    text: `Apache Log4j2 versions 2.0-beta9 through 2.15.0 JNDI features used in configuration, log messages, and parameters do not protect against attacker controlled LDAP and other JNDI related endpoints. An attacker who can control log messages or log message parameters can execute arbitrary code loaded from LDAP servers when message lookup substitution is enabled.`,
    defaultQuestion: 'What are the main exploit primitives and how can an attacker trigger this via HTTP headers?',
  },
  {
    id: 'xz-backdoor',
    cve_id: 'CVE-2024-3094',
    cve_url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-3094',
    title: 'XZ Utils Liblzma Upstream Backdoor',
    tag: 'Supply Chain / SSH',
    text: `Malicious code was discovered in the upstream tarballs of xz, starting with version 5.6.0. Through a series of complex M4 macros and disguised test files in the build process, the backdoor modifies the liblzma build to hook OpenSSH RSA authentication routines in sshd on systemd-linked Linux distributions.`,
    defaultQuestion: 'How does the backdoor intercept RSA authentication and what is the MITRE ATT&CK mapping?',
  },
  {
    id: 'atlas-prompt',
    cve_id: 'AML.T0000',
    cve_url: 'https://atlas.mitre.org/techniques/AML.T0000',
    title: 'AI Agent Indirect Prompt Injection',
    tag: 'AI Security / ATLAS',
    text: `Adversary crafts indirect prompt injection within untrusted web documents ingested by an autonomous LLM agent. The injected payload contains system delimiter overrides instructing the agent to invoke restricted environment inspection tools and exfiltrate credentials via side-channel requests.`,
    defaultQuestion: 'What are the recommended defenses against indirect prompt injection in autonomous agent loops?',
  },
  {
    id: 'bluekeep',
    cve_id: 'CVE-2019-0708',
    cve_url: 'https://nvd.nist.gov/vuln/detail/CVE-2019-0708',
    title: 'Windows RDP Pre-Auth RCE (BlueKeep)',
    tag: 'Kernel / Network',
    text: `A remote code execution vulnerability exists in Remote Desktop Services formerly known as Terminal Services when an unauthenticated attacker connects to the target system using RDP and sends specially crafted requests. The vulnerability is pre-authentication and requires no user interaction.`,
    defaultQuestion: 'What virtual channel in RDP causes this vulnerability and what is the mitigation?',
  },
];

export default function IntakeTab({
  onStartInvestigation,
  isLoading,
  selectedModel,
  onScriptGenerated,
  onSwitchToDockerTab,
}: IntakeTabProps) {
  const [cveUrl, setCveUrl] = useState<string>('');
  const [blogText, setBlogText] = useState<string>(PRESET_SCENARIOS[0].text);
  const [question, setQuestion] = useState<string>(PRESET_SCENARIOS[0].defaultQuestion);

  // Gemma Stream State
  const [gemmaResponse, setGemmaResponse] = useState<string>('');
  const [isQuestioning, setIsQuestioning] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);

  const handleSelectPreset = (preset: (typeof PRESET_SCENARIOS)[0]) => {
    setCveUrl(preset.cve_url);
    setBlogText(preset.text);
    setQuestion(preset.defaultQuestion);
    setGemmaResponse('');
  };

  const handleAskGemma = async () => {
    if (!blogText.trim() || !question.trim()) return;
    setIsQuestioning(true);
    setGemmaResponse('');

    try {
      await streamBlogQuestion(
        {
          blog_text: blogText,
          question: question,
          cve_url: cveUrl,
          model: selectedModel,
        },
        (chunk) => {
          setGemmaResponse((prev) => prev + chunk);
        }
      );
    } catch (err: any) {
      setGemmaResponse(`Error querying Gemma: ${err.message || err}`);
    } finally {
      setIsQuestioning(false);
    }
  };

  const handleGenerateScriptStream = async () => {
    if (!blogText.trim()) return;
    setIsQuestioning(true);
    setGemmaResponse('');

    try {
      let scriptBuffer = '';
      await streamScriptGeneration(
        {
          description: blogText,
          cve_id: cveUrl || 'CVE-TARGET',
          model: selectedModel,
        },
        (chunk) => {
          scriptBuffer += chunk;
          setGemmaResponse(scriptBuffer);
        }
      );

      if (onScriptGenerated) {
        onScriptGenerated(scriptBuffer);
      }
      if (onSwitchToDockerTab) {
        onSwitchToDockerTab();
      }
    } catch (err: any) {
      setGemmaResponse(`Error generating script: ${err.message || err}`);
    } finally {
      setIsQuestioning(false);
    }
  };

  const handleCopyGemma = () => {
    navigator.clipboard.writeText(gemmaResponse);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Preset Scenarios Strip */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-google-card">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-[#1a73e8]" />
          <span className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            Quick Preset Vulnerability & Advisory Scenarios
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="text-left p-3 rounded-xl border border-[#dadce0] hover:border-[#1a73e8] hover:bg-[#f8f9fa] transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-mono text-xs font-bold text-[#1a73e8] group-hover:underline">
                  {preset.cve_id}
                </span>
                <span className="text-[10px] font-medium bg-[#f1f3f4] text-[#5f6368] px-1.5 py-0.5 rounded">
                  {preset.tag}
                </span>
              </div>
              <h4 className="text-xs font-semibold text-[#202124] line-clamp-1">{preset.title}</h4>
            </button>
          ))}
        </div>
      </div>

      {/* Grid: CVE Link Input & Advisory Text Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: CVE Link & Repeat Card (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-google-card space-y-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-[#1a73e8]" />
              <h3 className="font-bold text-sm text-[#202124]">CVE / Advisory Web Link</h3>
            </div>

            <div>
              <label className="block text-xs text-[#5f6368] mb-1.5 font-medium">
                Enter Vulnerability Reference URL:
              </label>
              <input
                type="url"
                value={cveUrl}
                onChange={(e) => setCveUrl(e.target.value)}
                placeholder="https://nvd.nist.gov/vuln/detail/CVE-2021-44228"
                className="w-full text-xs font-mono px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all text-[#202124]"
              />
            </div>

            {/* Live Link Repeat / Echo Preview Box */}
            <div className="bg-[#f8f9fa] border border-[#e8eaed] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#5f6368]">
                <Info className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span>Link Echo & Intake State:</span>
              </div>

              {cveUrl ? (
                <div className="space-y-1">
                  <div className="font-mono text-xs font-semibold text-[#1a73e8] break-all bg-white p-2 rounded-lg border border-[#dadce0]">
                    {cveUrl}
                  </div>
                  <p className="text-[11px] text-[#5f6368]">
                    <span className="font-semibold text-[#1e8e3e]">● Ready for Intake</span> — URL recorded. Background scraping disabled in this stage.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#80868b] italic">
                  No CVE URL entered yet. Paste or select a preset to echo link here.
                </p>
              )}
            </div>

            {/* Quick Helper Tips */}
            <div className="p-3 bg-[#e8f0fe]/60 border border-[#d2e3fc] rounded-xl text-xs text-[#1a73e8] space-y-1">
              <span className="font-bold block">Autonomous SOC Protocol</span>
              <p className="text-[11px] text-[#3c4043] leading-relaxed">
                Paste the cybersecurity blog text on the right. You can either question Gemma directly or launch the full empirical verification sandbox!
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Cybersecurity Blog & Gemma Questioning (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-google-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1a73e8]" />
                <h3 className="font-bold text-sm text-[#202124]">
                  Cybersecurity Advisory / Blog Text
                </h3>
              </div>
              <span className="text-xs text-[#5f6368] font-mono">{blogText.length} chars</span>
            </div>

            <textarea
              value={blogText}
              onChange={(e) => setBlogText(e.target.value)}
              rows={6}
              placeholder="Paste cybersecurity writeup, vulnerability advisory, or threat intelligence disclosure here..."
              className="w-full text-xs font-sans p-3.5 bg-white border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all text-[#202124] leading-relaxed resize-y"
            />

            {/* Question Gemma Input */}
            <div className="pt-2 border-t border-[#f1f3f4] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#202124]">
                <HelpCircle className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span>Ask Local Gemma About This Advisory:</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. What are the exploit primitives and mitigation steps?"
                  className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-[#1a73e8]/20 transition-all text-[#202124]"
                />

                <button
                  onClick={handleAskGemma}
                  disabled={isQuestioning || !blogText.trim()}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#dadce0] hover:border-[#1a73e8] hover:text-[#1a73e8] text-[#3c4043] flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm active:scale-95 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
                  <span>{isQuestioning ? 'Thinking...' : 'Ask Gemma'}</span>
                </button>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-[#f1f3f4] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleGenerateScriptStream}
                disabled={isQuestioning || isLoading || !blogText.trim()}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#f8f9fa] border border-[#dadce0] hover:border-[#1a73e8] text-[#202124] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                <span>Stream PoC Script with Gemma</span>
              </button>

              <button
                onClick={() => onStartInvestigation(blogText, cveUrl)}
                disabled={isLoading || !blogText.trim()}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isLoading ? 'Running Triage...' : 'Launch Autonomous Verification'}</span>
              </button>
            </div>
          </div>

          {/* Gemma Response Stream Box (if any) */}
          {gemmaResponse && (
            <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-google-card space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#f1f3f4]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                  <span className="font-bold text-xs text-[#202124]">
                    Gemma Response ({selectedModel})
                  </span>
                  {isQuestioning && (
                    <span className="text-[10px] bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full animate-pulse font-medium">
                      Streaming...
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCopyGemma}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#dadce0] hover:border-[#1a73e8] text-[#3c4043] flex items-center gap-1 transition-all active:scale-95"
                >
                  {copiedResponse ? <Check className="w-3 h-3 text-[#1e8e3e]" /> : <Copy className="w-3 h-3 text-[#5f6368]" />}
                  <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="whitespace-pre-wrap font-sans text-xs text-[#202124] leading-relaxed bg-[#f8f9fa] p-4 rounded-xl border border-[#dadce0] max-h-[300px] overflow-y-auto">
                {gemmaResponse}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
