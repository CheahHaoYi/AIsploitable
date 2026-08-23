'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Cpu,
  RefreshCw,
  Layers,
  CheckCircle2,
  Settings as SettingsIcon,
  Globe,
  AlertTriangle,
  Key,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { ModelInfo } from '../lib/types';
import {
  LLMProvider,
  ProviderSettings,
  PROVIDER_REGISTRY,
} from '../lib/llm/types';
import SettingsModal from './SettingsModal';
import {
  isModelKeyConfigured,
  inferProvider,
  getStoredSettings,
  saveStoredSettings,
  DEFAULT_SETTINGS,
} from '../lib/llm/gateway';

interface HeaderProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  selectedProvider?: LLMProvider;
  onSelectProvider?: (provider: LLMProvider) => void;
  isLoadingModels?: boolean;
  onRefreshModels?: () => void;
  isOllamaConnected?: boolean;
  ollamaError?: string;
  isSettingsOpen?: boolean;
  onOpenSettings?: (provider?: LLMProvider) => void;
  onCloseSettings?: () => void;
}

export default function Header({
  models,
  selectedModel,
  onSelectModel,
  selectedProvider: externalSelectedProvider,
  onSelectProvider: externalOnSelectProvider,
  isLoadingModels = false,
  onRefreshModels,
  isOllamaConnected = false,
  ollamaError,
  isSettingsOpen: externalIsSettingsOpen,
  onOpenSettings,
  onCloseSettings,
}: HeaderProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [internalSettingsOpen, setInternalSettingsOpen] = useState<boolean>(false);
  const [targetProviderForModal, setTargetProviderForModal] = useState<LLMProvider | undefined>(undefined);
  const isSettingsOpen = externalIsSettingsOpen !== undefined ? externalIsSettingsOpen : internalSettingsOpen;

  // Stored provider settings to derive keys and provider states
  const [settings, setSettings] = useState<ProviderSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setMounted(true);
    setSettings(getStoredSettings());
  }, [isSettingsOpen, selectedModel]);

  // Determine active provider
  const currentProvider: LLMProvider =
    externalSelectedProvider ||
    settings.selectedProvider ||
    inferProvider(selectedModel, settings);

  const handleOpenSettingsWithProvider = (provider?: LLMProvider) => {
    setTargetProviderForModal(provider || currentProvider);
    if (onOpenSettings) onOpenSettings(provider || currentProvider);
    else setInternalSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    if (onCloseSettings) onCloseSettings();
    else setInternalSettingsOpen(false);
  };

  const handleProviderSelect = (newProvider: LLMProvider) => {
    const currentStored = getStoredSettings();
    const providerMeta = PROVIDER_REGISTRY[newProvider];
    const preferredModel =
      currentStored.providerModels?.[newProvider] ||
      providerMeta?.defaultModel ||
      'gemini-2.5-flash';

    const updated = saveStoredSettings({
      selectedProvider: newProvider,
      selectedModel: preferredModel,
      providerModels: {
        ...(currentStored.providerModels || {}),
        [newProvider]: preferredModel,
      },
    });

    setSettings(updated);
    if (externalOnSelectProvider) externalOnSelectProvider(newProvider);
    onSelectModel(preferredModel);

    // If switching to a cloud provider with no key, prompt to enter key
    if (providerMeta?.requiresKey && !isModelKeyConfigured(preferredModel, updated, newProvider)) {
      handleOpenSettingsWithProvider(newProvider);
    }
  };

  const handleModelInputChange = (newModel: string) => {
    onSelectModel(newModel);
    const updated = saveStoredSettings({
      selectedModel: newModel,
      providerModels: {
        ...(settings.providerModels || {}),
        [currentProvider]: newModel,
      },
    });
    setSettings(updated);
  };

  const currentMeta = PROVIDER_REGISTRY[currentProvider] || PROVIDER_REGISTRY.gemini;
  const isKeyConfigured = mounted ? isModelKeyConfigured(selectedModel, settings, currentProvider) : false;

  // Suggestions for datalist: combine provider suggestions with any live models
  const suggestedModelsList = Array.from(
    new Set([
      ...(currentMeta?.suggestedModels || []),
      ...models.filter((m) => m.provider === currentProvider).map((m) => m.id),
    ])
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#dadce0] px-4 sm:px-6 py-2.5 transition-shadow shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Left: Brand Logo & Name */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1a73e8] to-[#4285f4] flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg tracking-tight text-[#202124]">
                    AIsploitable
                  </span>
                  <div className="flex items-center gap-1 ml-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#34a853] inline-block animate-pulse"></span>
                    <span className="text-[10px] font-semibold text-[#5f6368] uppercase tracking-wider">
                      Live SOC
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-[#5f6368] hidden sm:block">
                  Autonomous Threat Intelligence &amp; Empirical Sandbox Verification
                </p>
              </div>
            </div>

            {/* Mobile Settings Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => handleOpenSettingsWithProvider(currentProvider)}
                title="AI Settings & BYOK Keys"
                className="p-2 border border-[#dadce0] hover:border-[#1a73e8] rounded-xl hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1a73e8] shadow-sm transition-all"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center: Quick Capabilities Badge */}
          <div className="hidden xl:flex items-center gap-2 bg-[#f8f9fa] border border-[#dadce0] px-3 py-1.5 rounded-full text-xs text-[#5f6368]">
            <div className="flex items-center gap-1 font-medium text-[#1a73e8]">
              <Layers className="w-3.5 h-3.5" />
              <span>755 ATT&amp;CK &amp; ATLAS RAG</span>
            </div>
            <span className="text-[#dadce0]">|</span>
            <div className="flex items-center gap-1 font-medium text-[#34a853]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Client-Side Triage</span>
            </div>
          </div>

          {/* Right: Modern Provider Dropdown + Custom Model Input + API Key Status */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {/* 1. Provider Selector Dropdown */}
            <div className="flex items-center bg-[#f8f9fa] border border-[#dadce0] hover:border-[#1a73e8] rounded-xl px-2.5 py-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#1a73e8]/20 focus-within:border-[#1a73e8]">
              <span className="text-[11px] font-medium text-[#5f6368] mr-1.5 hidden sm:inline">
                Provider:
              </span>
              <div className="relative">
                <select
                  value={currentProvider}
                  onChange={(e) => handleProviderSelect(e.target.value as LLMProvider)}
                  className="bg-transparent text-xs font-semibold text-[#202124] focus:outline-none cursor-pointer pr-5 py-0.5"
                >
                  <option value="gemini">🌟 Google Gemini</option>
                  <option value="openrouter">🔀 OpenRouter</option>
                  <option value="groq">⚡ Groq LPU</option>
                  <option value="openai">🟢 OpenAI</option>
                  <option value="anthropic">🟣 Anthropic</option>
                  <option value="ollama">💻 Local Ollama</option>
                  <option value="demo">🧪 Demo Mode</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#5f6368] absolute right-0 top-1.5 pointer-events-none" />
              </div>
            </div>

            {/* 2. Custom Model Type Input (Editable with Suggestions Datalist) */}
            <div className="flex items-center gap-1.5 bg-white border border-[#dadce0] hover:border-[#1a73e8] rounded-xl px-2.5 py-1 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#1a73e8]/20 focus-within:border-[#1a73e8]">
              <Cpu className="w-3.5 h-3.5 text-[#1a73e8] flex-shrink-0" />
              <input
                type="text"
                list="header-model-suggestions"
                value={selectedModel}
                onChange={(e) => handleModelInputChange(e.target.value)}
                placeholder={currentMeta.placeholder}
                title="Enter or select model name"
                className="bg-transparent text-xs font-mono font-semibold text-[#1a73e8] focus:outline-none w-36 sm:w-44 truncate"
              />
              <datalist id="header-model-suggestions">
                {suggestedModelsList.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>

              {onRefreshModels && (
                <button
                  onClick={onRefreshModels}
                  title="Refresh models from Ollama & settings"
                  className="text-[#5f6368] hover:text-[#1a73e8] p-0.5 rounded transition-colors"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoadingModels ? 'animate-spin' : ''}`}
                  />
                </button>
              )}
            </div>

            {/* 3. API Key Status or Provider Badge Button */}
            {currentMeta.requiresKey ? (
              <button
                suppressHydrationWarning
                onClick={() => handleOpenSettingsWithProvider(currentProvider)}
                title={
                  isKeyConfigured
                    ? `${currentMeta.name} API Key is configured. Click to change.`
                    : `${currentMeta.name} API Key is missing! Click to enter key.`
                }
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all shadow-sm ${
                  isKeyConfigured
                    ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6] hover:bg-[#ceead6]'
                    : 'bg-[#fef7e0] text-[#b06000] border-[#fce8b2] hover:bg-[#fce8b2] animate-pulse'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span suppressHydrationWarning className="hidden sm:inline">
                  {isKeyConfigured ? 'Key Set' : 'Add Key'}
                </span>
              </button>
            ) : currentProvider === 'ollama' ? (
              isOllamaConnected ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#e6f4ea] text-[#137333] border border-[#ceead6] rounded-xl text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#1e8e3e]"></span>
                  <span className="hidden sm:inline">Local Ollama Online</span>
                </div>
              ) : (
                <button
                  onClick={() => handleOpenSettingsWithProvider('ollama')}
                  title={ollamaError || 'Click to test Ollama connection & CORS'}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] rounded-xl text-xs font-medium hover:bg-[#fad2cf] transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#c5221f]" />
                  <span className="hidden sm:inline">Check Ollama CORS</span>
                </button>
              )
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#fef7e0] text-[#b06000] border border-[#fce8b2] rounded-xl text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#f9ab00]" />
                <span className="hidden sm:inline">Zero-Key Demo</span>
              </div>
            )}

            {/* 4. Settings Modal Button */}
            <button
              onClick={() => handleOpenSettingsWithProvider(currentProvider)}
              title="Provider Settings & Key Vault"
              className="hidden lg:flex items-center p-2 border border-[#dadce0] hover:border-[#1a73e8] rounded-xl hover:bg-[#f1f3f4] text-[#5f6368] hover:text-[#1a73e8] shadow-sm transition-all"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        initialProvider={targetProviderForModal}
        onSettingsSaved={() => {
          const fresh = getStoredSettings();
          setSettings(fresh);
          if (onRefreshModels) onRefreshModels();
        }}
      />
    </>
  );
}
