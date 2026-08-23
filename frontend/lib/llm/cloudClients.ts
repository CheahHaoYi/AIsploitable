import {
  DEFAULT_CONTEXT_SIZE,
  DEFAULT_MAX_PREDICT,
  DEFAULT_TEMPERATURE,
  GenerateOptions,
} from './types';

/**
 * Format raw error payload from cloud LLM providers into a user-friendly message.
 */
export function formatApiErrorMessage(errText: string, status: number, provider: string): string {
  try {
    const parsed = JSON.parse(errText);
    
    // OpenRouter / OpenAI standard error schema: { error: { message: "...", code: 403 } }
    if (parsed.error?.message) {
      return `${provider} error (${status}): ${parsed.error.message}`;
    }
    // Gemini error schema: { error: { code: 403, message: "...", status: "PERMISSION_DENIED" } }
    if (parsed.error && typeof parsed.error === 'string') {
      return `${provider} error (${status}): ${parsed.error}`;
    }
    if (parsed.message) {
      return `${provider} error (${status}): ${parsed.message}`;
    }
  } catch {
    // If not valid JSON, use plain string
  }
  
  const cleanSnippet = errText.replace(/<[^>]*>?/gm, '').trim();
  return `${provider} API error (${status}): ${cleanSnippet.slice(0, 300)}`;
}

/**
 * Stream text generation using Google Gemini REST API via Server-Sent Events (SSE).
 */
export async function streamGemini(
  prompt: string,
  apiKey: string,
  model: string = 'gemini-2.5-flash',
  options: GenerateOptions = {}
): Promise<string> {
  if (!apiKey || apiKey.trim() === '') {
    const err = new Error('Google Gemini API key is required. Please add your key in Settings (⚙️).');
    (err as any).isKeyMissing = true;
    (err as any).provider = 'gemini';
    throw err;
  }

  const cleanModel = model.replace(/^models\//, '');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:streamGenerateContent?key=${apiKey}&alt=sse`;

  const body: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      maxOutputTokens: options.numPredict ?? DEFAULT_MAX_PREDICT,
      responseMimeType: options.formatJson ? 'application/json' : 'text/plain',
    },
  };

  if (options.system) {
    body.systemInstruction = {
      parts: [{ text: options.system }],
    };
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: options.signal,
    });
  } catch (fetchErr: any) {
    const err = new Error(`Network error connecting to Google Gemini API: ${fetchErr.message || fetchErr}`);
    (err as any).provider = 'gemini';
    throw err;
  }

  if (!res.ok) {
    const errText = await res.text();
    const formatted = formatApiErrorMessage(errText, res.status, 'Google Gemini');
    const err = new Error(formatted);
    (err as any).statusCode = res.status;
    (err as any).provider = 'gemini';
    (err as any).isQuotaExceeded = res.status === 403 || res.status === 429;
    (err as any).rawText = errText;
    throw err;
  }

  try {
    const streamedText = await parseSSE(
      res,
      (parsed) => {
        return parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
      },
      options.onToken
    );

    if (streamedText && streamedText.trim().length > 0) {
      return streamedText;
    }
  } catch (streamErr) {
    console.warn('Gemini SSE stream error, attempting non-streaming generateContent fallback:', streamErr);
  }

  // Non-streaming fallback if stream returned empty or had an issue
  try {
    const nonStreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
    const nonStreamRes = await fetch(nonStreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (nonStreamRes.ok) {
      const data = await nonStreamRes.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text && options.onToken) {
        options.onToken(text);
      }
      return text;
    }
  } catch (nonStreamErr) {
    console.warn('Gemini non-streaming fallback also failed:', nonStreamErr);
  }

  return '';
}

/**
 * Stream text generation using OpenAI-compatible APIs (OpenAI, Groq, OpenRouter).
 */
