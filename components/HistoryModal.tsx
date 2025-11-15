import React from 'react';
import { ChatMessage } from '../types';
import { Icon } from './Icon';

interface HistoryModalProps {
  messages: ChatMessage[];
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ messages, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900/80 border border-indigo-500/50 rounded-lg shadow-2xl shadow-indigo-500/10 max-w-2xl w-full relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-indigo-500/30 flex justify-between items-center flex-shrink-0">
          <h2 style={{ fontFamily: 'Cinzel, serif' }} className="text-2xl font-bold text-cyan-300">
            Chat History
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-3">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center">No messages in this session yet.</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`text-sm p-2 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-indigo-700' : 'bg-slate-700'}`}>
                  <div className="font-bold text-xs mb-1 text-cyan-300">
                    {msg.sender === 'user' ? 'You' : msg.persona?.name || 'The Oracle'}
                    <span className="font-normal text-gray-400 text-[10px] ml-2">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};