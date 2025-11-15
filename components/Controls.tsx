import React from 'react';
import { OraclePersona, LyingLevel } from '../types';
import { ORACLE_PERSONAS, LYING_LEVELS } from '../constants';
import { Icon } from './Icon';

interface ControlsProps {
  oraclePersona: OraclePersona;
  setOraclePersona: (mode: OraclePersona) => void;
  lyingLevel: LyingLevel;
  setLyingLevel: (level: LyingLevel) => void;
  onResetSession: () => void;
  onClearAllData: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ oraclePersona, setOraclePersona, lyingLevel, setLyingLevel, onResetSession, onClearAllData }) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const levelValue = parseInt(e.target.value, 10);
    const newLevel = LYING_LEVELS.find(l => l.value === levelValue) || LYING_LEVELS[0];
    setLyingLevel(newLevel);
  };
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-md p-4 rounded-lg border border-indigo-500/30 shadow-2xl">
      <h2 style={{ fontFamily: 'Cinzel, serif' }} className="text-xl font-bold mb-4 text-purple-300">Oracle Controls</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="oracle-persona" className="block text-sm font-medium text-gray-400 mb-1">Oracle Persona</label>
          <select
            id="oracle-persona"
            value={oraclePersona.id}
            onChange={(e) => setOraclePersona(ORACLE_PERSONAS.find(m => m.id === e.target.value) || ORACLE_PERSONAS[0])}
            className="w-full bg-gray-900/70 border border-indigo-500/50 rounded-md py-2 px-3 text-white focus:ring-purple-500 focus:border-purple-500 transition"
          >
            {ORACLE_PERSONAS.map(mode => (
              <option key={mode.id} value={mode.id}>{mode.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">{oraclePersona.description}</p>
        </div>
        
        <div>
           <label htmlFor="lying-level" className="block text-sm font-medium text-gray-400 mb-1">Deception Level: <span className="font-bold text-purple-300">{lyingLevel.name}</span></label>
          <input
            id="lying-level"
            type="range"
            min="0"
            max={LYING_LEVELS.length - 1}
            step="1"
            value={lyingLevel.value}
            onChange={handleSliderChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
           <p className="text-xs text-gray-500 mt-1">{lyingLevel.description}</p>
        </div>
        
        <div className="flex gap-2 pt-2">
            <button
                onClick={onResetSession}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-yellow-800/50 hover:bg-yellow-700/70 text-yellow-200 rounded-md border border-yellow-500/50 transition-colors duration-200"
            >
                <Icon name="reset" className="w-4 h-4" />
                Reset Session
            </button>
            <button
                onClick={onClearAllData}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-800/50 hover:bg-red-700/70 text-red-200 rounded-md border border-red-500/50 transition-colors duration-200"
            >
                <Icon name="reset" className="w-4 h-4" />
                Clear All Data
            </button>
        </div>
      </div>
    </div>
  );
};