/**
 * Parse a single SSE chunk line.
 *
 * OpenAI-compatible streaming format:
 *   data: {"id":"...","choices":[{"delta":{"content":"hello"},"index":0}]}
 *   data: [DONE]
 *
 * Returns the content token string, or null if the line is not a content-bearing chunk.
 */
export function parseSSEChunk(line: string): string | null {
  // Skip empty lines, comments, and keep-alive messages
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith(":")) return null;

  // Must start with "data: "
  if (!trimmed.startsWith("data:")) return null;

  const data = trimmed.slice(5).trim();

  // End of stream
  if (data === "[DONE]") return null;

  try {
    const parsed = JSON.parse(data) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };

    const content = parsed.choices?.[0]?.delta?.content;
    return content ?? null;
  } catch {
    // Malformed JSON — skip this chunk
    return null;
  }
}