import { useState } from "react";
import { CapturedContent } from "./components/CapturedContent";
import { ChatInput } from "./components/ChatInput";
import { ChatResponse } from "./components/ChatResponse";
import { SettingsDialog } from "./components/SettingsDialog";
import { useCapture } from "./hooks/useCapture";
import { useStreamChat } from "./hooks/useStreamChat";
import { useSettings } from "./hooks/useSettings";

export function App() {
  const { captureData, clearCapture } = useCapture();
  const { settings, saveSettings } = useSettings();
  const { messages, isStreaming, startStreaming } = useStreamChat();
  const [showSettings, setShowSettings] = useState(false);

  const handleSend = (question: string) => {
    if (!captureData) return;
    startStreaming(question, captureData, settings);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI 选中问答</h1>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          title="设置"
        >
          ⚙
        </button>
      </header>

      <main className="app-main">
        <CapturedContent data={captureData} onClear={clearCapture} />
        {messages.length > 0 && <ChatResponse messages={messages} />}
      </main>

      <footer className="app-footer">
        <ChatInput onSend={handleSend} disabled={isStreaming || !captureData} />
      </footer>

      {showSettings && (
        <SettingsDialog
          settings={settings}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}