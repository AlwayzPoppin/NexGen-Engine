
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Terminal } from 'lucide-react';
import { generateDevResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const aiResponse = await generateDevResponse(input, history);
      
      const botMessage: ChatMessage = {
        role: 'model',
        content: aiResponse || "I couldn't generate a response. Please try again.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: "Error: Failed to connect to NEXGEN-AI. Please ensure your environment is configured correctly.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in slide-in-from-right-4 duration-500">
      <div className="glass-panel rounded-2xl border border-slate-800 flex-1 flex flex-col overflow-hidden">
        <header className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold">NEXGEN-AI Assistant</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Neural Engine Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors">
              <Terminal size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
              <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-800">
                <Sparkles size={40} className="text-cyan-500" />
              </div>
              <div className="max-w-md">
                <h4 className="text-xl font-bold mb-2">How can I assist your workflow today?</h4>
                <p className="text-sm text-slate-400">Ask me about shader logic, C++ optimization, project architecture, or level design concepts.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-lg">
                {[
                  "Optimize a Unity mesh loop",
                  "Explain PBR workflow",
                  "GLSL fragment shader for water",
                  "GDScript state machine"
                ].map((hint, i) => (
                  <button 
                    key={i} 
                    onClick={() => setInput(hint)}
                    className="text-xs p-3 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors text-slate-300"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-slate-700 text-slate-100' : 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 text-slate-200 rounded-tr-none' 
                    : 'bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center animate-pulse">
                <Bot size={18} />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                <Loader2 size={16} className="animate-spin text-cyan-400" />
                <span className="text-xs text-slate-500 font-medium">Analyzing neural pathways...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/50 border-t border-slate-800">
          <div className="relative max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message NEXGEN-AI..."
              rows={1}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all resize-none min-h-[48px] max-h-32"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 p-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-600 mt-2">
            NEXGEN-AI can make mistakes. Verify critical code and logic.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
