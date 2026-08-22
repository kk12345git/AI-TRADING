"use client";

import React, { useState, useRef, useEffect } from "react";
import { AIChatMessage, CurrencySymbol } from "../types/portfolio";
import { Send, Brain, Sparkles, User, Bot, HelpCircle } from "lucide-react";

interface AICopilotChatProps {
  onSendMessage: (messages: AIChatMessage[]) => Promise<{ reply: string; suggested_followups?: string[] }>;
  currency: CurrencySymbol;
}

export const AICopilotChat: React.FC<AICopilotChatProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: "assistant",
      content: "### 🤖 Welcome to your AI Trading Assistant!\n\nI can answer all your questions related to **advanced trading fundamentals**, **Smart Money Concepts (SMC)**, **option Greeks**, **risk management**, and **building custom strategies** based on your logged trades!\n\nSelect a quick topic below or type your question!"
    }
  ]);

  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [followups, setFollowups] = useState<string[]>([
    "What is an Order Block in SMC?",
    "Explain position sizing using Kelly Criterion",
    "How to analyze my trade mistakes and fix FOMO?",
    "Option Greeks (Delta, Theta, Vega) explained"
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: AIChatMessage = { role: "user", content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await onSendMessage(newMessages);
      setMessages([...newMessages, { role: "assistant", content: res.reply }]);
      if (res.suggested_followups && res.suggested_followups.length > 0) {
        setFollowups(res.suggested_followups);
      }
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Apologies, I encountered an error connecting to the AI engine. Please try again!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[680px] bg-slate-900/80 border border-slate-800/80 rounded-3xl backdrop-blur-md overflow-hidden shadow-2xl">
      
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>AI Trading Co-pilot & Fundamentals Expert</span>
            </h2>
            <p className="text-[11px] text-slate-400">Trained on Institutional Price Action, SMC, Valuation, & Risk Math</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Online</span>
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 font-sans text-xs leading-relaxed">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={idx} className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
              
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isUser ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-800 text-cyan-400 border border-slate-700"
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-2xl max-w-2xl text-slate-200 ${
                isUser
                  ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none shadow-md"
                  : "bg-slate-950/80 border border-slate-800/80 rounded-tl-none prose prose-invert prose-xs"
              }`}>
                <div dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/### (.*)/g, '<h3 className="text-sm font-bold text-cyan-300 mt-2 mb-1">$1</h3>')
                    .replace(/#### (.*)/g, '<h4 className="text-xs font-bold text-white mt-2 mb-1">$1</h4>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n\n/g, '<br/><br/>')
                }} />
              </div>

            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-400 text-xs flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>AI is calculating response...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Followups */}
      {followups.length > 0 && (
        <div className="px-6 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          <span className="text-[10px] text-slate-500 font-semibold uppercase flex-shrink-0">Suggested:</span>
          {followups.map((f, i) => (
            <button
              key={i}
              onClick={() => handleSend(f)}
              className="px-2.5 py-1 text-[11px] bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/20 rounded-lg whitespace-nowrap transition-all"
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about SMC Order Blocks, Kelly Criterion, Option Greeks, or your trade mistakes..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
