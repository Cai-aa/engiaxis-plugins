# EngiAxis Connector — ChatGPT Desktop / Codex Plugin Marketplace

Version: **v1.0.0**

Official plugin marketplace for **EngiAxis Connector**, bringing one-click local CAD, CAE, and EDA engineering software connections natively into ChatGPT Desktop / Codex with a pinnable sidebar workspace.

## Included Editions / 包含版本

| Plugin | Edition | Supported Desktop Software |
| :--- | :--- | :--- |
| `engiaxis-connector-cad` | **CAD Edition** (`EA-CONN-CAD`) | SolidWorks, CATIA V5, UG / Siemens NX |
| `engiaxis-connector-cae` | **CAE Edition** (`EA-CONN-CAE`) | Abaqus, Ansys (Workbench / Fluent / AEDT), COMSOL, CST, ANSA, CalculiX |
| `engiaxis-connector-eda` | **EDA Edition** (`EA-CONN-EDA`) | EasyEDA Pro (嘉立创EDA专业版), KiCad, Keysight ADS |
| `engiaxis-connector-suite` | **All-in-One Suite** (`EA-CONN-SUITE`) | All 14 CAD + CAE + EDA engineering software adapters |

## Quick Install in ChatGPT Desktop / 安装步骤

1. Open **ChatGPT Desktop** → **Customize (自定义)** → **Plugins (插件)** → **Add (添加)** → **Add Plugin Marketplace (添加插件市场)**.
2. Enter **`Cai-aa/engiaxis-plugins`** as the source and click **Add Marketplace (添加市场)**.
3. Choose your edition (CAD / CAE / EDA / Suite) and click **+** to install.
4. Pin **EngiAxis Connector** to the left sidebar, open the workspace, paste your redeem code (`EA-CAD-XXXX-XXXX-XXXX`) or offline license key (`EA1.xxx`), and click **Activate (激活授权)**.
5. Click **One-Click Setup (一键配置)** on any detected local software to connect it automatically.

## Prerequisites / 运行要求

- Node.js 20+ installed locally (for running the local stdio MCP server).
- Target desktop engineering software installed on Windows (macOS/Linux supported for cross-platform tools such as KiCad / CalculiX).
- A valid EngiAxis Connector commercial license key or redeem code.
