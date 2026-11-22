---
name: connector-setup
description: Diagnose, activate, and configure EngiAxis Connector adapters for local CAD, CAE, and EDA desktop applications.
---

# EngiAxis Connector Setup & Troubleshooting

Use this workflow whenever a user wants to connect an engineering desktop application, activate a commercial license key, or debug an MCP bridge.

## Workflow
1. Call `connector_status` to check the installed edition (`cad`, `cae`, `eda`, or `suite`), license activation state, machine fingerprint, detected software executables, and bridge port status.
2. If the license is not yet active and the user provides an `EA1.xxx` key, call `connector_activate_license`.
3. Call `connector_setup` with the target `software_id` (and optional `sync_host`) to provision the isolated Python/Node runtime and verify the stdio MCP handshake.
4. Distinguish MCP transport health from downstream commercial application health and license validity. If an in-application bridge port (NX `48161`, Abaqus `48152`, Ansys Workbench `9885`, Keysight ADS `48326`) is unreachable, guide the user to start the in-app plugin/bridge before running mutations.
