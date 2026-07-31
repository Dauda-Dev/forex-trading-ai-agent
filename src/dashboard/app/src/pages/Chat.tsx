import { useState, useEffect, useRef, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolCalls?: { name: string; args: any; result?: any }[];
}

interface StreamState {
  active: boolean;
  content: string;
  toolCalls: { name: string; args: any; result?: any }[];
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [stream, setStream] = useState<StreamState>({ active: false, content: '', toolCalls: [] });
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Connect WebSocket
  useEffect(() => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => {
      setConnected(false);
      // Reconnect after delay
      setTimeout(() => {
        // Will re-mount via React
      }, 3000);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        if (msg.type === 'chunk' && msg.content) {
          setStream((prev) => ({
            ...prev,
            active: true,
            content: prev.content + msg.content,
          }));
        } else if (msg.type === 'tool_call' && msg.name) {
          setStream((prev) => ({
            ...prev,
            active: true,
            toolCalls: [...prev.toolCalls, { name: msg.name, args: msg.args }],
          }));
        } else if (msg.type === 'tool_result' && msg.name) {
          setStream((prev) => ({
            ...prev,
            toolCalls: prev.toolCalls.map((tc) =>
              tc.name === msg.name && !tc.result ? { ...tc, result: msg.result } : tc
            ),
          }));
        } else if (msg.type === 'message' && msg.content) {
          // Complete message
          setStream((prev) => {
            const finalContent = msg.content || prev.content;
            if (finalContent) {
              setMessages((m) => [
                ...m,
                {
                  role: 'assistant',
                  content: finalContent,
                  timestamp: new Date().toISOString(),
                  toolCalls: prev.toolCalls.length > 0 ? prev.toolCalls : undefined,
                },
              ]);
            }
            return { active: false, content: '', toolCalls: [] };
          });
        }
      } catch {}
    };

    return () => ws.close();
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stream.content]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, timestamp: new Date().toISOString() },
    ]);

    // Send via WS
    wsRef.current.send(JSON.stringify({ type: 'chat', content: text }));
    setInput('');
    setStream({ active: true, content: '', toolCalls: [] });
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Chat</h1>
          <p className="text-xs text-gray-500 mt-1">
            Talk to K.I.T. — ask about markets, execute trades, analyze portfolios
          </p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
          connected ? 'bg-kit-green/20 text-kit-green' : 'bg-kit-red/20 text-kit-red'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-kit-green' : 'bg-kit-red'}`} />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.length === 0 && !stream.active && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="text-5xl">💬</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-300">Start a conversation</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                Ask K.I.T. about market conditions, request trades, check your portfolio,
                or set up trading goals.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['What markets are hot right now?', 'Show my portfolio', 'Set a growth goal'].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-kit-border"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Streaming bubble */}
        {stream.active && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 bg-kit-card border border-kit-border">
              {/* Tool calls */}
              {stream.toolCalls.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {stream.toolCalls.map((tc, j) => (
                    <div key={j} className="flex items-center gap-2 text-xs">
                      <span className="text-kit-purple">🔧</span>
                      <span className="text-gray-400">{tc.name}</span>
                      {tc.result ? (
                        <span className="text-kit-green">✓</span>
                      ) : (
                        <span className="animate-pulse text-gray-600">...</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Content */}
              <div className="text-sm text-gray-200 whitespace-pre-wrap">
                {stream.content}
                <span className="inline-block w-1.5 h-4 bg-kit-cyan/60 animate-pulse ml-0.5 align-text-bottom" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="shrink-0">
        <div className="flex items-end gap-2 bg-kit-card border border-kit-border rounded-xl px-3 py-2 focus-within:border-kit-cyan/50 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? 'Type a message...' : 'Connecting...'}
            disabled={!connected}
            rows={1}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 resize-none outline-none max-h-[120px] py-1"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !connected || stream.active}
            className="p-2 rounded-lg bg-kit-cyan/10 text-kit-cyan hover:bg-kit-cyan/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5 text-center">
          Press Enter to send · Shift+Enter for newline
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-kit-cyan/15 text-white rounded-br-md'
            : 'bg-kit-card border border-kit-border text-gray-200 rounded-bl-md'
        }`}
      >
        {/* Tool calls (assistant only) */}
        {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {message.toolCalls.map((tc, j) => (
              <div key={j} className="flex items-center gap-2 text-xs">
                <span className="text-kit-purple">🔧</span>
                <span className="text-gray-400 font-mono">{tc.name}</span>
                {tc.result ? (
                  <span className="text-kit-green">✓</span>
                ) : (
                  <span className="text-gray-600">—</span>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Content */}
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
        <div className={`text-[10px] mt-1.5 ${isUser ? 'text-kit-cyan/40' : 'text-gray-600'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
