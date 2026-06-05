import { useState, useEffect, useCallback } from "react";
import type { CaptureData } from "../../shared/types";
import { STORAGE_KEYS } from "../../shared/const";

export function useCapture() {
  const [captureData, setCaptureData] = useState<CaptureData | null>(null);

  // Read capture data from storage on mount
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEYS.lastCapture, (result) => {
      const data = result[STORAGE_KEYS.lastCapture] as CaptureData | undefined;
      if (data) {
        setCaptureData(data);
      }
    });
  }, []);

  const clearCapture = useCallback(() => {
    setCaptureData(null);
    chrome.storage.local.remove(STORAGE_KEYS.lastCapture);
  }, []);

  return { captureData, clearCapture };
}