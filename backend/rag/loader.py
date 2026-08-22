import json
from pathlib import Path
from typing import List, Dict, Any
from ..config import settings
from ..models.technique import Technique

class ThreatIntelLoader:
    def __init__(self, data_dir: Path = settings.data_dir):
        self.data_dir = data_dir
        self.techniques: List[Technique] = []
        self._loaded = False

    def load_all(self) -> List[Technique]:
        if self._loaded:
            return self.techniques

        self.techniques = []
        # Load ATT&CK files
        attack_dir = self.data_dir / "attack"
        if attack_dir.exists():
            for json_file in sorted(attack_dir.glob("*.json")):
                try:
                    with open(json_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            for item in data:
                                tech = self._map_item(item, is_atlas=False)
                                if tech:
                                    self.techniques.append(tech)
                except Exception as e:
                    print(f"Error loading {json_file}: {e}")

        # Load ATLAS files
        atlas_dir = self.data_dir / "atlas"
        if atlas_dir.exists():
            for json_file in sorted(atlas_dir.glob("*.json")):
                try:
                    with open(json_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if isinstance(data, list):
                            for item in data:
                                tech = self._map_item(item, is_atlas=True)
                                if tech:
                                    self.techniques.append(tech)
                except Exception as e:
                    print(f"Error loading {json_file}: {e}")

        self._loaded = True
        print(f"Loaded {len(self.techniques)} threat intel techniques (ATT&CK + ATLAS).")
        return self.techniques

    def _map_item(self, item: Dict[str, Any], is_atlas: bool = False) -> Technique:
        tech_id = item.get("technique_id") or item.get("id") or "UNKNOWN"
        name = item.get("technique_name") or item.get("name") or "Unknown Technique"
        tactic_id = item.get("tactic_id")
        tactic_name = item.get("tactic_name")
        description = item.get("description") or ""
        attack_complexity = item.get("attack_complexity")
        privileges_required = item.get("privileges_required")
        execution_context = item.get("execution_context") or []
        defenses = item.get("potential_defenses") or item.get("defenses") or []
        detection_opportunities = item.get("detection_opportunities") or []
        exploit_primitives = item.get("exploit_primitives") or []
        code_patterns = item.get("code_examples_patterns") or item.get("code_patterns") or []
        related_tools = item.get("related_tools") or []
        url = item.get("url")

        return Technique(
            id=tech_id,
            name=name,
            tactic_id=tactic_id,
            tactic_name=tactic_name,
            description=description,
            attack_complexity=attack_complexity,
            privileges_required=privileges_required,
            execution_context=execution_context if isinstance(execution_context, list) else [str(execution_context)],
            defenses=defenses if isinstance(defenses, list) else [str(defenses)],
            detection_opportunities=detection_opportunities if isinstance(detection_opportunities, list) else [str(detection_opportunities)],
            exploit_primitives=exploit_primitives if isinstance(exploit_primitives, list) else [str(exploit_primitives)],
            code_patterns=code_patterns if isinstance(code_patterns, list) else [str(code_patterns)],
            related_tools=related_tools if isinstance(related_tools, list) else [str(related_tools)],
            is_atlas=is_atlas or item.get("is_atlas", False),
            url=url
        )

loader = ThreatIntelLoader()
