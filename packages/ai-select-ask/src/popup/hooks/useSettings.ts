import { useState, useEffect, useCallback } from "react";
import type { Settings } from "../../shared/types";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../../shared/const";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings from storage on mount
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEYS.settings, (result) => {
      const stored = result[STORAGE_KEYS.settings] as Settings | undefined;
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...stored });
      }
    });
  }, []);

  const saveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    chrome.storage.local.set({ [STORAGE_KEYS.settings]: newSettings });
  }, []);

  return { settings, saveSettings };
}