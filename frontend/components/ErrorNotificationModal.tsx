'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  X,
  Settings as SettingsIcon,
  Play,
  ExternalLink,
  ShieldAlert,
  Key,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { LLMErrorDetails } from '../lib/llm/types';

interface ErrorNotificationModalProps {
  errorDetails: LLMErrorDetails | null;
  onClose: () => void;
  onOpenSettings: () => void;
  onSwitchToDemo?: () => void;
}

/**
 * Utility to render text with clickable URLs
 */
function renderMessageWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s"'`]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1a73e8] underline hover:text-[#1557b0] inline-flex items-center gap-0.5 break-all font-mono text-xs font-semibold px-1 py-0.5 rounded bg-[#e8f0fe] mx-0.5"
        >
          <span>{part}</span>
          <ExternalLink className="w-3 h-3 inline-block shrink-0" />
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function ErrorNotificationModal({
  errorDetails,
  onClose,
  onOpenSettings,
  onSwitchToDemo,
}: ErrorNotificationModalProps) {
  const [copiedCors, setCopiedCors] = useState<boolean>(false);

  if (!errorDetails) return null;

  const {
    title,
    message,
    provider = 'unknown',
    statusCode,
    isKeyMissing,
    isQuotaExceeded,
    isCorsError,
  } = errorDetails;

  const handleCopyCors = () => {
    navigator.clipboard.writeText('OLLAMA_ORIGINS="*" ollama serve');
    setCopiedCors(true);
    setTimeout(() => setCopiedCors(false), 2000);
  };

  const isOllama = provider === 'ollama';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#f5c2c7] shadow-2xl overflow-hidden flex flex-col scale-100 transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#ea4335]/10 via-[#ea4335]/5 to-transparent px-6 py-4 border-b border-[#fce8e6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ea4335] text-white flex items-center justify-center shadow-md shadow-[#ea4335]/20 shrink-0">
              {isKeyMissing ? (
                <Key className="w-5 h-5" />
              ) : isOllama ? (
                <ShieldAlert className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#202124]">
                  {title || (isKeyMissing ? 'API Key Required' : 'LLM Provider Error')}
                </h3>
                {statusCode && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#fce8e6] text-[#c5221f] border border-[#f5c2c7]">
                    HTTP {statusCode}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#5f6368] capitalize">
                Provider: <span className="font-semibold text-[#202124]">{provider}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Main Error Box */}
          <div className="p-4 rounded-xl bg-[#fdf2f2] border border-[#f5c2c7] text-[#c5221f] text-xs leading-relaxed space-y-2">
            <div className="font-semibold flex items-center gap-1.5 text-sm text-[#d93025]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Details:</span>
            </div>
            <div className="text-[#202124] font-medium leading-normal whitespace-pre-wrap">
              {renderMessageWithLinks(message)}
            </div>
          </div>

          {/* Contextual Guidance */}
          {isKeyMissing && (
            <div className="p-3.5 rounded-xl bg-[#e8f0fe] border border-[#d2e3fc] text-[#174ea6] text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#1a73e8]" />
                <span>How to resolve:</span>
              </div>
              <p className="text-[#3c4043]">
                Click <span className="font-semibold text-[#1a73e8]">Open Settings</span> below to paste your {provider.toUpperCase()} API key. Keys are securely stored in your browser&apos;s local storage and are never uploaded to our servers.
              </p>
            </div>
          )}

          {isQuotaExceeded && (
            <div className="p-3.5 rounded-xl bg-[#fef7e0] border border-[#ffeeba] text-[#b06000] text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#f29900]" />
                <span>Quota or Rate Limit Guidance:</span>
              </div>
              <p className="text-[#3c4043]">
                Your {provider} key limit or daily quota has been exceeded. You can check your account dashboard, switch to a different provider, or use <strong>Demo Mode</strong> to test immediately without quota limits.
              </p>
            </div>
          )}

          {isOllama && (
            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] text-xs space-y-2">
              <div className="font-bold text-[#202124] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#1a73e8]" />
                <span>Local Ollama CORS Configuration:</span>
              </div>
              <p className="text-[#5f6368]">
                Web browsers enforce CORS security when querying localhost. Start Ollama with origin allowance:
              </p>
              <div className="bg-[#202124] text-white p-2.5 rounded-lg font-mono text-[11px] flex items-center justify-between">
                <span>OLLAMA_ORIGINS=&quot;*&quot; ollama serve</span>
                <button
                  onClick={handleCopyCors}
                  className="px-2 py-1 rounded bg-[#3c4043] hover:bg-[#5f6368] text-white text-[10px] flex items-center gap-1"
                >
                  {copiedCors ? <Check className="w-3 h-3 text-[#34a853]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCors ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-[#f8f9fa] border-t border-[#dadce0] flex flex-col sm:flex-row items-center justify-between gap-3">
          {onSwitchToDemo ? (
            <button
              onClick={() => {
                onSwitchToDemo();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#dadce0] hover:bg-[#f1f3f4] text-[#202124] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <Play className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Switch to Demo Simulation</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl hover:bg-[#e8eaed] text-[#5f6368] transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Open Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
