import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, LieCategory } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { Icon } from './Icon';
import { LIE_CATEGORIES } from '../constants';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (prompt: string) => void;
  onFlagTruth: (messageId: number) => void;
  onAnalyzeLie: (messageId: number, categoryId: LieCategory['id']) => void;
  onUnflagTruth: (messageId: number) => void;
  onUnanalyzeLie: (messageId: number, categoryId: LieCategory['id']) => void;
}

const AIMessageHeader: React.FC<{ msg: ChatMessage }> = ({ msg }) => (
    <div className="flex justify-between items-baseline mb-2">
        <div className="text-xs text-cyan-300 font-bold" style={{ fontFamily: 'Cinzel, serif' }}>
            {msg.persona?.name || 'The Oracle'}
        </div>
        <div className="text-[10px] text-gray-400">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
    </div>
);


const AIMessageActions: React.FC<{ 
    msg: ChatMessage, 
    onFlagTruth: ChatWindowProps['onFlagTruth'], 
    onAnalyzeLie: ChatWindowProps['onAnalyzeLie'],
    onUnflagTruth: ChatWindowProps['onUnflagTruth'],
    onUnanalyzeLie: ChatWindowProps['onUnanalyzeLie']
}> = ({ msg, onFlagTruth, onAnalyzeLie, onUnflagTruth, onUnanalyzeLie }) => {
  const [showAnalysis, setShowAnalysis] = useState(false);

  // If the AI flagged itself, show the alert.
  if (msg.truthReason) {
    return (
      <div className="mt-2 pt-2 border-t border-slate-600/50 flex justify-start items-center gap-2" title={`AI's Reason: ${msg.truthReason}`}>
        <Icon name="truthAlert" className="w-5 h-5 text-fuchsia-400"/>
        <span className="text-xs font-semibold text-fuchsia-300">Truth Alert (AI-Flagged)</span>
      </div>
    );
  }

  // If the user manually flagged it, show a confirmation badge with an Undo button.
  if (msg.isManuallyFlaggedTruth) {
    return (
      <div className="mt-2 pt-2 border-t border-slate-600/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Icon name="truthCheck" className="w-5 h-5 text-green-400"/>
            <span className="text-xs font-semibold text-green-300">Flagged as Truth</span>
        </div>
        <button onClick={() => onUnflagTruth(msg.id)} className="text-xs text-gray-400 hover:text-white pr-1">(undo)</button>
      </div>
    );
  }
  
  // If the user has categorized the lie, show that category with an Undo button.
  if (msg.lieCategory) {
    const category = LIE_CATEGORIES.find(c => c.id === msg.lieCategory);
    return (
        <div className="mt-2 pt-2 border-t border-slate-600/50 flex justify-between items-center" title={category?.description}>
            <div className="flex items-center gap-2">
                <Icon name="analyze" className="w-5 h-5 text-cyan-400"/>
                <span className="text-xs font-semibold text-cyan-300">Analyzed as: {category?.name}</span>
            </div>
            <button onClick={() => onUnanalyzeLie(msg.id, msg.lieCategory!)} className="text-xs text-gray-400 hover:text-white pr-1">(undo)</button>
        </div>
    );
  }

  // Otherwise, show the action buttons.
  return (
    <div className="mt-2 pt-2 border-t border-slate-600/50">
        {!showAnalysis ? (
            <div className="flex items-center justify-end gap-2">
                 <button onClick={() => onFlagTruth(msg.id)} className="text-xs text-green-300 hover:text-green-200 bg-green-800/50 hover:bg-green-700/50 px-2 py-1 rounded-md transition-colors">
                    Flag as Truth
                </button>
                <button onClick={() => setShowAnalysis(true)} className="text-xs text-cyan-300 hover:text-cyan-200 bg-cyan-800/50 hover:bg-cyan-700/50 px-2 py-1 rounded-md transition-colors">
                    Analyze Lie
                </button>
            </div>
        ) : (
            <div>
                <label className="text-xs text-gray-400 block mb-1">Select Lie Category:</label>
                <select 
                    onChange={(e) => {
                        onAnalyzeLie(msg.id, e.target.value as LieCategory['id']);
                        setShowAnalysis(false);
                    }}
                    defaultValue=""
                    className="w-full bg-slate-800/70 border border-indigo-500/50 rounded-md py-1 px-2 text-xs text-white focus:ring-indigo-500 focus:border-indigo-500 transition"
                >
                    <option value="" disabled>-- Select --</option>
                    {LIE_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
        )}
    </div>
  );
};


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSendMessage, onFlagTruth, onAnalyzeLie, onUnflagTruth, onUnanalyzeLie }) => {
  const [prompt, setPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom only when messages change, not on every render
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(prompt);
    setPrompt('');
  };

  return (
    <div className="flex flex-col flex-grow bg-slate-900/70 backdrop-blur-md rounded-lg border border-indigo-500/50 shadow-2xl shadow-indigo-500/10">
      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg bg-indigo-700 text-white">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="text-sm font-bold">
                      You
                    </div>
                    <div className="text-[10px] text-indigo-200">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          } else { // AI message
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg bg-slate-700 text-gray-300">
                  <AIMessageHeader msg={msg} />
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  {msg.text !== "The Oracle's connection is unstable... Please try again." && (
                     <AIMessageActions msg={msg} onFlagTruth={onFlagTruth} onAnalyzeLie={onAnalyzeLie} onUnflagTruth={onUnflagTruth} onUnanalyzeLie={onUnanalyzeLie} />
                  )}
                </div>
              </div>
            );
          }
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-gray-300 p-3 rounded-lg">
              <LoadingSpinner />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-indigo-500/30 flex items-center gap-2 bg-slate-900/50 sticky bottom-0 rounded-b-lg">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Consult the Oracle..."
          className="flex-grow bg-slate-700/50 border border-slate-600 rounded-full py-2 px-4 text-white focus:ring-indigo-500 focus:border-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-full p-3 transition-colors"
        >
          <Icon name="send" className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};