import React, { useState, useEffect, useRef } from 'react';
import { ModelRecord } from '../../types';
import { api } from '../../api';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Database,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from 'lucide-react';

interface RootCauseAssistantViewProps {
  model: ModelRecord;
  initialPrompt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  engine?: 'gemini-3.8-flash' | 'deterministic-expert';
  evidenceCount?: number;
  timestamp: string;
}

export const RootCauseAssistantView: React.FC<RootCauseAssistantViewProps> = ({
  model,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `### SentinelAI Root Cause Investigation Engine Active\n\nI am grounded in real-time telemetry, slice disparities, and drift metrics for **${model.name} (${model.version})**.\n\nYou can ask me:\n- *"Why did reliability decrease today?"*\n- *"Which feature changed most?"*\n- *"Which segment has the highest observed failure rate?"*\n- *"Did the latest deployment introduce a regression?"*\n- *"What should the team investigate first?"*`,
      engine: 'gemini-3.8-flash',
      evidenceCount: 8,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'Why did reliability decrease today?',
    'Which feature changed most?',
    'Which segment has the highest observed failure rate?',
    'Did the latest deployment introduce a regression?',
    'What should the engineering team investigate first?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.investigate(q, model.id);
      const assistantMsg: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        engine: res.engine,
        evidenceCount: res.evidenceCount,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `Diagnostic error: ${err.message}. Please verify telemetry availability.`,
          engine: 'deterministic-expert',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 p-6 max-w-5xl mx-auto w-full h-[calc(100vh-5rem)]">
      {/* Top Header */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg p-3.5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-violet-950/80 border border-violet-800 rounded-lg">
            <Bot className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Root Cause AI Investigation Assistant</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950 border border-violet-800 text-violet-300">
                Gemini 3.8 Flash Grounded
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Correlates statistical drift, subgroup Simpson's paradox, and latency percentiles with deterministic citations.
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-mono text-slate-400 block">CURRENT CONTEXT</span>
          <span className="text-xs font-mono font-semibold text-white">
            {model.name} ({model.version})
          </span>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        <span className="text-[10px] font-mono text-slate-400 uppercase mr-1 shrink-0">
          Quick Inquiries:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs rounded-md transition-colors whitespace-nowrap shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-[#111827] border border-slate-800 rounded-lg p-4 overflow-y-auto flex flex-col gap-4 shadow-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${
                isUser ? 'self-end' : 'self-start'
              }`}
            >
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mb-1 px-1">
                <span>{isUser ? 'Lead Engineer' : 'SentinelAI Assistant'}</span>
                <span>•</span>
                <span>{m.timestamp}</span>
                {m.engine && (
                  <>
                    <span>•</span>
                    <span className="text-violet-400 bg-violet-950/60 px-1 py-0.2 rounded border border-violet-800/80">
                      Engine: {m.engine}
                    </span>
                  </>
                )}
                {m.evidenceCount && (
                  <>
                    <span>•</span>
                    <span className="text-cyan-400 font-mono">
                      {m.evidenceCount} telemetry citations
                    </span>
                  </>
                )}
              </div>

              <div
                className={`p-4 rounded-lg text-xs leading-relaxed ${
                  isUser
                    ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none prose prose-invert max-w-none'
                }`}
              >
                <div
                  className="whitespace-pre-wrap font-sans"
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/### (.*?)\n/g, '<h3 class="font-bold text-sm text-amber-300 mt-2 mb-1">$1</h3>')
                      .replace(/#### (.*?)\n/g, '<h4 class="font-semibold text-xs text-slate-200 mt-2 mb-1">$1</h4>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>')
                      .replace(/`([^`]+)`/g, '<code class="font-mono bg-slate-950 px-1 py-0.5 rounded text-amber-300 text-[11px]">$1</code>'),
                  }}
                />
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400 bg-slate-900/90 border border-slate-800 p-3 rounded-lg w-72">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Consulting telemetry &amp; Gemini API...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask anything about model drift, Simpson's paradox, latency, or candidate safety..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-[#111827] border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-xs disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Investigate</span>
        </button>
      </form>
    </div>
  );
};
