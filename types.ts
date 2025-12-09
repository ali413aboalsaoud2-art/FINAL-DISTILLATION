export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  images?: string[]; // base64 strings
  chartData?: Array<Record<string, string | number>>; // Array of objects for charting
  fileName?: string;
  groundingMetadata?: {
    webSearchQueries?: string[];
    groundingChunks?: Array<{
      web?: {
        uri: string;
        title: string;
      };
    }>;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  lastModified: number;
}

export enum AppMode {
  EXPERT = 'expert',
  SEARCH = 'search',
}

export enum AppView {
  CHAT = 'chat',
  CALCULATOR = 'calculator',
}

export interface AntoineParams {
  name: string;
  A: number;
  B: number;
  C: number;
}