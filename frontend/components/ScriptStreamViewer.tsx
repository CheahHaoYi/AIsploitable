'use client';

import React, { useState } from 'react';
import { Code, Copy, Check, Sparkles, Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface ScriptStreamViewerProps {
  script?: string;
  isStreaming?: boolean;
  modelUsed?: string;
}

export default function ScriptStreamViewer({
  script,
  isStreaming = false,
  modelUsed = 'gemma4:e2b',
}: ScriptStreamViewerProps) {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!script && !isStreaming) {
    return null;
  }

  const handleCopy = () => {
    if (!script) return;
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = script ? script.split('\n').length : 0;

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl shadow-google-card overflow-hidden transition-all">
      {/* Header */}
      <div className="bg-[#f8f9fa] border-b border-[#dadce0] px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center font-bold">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#202124]">
                PoC Verification Script (Gemma Synthesized)
              </h3>
              {isStreaming && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  Streaming Script...
                </span>
              )}
            </div>
            <p className="text-xs text-[#5f6368]">
              Automated Python 3 harness loaded into <code className="font-mono text-[#1a73e8]">/workspace/poc.py</code> ({lineCount} lines)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {script && (
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-[#dadce0] hover:border-[#1a73e8] text-[#3c4043] flex items-center gap-1.5 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3 h-3 text-[#1e8e3e]" /> : <Copy className="w-3 h-3 text-[#5f6368]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-[#5f6368] hover:text-[#202124] rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Body */}
      {!isCollapsed && (
        <div className="p-4 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs overflow-x-auto max-h-[320px] scrollbar-thin">
          <pre className="whitespace-pre leading-relaxed">
            {script}
            {isStreaming && <span className="inline-block w-2 h-4 bg-[#1a73e8] animate-pulse ml-0.5 align-middle"></span>}
          </pre>
        </div>
      )}
    </div>
  );
}
