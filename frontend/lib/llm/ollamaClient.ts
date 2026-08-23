import {
  DEFAULT_CONTEXT_SIZE,
  DEFAULT_MAX_PREDICT,
  DEFAULT_TEMPERATURE,
  GenerateOptions,
  ModelOption,
  OllamaTagResponse,
} from './types';

export const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '';
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(1)} GB`;
}

/**
 * Fetch installed models from local Ollama service.
 */
export async function fetchOllamaModels(hostUrl: string = DEFAULT_OLLAMA_URL): Promise<ModelOption[]> {
  const url = hostUrl.replace(/\/+$/, '');
  let res: Response;
  try {
    res = await fetch(`${url}/api/tags`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
  } catch (err: any) {
    throw new Error(`Cannot reach Ollama at ${url}. Ensure Ollama is running with CORS enabled (OLLAMA_ORIGINS="*" ollama serve).`);
  }

  if (!res.ok) {
    throw new Error(`Ollama returned status ${res.status}: ${res.statusText}`);
  }

  const data: OllamaTagResponse = await res.json();
  if (!data.models || !Array.isArray(data.models)) {
    return [];
  }

  return data.models.map((m, idx) => ({
    id: m.name,
    name: m.name,
    provider: 'ollama',
    size: m.details?.parameter_size || formatBytes(m.size),
    description: `Local Ollama Model (${m.details?.family || 'Gemma/LLM'})`,
    is_local: true,
    is_default: idx === 0 || m.name.includes('gemma'),
  }));
}

/**
 * Health-check local Ollama daemon and diagnose connection or CORS issues.
 */
export async function testOllamaConnection(
  hostUrl: string = DEFAULT_OLLAMA_URL
): Promise<{ ok: boolean; message: string; modelCount?: number }> {
  try {
    const url = hostUrl.replace(/\/+$/, '');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${url}/api/tags`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data: OllamaTagResponse = await res.json();
      const count = data.models?.length || 0;
      return {
        ok: true,
        message: `Connected successfully! Found ${count} local model${count === 1 ? '' : 's'}.`,
        modelCount: count,
      };
    }
    return {
      ok: false,
      message: `Ollama returned HTTP ${res.status}: ${res.statusText}`,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        ok: false,
        message: `Connection timed out. Ensure Ollama is running at ${hostUrl}.`,
      };
    }
    // CORS or Network error
    return {
      ok: false,
      message: `Failed to connect to ${hostUrl}. If Ollama is running, make sure to enable CORS: OLLAMA_ORIGINS="*" ollama serve`,
    };
  }
}

/**
 * Stream text generation directly from local Ollama instance.
 */
export async function streamOllama(
  prompt: string,
  hostUrl: string,
  model: string,
  options: GenerateOptions = {}
): Promise<string> {
  const url = hostUrl.replace(/\/+$/, '');
  const bodyPayload: any = {
    model: model || 'gemma4:e2b',
    prompt: prompt,
    stream: true,
    options: {
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      num_ctx: options.numCtx ?? DEFAULT_CONTEXT_SIZE,
      num_predict: options.numPredict ?? DEFAULT_MAX_PREDICT,
    },
  };

  if (options.system) {
    bodyPayload.system = options.system;
  }
  if (options.formatJson) {
    bodyPayload.format = 'json';
  }

  let res: Response;
  try {
    res = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
      signal: options.signal,
    });
  } catch (err: any) {
    const error = new Error(`Cannot connect to local Ollama at ${url}. Ensure Ollama is running with CORS enabled (OLLAMA_ORIGINS="*" ollama serve).`);
    (error as any).isCorsError = true;
    (error as any).provider = 'ollama';
    throw error;
  }

  if (!res.ok) {
    const error = new Error(`Ollama generation error: HTTP ${res.status} ${res.statusText}`);
    (error as any).statusCode = res.status;
    (error as any).provider = 'ollama';
    throw error;
  }

  if (!res.body) {
    throw new Error('ReadableStream not supported in response body.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullResponse = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.response) {
          fullResponse += parsed.response;
          if (options.onToken) {
            options.onToken(parsed.response);
          }
        }
      } catch {
        // partial json, ignore
      }
    }
  }

  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer.trim());
      if (parsed.response) {
        fullResponse += parsed.response;
        if (options.onToken) {
          options.onToken(parsed.response);
        }
      }
    } catch {
      // ignore
    }
  }

  return fullResponse;
}
