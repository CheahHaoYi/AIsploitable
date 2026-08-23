export type LLMProvider =
  | 'gemini'
  | 'openrouter'
  | 'groq'
  | 'openai'
  | 'anthropic'
  | 'ollama'
  | 'demo'
  | 'unknown';

export interface ProviderMeta {
  id: LLMProvider;
  name: string;
  badge: string;
  defaultModel: string;
  placeholder: string;
  suggestedModels: string[];
  keyField?: 'geminiKey' | 'openrouterKey' | 'groqKey' | 'openaiKey' | 'anthropicKey';
  keyHelpUrl?: string;
  requiresKey: boolean;
  description: string;
}

export const PROVIDER_REGISTRY: Record<LLMProvider, ProviderMeta> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Google AI',
    defaultModel: 'gemini-2.5-flash',
    placeholder: 'e.g. gemini-2.5-flash, gemini-3.1-pro-preview',
    suggestedModels: [
      'gemini-2.5-flash',
      'gemini-3.1-pro-preview',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
    ],
    keyField: 'geminiKey',
    keyHelpUrl: 'https://aistudio.google.com/app/apikey',
    requiresKey: true,
    description: 'Direct Google Gemini API with multimodal exploit synthesis & high throughput',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    badge: 'Multi-Provider / DeepSeek',
    defaultModel: 'deepseek/deepseek-r1',
    placeholder: 'e.g. deepseek/deepseek-r1, meta-llama/llama-3.3-70b-instruct',
    suggestedModels: [
      'deepseek/deepseek-r1',
      'meta-llama/llama-3.3-70b-instruct',
      'google/gemini-2.5-flash',
      'anthropic/claude-3.5-sonnet',
      'mistralai/mistral-small-24b-instruct-2501',
    ],
    keyField: 'openrouterKey',
    keyHelpUrl: 'https://openrouter.ai/keys',
    requiresKey: true,
    description: 'Unified gateway for DeepSeek R1, Llama 3.3, Claude, Mistral, and 200+ models',
  },
  groq: {
    id: 'groq',
    name: 'Groq LPU',
    badge: 'Ultra-Fast',
    defaultModel: 'llama-3.3-70b-versatile',
    placeholder: 'e.g. llama-3.3-70b-versatile, deepseek-r1-distill-llama-70b',
    suggestedModels: [
      'llama-3.3-70b-versatile',
      'deepseek-r1-distill-llama-70b',
      'gemma2-9b-it',
    ],
    keyField: 'groqKey',
    keyHelpUrl: 'https://console.groq.com/keys',
    requiresKey: true,
    description: 'Ultra-low latency inference on Groq Language Processing Units',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    badge: 'GPT-4o',
    defaultModel: 'gpt-4o-mini',
    placeholder: 'e.g. gpt-4o-mini, gpt-4o, o3-mini',
    suggestedModels: ['gpt-4o-mini', 'gpt-4o', 'o3-mini', 'gpt-4-turbo'],
    keyField: 'openaiKey',
    keyHelpUrl: 'https://platform.openai.com/api-keys',
    requiresKey: true,
    description: 'Official OpenAI GPT-4o, GPT-4o Mini, and reasoning models',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    badge: 'Claude 3.5 / 3.7',
    defaultModel: 'claude-3-5-sonnet-20241022',
    placeholder: 'e.g. claude-3-5-sonnet-20241022, claude-3-7-sonnet-latest',
    suggestedModels: [
      'claude-3-5-sonnet-20241022',
      'claude-3-7-sonnet-latest',
      'claude-3-5-haiku-20241022',
    ],
    keyField: 'anthropicKey',
    keyHelpUrl: 'https://console.anthropic.com/settings/keys',
    requiresKey: true,
    description: 'Anthropic Claude Sonnet & Haiku models for precise vulnerability synthesis',
  },
  ollama: {
    id: 'ollama',
    name: 'Local Ollama / LM Studio',
    badge: '100% Local / Zero Cloud',
    defaultModel: 'gemma4:e2b',
    placeholder: 'e.g. gemma4:e2b, gemma4:e4b, llama3.2, mistral',
    suggestedModels: ['gemma4:e2b', 'gemma4:e4b', 'llama3.2', 'mistral', 'deepseek-r1:8b'],
    requiresKey: false,
    description: 'Local on-premise inference daemon with zero external data transmission',
  },
  demo: {
    id: 'demo',
    name: 'Offline Demo Simulation',
    badge: 'Instant / No Keys Needed',
    defaultModel: 'demo-gemma-4',
    placeholder: 'demo-gemma-4',
    suggestedModels: ['demo-gemma-4'],
    requiresKey: false,
    description: 'Deterministic sandbox simulation for instant testing without API keys',
  },
  unknown: {
    id: 'unknown',
    name: 'Custom Provider',
    badge: 'Custom',
    defaultModel: 'custom-model',
    placeholder: 'custom-model',
    suggestedModels: [],
    requiresKey: false,
    description: 'Custom AI provider',
  },
};

/**
 * Unified Context Window & Inference Parameters across all processes in AIsploitable.
 */
export const DEFAULT_CONTEXT_SIZE = 8192;
export const DEFAULT_MAX_PREDICT = 4096;
export const DEFAULT_TEMPERATURE = 0.2;

export interface ModelOption {
  id: string;
  name: string;
  provider: LLMProvider;
  size?: string;
  description?: string;
  is_local?: boolean;
  is_default?: boolean;
}

export interface ProviderSettings {
  ollamaUrl: string;
  geminiKey: string;
  groqKey: string;
  openaiKey: string;
  anthropicKey: string;
  openrouterKey: string;
  selectedProvider: LLMProvider;
  selectedModel: string;
  providerModels?: Partial<Record<LLMProvider, string>>;
  contextSize?: number;
  maxPredict?: number;
  temperature?: number;
}

export interface GenerateOptions {
  model?: string;
  provider?: LLMProvider;
  system?: string;
  formatJson?: boolean;
  temperature?: number;
  numCtx?: number;
  numPredict?: number;
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

export interface OllamaTagResponse {
  models: Array<{
    name: string;
    model: string;
    size: number;
    details?: {
      format?: string;
      family?: string;
      parameter_size?: string;
      quantization_level?: string;
    };
  }>;
}

export interface LLMErrorDetails {
  title?: string;
  message: string;
  provider?: LLMProvider | string;
  statusCode?: number;
  isKeyMissing?: boolean;
  isQuotaExceeded?: boolean;
  isCorsError?: boolean;
  rawError?: any;
}
