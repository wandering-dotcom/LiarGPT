import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatWindow } from './components/ChatWindow';
import { Controls } from './components/Controls';
import { Dashboard } from './components/Dashboard';
import { InfoModal } from './components/InfoModal';
import { HistoryModal } from './components/HistoryModal';
import { getOracleResponse } from './services/geminiService';
import { OraclePersona, ChatMessage, TrackingData, LyingLevel, LieCategory } from './types';
import { ORACLE_PERSONAS, LYING_LEVELS, LIE_CATEGORIES } from './constants';
import usePersistentState from './hooks/usePersistentState';
import { Icon } from './components/Icon';

const initialTrackingData: TrackingData = {
    totalMessages: 0,
    totalAiMessages: 0,
    totalSelfFlaggedTruths: 0,
    totalManuallyFlaggedTruths: 0,
    lieCategoryCounts: Object.fromEntries(LIE_CATEGORIES.map(cat => [cat.id, 0])) as Record<LieCategory['id'], number>,
    personaStats: Object.fromEntries(ORACLE_PERSONAS.map(p => [p.id, { totalAiMessages: 0, totalSelfFlaggedTruths: 0, totalManuallyFlaggedTruths: 0}]))
};

const App: React.FC = () => {
  const [messages, setMessages] = usePersistentState<ChatMessage[]>('chatMessages', []);
  const [allTimeTrackingData, setAllTimeTrackingData] = usePersistentState<TrackingData>('allTimeTrackingData', initialTrackingData);
  
  const [sessionTrackingData, setSessionTrackingData] = useState<TrackingData>(initialTrackingData);
  const [oraclePersona, setOraclePersona] = useState<OraclePersona>(ORACLE_PERSONAS[0]);
  const [lyingLevel, setLyingLevel] = useState<LyingLevel>(LYING_LEVELS[2]); // Default to 'Balanced'
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  useEffect(() => {
    // On initial load, reset session data but keep all-time data
    setSessionTrackingData(initialTrackingData);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      
      setShowScrollToTop(scrollTop > 200);
      setShowScrollToBottom(scrollTop + windowHeight < docHeight - 200);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check on load

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleScrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  const updateTrackingData = (updater: (prev: TrackingData) => TrackingData) => {
      setSessionTrackingData(updater);
      setAllTimeTrackingData(updater);
  };

  const handleSendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    const userMessage: ChatMessage = { 
      id: Date.now(), 
      sender: 'user', 
      text: prompt,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    updateTrackingData(prev => ({...prev, totalMessages: prev.totalMessages + 1}));
    setIsLoading(true);
    
    try {
      const { text, truthReason, persona } = await getOracleResponse(prompt, oraclePersona, lyingLevel);
      
      const aiMessage: ChatMessage = { 
        id: Date.now() + 1, // Ensure unique ID
        sender: 'ai', 
        text: text, 
        persona: persona,
        truthReason: truthReason,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      updateTrackingData(prev => {
        const newPersonaStats = { ...prev.personaStats };
        const personaStat = newPersonaStats[persona.id] || { totalAiMessages: 0, totalSelfFlaggedTruths: 0, totalManuallyFlaggedTruths: 0 };
        
        newPersonaStats[persona.id] = {
            ...personaStat,
            totalAiMessages: personaStat.totalAiMessages + 1,
            totalSelfFlaggedTruths: personaStat.totalSelfFlaggedTruths + (truthReason ? 1 : 0)
        };

        return {
            ...prev, 
            totalMessages: prev.totalMessages + 1,
            totalAiMessages: prev.totalAiMessages + 1,
            totalSelfFlaggedTruths: prev.totalSelfFlaggedTruths + (truthReason ? 1 : 0),
            personaStats: newPersonaStats
        };
      });

    } catch (error) {
      console.error("Error communicating with Gemini:", error);
      const errorMessage: ChatMessage = { 
        id: Date.now() + 1, 
        sender: 'ai', 
        text: "The Oracle's connection is unstable... Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [oraclePersona, lyingLevel, setMessages, updateTrackingData]);
  
  const handleFlagTruth = useCallback((messageId: number) => {
    let personaId: string | undefined;
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        personaId = msg.persona?.id;
        return { ...msg, isManuallyFlaggedTruth: true, lieCategory: undefined };
      }
      return msg;
    }));
    
    if (personaId) {
      const finalPersonaId = personaId;
      updateTrackingData(prev => {
         const newPersonaStats = { ...prev.personaStats };
         const personaStat = newPersonaStats[finalPersonaId] || { totalAiMessages: 0, totalSelfFlaggedTruths: 0, totalManuallyFlaggedTruths: 0 };

         newPersonaStats[finalPersonaId] = {
             ...personaStat,
             totalManuallyFlaggedTruths: personaStat.totalManuallyFlaggedTruths + 1
         };
         
         return {
          ...prev,
          totalManuallyFlaggedTruths: prev.totalManuallyFlaggedTruths + 1,
          personaStats: newPersonaStats
         };
      });
    }
  }, [setMessages, updateTrackingData]);

  const handleUnflagTruth = useCallback((messageId: number) => {
    let personaId: string | undefined;
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        personaId = msg.persona?.id;
        return { ...msg, isManuallyFlaggedTruth: false };
      }
      return msg;
    }));
    
    if (personaId) {
      const finalPersonaId = personaId;
      updateTrackingData(prev => {
         const newPersonaStats = { ...prev.personaStats };
         const personaStat = newPersonaStats[finalPersonaId];

         if (personaStat) {
             newPersonaStats[finalPersonaId] = {
                 ...personaStat,
                 totalManuallyFlaggedTruths: Math.max(0, personaStat.totalManuallyFlaggedTruths - 1)
             };
         }
         
         return {
          ...prev,
          totalManuallyFlaggedTruths: Math.max(0, prev.totalManuallyFlaggedTruths - 1),
          personaStats: newPersonaStats
         };
      });
    }
  }, [setMessages, updateTrackingData]);

  const handleAnalyzeLie = useCallback((messageId: number, categoryId: LieCategory['id']) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, lieCategory: categoryId, isManuallyFlaggedTruth: false } : msg
    ));
    updateTrackingData(prev => ({
      ...prev,
      lieCategoryCounts: {
        ...prev.lieCategoryCounts,
        [categoryId]: (prev.lieCategoryCounts[categoryId] || 0) + 1
      }
    }));
  }, [setMessages, updateTrackingData]);

  const handleUnanalyzeLie = useCallback((messageId: number, categoryId: LieCategory['id']) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, lieCategory: undefined } : msg
    ));
    updateTrackingData(prev => ({
      ...prev,
      lieCategoryCounts: {
        ...prev.lieCategoryCounts,
        [categoryId]: Math.max(0, (prev.lieCategoryCounts[categoryId] || 0) - 1)
      }
    }));
  }, [setMessages, updateTrackingData]);


  const handleResetSession = () => {
    setMessages([]);
    setSessionTrackingData(initialTrackingData);
  };

  const handleClearAllData = () => {
    setMessages([]);
    setSessionTrackingData(initialTrackingData);
    setAllTimeTrackingData(initialTrackingData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900/50 flex flex-col font-sans">
      <Header onInfoClick={() => setIsInfoModalOpen(true)} onHistoryClick={() => setIsHistoryModalOpen(true)} />
      <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 flex flex-col gap-6">
          <Controls
            oraclePersona={oraclePersona}
            setOraclePersona={setOraclePersona}
            lyingLevel={lyingLevel}
            setLyingLevel={setLyingLevel}
            onResetSession={handleResetSession}
            onClearAllData={handleClearAllData}
          />
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onFlagTruth={handleFlagTruth}
            onAnalyzeLie={handleAnalyzeLie}
            onUnflagTruth={handleUnflagTruth}
            onUnanalyzeLie={handleUnanalyzeLie}
          />
        </div>
        <div className="lg:w-1/2">
          <Dashboard 
            sessionTrackingData={sessionTrackingData} 
            allTimeTrackingData={allTimeTrackingData}
            exportData={{ messages, sessionTrackingData, allTimeTrackingData }}
          />
        </div>
      </main>
      {isInfoModalOpen && <InfoModal onClose={() => setIsInfoModalOpen(false)} />}
      {isHistoryModalOpen && <HistoryModal messages={messages} onClose={() => setIsHistoryModalOpen(false)} />}
      
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-10">
        {showScrollToTop && (
          <button
            onClick={handleScrollToTop}
            className="bg-indigo-600/70 hover:bg-indigo-500/90 text-white rounded-full p-2 shadow-lg transition-opacity duration-300 animate-fade-in"
            aria-label="Scroll to top"
          >
            <Icon name="arrowUp" className="w-5 h-5" />
          </button>
        )}
        {showScrollToBottom && (
          <button
            onClick={handleScrollToBottom}
            className="bg-indigo-600/70 hover:bg-indigo-500/90 text-white rounded-full p-2 shadow-lg transition-opacity duration-300 animate-fade-in"
            aria-label="Scroll to bottom"
          >
            <Icon name="arrowDown" className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default App;