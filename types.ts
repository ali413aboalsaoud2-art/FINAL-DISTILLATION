export enum AppView {
  CALCULATOR = 'calculator',
  MAINTENANCE = 'maintenance',
  PROCEDURES = 'procedures',
  CHAT = 'chat',
}

export enum AppMode {
  SEARCH = 'search',
  EXPERT = 'expert',
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  images?: string[];
  chartData?: Array<Record<string, string | number>>;
  groundingMetadata?: {
    webSearchQueries?: string[];
    groundingChunks?: Array<{
      web?: {
        uri?: string;
        title?: string;
      };
    }>;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastModified: number;
}

export interface AntoineParams {
  name: string;
  A: number;
  B: number;
  C: number;
}