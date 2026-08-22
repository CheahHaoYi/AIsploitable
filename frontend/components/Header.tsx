'use client';

import React from 'react';
import { Shield, Cpu, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { ModelInfo } from '../lib/types';

interface HeaderProps {
  models: ModelInfo[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  isLoadingModels?: boolean;
  onRefreshModels?: () => void;
}

export default function Header({
  models,
  selectedModel,
  onSelectModel,
  isLoadingModels = false,
  onRefreshModels,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#dadce0] px-6 py-3 transition-shadow shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1a73e8] to-[#4285f4] flex items-center justify-center text-white shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight text-[#202124]">CyberTriage</span>
              <span className="bg-[#1a73e8] text-white text-xs font-semibold px-1.5 py-0.5 rounded tracking-wide">
                AI
              </span>
              <div className="flex items-center gap-1 ml-2">
                <span className="w-2 h-2 rounded-full bg-[#34a853] inline-block animate-pulse"></span>
                <span className="text-[11px] font-medium text-[#5f6368] uppercase tracking-wider">
                  Live SOC
                </span>
              </div>
            </div>
            <p className="text-xs text-[#5f6368] hidden sm:block">
              Autonomous Threat Intelligence & Empirical Sandbox Verification
            </p>
          </div>
        </div>

        {/* Center: Quick Capabilities Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-[#f8f9fa] border border-[#dadce0] px-3 py-1.5 rounded-full text-xs text-[#5f6368]">
          <div className="flex items-center gap-1 font-medium text-[#1a73e8]">
            <Layers className="w-3.5 h-3.5" />
            <span>ATT&CK & ATLAS RAG</span>
          </div>
          <span className="text-[#dadce0]">|</span>
          <div className="flex items-center gap-1 font-medium text-[#34a853]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Deterministic PoC Sandbox</span>
          </div>
        </div>

        {/* Right: Model Selector Dropdown & Engine Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-white border border-[#dadce0] hover:border-[#1a73e8] rounded-xl px-3 py-1.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#1a73e8]/20 focus-within:border-[#1a73e8]">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#202124]">
              <Cpu className="w-4 h-4 text-[#1a73e8]" />
              <span className="hidden sm:inline text-[#5f6368]">Model:</span>
            </div>
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#1a73e8] focus:outline-none cursor-pointer pr-1"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="text-[#202124]">
                  {m.name} {m.size ? `(${m.size})` : ''} {m.is_default ? '★ default' : ''}
                </option>
              ))}
            </select>
            {onRefreshModels && (
              <button
                onClick={onRefreshModels}
                title="Refresh models from Ollama"
                className="text-[#5f6368] hover:text-[#1a73e8] p-0.5 rounded transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModels ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#e6f4ea] text-[#137333] border border-[#ceead6] rounded-xl text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#1e8e3e]"></span>
            <span>GEMMA LOCAL</span>
          </div>
        </div>
      </div>
    </header>
  );
}
