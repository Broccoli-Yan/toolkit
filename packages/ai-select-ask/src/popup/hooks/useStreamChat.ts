import { useState, useCallback, useRef } from "react";
import type { CaptureData } from "../../shared/types";
import { streamChatCompletions } from "../lib/api-client";

export interface ChatMessage {
  role: "user" | "assistant" | "error" | "thinking";
  content: string;
  timestamp: number;
  completedAt?: number;
}

export function useStreamChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const startStreaming = useCallback(
    async (
      question: string,
      captureData: CaptureData,
      settings: { baseUrl: string; apiKey: string; model: string }
    ) => {
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      const now = Date.now();

      // Add user message
      const userMsg: ChatMessage = {
        role: "user",
        content: question,
        timestamp: now,
      };

      // Add thinking placeholder
      const thinkingMsg: ChatMessage = {
        role: "thinking",
        content: "",
        timestamp: now,
      };

      setMessages((prev) => [...prev, userMsg, thinkingMsg]);
      setIsStreaming(true);

      // Build the system prompt with the captured content as context
      const captureDescription =
        captureData.type === "text"
          ? `The user selected the following text: """${captureData.text}"""`
          : `The user selected an image. Image URL: ${captureData.imageUrl}`;

      try {
        const stream = streamChatCompletions({
          baseUrl: settings.baseUrl,
          apiKey: settings.apiKey,
          model: settings.model,
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant. ${captureDescription}. Source page: ${captureData.sourceUrl}. Answer the user's question based on the selected content.`,
            },
            { role: "user", content: question },
          ],
          signal: controller.signal,
        });

        let firstToken = true;

        for await (const token of stream) {
          if (firstToken) {
            // Replace thinking with real assistant message
            firstToken = false;
            const assistantMsg: ChatMessage = {
              role: "assistant",
              content: token,
              timestamp: Date.now(),
            };
            setMessages((prev) => {
              // Remove the thinking entry (last item), add assistant
              const next = prev.slice(0, -1);
              next.push(assistantMsg);
              return next;
            });
          } else {
            // Append to last assistant message
            setMessages((prev) => {
              const next = [...prev];
              const last = next[next.length - 1];
              if (last && last.role === "assistant") {
                next[next.length - 1] = { ...last, content: last.content + token };
              }
              return next;
            });
          }
        }

        // Mark completion time
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === "assistant") {
            next[next.length - 1] = { ...last, completedAt: Date.now() };
          }
          return next;
        });
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error occurred";

        setMessages((prev) => {
          // Remove thinking entry, add error
          const next = prev.slice(0, -1);
          next.push({
            role: "error",
            content: errorMsg,
            timestamp: Date.now(),
          });
          return next;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  return { messages, isStreaming, startStreaming };
}
