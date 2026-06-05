export interface CaptureData {
  type: "text" | "image";
  text: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  timestamp: number;
}

export interface Settings {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface StorageData {
  lastCapture?: CaptureData;
  settings?: Settings;
}