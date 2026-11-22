---
name: cad-connector
description: Parametric CAD modeling and verification rules for SolidWorks, CATIA V5, and UG / Siemens NX connected via EngiAxis Connector.
---

# CAD Connector Workflow (SolidWorks / CATIA V5 / Siemens NX)

1. Always inspect the active document, units, and feature tree before modifying geometry.
2. Follow right-hand Z-up millimeter conventions unless the target document specifies another unit system (remember SolidWorks COM APIs often operate in meters internally: `0.001 m = 1 mm`).
3. Build features in stable topological order: primary base solid -> datum bosses/cuts -> patterns -> fillets and chamfers last.
4. Keep `NX_MCP_ALLOW_EXECUTE=0` for Siemens NX unless arbitrary NXOpen execution is explicitly authorized.
5. Verify bounding-box dimensions, body count, and STEP/STL exports deterministically before reporting completion.
