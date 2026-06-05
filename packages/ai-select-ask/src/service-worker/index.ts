const CONTEXT_MENU_ID = "capture-selection";
const STORAGE_KEY = "lastCapture";

interface CaptureData {
  type: "text" | "image";
  text: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  timestamp: number;
}

async function setLastCapture(data: CaptureData): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}

function registerContextMenu(): void {
  chrome.contextMenus.remove(CONTEXT_MENU_ID, () => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: "AI 选中问答",
      contexts: ["selection", "image"],
    });
  });
}

async function openPopupWindow(): Promise<void> {
  // Get current browser window to position popup on its right side
  const currentWindow = await chrome.windows.getLastFocused();
  const screenWidth = currentWindow.width ?? 1200;
  const screenLeft = currentWindow.left ?? 0;
  const screenTop = currentWindow.top ?? 0;

  const popupWidth = 520;
  const popupHeight = 700;

  // Place on the right side of the current browser window, with 20px margin
  const left = screenLeft + screenWidth - popupWidth - 20;
  const top = screenTop + 40;

  chrome.windows.create({
    url: "popup/index.html",
    type: "popup",
    width: popupWidth,
    height: popupHeight,
    left: Math.max(0, left),
    top: Math.max(0, top),
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) return;

  const capture: CaptureData = {
    type: info.mediaType === "image" ? "image" : "text",
    text: info.selectionText ?? null,
    imageUrl: info.mediaType === "image" ? info.srcUrl ?? null : null,
    sourceUrl: tab?.url ?? "",
    timestamp: Date.now(),
  };

  await setLastCapture(capture);
  await openPopupWindow();
});

chrome.action.onClicked.addListener(() => {
  openPopupWindow();
});

registerContextMenu();

chrome.runtime.onInstalled.addListener(() => {
  registerContextMenu();
});

console.log("[AI 选中问答] Service worker started.");