export async function streamOpenAICompatible(
  prompt: string,
  apiKey: string,
  baseUrl: string,
  model: string,
  options: GenerateOptions = {},
  customHeaders: Record<string, string> = {}
): Promise<string> {
  const providerLabel = baseUrl.includes('groq')
    ? 'Groq'
    : baseUrl.includes('openrouter')
    ? 'OpenRouter'
    : 'OpenAI';

  if (!apiKey || apiKey.trim() === '') {
    const err = new Error(`${providerLabel} API key is required. Please add your key in Settings (⚙️).`);
    (err as any).isKeyMissing = true;
    (err as any).provider = providerLabel.toLowerCase();
    throw err;
  }

  const messages: Array<{ role: string; content: string }> = [];
  if (options.system) {
    messages.push({ role: 'system', content: options.system });
  }
  messages.push({ role: 'user', content: prompt });

  const body: any = {
    model: model,
    messages: messages,
    stream: true,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    max_tokens: options.numPredict ?? DEFAULT_MAX_PREDICT,
  };

  if (options.formatJson) {
    body.response_format = { type: 'json_object' };
  }

  const url = baseUrl.replace(/\/+$/, '') + '/chat/completions';
  
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...customHeaders,
      },
      body: JSON.stringify(body),
      signal: options.signal,
    });
  } catch (fetchErr: any) {
    const err = new Error(`Network error connecting to ${providerLabel} API (${url}): ${fetchErr.message || fetchErr}`);
    (err as any).provider = providerLabel.toLowerCase();
    throw err;
  }

  if (!res.ok) {
    const errText = await res.text();
    const formatted = formatApiErrorMessage(errText, res.status, providerLabel);
    const err = new Error(formatted);
    (err as any).statusCode = res.status;
    (err as any).provider = providerLabel.toLowerCase();
    (err as any).isQuotaExceeded = res.status === 403 || res.status === 429;
    (err as any).rawText = errText;
    throw err;
  }

  return parseSSE(res, (parsed) => {
    return parsed.choices?.[0]?.delta?.content || '';
  }, options.onToken);
}

/**
 * Stream text generation using Anthropic Claude API.
 */
export async function streamAnthropic(
  prompt: string,
  apiKey: string,
  model: string = 'claude-3-5-sonnet-20241022',
  options: GenerateOptions = {}
): Promise<string> {
  if (!apiKey || apiKey.trim() === '') {
    const err = new Error('Anthropic Claude API key is required. Please add your key in Settings (⚙️).');
    (err as any).isKeyMissing = true;
    (err as any).provider = 'anthropic';
    throw err;
  }

  const body: any = {
    model: model,
    max_tokens: options.numPredict ?? DEFAULT_MAX_PREDICT,
    messages: [{ role: 'user', content: prompt }],
    stream: true,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
  };

  if (options.system) {
    body.system = options.system;
  }

  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
      signal: options.signal,
    });
  } catch (fetchErr: any) {
    const err = new Error(`Network error connecting to Anthropic API: ${fetchErr.message || fetchErr}`);
    (err as any).provider = 'anthropic';
    throw err;
  }

  if (!res.ok) {
    const errText = await res.text();
    const formatted = formatApiErrorMessage(errText, res.status, 'Anthropic Claude');
    const err = new Error(formatted);
    (err as any).statusCode = res.status;
    (err as any).provider = 'anthropic';
    (err as any).isQuotaExceeded = res.status === 403 || res.status === 429;
    (err as any).rawText = errText;
    throw err;
  }

  return parseSSE(res, (parsed) => {
    if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
      return parsed.delta.text;
    }
    return '';
  }, options.onToken);
}

/**
 * Generic SSE stream parser helper compliant with W3C SSE standard.
 * Correctly accumulates multi-line event blocks, data fields, and embedded newlines.
 */
async function parseSSE(
  res: Response,
  extractText: (parsed: any) => string,
  onToken?: (token: string) => void
): Promise<string> {
  if (!res.body) {
    throw new Error('No response body returned from streaming endpoint.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullResponse = '';
  let buffer = '';

  const processBlock = (block: string) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    // Split event block into lines
    const lines = trimmed.split(/\r?\n/);
    const dataParts: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith(':')) continue; // comments / keep-alives

      if (line.startsWith('data:')) {
        const payload = line.replace(/^data:\s?/, '');
        if (payload === '[DONE]') return;
        dataParts.push(payload);
      }
    }

    if (dataParts.length > 0) {
      // Per SSE spec, multiple data: lines in one event are joined by \n
      const combined = dataParts.join('\n');
      try {
        const parsed = JSON.parse(combined);
        const chunk = extractText(parsed);
        if (chunk) {
          fullResponse += chunk;
          if (onToken) onToken(chunk);
        }
      } catch {
        // Fallback: try parsing each line independently
        for (const line of dataParts) {
          try {
            const parsed = JSON.parse(line);
            const chunk = extractText(parsed);
            if (chunk) {
              fullResponse += chunk;
              if (onToken) onToken(chunk);
            }
          } catch {
            // ignore partial fragments
          }
        }
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Look for SSE event boundaries (two consecutive newlines)
    let boundaryMatch = buffer.search(/\r?\n\r?\n/);
    while (boundaryMatch !== -1) {
      const isCrlf = buffer.indexOf('\r\n\r\n') !== -1 && boundaryMatch === buffer.indexOf('\r\n\r\n');
      const sepLen = isCrlf ? 4 : 2;
      const block = buffer.slice(0, boundaryMatch);
      buffer = buffer.slice(boundaryMatch + sepLen);

      processBlock(block);
      boundaryMatch = buffer.search(/\r?\n\r?\n/);
    }
  }

  // Process any leftover block in the buffer after stream close
  if (buffer.trim()) {
    processBlock(buffer);
  }

  return fullResponse;
}
