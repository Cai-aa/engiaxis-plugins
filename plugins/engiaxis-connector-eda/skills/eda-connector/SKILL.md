---
name: eda-connector
description: Schematic, PCB layout, and RF/microwave simulation workflow rules for EasyEDA Pro (JLC EDA), KiCad, and Keysight ADS.
---

# EDA Connector Workflow (EasyEDA Pro / KiCad / Keysight ADS)

1. Query the active project, schematic sheets, PCB stackup, or RF workspace before mutating nets or components.
2. For **EasyEDA Pro**, confirm the `easyeda` CLI bridge is reachable and verify schematic/PCB synchronization.
3. For **KiCad**, verify the KiCad installation and embedded `pcbnew` Python module before running layout or fabrication exports.
4. For **Keysight ADS**, confirm the ADS Addon uses the same `bridge_config.json` token on `127.0.0.1:48326`.
5. Run ERC/DRC checks and report any unresolved violations explicitly.
