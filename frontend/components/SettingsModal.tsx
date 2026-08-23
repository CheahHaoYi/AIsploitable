'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Cpu,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';
import {
  LLMProvider,
  ProviderSettings,
  PROVIDER_REGISTRY,
} from '../lib/llm/types';
import {
  DEFAULT_SETTINGS,
  getStoredSettings,
  saveStoredSettings,
  inferProvider,
} from '../lib/llm/gateway';
import { testOllamaConnection } from '../lib/llm/ollamaClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
  initialProvider?: LLMProvider;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSettingsSaved,
  initialProvider,
}: SettingsModalProps) {
  const [settings, setSettings] = useState<ProviderSettings>(DEFAULT_SETTINGS);
  const [activeProvider, setActiveProvider] = useState<LLMProvider>('gemini');
  const [customModelInput, setCustomModelInput] = useState<string>('gemini-2.5-flash');
  
  const [testingOllama, setTestingOllama] = useState<boolean>(false);
  const [ollamaStatus, setOllamaStatus] = useState<{
    tested: boolean;
    ok: boolean;
    message: string;
  } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredSettings();
      setSettings(stored);
      const prov = initialProvider || stored.selectedProvider || inferProvider(stored.selectedModel, stored);
      setActiveProvider(prov);
      setCustomModelInput(
        stored.providerModels?.[prov] ||
          stored.selectedModel ||
          PROVIDER_REGISTRY[prov]?.defaultModel ||
          'gemini-2.5-flash'
      );
      setOllamaStatus(null);
      setSaveSuccess(false);
    }
  }, [isOpen, initialProvider]);

  if (!isOpen) return null;

  const handleProviderChange = (newProvider: LLMProvider) => {
    setActiveProvider(newProvider);
    const existingModelForProvider =
      settings.providerModels?.[newProvider] ||
      PROVIDER_REGISTRY[newProvider]?.defaultModel ||
      '';
    setCustomModelInput(existingModelForProvider);
    setSettings((prev) => ({
      ...prev,
      selectedProvider: newProvider,
      selectedModel: existingModelForProvider,
    }));
  };

  const handleModelChange = (newModel: string) => {
    setCustomModelInput(newModel);
    setSettings((prev) => ({
      ...prev,
      selectedModel: newModel,
      providerModels: {
        ...(prev.providerModels || {}),
        [activeProvider]: newModel,
      },
    }));
  };

  const handlePresetClick = (presetModel: string) => {
    handleModelChange(presetModel);
  };

  const handleTestOllama = async () => {
    setTestingOllama(true);
    setOllamaStatus(null);
    try {
      const result = await testOllamaConnection(settings.ollamaUrl);
      setOllamaStatus({
        tested: true,
        ok: result.ok,
        message: result.message,
      });
    } catch (e: any) {
      setOllamaStatus({
        tested: true,
        ok: false,
        message: e.message || 'Connection failed.',
      });
    } finally {
      setTestingOllama(false);
    }
  };

  const handleSave = () => {
    const updatedSettings: ProviderSettings = {
      ...settings,
      selectedProvider: activeProvider,
      selectedModel: customModelInput.trim() || PROVIDER_REGISTRY[activeProvider]?.defaultModel || 'gemini-2.5-flash',
      providerModels: {
        ...(settings.providerModels || {}),
        [activeProvider]: customModelInput.trim() || PROVIDER_REGISTRY[activeProvider]?.defaultModel || '',
      },
    };
    saveStoredSettings(updatedSettings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onSettingsSaved) onSettingsSaved();
      onClose();
    }, 350);
  };

  const copyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const activeProviderMeta = PROVIDER_REGISTRY[activeProvider] || PROVIDER_REGISTRY.gemini;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-[#dadce0] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dadce0] bg-[#f8f9fa] sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1a73e8]/10 text-[#1a73e8] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#202124]">
                Model Provider &amp; API Configuration
              </h2>
              <p className="text-xs text-[#5f6368]">
                Select your AI provider, enter any custom model name, and configure API keys
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#5f6368] hover:text-[#202124] p-1.5 rounded-lg hover:bg-[#e8eaed] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Privacy Alert */}
          <div className="flex items-start gap-3 p-3.5 bg-[#e8f0fe] border border-[#d2e3fc] rounded-xl text-xs text-[#174ea6]">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-[#1a73e8] mt-0.5" />
            <div>
              <p className="font-semibold">100% Client-Side Privacy Guarantee</p>
              <p className="text-[#3c4043] mt-0.5">
                All API keys and provider endpoints are stored strictly in your browser&apos;s
                <code className="mx-1 px-1 bg-white/80 rounded border border-[#d2e3fc]">localStorage</code>
                and sent directly from your browser to the respective AI APIs. No backend servers store or proxy your keys.
              </p>
            </div>
          </div>

          {/* Primary Provider & Custom Model Selector */}
          <div className="p-4 bg-[#f8f9fa] border-2 border-[#1a73e8]/30 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1a73e8]" />
                <h3 className="text-sm font-bold text-[#202124]">
                  Active AI Engine &amp; Model Selection
                </h3>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 bg-[#1a73e8]/10 text-[#1a73e8] rounded-full">
                {activeProviderMeta.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Provider Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  1. Select Provider:
                </label>
                <div className="relative">
                  <select
                    value={activeProvider}
                    onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
                    className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-lg text-xs font-medium text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8] appearance-none cursor-pointer pr-8"
                  >
                    <option value="gemini">🌟 Google Gemini (Recommended)</option>
                    <option value="openrouter">🔀 OpenRouter (DeepSeek, Llama, 200+)</option>
                    <option value="groq">⚡ Groq LPU (Ultra-Low Latency)</option>
                    <option value="openai">🟢 OpenAI (GPT-4o, o3-mini)</option>
                    <option value="anthropic">🟣 Anthropic Claude (Sonnet, Haiku)</option>
                    <option value="ollama">💻 Local Ollama / LM Studio</option>
                    <option value="demo">🧪 Offline Demo Simulation (No Keys)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#5f6368] absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Custom Model Name / Type Input */}
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1">
                  2. Model Type / Name (Editable):
                </label>
                <input
                  type="text"
                  value={customModelInput}
                  onChange={(e) => handleModelChange(e.target.value)}
                  placeholder={activeProviderMeta.placeholder}
                  className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-lg text-xs font-mono font-medium text-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8]"
                />
              </div>
            </div>

            {/* Suggested Model Presets */}
            {activeProviderMeta.suggestedModels.length > 0 && (
              <div>
                <div className="text-[11px] font-semibold text-[#5f6368] mb-1.5 flex items-center justify-between">
                  <span>Quick Presets (Click to set):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeProviderMeta.suggestedModels.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className={`text-[11px] px-2.5 py-1 rounded-md font-mono transition-all border ${
                        customModelInput === preset
                          ? 'bg-[#1a73e8] text-white border-[#1a73e8] shadow-sm font-semibold'
                          : 'bg-white text-[#3c4043] border-[#dadce0] hover:border-[#1a73e8] hover:text-[#1a73e8]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: API Key Vault */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#ea4335]" />
              <h3 className="text-sm font-semibold text-[#202124]">
                Provider API Key Vault &amp; Endpoint Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Google Gemini Card */}
              <div
                className={`p-3.5 border rounded-xl space-y-2 transition-all ${
                  activeProvider === 'gemini'
                    ? 'bg-[#e8f0fe]/40 border-[#1a73e8] ring-1 ring-[#1a73e8]/20'
                    : 'bg-[#f8f9fa] border-[#dadce0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#202124]">Google Gemini</span>
                    {settings.geminiKey?.trim() ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#e6f4ea] text-[#137333] rounded">
                        Key Set
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#fce8e6] text-[#c5221f] rounded">
                        Key Required
                      </span>
                    )}
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#1a73e8] hover:underline flex items-center gap-0.5"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={settings.geminiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, geminiKey: e.target.value })
                  }
                  placeholder="AIzaSy..."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#dadce0] rounded-lg text-xs font-mono text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
                />
                <p className="text-[11px] text-[#5f6368]">
                  Supports <code className="text-[#1a73e8]">gemini-2.5-flash</code>, <code className="text-[#1a73e8]">gemini-3.1-pro-preview</code>, etc.
                </p>
              </div>

              {/* OpenRouter Card */}
              <div
                className={`p-3.5 border rounded-xl space-y-2 transition-all ${
                  activeProvider === 'openrouter'
                    ? 'bg-[#e8f0fe]/40 border-[#1a73e8] ring-1 ring-[#1a73e8]/20'
                    : 'bg-[#f8f9fa] border-[#dadce0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#202124]">OpenRouter</span>
                    {settings.openrouterKey?.trim() ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#e6f4ea] text-[#137333] rounded">
                        Key Set
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#fce8e6] text-[#c5221f] rounded">
                        Key Required
                      </span>
                    )}
                  </div>
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#1a73e8] hover:underline flex items-center gap-0.5"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={settings.openrouterKey}
                  onChange={(e) =>
                    setSettings({ ...settings, openrouterKey: e.target.value })
                  }
                  placeholder="sk-or-..."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#dadce0] rounded-lg text-xs font-mono text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
                />
                <p className="text-[11px] text-[#5f6368]">
                  Supports DeepSeek R1, Llama 3.3, Claude, Mistral, and 200+ models.
                </p>
              </div>

              {/* Groq Card */}
              <div
                className={`p-3.5 border rounded-xl space-y-2 transition-all ${
                  activeProvider === 'groq'
                    ? 'bg-[#e8f0fe]/40 border-[#1a73e8] ring-1 ring-[#1a73e8]/20'
                    : 'bg-[#f8f9fa] border-[#dadce0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#202124]">Groq LPU</span>
                    {settings.groqKey?.trim() ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#e6f4ea] text-[#137333] rounded">
                        Key Set
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#fce8e6] text-[#c5221f] rounded">
                        Key Required
                      </span>
                    )}
                  </div>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#1a73e8] hover:underline flex items-center gap-0.5"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={settings.groqKey}
                  onChange={(e) =>
                    setSettings({ ...settings, groqKey: e.target.value })
                  }
                  placeholder="gsk_..."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#dadce0] rounded-lg text-xs font-mono text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
                />
                <p className="text-[11px] text-[#5f6368]">
                  Ultra-fast token throughput on Groq LPUs.
                </p>
              </div>

              {/* OpenAI Card */}
              <div
                className={`p-3.5 border rounded-xl space-y-2 transition-all ${
                  activeProvider === 'openai'
                    ? 'bg-[#e8f0fe]/40 border-[#1a73e8] ring-1 ring-[#1a73e8]/20'
                    : 'bg-[#f8f9fa] border-[#dadce0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#202124]">OpenAI</span>
                    {settings.openaiKey?.trim() ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#e6f4ea] text-[#137333] rounded">
                        Key Set
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#fce8e6] text-[#c5221f] rounded">
                        Key Required
                      </span>
                    )}
                  </div>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#1a73e8] hover:underline flex items-center gap-0.5"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={settings.openaiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, openaiKey: e.target.value })
                  }
                  placeholder="sk-..."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#dadce0] rounded-lg text-xs font-mono text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
                />
                <p className="text-[11px] text-[#5f6368]">
                  Supports GPT-4o, GPT-4o Mini, o3-mini, and custom fine-tunes.
                </p>
              </div>

              {/* Anthropic Card */}
              <div
                className={`p-3.5 border rounded-xl space-y-2 transition-all md:col-span-2 ${
                  activeProvider === 'anthropic'
                    ? 'bg-[#e8f0fe]/40 border-[#1a73e8] ring-1 ring-[#1a73e8]/20'
                    : 'bg-[#f8f9fa] border-[#dadce0]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#202124]">Anthropic Claude</span>
                    {settings.anthropicKey?.trim() ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#e6f4ea] text-[#137333] rounded">
                        Key Set
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 bg-[#fce8e6] text-[#c5221f] rounded">
                        Key Required
                      </span>
                    )}
                  </div>
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#1a73e8] hover:underline flex items-center gap-0.5"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={settings.anthropicKey}
                  onChange={(e) =>
                    setSettings({ ...settings, anthropicKey: e.target.value })
                  }
                  placeholder="sk-ant-..."
                  className="w-full px-2.5 py-1.5 bg-white border border-[#dadce0] rounded-lg text-xs font-mono text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
                />
                <p className="text-[11px] text-[#5f6368]">
                  Supports Claude 3.5 Sonnet, Claude 3.7 Sonnet Hybrid Reasoning, and Haiku.
                </p>
              </div>
            </div>
          </div>

              {/* Section: Local Ollama Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#1a73e8]" />
              <h3 className="text-sm font-semibold text-[#202124]">
                Local Ollama / LM Studio (Zero Cloud Dependency)
              </h3>
            </div>

            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#3c4043] mb-1">
                  Local Ollama Host URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.ollamaUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, ollamaUrl: e.target.value })
                    }
                    placeholder="http://127.0.0.1:11434"
                    className="flex-1 px-3 py-2 bg-white border border-[#dadce0] rounded-lg text-xs font-mono text-[#202124] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/20 focus:border-[#1a73e8]"
                  />
                  <button
                    onClick={handleTestOllama}
                    disabled={testingOllama}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#dadce0] hover:border-[#1a73e8] text-[#1a73e8] text-xs font-medium rounded-lg shadow-sm transition-all hover:bg-[#f1f3f4]"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${testingOllama ? 'animate-spin' : ''}`}
                    />
                    <span>{testingOllama ? 'Testing...' : 'Test Connection'}</span>
                  </button>
                </div>
              </div>

              {/* Ollama Connection Test Result */}
              {ollamaStatus && (
                <div
                  className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                    ollamaStatus.ok
                      ? 'bg-[#e6f4ea] text-[#137333] border border-[#ceead6]'
                      : 'bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]'
                  }`}
                >
                  {ollamaStatus.ok ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{ollamaStatus.message}</p>
                    {!ollamaStatus.ok && (
                      <div className="mt-2 space-y-1.5 text-[#202124]">
                        <p className="font-semibold text-[11px] text-[#5f6368]">
                          To allow browser access to local Ollama, start it with CORS enabled:
                        </p>
                        <div className="flex items-center justify-between bg-white border border-[#dadce0] rounded-md px-2.5 py-1.5 font-mono text-[11px]">
                          <span>OLLAMA_ORIGINS=&quot;*&quot; ollama serve</span>
                          <button
                            onClick={() =>
                              copyCommand('OLLAMA_ORIGINS="*" ollama serve')
                            }
                            className="text-[#5f6368] hover:text-[#1a73e8] ml-2"
                            title="Copy command"
                          >
                            {copiedCmd ? (
                              <Check className="w-3.5 h-3.5 text-[#34a853]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Unified Context Window & Inference Parameters */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#1a73e8]" />
              <h3 className="text-sm font-semibold text-[#202124]">
                Inference Parameters &amp; Context Window (All Models)
              </h3>
            </div>

            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Context Window Size */}
                <div>
                  <label className="block font-medium text-[#3c4043] mb-1">
                    Context Window Size (<code className="font-mono text-[11px] text-[#1a73e8]">num_ctx</code>):
                  </label>
                  <select
                    value={settings.contextSize || 8192}
                    onChange={(e) =>
                      setSettings({ ...settings, contextSize: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-lg text-xs font-mono text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
                  >
                    <option value={4096}>4,096 tokens (Fast / Low RAM)</option>
                    <option value={8192}>8,192 tokens (Standard Default)</option>
                    <option value={16384}>16,384 tokens (Deep Advisory Ingestion)</option>
                    <option value={32768}>32,768 tokens (Extended Context)</option>
                  </select>
                  <p className="text-[11px] text-[#5f6368] mt-1">
                    Enables local Gemma 4 / Ollama and cloud models to ingest full CVE advisories without token cutoff.
                  </p>
                </div>

                {/* Max Generation Tokens */}
                <div>
                  <label className="block font-medium text-[#3c4043] mb-1">
                    Max Output Tokens (<code className="font-mono text-[11px] text-[#1a73e8]">num_predict</code>):
                  </label>
                  <select
                    value={settings.maxPredict || 4096}
                    onChange={(e) =>
                      setSettings({ ...settings, maxPredict: parseInt(e.target.value, 10) })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#dadce0] rounded-lg text-xs font-mono text-[#202124] focus:outline-none focus:ring-1 focus:ring-[#1a73e8]"
                  >
                    <option value={2048}>2,048 tokens</option>
                    <option value={4096}>4,096 tokens (Default)</option>
                    <option value={8192}>8,192 tokens (Long PoC Code)</option>
                  </select>
                  <p className="text-[11px] text-[#5f6368] mt-1">
                    Maximum token limit for generated technical writeups and Python PoC scripts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#dadce0] bg-[#f8f9fa] sticky bottom-0">
          <button
            onClick={() => {
              setSettings(DEFAULT_SETTINGS);
              setActiveProvider('gemini');
              setCustomModelInput('gemini-2.5-flash');
            }}
            className="text-xs text-[#5f6368] hover:text-[#202124] hover:underline"
          >
            Reset to Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#dadce0] hover:bg-[#e8eaed] text-[#3c4043] text-xs font-medium rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
