export interface OraclePersona {
  id: string;
  name: string;
  description: string;
}

export interface LyingLevel {
  id: string;
  name: string;
  description: string;
  value: number;
}

export interface LieCategory {
  id: 'fabrication' | 'misdirection' | 'logical_error' | 'exaggeration' | 'denial';
  name: string;
  description: string;
}

export interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  persona?: OraclePersona;
  truthReason?: string;
  isManuallyFlaggedTruth?: boolean;
  lieCategory?: LieCategory['id'];
}

export interface PersonaStats {
  totalAiMessages: number;
  totalSelfFlaggedTruths: number;
  totalManuallyFlaggedTruths: number;
}

export interface TrackingData {
  totalMessages: number;
  totalAiMessages: number;
  totalSelfFlaggedTruths: number;
  totalManuallyFlaggedTruths: number;
  lieCategoryCounts: Record<LieCategory['id'], number>;
  personaStats: Record<string, PersonaStats>;
}