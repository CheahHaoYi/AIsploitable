import re
from typing import List, Tuple
from ..models.technique import Technique
from .loader import loader

class ThreatIntelRetriever:
    def __init__(self):
        self.loader = loader

    def retrieve(self, query_text: str, top_k: int = 5) -> List[Technique]:
        techniques = self.loader.load_all()
        if not query_text:
            return techniques[:top_k]

        tokens = set(re.findall(r"\b[a-zA-Z0-9_\-\.]{3,}\b", query_text.lower()))
        scored_techniques: List[Tuple[float, Technique, str]] = []

        for tech in techniques:
            score = 0.0
            reasons = []

            tech_text = f"{tech.id} {tech.name} {tech.tactic_name or ''} {tech.description} {' '.join(tech.exploit_primitives)} {' '.join(tech.code_patterns)}".lower()

            # ID direct match
            if tech.id.lower() in query_text.lower():
                score += 15.0
                reasons.append(f"Explicit match on technique ID {tech.id}")

            # Name match
            for word in re.findall(r"\b[a-zA-Z]{4,}\b", tech.name.lower()):
                if word in tokens:
                    score += 3.0
                    reasons.append(f"Matched keyword '{word}' in technique name")

            # Exploit primitives match
            for ep in tech.exploit_primitives:
                ep_clean = ep.lower()
                if ep_clean in query_text.lower():
                    score += 6.0
                    reasons.append(f"Matched exploit primitive '{ep}'")

            # General token match in description
            desc_tokens = set(re.findall(r"\b[a-zA-Z0-9_\-]{4,}\b", tech.description.lower()))
            overlap = tokens.intersection(desc_tokens)
            if overlap:
                score += min(len(overlap) * 1.2, 8.0)
                if not reasons:
                    matched_samples = list(overlap)[:3]
                    reasons.append(f"Context match on concepts: {', '.join(matched_samples)}")

            if score > 0:
                confidence = min(round(0.5 + (score / 30.0) * 0.45, 2), 0.98)
                tech_copy = tech.model_copy()
                tech_copy.confidence = confidence
                tech_copy.why_retrieved = "; ".join(reasons[:2]) if reasons else "Contextual match against vulnerability description."
                scored_techniques.append((score, tech_copy, tech_copy.why_retrieved))

        scored_techniques.sort(key=lambda x: x[0], reverse=True)
        
        # If no results or few results, fallback to top relevant general techniques
        results = [item[1] for item in scored_techniques[:top_k]]
        if not results and techniques:
            fallback = techniques[:top_k]
            for f in fallback:
                f_copy = f.model_copy()
                f_copy.confidence = 0.60
                f_copy.why_retrieved = "Baseline security tactic relevant for initial assessment."
                results.append(f_copy)
        return results

retriever = ThreatIntelRetriever()
