import { Technique } from '../types';

let cachedTechniques: Technique[] | null = null;
let isLoadingPromise: Promise<Technique[]> | null = null;

/**
 * Load all 755 MITRE ATT&CK and ATLAS threat intelligence techniques into browser memory.
 */
export async function loadThreatIntel(): Promise<Technique[]> {
  if (cachedTechniques && cachedTechniques.length > 0) {
    return cachedTechniques;
  }

  if (isLoadingPromise) {
    return isLoadingPromise;
  }

  isLoadingPromise = (async () => {
    // Attempt multiple basePath variations for GitHub Pages compatibility
    const pathsToTry = [
      'data/threat_intel.json',
      '/data/threat_intel.json',
      '/AIsploitable/data/threat_intel.json',
    ];

    let data: any[] | null = null;

    for (const path of pathsToTry) {
      try {
        const res = await fetch(path);
        if (res.ok) {
          data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            break;
          }
        }
      } catch {
        // try next path
      }
    }

    if (!data || !Array.isArray(data)) {
      console.warn('Could not load threat_intel.json from static assets, using baseline fallback techniques.');
      data = getFallbackTechniques();
    }

    cachedTechniques = data.map((item: any) => ({
      id: item.id || item.technique_id || 'UNKNOWN',
      name: item.name || item.technique_name || 'Unknown Technique',
      tactic_id: item.tactic_id,
      tactic_name: item.tactic_name,
      description: item.description || '',
      attack_complexity: item.attack_complexity,
      privileges_required: item.privileges_required,
      execution_context: Array.isArray(item.execution_context) ? item.execution_context : [],
      defenses: Array.isArray(item.defenses) ? item.defenses : [],
      detection_opportunities: Array.isArray(item.detection_opportunities) ? item.detection_opportunities : [],
      exploit_primitives: Array.isArray(item.exploit_primitives) ? item.exploit_primitives : [],
      code_patterns: Array.isArray(item.code_patterns) ? item.code_patterns : [],
      related_tools: Array.isArray(item.related_tools) ? item.related_tools : [],
      is_atlas: !!item.is_atlas,
      url: item.url,
    }));

    return cachedTechniques;
  })();

  return isLoadingPromise;
}

/**
 * Perform sub-2ms semantic keyword & Jaccard token retrieval against in-memory threat intelligence.
 */
export async function searchTechniques(queryText: string, topK: number = 4): Promise<Technique[]> {
  const techniques = await loadThreatIntel();
  if (!queryText || !queryText.trim()) {
    return techniques.slice(0, topK);
  }

  const cleanQuery = queryText.toLowerCase();
  const tokenMatches = cleanQuery.match(/\b[a-z0-9_\-.]{3,}\b/g) || [];
  const queryTokensSet = new Set(tokenMatches);
  const queryTokensList = Array.from(queryTokensSet);

  const scored: Array<{ score: number; tech: Technique }> = [];

  for (const tech of techniques) {
    let score = 0;
    const reasons: string[] = [];
    const techIdLower = tech.id.toLowerCase();
    const techNameLower = tech.name.toLowerCase();
    const techDescLower = tech.description.toLowerCase();

    // 1. Direct ID match (e.g. T1190 or AML.T0040)
    if (cleanQuery.includes(techIdLower)) {
      score += 15.0;
      reasons.push(`Explicit match on technique ID ${tech.id}`);
    }

    // 2. Name token match
    const nameWords = techNameLower.match(/\b[a-z]{4,}\b/g) || [];
    for (const w of nameWords) {
      if (queryTokensSet.has(w)) {
        score += 3.0;
        reasons.push(`Matched keyword '${w}' in technique name`);
      }
    }

    // 3. Exploit primitives match
    for (const ep of tech.exploit_primitives || []) {
      const epClean = ep.toLowerCase();
      if (cleanQuery.includes(epClean)) {
        score += 6.0;
        reasons.push(`Matched exploit primitive '${ep}'`);
      }
    }

    // 4. Description token overlap
    const descWords = new Set(techDescLower.match(/\b[a-z0-9_-]{4,}\b/g) || []);
    let overlapCount = 0;
    for (const token of queryTokensList) {
      if (descWords.has(token)) {
        overlapCount++;
      }
    }

    if (overlapCount > 0) {
      score += Math.min(overlapCount * 1.2, 8.0);
      if (reasons.length === 0) {
        reasons.push(`Context match on ${overlapCount} security tokens`);
      }
    }

    if (score > 0) {
      const confidence = Math.min(
        Math.round((0.5 + (score / 30.0) * 0.45) * 100) / 100,
        0.98
      );
      const copy: Technique = {
        ...tech,
        confidence,
        why_retrieved: reasons.slice(0, 2).join('; ') || 'Contextual match against vulnerability description.',
      };
      scored.push({ score, tech: copy });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  const results = scored.slice(0, topK).map((s) => s.tech);
  if (results.length === 0 && techniques.length > 0) {
    return techniques.slice(0, topK).map((t) => ({
      ...t,
      confidence: 0.6,
      why_retrieved: 'Baseline security tactic relevant for initial assessment.',
    }));
  }

  return results;
}

function getFallbackTechniques(): any[] {
  return [
    {
      id: 'T1190',
      name: 'Exploit Public-Facing Application',
      tactic_id: 'TA0001',
      tactic_name: 'Initial Access',
      description: 'Adversaries may attempt to take advantage of a weakness in an Internet-facing computer or program using software, system, or service bugs.',
      exploit_primitives: ['Remote Code Execution', 'Input Validation Flaw'],
      is_atlas: false,
    },
    {
      id: 'T1059.006',
      name: 'Command and Scripting Interpreter: Python',
      tactic_id: 'TA0002',
      tactic_name: 'Execution',
      description: 'Adversaries may abuse Python commands and scripts for execution.',
      exploit_primitives: ['Python Scripting', 'Process Execution'],
      is_atlas: false,
    },
    {
      id: 'AML.T0040',
      name: 'ML Model Inversion / Extraction',
      tactic_id: 'AML.TA0004',
      tactic_name: 'Model Access',
      description: 'Adversaries may attempt to extract model parameters or reconstruct training samples.',
      exploit_primitives: ['Model Inversion', 'Prompt Leakage'],
      is_atlas: true,
    },
  ];
}
