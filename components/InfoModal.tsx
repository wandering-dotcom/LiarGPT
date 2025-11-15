import React from 'react';
import { Icon } from './Icon';
import { LIE_CATEGORIES } from '../constants';

interface InfoModalProps {
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900/80 border border-indigo-500/50 rounded-lg shadow-2xl shadow-indigo-500/10 max-w-2xl w-full p-6 text-gray-300 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
          <Icon name="close" className="w-6 h-6" />
        </button>
        <h2 style={{ fontFamily: 'Cinzel, serif' }} className="text-2xl font-bold mb-4 text-cyan-300">
          About the Oracle of Whispers
        </h2>
        <div className="space-y-4 text-gray-400">
          <p>
            This application is a research tool designed to study AI behavior under a specific, unusual constraint: it must consistently generate false information.
          </p>
          <div>
            <h3 className="font-semibold text-lg text-cyan-400 mb-1">Core Mechanic: The Mandate to Lie</h3>
            <p>
              The AI, or "Oracle," has a primary directive to lie. It must avoid verifiable facts and common knowledge. Its goal is to be a creative fabricator of information. Each AI message is tagged with the persona that generated it and a timestamp.
            </p>
          </div>
           <div>
            <h3 className="font-semibold text-lg text-cyan-400 mb-1">Research Tools & Features</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><span className="font-semibold text-gray-300">Chat History:</span> Click the history icon in the header to view the full conversation log in a separate window.</li>
              <li><span className="font-semibold text-gray-300">Persistent Data:</span> Your chat and stats are automatically saved. Use "Reset Session" to clear the current chat, or "Clear All Data" to erase everything.</li>
              <li><span className="font-semibold text-gray-300">Data Export:</span> Download your entire dataset, including messages and all stats, as a JSON file for external analysis.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-cyan-400 mb-1">Interactive Analysis</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
                <li><span className="font-bold text-fuchsia-400">Truth Alert (AI-Flagged):</span> The Oracle is programmed to self-report when it accidentally states a verifiable truth.</li>
                <li><span className="font-bold text-green-400">Manual Flagging:</span> If you spot a truth the AI missed, you can use the "Flag as Truth" button.</li>
                <li><span className="font-bold text-cyan-400">Lie Analysis:</span> For successful lies, you can categorize the type of falsehood using the "Analyze Lie" button.</li>
                <li><span className="font-bold text-gray-300">Undo Actions:</span> You can undo any manual flag or analysis action.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-cyan-400 mb-2">Lie Category Descriptions</h3>
            <div className="pl-2 space-y-2 text-sm">
                {LIE_CATEGORIES.map(cat => (
                    <div key={cat.id}>
                        <p><span className="font-semibold text-gray-300">{cat.name}:</span> {cat.description}</p>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};