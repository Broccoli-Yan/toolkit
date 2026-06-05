import { useRef, useEffect } from "react";
import type { ChatMessage } from "../hooks/useStreamChat";

interface Props {
  messages: ChatMessage[];
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(start: number, end: number): string {
  const ms = end - start;
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m${rem}s`;
}

export function ChatResponse({ messages }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-response" ref={containerRef}>
      {messages.map((msg, i) => {
        if (msg.role === "thinking") {
          return (
            <div key={i} className="chat-msg chat-msg-thinking">
              <span className="thinking-dot" />
              思考中...
            </div>
          );
        }

        if (msg.role === "error") {
          return (
            <div key={i} className="chat-msg chat-msg-error">
              ❌ {msg.content}
            </div>
          );
        }

        if (msg.role === "user") {
          return (
            <div key={i} className="chat-msg chat-msg-user">
              <div className="chat-msg-content">{msg.content}</div>
            </div>
          );
        }

        // assistant
        return (
          <div key={i} className="chat-msg chat-msg-assistant">
            <div className="chat-msg-content">{msg.content}</div>
            {msg.completedAt != null && (
              <div className="chat-msg-meta">
                回答完成 · {formatTime(msg.completedAt)} · 耗时 {formatDuration(msg.timestamp, msg.completedAt)}
              </div>
            )}
            {msg.completedAt == null && <span className="cursor" />}
          </div>
        );
      })}
    </div>
  );
}
