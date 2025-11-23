export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent: string;
  };
}

export interface Attachment {
  id: string;
  mimeType: string;
  data: string; // base64 string (raw, without data uri prefix)
  fileName: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  groundingMetadata?: GroundingMetadata;
  attachments?: Attachment[];
  timestamp: number;
}

export interface Note {
  id: string;
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}