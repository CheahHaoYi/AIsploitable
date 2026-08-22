'use client';

import React, { useState } from 'react';
import { Zap, Copy, Check, Sparkles, Cpu, Clock } from 'lucide-react';

interface DirectPromptViewProps {
  model: string;
  response: string;
  isStreaming: boolean;
  onClose?: () => void;
}

export default function DirectPromptView({
  model,
  response,
  isStreaming,
  onClose,
}: DirectPromptViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-google-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#f1f3f4]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#fef7e0] text-[#f29900] flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#202124]">Direct Ollama Inference</h3>
              <span className="text-xs bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-md font-mono font-medium">
                {model}
              </span>
            </div>
            <p className="text-xs text-[#5f6368]">
              {isStreaming ? 'Streaming response from local Gemma...' : 'Inference complete'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!response}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-[#dadce0] hover:border-[#1a73e8] text-[#3c4043] flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#1e8e3e]" /> : <Copy className="w-3.5 h-3.5 text-[#5f6368]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#3c4043] transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-5 text-xs sm:text-sm text-[#202124] overflow-x-auto min-h-[140px]">
        {response ? (
          <pre className="whitespace-pre-wrap font-mono leading-relaxed">{response}</pre>
        ) : (
          <div className="flex items-center gap-2 text-[#5f6368] italic py-6 justify-center">
            <Sparkles className="w-4 h-4 animate-spin text-[#1a73e8]" />
            <span>Sending prompt directly to {model} on Ollama server...</span>
          </div>
        )}
      </div>
    </div>
  );
}
