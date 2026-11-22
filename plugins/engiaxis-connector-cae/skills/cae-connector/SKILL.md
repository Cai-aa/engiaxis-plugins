---
name: cae-connector
description: Simulation setup, bridge checks, and deterministic verification rules for Abaqus, Ansys, COMSOL, CST, ANSA, and CalculiX.
---

# CAE Connector Workflow (Abaqus / Ansys / COMSOL / CST / ANSA / CalculiX)

1. Enforce consistent engineering units (`mm - tonne - s - N - MPa` for structural FEA; report stresses in `MPa` and modal frequencies in `Hz`).
2. Confirm in-application bridges are live before executing interactive session commands (Abaqus `127.0.0.1:48152`, Ansys Workbench `127.0.0.1:9885`).
3. Inspect geometry, material properties, mesh quality, boundary conditions, and solver convergence residuals before summarizing engineering findings.
