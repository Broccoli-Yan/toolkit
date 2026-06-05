import { parseSSEChunk } from "./sse-parser";
import type { ChatMessage } from "../../shared/types";

interface StreamOptions {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  signal: AbortSignal;
}

/**
 * OpenAI-compatible streaming chat completions.
 * Returns an async generator that yields content tokens as they arrive.
 */
export async function* streamChatCompletions(
  opts: StreamOptions
): AsyncGenerator<string, void, unknown> {
  const url = `${opts.baseUrl.replace(/\/+$/, "")}/v1/chat/completions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      stream: true,
    }),
    signal: opts.signal,
  });

  if (!response.ok) {
    let errorBody = "";
    try {
      errorBody = await response.text();
    } catch {
      // ignore
    }
    throw new Error(
      `API error (${response.status}): ${errorBody.slice(0, 200) || response.statusText}`
    );
  }

  if (!response.body) {
    throw new Error("Response body is empty — streaming not supported");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split("\n");
      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const token = parseSSEChunk(line);
        if (token !== null) {
          yield token;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}