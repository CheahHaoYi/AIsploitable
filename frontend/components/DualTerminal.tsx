'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Copy, Check, Trash2, ArrowDown, Shield, Server, Cpu, Play } from 'lucide-react';

interface DualTerminalProps {
  attackerLogs: string;
  victimLogs: string;
  compositeLogs?: string;
  isExecuting?: boolean;
}

export default function DualTerminal({
  attackerLogs,
  victimLogs,
  compositeLogs = '',
  isExecuting = false,
}: DualTerminalProps) {
  const [autoscroll, setAutoscroll] = useState(true);
  const [copiedAttacker, setCopiedAttacker] = useState(false);
  const [copiedVictim, setCopiedVictim] = useState(false);

  const attackerEndRef = useRef<HTMLDivElement | null>(null);
  const victimEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (autoscroll) {
      attackerEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      victimEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [attackerLogs, victimLogs, autoscroll]);

  const copyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Sandbox Sub-Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            Docker Dual-Sandbox Real-Time Telemetry
          </span>
          {isExecuting && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1e8e3e] bg-[#e6f4ea] px-2 py-0.5 rounded-full animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1e8e3e]"></span>
              Streaming Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoscroll(!autoscroll)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all flex items-center gap-1 ${
              autoscroll
                ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] font-medium'
                : 'bg-white border-[#dadce0] text-[#5f6368]'
            }`}
          >
            <ArrowDown className="w-3 h-3" />
            <span>Autoscroll {autoscroll ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Terminals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Container 1: Attacker Sandbox */}
        <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl shadow-google-card overflow-hidden flex flex-col h-[400px]">
          {/* Header */}
          <div className="bg-[#2d2d2d] px-4 py-2.5 flex items-center justify-between border-b border-[#3e3e3e]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#34a853] animate-pulse"></div>
              <Shield className="w-3.5 h-3.5 text-[#4285f4]" />
              <span className="font-mono text-xs font-bold text-[#ffffff]">
                sandbox-attacker-node
              </span>
              <span className="text-[10px] bg-[#1a73e8]/30 text-[#8ab4f8] px-1.5 py-0.5 rounded font-mono">
                172.20.0.2 (PoC Agent)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyText(attackerLogs, setCopiedAttacker)}
                className="text-[#9aa0a6] hover:text-white p-1 rounded transition-colors"
                title="Copy Attacker Logs"
              >
                {copiedAttacker ? <Check className="w-3.5 h-3.5 text-[#34a853]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="flex-1 p-4 font-mono text-xs text-[#e8eaed] overflow-y-auto space-y-1 scrollbar-thin">
            {attackerLogs ? (
              <pre className="whitespace-pre-wrap leading-relaxed">
                {attackerLogs}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#80868b] space-y-2">
                <TerminalIcon className="w-8 h-8 opacity-40 animate-pulse" />
                <p className="text-xs">Attacker container standby. Awaiting execution trigger...</p>
              </div>
            )}
            <div ref={attackerEndRef} />
          </div>

          {/* Footer Status */}
          <div className="bg-[#252526] px-4 py-1.5 text-[11px] text-[#9aa0a6] font-mono flex items-center justify-between border-t border-[#333333]">
            <span>Runtime: Python 3.11</span>
            <span>CAP_NET_RAW: Dropped</span>
          </div>
        </div>

        {/* Container 2: Victim Target */}
        <div className="bg-[#1e1e1e] border border-[#333333] rounded-2xl shadow-google-card overflow-hidden flex flex-col h-[400px]">
          {/* Header */}
          <div className="bg-[#2d2d2d] px-4 py-2.5 flex items-center justify-between border-b border-[#3e3e3e]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#fbbc04] animate-pulse"></div>
              <Server className="w-3.5 h-3.5 text-[#fbbc04]" />
              <span className="font-mono text-xs font-bold text-[#ffffff]">
                sandbox-victim-target
              </span>
              <span className="text-[10px] bg-[#fbbc04]/20 text-[#fdd663] px-1.5 py-0.5 rounded font-mono">
                172.20.0.3:8080 (Target App)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyText(victimLogs, setCopiedVictim)}
                className="text-[#9aa0a6] hover:text-white p-1 rounded transition-colors"
                title="Copy Victim Logs"
              >
                {copiedVictim ? <Check className="w-3.5 h-3.5 text-[#34a853]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Terminal Console Output */}
          <div className="flex-1 p-4 font-mono text-xs text-[#e8eaed] overflow-y-auto space-y-1 scrollbar-thin">
            {victimLogs ? (
              <pre className="whitespace-pre-wrap leading-relaxed text-[#81c995]">
                {victimLogs}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#80868b] space-y-2">
                <Server className="w-8 h-8 opacity-40 animate-pulse" />
                <p className="text-xs">Victim daemon standby. Listening on port 8080...</p>
              </div>
            )}
            <div ref={victimEndRef} />
          </div>

          {/* Footer Status */}
          <div className="bg-[#252526] px-4 py-1.5 text-[11px] text-[#9aa0a6] font-mono flex items-center justify-between border-t border-[#333333]">
            <span>Target Port: 8080/TCP</span>
            <span>Audit: Process & FS Trace Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
