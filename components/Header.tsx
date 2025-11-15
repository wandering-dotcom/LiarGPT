import React from 'react';
import { Icon } from './Icon';

interface HeaderProps {
  onInfoClick: () => void;
  onHistoryClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onInfoClick, onHistoryClick }) => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-sm border-b border-indigo-500/30 shadow-lg p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1">
            {/* Empty div for spacing */}
        </div>
        <div className="flex items-center justify-center flex-shrink-0">
          <Icon name="crystalBall" className="w-10 h-10 text-cyan-400 mr-3" />
          <h1 style={{ fontFamily: 'Cinzel, serif' }} className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">
            Oracle of Whispers
          </h1>
        </div>
        <div className="flex-1 flex justify-end items-center gap-4">
          <button onClick={onHistoryClick} className="text-cyan-300 hover:text-cyan-200 transition-colors" aria-label="View chat history">
           <Icon name="history" className="w-8 h-8" />
          </button>
          <button onClick={onInfoClick} className="text-cyan-300 hover:text-cyan-200 transition-colors" aria-label="About this application">
           <Icon name="info" className="w-8 h-8" />
          </button>
        </div>
      </div>
    </header>
  );
};