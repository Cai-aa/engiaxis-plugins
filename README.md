# EngiAxis Connector — ChatGPT Desktop / Codex Plugin Marketplace

Version: **v1.0.5**

Official plugin marketplace for **EngiAxis Connector**, bringing one-click local CAD, CAE, and EDA engineering software connections natively into ChatGPT Desktop / Codex with a pinnable sidebar workspace.

## Included Editions / 包含版本

| Plugin | Edition | Supported Desktop Software |
| :--- | :--- | :--- |
| `engiaxis-connector-cad` | **CAD Edition** (`EA-CONN-CAD`) | SolidWorks, CATIA V5, UG / Siemens NX, EPLAN + Creo, Inventor, AutoCAD, Fusion (8) |
| `engiaxis-connector-cae` | **CAE Edition** (`EA-CONN-CAE`) | Abaqus, Ansys (Workbench / Fluent / AEDT), COMSOL, CST, ANSA, HyperWorks, Adams, CalculiX + STAR-CCM+, FloTHERM, FLAC3D (13) |
| `engiaxis-connector-eda` | **EDA Edition** (`EA-CONN-EDA`) | EasyEDA Pro (嘉立创EDA专业版), KiCad, Keysight ADS + Altium Designer (4) |
| `engiaxis-connector-suite` | **All-in-One Suite** (`EA-CONN-SUITE`) | All 25 CAD + CAE + EDA engineering software entries synced with EngiAxis |

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


## Independent Third-Party Notice / 免责声明

EngiAxis Connector is an independent third-party tool and is not affiliated with, endorsed by, or a partner of any CAD, CAE, or EDA software vendor. Software names are referenced for compatibility information only; all trademarks belong to their respective owners.

EngiAxis Connector 为独立第三方连接工具，与上述工程软件厂商无隶属、赞助或官方授权关系；相关软件名称仅用于说明兼容性，其商标归各自权利人所有。
