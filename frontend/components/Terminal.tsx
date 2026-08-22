'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal as TerminalIcon, Copy, Check, Trash2, ArrowDown } from 'lucide-react';

interface TerminalProps {
  output: string;
  isExecuting?: boolean;
}

export default function Terminal({ output, isExecuting = false }: TerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output, autoScroll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl overflow-hidden shadow-lg flex flex-col font-mono">
      {/* Terminal Title Bar */}
      <div className="bg-[#2d2d2d] px-4 py-2.5 flex items-center justify-between border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block"></span>
          </div>
          <TerminalIcon className="w-4 h-4 text-[#858585]" />
          <span className="text-xs text-[#cccccc] font-medium">
            sandbox-target-node:~ # live-stream
          </span>
          {isExecuting && (
            <span className="flex items-center gap-1 text-[11px] text-[#27c93f] bg-[#1b3a24] px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27c93f] animate-ping"></span>
              <span>RUNNING</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
              autoScroll ? 'bg-[#3c3c3c] text-[#ffffff]' : 'text-[#858585] hover:text-white'
            }`}
            title="Auto-scroll"
          >
            <ArrowDown className="w-3 h-3" />
            <span className="text-[10px]">Auto-scroll</span>
          </button>

          <button
            onClick={handleCopy}
            className="text-[#858585] hover:text-white p-1 rounded transition-colors"
            title="Copy Terminal Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#27c93f]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Content Area */}
      <div className="p-4 text-xs text-[#e0e0e0] overflow-y-auto max-h-[340px] min-h-[180px] space-y-1 select-text">
        {output ? (
          <pre className="whitespace-pre-wrap leading-relaxed font-mono">
            {output}
          </pre>
        ) : (
          <div className="text-[#6e7681] italic py-8 text-center">
            Waiting for PoC verification execution commands to stream...
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
