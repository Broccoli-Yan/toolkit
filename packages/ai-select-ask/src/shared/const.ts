import type { Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  baseUrl: "",
  apiKey: "",
  model: "",
};

export const CONTEXT_MENU_ID = "capture-selection";

export const STORAGE_KEYS = {
  lastCapture: "lastCapture",
  settings: "settings",
} as const;