#!/usr/bin/env node

// packages/core/dist/editions.js
var EDITION_SPECS = {
  cad: {
    id: "cad",
    sku: "EA-CONN-CAD",
    slug: "engiaxis-connector-cad",
    nameEn: "EngiAxis Connector \u2014 CAD Edition",
    nameZh: "EngiAxis \u5DE5\u7A0B\u8FDE\u63A5\u5668 \xB7 CAD \u7248",
    shortLabel: "CAD",
    descriptionEn: "Connect SolidWorks, CATIA V5, and UG / Siemens NX to ChatGPT Desktop, WorkBuddy Desktop, and DeepSeek Harness.",
    descriptionZh: "\u5C06 SolidWorks\u3001CATIA V5 \u4E0E UG / Siemens NX \u4E00\u952E\u63A5\u5165 ChatGPT \u684C\u9762\u7AEF\u3001WorkBuddy \u684C\u9762\u7AEF\u4E0E DeepSeek Harness\u3002",
    categories: ["cad"]
  },
  cae: {
    id: "cae",
    sku: "EA-CONN-CAE",
    slug: "engiaxis-connector-cae",
    nameEn: "EngiAxis Connector \u2014 CAE Edition",
    nameZh: "EngiAxis \u5DE5\u7A0B\u8FDE\u63A5\u5668 \xB7 CAE \u7248",
    shortLabel: "CAE",
    descriptionEn: "Connect Abaqus, Ansys (Workbench / Fluent / AEDT), COMSOL, CST, ANSA, and CalculiX to AI desktop clients.",
    descriptionZh: "\u5C06 Abaqus\u3001Ansys\uFF08Workbench / Fluent / AEDT\uFF09\u3001COMSOL\u3001CST\u3001ANSA \u4E0E CalculiX \u4E00\u952E\u63A5\u5165 AI \u684C\u9762\u7AEF\u3002",
    categories: ["cae"]
  },
  eda: {
    id: "eda",
    sku: "EA-CONN-EDA",
    slug: "engiaxis-connector-eda",
    nameEn: "EngiAxis Connector \u2014 EDA Edition",
    nameZh: "EngiAxis \u5DE5\u7A0B\u8FDE\u63A5\u5668 \xB7 EDA \u7248",
    shortLabel: "EDA",
    descriptionEn: "Connect EasyEDA Pro (JLC EDA), KiCad, and Keysight ADS to ChatGPT Desktop, WorkBuddy Desktop, and DeepSeek Harness.",
    descriptionZh: "\u5C06\u5609\u7ACB\u521BEDA\uFF08EasyEDA Pro\uFF09\u3001KiCad \u4E0E Keysight ADS \u4E00\u952E\u63A5\u5165 AI \u684C\u9762\u7AEF\u3002",
    categories: ["eda"]
  },
  suite: {
    id: "suite",
    sku: "EA-CONN-SUITE",
    slug: "engiaxis-connector-suite",
    nameEn: "EngiAxis Connector \u2014 All-in-One Suite (CAD + CAE + EDA)",
    nameZh: "EngiAxis \u5DE5\u7A0B\u8FDE\u63A5\u5668 \xB7 \u5168\u80FD\u7248\uFF08CAD + CAE + EDA\uFF09",
    shortLabel: "CAD + CAE + EDA",
    descriptionEn: "Complete engineering connector bundle unifying all 14 CAD, CAE, and EDA desktop software adapters.",
    descriptionZh: "\u4E09\u5408\u4E00\u5DE5\u7A0B\u8F6F\u4EF6\u8FDE\u63A5\u5168\u80FD\u7248\uFF0C\u5B8C\u6574\u8986\u76D6 CAD\u3001CAE \u4E0E EDA \u5168\u90E8 14 \u6B3E\u5DE5\u7A0B\u8F6F\u4EF6\u9002\u914D\u5668\u3002",
    categories: ["cad", "cae", "eda"]
  }
};
function isEditionId(value) {
  return value === "cad" || value === "cae" || value === "eda" || value === "suite";
}
function parseEditionId(value, fallback = "suite") {
  if (!value)
    return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "all" || normalized === "all-in-one" || normalized === "pro")
    return "suite";
  if (isEditionId(normalized))
    return normalized;
  throw new Error(`Unknown edition "${value}". Expected one of: cad, cae, eda, suite.`);
}
function editionCoversCategory(edition, category) {
  return EDITION_SPECS[edition].categories.includes(category);
}

// packages/core/dist/catalog.js
import { dirname, join } from "node:path";
var CAD_REPO = "https://github.com/Cai-aa/CAD-Agent-Hub/tree/main/MCP";
var CAE_REPO = "https://github.com/Cai-aa/CAE-Agent-Hub/tree/main/MCP";
var EDA_REPO = "https://github.com/Cai-aa/EDA-Agent-Hub/tree/main/MCP";
function executableEnv(key, discoveredExecutable, transform) {
  if (!discoveredExecutable)
    return {};
  return { [key]: transform ? transform(discoveredExecutable) : discoveredExecutable };
}
function comsolRootFromExecutable(executable) {
  const binDir = dirname(executable);
  return /[\\/]bin[\\/]win64$/iu.test(binDir) ? dirname(dirname(binDir)) : binDir;
}
function adsRootFromExecutable(executable) {
  const binDir = dirname(executable);
  return /[\\/]bin$/iu.test(binDir) ? dirname(binDir) : binDir;
}
var SOFTWARE_CATALOG = [
  // ── CAD Edition (3) ───────────────────────────────────────────────────────
  {
    id: "solidworks",
    title: "SolidWorks",
    titleZh: "SolidWorks",
    category: "cad",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAD_REPO}/Solidworks`,
    prerequisitesEn: "Licensed Windows SolidWorks attached via COM automation under the same Windows user and integrity level.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Windows SolidWorks\uFF0C\u5E76\u4EE5\u76F8\u540C\u7528\u6237\u6743\u9650\u901A\u8FC7 COM \u63A5\u53E3\u9644\u7740\u5230\u8FD0\u884C\u5B9E\u4F8B\u3002",
    capabilities: ["Part & Assembly Modeling", "Sketch / Extrude / Fillet / Chamfer", "STEP / STL Export", "Mass Properties"],
    iconFile: "solidworks.png",
    source: {
      repo: "CAD-Agent-Hub",
      localRepoAliases: ["CAD-Agent-HUb"],
      repoSubpath: "MCP/Solidworks",
      bundledDir: "solidworks"
    },
    launch: {
      kind: "python-module",
      module: "solidworks_mcp.server",
      checkFile: "src/solidworks_mcp/server.py",
      pythonPathSubdir: "src"
    },
    buildEnv: ({ homeDir }) => ({
      PYTHONUNBUFFERED: "1",
      SOLIDWORKS_INTERACTIVE_MODE: "true",
      SOLIDWORKS_MCP_WORKSPACE: join(homeDir, "workspaces", "solidworks")
    })
  },
  {
    id: "catia",
    title: "CATIA V5",
    titleZh: "CATIA V5",
    category: "cad",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAD_REPO}/CATIA`,
    prerequisitesEn: "Licensed Windows CATIA V5 with COM automation enabled under the same user session.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Windows CATIA V5 \u5E76\u542F\u7528 COM \u81EA\u52A8\u5316\u63A5\u53E3\u3002",
    capabilities: ["PartDesign & Generative Shape Design", "Parameter Editing", "STEP / IGES Export"],
    iconFile: "catia.png",
    source: {
      repo: "CAD-Agent-Hub",
      localRepoAliases: ["CAD-Agent-HUb"],
      repoSubpath: "MCP/CATIA",
      bundledDir: "catia"
    },
    launch: {
      kind: "python-module",
      module: "catia_mcp.server",
      checkFile: "src/catia_mcp/server.py",
      pythonPathSubdir: "src"
    },
    buildEnv: ({ homeDir }) => ({
      PYTHONUNBUFFERED: "1",
      CATIA_MCP_WORKSPACE: join(homeDir, "workspaces", "catia")
    })
  },
  {
    id: "nx",
    title: "UG / Siemens NX",
    titleZh: "UG / Siemens NX",
    category: "cad",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAD_REPO}/UG`,
    bridgePort: 48161,
    prerequisitesEn: "Licensed Siemens NX with the NXOpen remoting bridge running inside NX on 127.0.0.1:48161. Keeps NX_MCP_ALLOW_EXECUTE=0 by default.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Siemens NX \u5E76\u5728 NX \u5185\u542F\u52A8 NXOpen Remoting \u6865\u63A5\uFF08\u7AEF\u53E3 48161\uFF09\uFF1B\u9ED8\u8BA4\u5173\u95ED\u4EFB\u610F\u4EE3\u7801\u6267\u884C\uFF08NX_MCP_ALLOW_EXECUTE=0\uFF09\u3002",
    capabilities: ["NXOpen Remoting Session", "Feature Inspection & Modeling", "STEP / Parasolid Export"],
    iconFile: "nx.png",
    source: {
      repo: "CAD-Agent-Hub",
      localRepoAliases: ["CAD-Agent-HUb"],
      repoSubpath: "MCP/UG",
      bundledDir: "nx"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py", "mcp_server.py"]
    },
    buildEnv: () => ({
      PYTHONUNBUFFERED: "1",
      NX_MCP_ALLOW_EXECUTE: "0",
      NX_MCP_TRANSPORT: "remoting",
      NX_MCP_HOST: "127.0.0.1",
      NX_MCP_REMOTING_PORT: "48161",
      NX_MCP_TIMEOUT: "120"
    })
  },
  // ── CAE Edition (8) ───────────────────────────────────────────────────────
  {
    id: "abaqus",
    title: "Abaqus",
    titleZh: "Abaqus",
    category: "cae",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/Abaqus`,
    bridgePort: 48152,
    prerequisitesEn: "Licensed Abaqus/CAE with the Abaqus MCP GUI plugin or kernel bridge listening on 127.0.0.1:48152.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Abaqus/CAE \u5E76\u52A0\u8F7D Abaqus MCP \u63D2\u4EF6/\u5185\u6838\u6865\u63A5\uFF08\u9ED8\u8BA4\u7AEF\u53E3 48152\uFF09\u3002",
    capabilities: ["CAE Pre-processing & Meshing", "Job Submission & Monitoring", "ODB Field Extraction"],
    iconFile: "abaqus.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/Abaqus",
      bundledDir: "abaqus"
    },
    launch: {
      kind: "python-script",
      scripts: ["mcp_server.py"]
    },
    buildEnv: ({ homeDir, sourceDir }) => ({
      PYTHONUNBUFFERED: "1",
      ABAQUS_MCP_HOST: "127.0.0.1",
      ABAQUS_MCP_PORT: "48152",
      ABAQUS_MCP_TIMEOUT: "60",
      ABAQUS_MCP_HOME: sourceDir,
      ABAQUS_CAE_HOST: "127.0.0.1",
      ABAQUS_CAE_PORT: "54321",
      ABAQUS_WORK_DIR: join(homeDir, "results", "abaqus")
    })
  },
  {
    id: "ansys-workbench",
    title: "Ansys Workbench",
    titleZh: "Ansys Workbench",
    category: "cae",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/Ansys/Workbench%20MCP`,
    bridgePort: 9885,
    prerequisitesEn: "Licensed Ansys Workbench/Mechanical with the ACT or Workbench bridge running on 127.0.0.1:9885.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Ansys Workbench/Mechanical \u5E76\u542F\u52A8 ACT/Workbench \u6865\u63A5\uFF08\u9ED8\u8BA4\u7AEF\u53E3 9885\uFF09\u3002",
    capabilities: ["Workbench Project Orchestration", "Mechanical Static/Modal Setup", "Result Mesh Export"],
    iconFile: "ansys-workbench.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/Ansys/Workbench MCP",
      bundledDir: "ansys-workbench"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py"]
    },
    buildEnv: ({ homeDir, sourceDir }) => ({
      PYTHONUNBUFFERED: "1",
      WORKBENCH_MCP_ROOT: sourceDir,
      WORKBENCH_MCP_QUEUE_ROOT: join(homeDir, "results", "ansys-workbench", "queue"),
      WORKBENCH_MCP_HOST: "127.0.0.1",
      WORKBENCH_MCP_PORT: "9885",
      MECHANICAL_HOST: "127.0.0.1",
      MECHANICAL_PORT: "18765",
      ANSYS_MCP_JOBS_DIR: join(homeDir, "results", "ansys-workbench")
    })
  },
  {
    id: "ansys-fluent",
    title: "Ansys Fluent",
    titleZh: "Ansys Fluent",
    category: "cae",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/Ansys/Fluent%20MCP`,
    prerequisitesEn: "Licensed Ansys Fluent with PyFluent connectivity.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Ansys Fluent \u5E76\u652F\u6301 PyFluent \u8FDE\u63A5\u3002",
    capabilities: ["CFD Meshing & Solver Setup", "Boundary Conditions", "Residual & Report Monitoring"],
    iconFile: "ansys-fluent.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/Ansys/Fluent MCP",
      bundledDir: "ansys-fluent"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py"]
    },
    buildEnv: ({ homeDir, discoveredExecutable }) => ({
      PYTHONUNBUFFERED: "1",
      FLUENT_MCP_JOBS_DIR: join(homeDir, "results", "ansys-fluent"),
      ...executableEnv("FLUENT_EXE", discoveredExecutable)
    })
  },
  {
    id: "ansys-aedt",
    title: "Ansys Electronics Desktop",
    titleZh: "Ansys Electronics Desktop (AEDT)",
    category: "cae",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/Ansys/AEDT%20MCP`,
    prerequisitesEn: "Licensed Ansys Electronics Desktop (HFSS / Maxwell / Icepak / Q3D) with PyAEDT support.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Ansys Electronics Desktop\uFF08HFSS / Maxwell / Icepak \u7B49\uFF09\u53CA PyAEDT \u517C\u5BB9\u73AF\u5883\u3002",
    capabilities: ["HFSS / Maxwell / Icepak Automation", "S-Parameter & Field Sweeps", "Project Inspection"],
    iconFile: "ansys-aedt.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/Ansys/AEDT MCP",
      bundledDir: "ansys-aedt"
    },
    launch: {
      kind: "python-script",
      scripts: ["mcp_server.py"]
    },
    buildEnv: ({ discoveredExecutable }) => ({
      PYTHONUNBUFFERED: "1",
      AEDT_WORKER_TIMEOUT: "60",
      AEDT_LAUNCH_TIMEOUT: "120",
      ...executableEnv("AEDT_INSTALL_DIR", discoveredExecutable, dirname)
    })
  },
  {
    id: "comsol",
    title: "COMSOL Multiphysics",
    titleZh: "COMSOL Multiphysics",
    category: "cae",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/COMSOL`,
    prerequisitesEn: "Licensed COMSOL Multiphysics with Java / MPh server bridge available.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 COMSOL Multiphysics \u53CA\u5BF9\u5E94\u7684 Java/MPh \u6865\u63A5\u73AF\u5883\u3002",
    capabilities: ["Multiphysics Geometry & Physics Setup", "Study Execution", "Field & Table Export"],
    iconFile: "comsol.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/COMSOL",
      bundledDir: "comsol"
    },
    launch: {
      kind: "python-script",
      scripts: ["mcp_server.py"]
    },
    buildEnv: ({ homeDir, discoveredExecutable }) => ({
      PYTHONUNBUFFERED: "1",
      COMSOL_MCP_RUNS_DIR: join(homeDir, "results", "comsol"),
      ...executableEnv("COMSOL_ROOT", discoveredExecutable, comsolRootFromExecutable)
    })
  },
  {
    id: "cst",
    title: "CST Studio Suite",
    titleZh: "CST Studio Suite",
    category: "cae",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/CST`,
    prerequisitesEn: "Licensed CST Studio Suite on Windows with compatible Python automation bridge.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Windows CST Studio Suite \u4E0E\u517C\u5BB9\u7684 Python \u81EA\u52A8\u5316\u73AF\u5883\u3002",
    capabilities: ["Antenna & EM Structure Modeling", "Time/Frequency Domain Solver", "S-Parameter & Farfield Results"],
    iconFile: "cst.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/CST",
      bundledDir: "cst"
    },
    launch: {
      kind: "python-script",
      scripts: ["mcp_server.py"]
    },
    buildEnv: ({ discoveredExecutable }) => ({
      PYTHONUNBUFFERED: "1",
      ...executableEnv("CST_DESIGN_ENVIRONMENT_EXE", discoveredExecutable)
    })
  },
  {
    id: "ansa",
    title: "BETA CAE ANSA",
    titleZh: "BETA CAE ANSA",
    category: "cae",
    runtime: "python",
    platformWindowsOnly: false,
    sourceUrl: `${CAE_REPO}/ANSA`,
    prerequisitesEn: "Licensed BETA CAE ANSA with compatible ANSA plugin/bridge.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 BETA CAE ANSA \u53CA\u5BF9\u5E94\u7248\u672C\u7684 ANSA \u6865\u63A5\u63D2\u4EF6\u3002",
    capabilities: ["CAD Cleanup & Mid-Surfacing", "Shell / Volume Meshing", "Solver Deck Export"],
    iconFile: "ansa.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/ANSA",
      bundledDir: "ansa"
    },
    launch: {
      kind: "python-module",
      module: "ansa_mcp",
      checkFile: "src/ansa_mcp/__main__.py",
      pythonPathSubdir: "src"
    },
    buildEnv: ({ discoveredExecutable }) => ({
      PYTHONUNBUFFERED: "1",
      ...executableEnv("ANSA_EXECUTABLE", discoveredExecutable)
    })
  },
  {
    id: "calculix",
    title: "CalculiX",
    titleZh: "CalculiX (\u5F00\u6E90\u6709\u9650\u5143)",
    category: "cae",
    runtime: "python",
    platformWindowsOnly: false,
    sourceUrl: `${CAE_REPO}/CalculiX`,
    prerequisitesEn: "Installed CalculiX solver binary (ccx / ccx.exe) on PATH or configured via CCX_EXE.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u5F00\u6E90 CalculiX \u6C42\u89E3\u5668\uFF08ccx / ccx.exe\uFF09\u5E76\u52A0\u5165 PATH \u6216\u914D\u7F6E CCX_EXE\u3002",
    capabilities: ["Abaqus-Compatible .inp Solving", "Static / Modal / Thermal Analysis", "FRD Result Parsing"],
    iconFile: null,
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/CalculiX",
      bundledDir: "calculix"
    },
    launch: {
      kind: "python-script",
      scripts: ["mcp_server.py"]
    },
    buildEnv: ({ discoveredExecutable }) => ({
      PYTHONUNBUFFERED: "1",
      ...executableEnv("CCX_EXE", discoveredExecutable)
    })
  },
  // ── EDA Edition (3) ───────────────────────────────────────────────────────
  {
    id: "easyeda-pro",
    title: "EasyEDA Pro (JLC EDA)",
    titleZh: "\u5609\u7ACB\u521BEDA \u4E13\u4E1A\u7248 (EasyEDA Pro)",
    category: "eda",
    runtime: "node",
    platformWindowsOnly: false,
    sourceUrl: `${EDA_REPO}/easyeda-agent`,
    prerequisitesEn: "EasyEDA Pro desktop client and the easyeda bridge CLI (on PATH or configured via EASYEDA_BIN).",
    prerequisitesZh: "\u9700\u5B89\u88C5\u5609\u7ACB\u521BEDA \u4E13\u4E1A\u7248\u684C\u9762\u7AEF\u53CA easyeda CLI \u6865\u63A5\u7A0B\u5E8F\uFF08\u5728 PATH \u6216\u901A\u8FC7 EASYEDA_BIN \u6307\u5B9A\uFF09\u3002",
    capabilities: ["Schematic & PCB Reading/Editing", "Component Placement & Netlist", "BOM / Gerber Workflow"],
    iconFile: "easyeda-pro.png",
    source: {
      repo: "EDA-Agent-Hub",
      repoSubpath: "MCP/easyeda-agent",
      bundledDir: "easyeda-pro"
    },
    launch: {
      kind: "node-script",
      entryScript: "mcp/src/server.mjs",
      packageDir: "mcp"
    },
    buildEnv: () => ({
      EASYEDA_BIN: process.env.EASYEDA_BIN || "easyeda"
    })
  },
  {
    id: "kicad",
    title: "KiCad",
    titleZh: "KiCad",
    category: "eda",
    runtime: "node",
    platformWindowsOnly: false,
    sourceUrl: `${CAE_REPO}/KiCAD-MCP-Server`,
    prerequisitesEn: "KiCad 8/9 installation with bundled Python pcbnew module and Node.js >= 20.",
    prerequisitesZh: "\u9700\u5B89\u88C5 KiCad 8/9\uFF08\u542B\u5185\u7F6E Python pcbnew \u6A21\u5757\uFF09\u4E0E Node.js >= 20\u3002",
    capabilities: ["PCB Layout & Routing Automation", "Footprint & JLCPCB Library Search", "DRC & Fabrication Export"],
    iconFile: "kicad.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/KiCAD-MCP-Server",
      bundledDir: "kicad"
    },
    launch: {
      kind: "node-script",
      entryScript: "dist/index.js",
      buildCommand: ["npm", "run", "build"]
    },
    buildEnv: ({ discoveredExecutable }) => ({
      ...executableEnv("KICAD_EXE", discoveredExecutable)
    })
  },
  {
    id: "ads",
    title: "Keysight ADS",
    titleZh: "Keysight ADS (\u5148\u8FDB\u8BBE\u8BA1\u7CFB\u7EDF)",
    category: "eda",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${EDA_REPO}/ADS`,
    bridgePort: 48326,
    requiresBridgeTokenConfig: true,
    prerequisitesEn: "Licensed Keysight Advanced Design System (ADS) with the ADS MCP Addon reading the shared bridge_config.json token on 127.0.0.1:48326.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Keysight ADS \u5E76\u52A0\u8F7D ADS Addon \u63D2\u4EF6\uFF0C\u4E0E\u672C\u8FDE\u63A5\u5668\u5171\u4EAB bridge_config.json \u4EE4\u724C\uFF08\u7AEF\u53E3 48326\uFF09\u3002",
    capabilities: ["RF/Microwave Schematic & Layout", "S-Parameter / Harmonic Balance / Momentum", "Workspace & Dataset Inspection"],
    iconFile: null,
    source: {
      repo: "EDA-Agent-Hub",
      repoSubpath: "MCP/ADS",
      bundledDir: "ads"
    },
    launch: {
      kind: "python-module",
      module: "ads_mcp",
      checkFile: "src/ads_mcp/server.py",
      pythonPathSubdir: "src"
    },
    buildEnv: ({ homeDir, discoveredExecutable, runtimeConfigPath }) => ({
      PYTHONUNBUFFERED: "1",
      PYTHONUTF8: "1",
      ...executableEnv("ADS_INSTALL_ROOT", discoveredExecutable, adsRootFromExecutable),
      ...runtimeConfigPath ? { ADS_MCP_BRIDGE_CONFIG: runtimeConfigPath } : { ADS_MCP_BRIDGE_CONFIG: join(homeDir, "runtimes", "ads", "bridge_config.json") }
    })
  }
];
function adapterById(id) {
  return SOFTWARE_CATALOG.find((item) => item.id === id);
}
function adaptersForEdition(edition) {
  return SOFTWARE_CATALOG.filter((item) => editionCoversCategory(edition, item.category));
}
function isAdapterInEdition(id, edition) {
  const spec = adapterById(id);
  if (!spec)
    return false;
  return editionCoversCategory(edition, spec.category);
}

// packages/core/dist/detect.js
import { existsSync, readdirSync, statSync } from "node:fs";
import { createConnection } from "node:net";
import { win32 } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
var execFileAsync = promisify(execFile);
function isFile(filePath) {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}
function subdirectories(dirPath) {
  try {
    return readdirSync(dirPath, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => win32.join(dirPath, entry.name));
  } catch {
    return [];
  }
}
var ENV_DISCOVERY_RULES = {
  nx: {
    directKeys: [],
    rootKeys: ["UGII_BASE_DIR", "UGII_ROOT_DIR"],
    rootPatterns: [],
    relativePaths: [win32.join("NXBIN", "ugraf.exe"), "ugraf.exe"]
  },
  "ansys-workbench": {
    directKeys: [],
    rootKeys: ["ANSYS_ROOT"],
    rootPatterns: [/^AWP_ROOT\d+$/i],
    relativePaths: [win32.join("Framework", "bin", "Win64", "RunWB2.exe")]
  },
  "ansys-fluent": {
    directKeys: [],
    rootKeys: ["FLUENT_ROOT", "ANSYS_ROOT"],
    rootPatterns: [/^AWP_ROOT\d+$/i],
    relativePaths: [win32.join("fluent", "ntbin", "win64", "fluent.exe"), win32.join("ntbin", "win64", "fluent.exe")]
  },
  "ansys-aedt": {
    directKeys: [],
    rootKeys: ["AEDT_INSTALL_DIR"],
    rootPatterns: [/^ANSYSEM_ROOT\d+$/i, /^AWP_ROOT\d+$/i],
    relativePaths: ["ansysedt.exe", win32.join("AnsysEM", "ansysedt.exe")]
  },
  comsol: {
    directKeys: [],
    rootKeys: ["COMSOL_ROOT", "COMSOL_HOME", "COMSOL_INSTALL_DIR"],
    rootPatterns: [],
    relativePaths: [win32.join("bin", "win64", "comsol.exe"), win32.join("bin", "win64", "comsolmphserver.exe"), "comsol.exe"]
  },
  cst: {
    directKeys: ["CST_DESIGN_ENVIRONMENT_EXE"],
    rootKeys: ["CST_INSTALL_ROOT", "CST_ROOT", "CST_STUDIO_ROOT"],
    rootPatterns: [],
    relativePaths: [
      win32.join("AMD64", "CST DESIGN ENVIRONMENT_AMD64.exe"),
      win32.join("AMD64", "CST DESIGN ENVIRONMENT.exe"),
      "CST DESIGN ENVIRONMENT_AMD64.exe",
      "CST DESIGN ENVIRONMENT.exe"
    ]
  },
  ansa: {
    directKeys: ["ANSA_EXECUTABLE"],
    rootKeys: ["ANSA_ROOT", "BETA_CAE_ROOT"],
    rootPatterns: [],
    relativePaths: ["ansa64.bat", "ansa64.exe", "ansa.bat"]
  },
  calculix: {
    directKeys: ["CCX_EXE"],
    rootKeys: ["CALCULIX_ROOT"],
    rootPatterns: [],
    relativePaths: ["ccx.exe", win32.join("bin", "ccx.exe")]
  },
  kicad: {
    directKeys: ["KICAD_EXE"],
    rootKeys: ["KICAD_PATH", "KICAD_ROOT"],
    rootPatterns: [],
    relativePaths: [win32.join("bin", "kicad.exe"), "kicad.exe"]
  },
  "easyeda-pro": {
    directKeys: ["EASYEDA_PRO_EXE", "EASYEDA_BIN"],
    rootKeys: ["EASYEDA_PRO_ROOT"],
    rootPatterns: [],
    relativePaths: ["lceda-pro.exe", "easyeda.exe"]
  },
  ads: {
    directKeys: ["ADS_EXE"],
    rootKeys: ["ADS_INSTALL_ROOT", "HPEESOF_DIR"],
    rootPatterns: [],
    relativePaths: [win32.join("bin", "ads.exe"), win32.join("bin", "hpeesofde.exe")]
  }
};
function environmentCandidates(id, env) {
  const rule = ENV_DISCOVERY_RULES[id];
  if (!rule)
    return [];
  const direct = rule.directKeys.flatMap((key) => {
    const value = env[key];
    return value ? [value] : [];
  });
  const patternRoots = Object.entries(env).filter(([key]) => rule.rootPatterns.some((pattern) => pattern.test(key))).map(([, value]) => value);
  const roots = [...rule.rootKeys.map((key) => env[key]), ...patternRoots];
  const expanded = roots.flatMap((root) => root ? rule.relativePaths.map((rel) => win32.join(root, rel)) : []);
  return [...direct, ...expanded];
}
function defaultWindowsDrives() {
  return Array.from({ length: 24 }, (_, i) => `${String.fromCharCode(67 + i)}:\\`).filter(existsSync);
}
function ansysVersionRoots(drive) {
  const parents = [
    win32.join(drive, "Program Files", "ANSYS Inc"),
    win32.join(drive, "ANSYS Inc"),
    ...subdirectories(drive).filter((dir) => /[\\/]ansys[^\\/]*$/i.test(dir)).map((dir) => win32.join(dir, "ANSYS Inc"))
  ];
  return parents.flatMap(subdirectories);
}
function standardWindowsCandidates(id, drives = defaultWindowsDrives()) {
  return drives.flatMap((drive) => {
    const programs = win32.join(drive, "Program Files");
    switch (id) {
      case "solidworks":
        return ["SOLIDWORKS Corp", "SolidWorks Corp"].map((vendor) => win32.join(programs, vendor, "SOLIDWORKS", "SLDWORKS.exe"));
      case "catia":
        return subdirectories(win32.join(programs, "Dassault Systemes")).map((root) => win32.join(root, "win_b64", "code", "bin", "CNEXT.exe"));
      case "nx":
        return subdirectories(win32.join(programs, "Siemens")).map((root) => win32.join(root, "NXBIN", "ugraf.exe"));
      case "abaqus":
        return [win32.join(drive, "SIMULIA", "Commands", "abaqus.bat")];
      case "ansys-workbench":
        return ansysVersionRoots(drive).map((root) => win32.join(root, "Framework", "bin", "Win64", "RunWB2.exe"));
      case "ansys-fluent":
        return ansysVersionRoots(drive).map((root) => win32.join(root, "fluent", "ntbin", "win64", "fluent.exe"));
      case "ansys-aedt":
        return ansysVersionRoots(drive).flatMap((root) => [
          win32.join(root, "AnsysEM", "ansysedt.exe"),
          win32.join(root, "Win64", "ansysedt.exe")
        ]);
      case "cst":
        return [programs, win32.join(drive, "Program Files (x86)"), win32.join(programs, "Dassault Systemes")].flatMap(subdirectories).filter((dir) => /cst/i.test(dir)).flatMap((root) => [
          win32.join(root, "AMD64", "CST DESIGN ENVIRONMENT_AMD64.exe"),
          win32.join(root, "AMD64", "CST DESIGN ENVIRONMENT.exe")
        ]);
      case "comsol":
        return [win32.join(programs, "COMSOL"), win32.join(drive, "COMSOL")].flatMap(subdirectories).flatMap((root) => [
          win32.join(root, "Multiphysics", "bin", "win64", "comsol.exe"),
          win32.join(root, "Multiphysics", "bin", "win64", "comsolmphserver.exe"),
          win32.join(root, "bin", "win64", "comsol.exe")
        ]);
      case "ansa":
        return [win32.join(programs, "BETA_CAE_Systems"), win32.join(drive, "BETA_CAE_Systems")].flatMap(subdirectories).flatMap((root) => [win32.join(root, "ansa64.bat"), win32.join(root, "ansa64.exe")]);
      case "calculix":
        return [
          win32.join(drive, "CalculiX", "ccx.exe"),
          win32.join(programs, "CalculiX", "ccx.exe"),
          win32.join(programs, "bConverged", "CalculiX", "ccx", "ccx.exe")
        ];
      case "kicad":
        return subdirectories(win32.join(programs, "KiCad")).map((root) => win32.join(root, "bin", "kicad.exe"));
      case "easyeda-pro":
        return [
          win32.join(programs, "lceda-pro", "lceda-pro.exe"),
          win32.join(programs, "EasyEDA Pro", "lceda-pro.exe")
        ];
      case "ads":
        return [win32.join(programs, "Keysight"), win32.join(drive, "Keysight")].flatMap(subdirectories).filter((dir) => /ads/i.test(dir)).flatMap((root) => [win32.join(root, "bin", "ads.exe"), win32.join(root, "bin", "hpeesofde.exe")]);
    }
  });
}
var PATH_COMMANDS = {
  solidworks: "SLDWORKS.exe",
  catia: "CNEXT.exe",
  nx: "ugraf.exe",
  abaqus: "abaqus",
  "ansys-workbench": "RunWB2.exe",
  "ansys-fluent": "fluent.exe",
  "ansys-aedt": "ansysedt.exe",
  comsol: "comsol.exe",
  cst: "CST DESIGN ENVIRONMENT_AMD64.exe",
  ansa: "ansa64.bat",
  calculix: "ccx",
  kicad: "kicad.exe",
  "easyeda-pro": "lceda-pro.exe",
  ads: "ads.exe"
};
async function detectSoftwareExecutable(id, explicitPath, timeoutMs = 5e3) {
  if (explicitPath) {
    return { installed: isFile(explicitPath), detail: explicitPath };
  }
  const candidates = environmentCandidates(id, process.env);
  const command = PATH_COMMANDS[id];
  const locator = process.platform === "win32" ? "where.exe" : "which";
  const posixCommand = command.replace(/\.(exe|bat)$/i, "");
  try {
    const { stdout } = await execFileAsync(locator, [process.platform === "win32" ? command : posixCommand], {
      windowsHide: true,
      timeout: timeoutMs
    });
    candidates.push(...stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
  } catch {
  }
  if (process.platform === "win32") {
    candidates.push(...standardWindowsCandidates(id));
  }
  const matched = candidates.find(isFile);
  return matched ? { installed: true, detail: matched } : { installed: false, detail: "Not auto-detected; specify an executable path or install the vendor software." };
}
function probeTcpPort(port, host = "127.0.0.1", timeoutMs = 800) {
  return new Promise((resolve2) => {
    const socket = createConnection({ host, port });
    const done = (ok) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve2(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

// packages/core/dist/archive.js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname as dirname2, resolve } from "node:path";
import { createGunzip } from "node:zlib";
var TAR_BLOCK_BYTES = 512;
function readTarString(block, start, length) {
  let end = start;
  const limit = start + length;
  while (end < limit && block[end] !== 0)
    end += 1;
  return Buffer.from(block.subarray(start, end)).toString("utf8");
}
function isZeroBlock(block) {
  for (let i = 0; i < block.length; i += 1) {
    if (block[i] !== 0)
      return false;
  }
  return true;
}
function parsePaxPath(payload) {
  const text = Buffer.from(payload).toString("utf8");
  let cursor = 0;
  while (cursor < text.length) {
    const space = text.indexOf(" ", cursor);
    if (space <= cursor)
      break;
    const length = Number.parseInt(text.slice(cursor, space), 10);
    if (!Number.isFinite(length) || length <= space - cursor + 1 || cursor + length > text.length)
      break;
    const record = text.slice(space + 1, cursor + length - 1);
    cursor += length;
    if (record.startsWith("path="))
      return record.slice(5);
  }
  return void 0;
}
function findUnquotedChar(text, target) {
  let quote = null;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote === null) {
      if (ch === target)
        return i;
      if (ch === '"' || ch === "'")
        quote = ch;
    } else if (ch === "\\" && quote === '"') {
      i += 1;
    } else if (ch === quote) {
      quote = null;
    }
  }
  return -1;
}
function stripTomlComment(line) {
  const hash = findUnquotedChar(line, "#");
  return hash >= 0 ? line.slice(0, hash) : line;
}
function parseQuotedArrayItems(body) {
  const items = [];
  let index = 0;
  while (index < body.length) {
    const ch = body[index];
    if (ch !== '"' && ch !== "'") {
      index += 1;
      continue;
    }
    const quote = ch;
    index += 1;
    let value = "";
    while (index < body.length && body[index] !== quote) {
      if (quote === '"' && body[index] === "\\" && index + 1 < body.length) {
        index += 1;
      }
      value += body.charAt(index);
      index += 1;
    }
    index += 1;
    const trimmed = value.trim();
    if (trimmed !== "")
      items.push(trimmed);
  }
  return items;
}
function parsePyprojectDependencies(tomlText) {
  let inProject = false;
  let arrayChunk = "";
  let collecting = false;
  for (const rawLine of tomlText.split(/\r?\n/u)) {
    const line = stripTomlComment(rawLine).trim();
    if (line === "")
      continue;
    if (!collecting && line.startsWith("[") && line.endsWith("]")) {
      inProject = line.slice(1, -1).trim() === "project";
      continue;
    }
    if (!inProject)
      continue;
    if (!collecting) {
      if (!/^dependencies\s*=\s*\[/u.test(line))
        continue;
      collecting = true;
      arrayChunk = line.slice(line.indexOf("[") + 1);
    } else {
      arrayChunk += `
${line}`;
    }
    const closeIndex = findUnquotedChar(arrayChunk, "]");
    if (closeIndex >= 0) {
      return parseQuotedArrayItems(arrayChunk.slice(0, closeIndex));
    }
  }
  return [];
}
async function extractTarGzStreamSubpath(compressedStream, subpath, destinationDir, options) {
  const normalizedSubpath = subpath.replace(/^\/+|\/+$/gu, "");
  const destRoot = resolve(destinationDir);
  const rawReader = compressedStream.getReader();
  const gunzip = createGunzip();
  const decompressedQueue = [];
  gunzip.on("data", (chunk) => {
    decompressedQueue.push(chunk);
  });
  const pumpGunzip = (chunk) => new Promise((resolvePump, rejectPump) => {
    const onError = (err) => {
      rejectPump(err);
    };
    gunzip.once("error", onError);
    const done = () => {
      gunzip.off("error", onError);
      resolvePump();
    };
    if (chunk === null)
      gunzip.end(done);
    else
      gunzip.write(chunk, done);
  });
  let compressedBytes = 0;
  let decompressedBytes = 0;
  let buffer = Buffer.alloc(0);
  let skipBytes = 0;
  let nextPaxPath;
  let pending;
  let written = 0;
  let finishedEarly = false;
  const processDecompressedQueue = async () => {
    while (!finishedEarly) {
      const nextChunk = decompressedQueue.shift();
      if (nextChunk === void 0)
        break;
      decompressedBytes += nextChunk.byteLength;
      if (decompressedBytes > options.maxExtractedBytes) {
        finishedEarly = true;
        throw new Error(`Archive uncompressed size exceeded ${String(options.maxExtractedBytes)} bytes.`);
      }
      let incoming = nextChunk;
      if (skipBytes > 0) {
        const drop = Math.min(skipBytes, incoming.byteLength);
        skipBytes -= drop;
        if (drop === incoming.byteLength)
          continue;
        incoming = incoming.subarray(drop);
      }
      buffer = buffer.length === 0 ? Buffer.from(incoming) : Buffer.concat([buffer, incoming]);
      const skipPayload = (paddedSize) => {
        const drop = Math.min(paddedSize, buffer.length);
        buffer = buffer.subarray(drop);
        skipBytes = paddedSize - drop;
      };
      for (; ; ) {
        if (skipBytes > 0)
          break;
        if (pending !== void 0) {
          if (buffer.length < pending.paddedSize)
            break;
          const payload = buffer.subarray(0, pending.size);
          buffer = buffer.subarray(pending.paddedSize);
          const current = pending;
          pending = void 0;
          if (current.kind === "pax") {
            nextPaxPath = parsePaxPath(payload);
          } else {
            await mkdir(dirname2(current.targetPath), { recursive: true });
            await writeFile(current.targetPath, payload);
            written += 1;
          }
          continue;
        }
        if (buffer.length < TAR_BLOCK_BYTES)
          break;
        const header = buffer.subarray(0, TAR_BLOCK_BYTES);
        buffer = buffer.subarray(TAR_BLOCK_BYTES);
        if (isZeroBlock(header)) {
          finishedEarly = true;
          break;
        }
        const sizeText = readTarString(header, 124, 12).trim();
        const size = sizeText === "" ? 0 : Number.parseInt(sizeText, 8);
        if (!Number.isFinite(size) || size < 0) {
          throw new Error("Archive entry size is invalid or truncated.");
        }
        const paddedSize = Math.ceil(size / TAR_BLOCK_BYTES) * TAR_BLOCK_BYTES;
        const typeFlag = header.readUInt8(156);
        if (typeFlag === 120) {
          pending = { kind: "pax", size, paddedSize };
          continue;
        }
        if (typeFlag === 103) {
          skipPayload(paddedSize);
          continue;
        }
        const prefix = readTarString(header, 345, 155);
        const headerName = readTarString(header, 0, 100);
        const rawEntryPath = nextPaxPath ?? (prefix === "" ? headerName : `${prefix}/${headerName}`);
        nextPaxPath = void 0;
        const slash = rawEntryPath.indexOf("/");
        const repoRelative = slash > 0 ? rawEntryPath.slice(slash + 1).replace(/\/+$/gu, "") : "";
        const inTargetSubtree = slash > 0 && (repoRelative === normalizedSubpath || repoRelative.startsWith(`${normalizedSubpath}/`));
        if (!inTargetSubtree) {
          if (written > 0) {
            finishedEarly = true;
            break;
          }
          skipPayload(paddedSize);
          continue;
        }
        if (typeFlag === 49 || typeFlag === 50) {
          throw new Error(`Archive link entry refused: ${repoRelative}`);
        }
        if (typeFlag !== 0 && typeFlag !== 48) {
          skipPayload(paddedSize);
          continue;
        }
        const innerRelative = repoRelative.slice(normalizedSubpath.length).replace(/^\/+/gu, "");
        if (innerRelative === "" || innerRelative.includes("\\") || innerRelative.includes(":") || innerRelative.split("/").some((segment) => segment === "" || segment === "." || segment === "..")) {
          throw new Error(`Archive path escapes target directory: ${repoRelative}`);
        }
        pending = { kind: "file", targetPath: resolve(destRoot, innerRelative), size, paddedSize };
      }
    }
  };
  let upstreamEnded = false;
  try {
    while (!finishedEarly) {
      options.signal?.throwIfAborted();
      const next = await rawReader.read();
      if (next.done) {
        upstreamEnded = true;
        await pumpGunzip(null);
        await processDecompressedQueue();
        break;
      }
      compressedBytes += next.value.byteLength;
      if (compressedBytes > options.maxCompressedBytes) {
        throw new Error(`Archive download exceeded ${String(options.maxCompressedBytes)} bytes.`);
      }
      await pumpGunzip(next.value);
      await processDecompressedQueue();
    }
    if (pending !== void 0 || skipBytes > 0) {
      throw new Error("Archive entry size is invalid or truncated.");
    }
    return written;
  } finally {
    gunzip.destroy();
    if (!upstreamEnded) {
      await rawReader.cancel();
    }
    rawReader.releaseLock();
  }
}
var FASTMCP_V1_IMPORT = /\bmcp\.server\.fastmcp\b/;
var MCP_REQUIREMENT_PREFIX = /^mcp(?:\[[^\]]*\])?(?:$|[\s<>=!~])/i;
var MCP_BOUNDED_OR_PINNED = /(?:==|~=|<)/;
function constrainFastMcpDependencies(dependencies, pythonSources) {
  if (!pythonSources.some((source) => FASTMCP_V1_IMPORT.test(source)))
    return [...dependencies];
  return dependencies.map((spec) => {
    const trimmed = spec.trim();
    const semi = trimmed.indexOf(";");
    const req = (semi === -1 ? trimmed : trimmed.slice(0, semi)).trimEnd();
    if (!MCP_REQUIREMENT_PREFIX.test(req))
      return spec;
    if (MCP_BOUNDED_OR_PINNED.test(req))
      return spec;
    const bounded = /[<>=!~]/.test(req) ? `${req},<2` : `${req}<2`;
    return semi === -1 ? bounded : `${bounded}${trimmed.slice(semi)}`;
  });
}

// packages/core/dist/license.js
import { createHash, generateKeyPairSync, sign, verify } from "node:crypto";
import { existsSync as existsSync2, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { cpus, hostname, networkInterfaces, platform, arch } from "node:os";
import { dirname as dirname3, join as join2 } from "node:path";
var LICENSE_PREFIX = "EA1";
function computeMachineFingerprint() {
  const macs = [];
  const nets = networkInterfaces();
  for (const entries of Object.values(nets)) {
    for (const entry of entries ?? []) {
      if (!entry.internal && entry.mac && entry.mac !== "00:00:00:00:00:00") {
        macs.push(entry.mac.toLowerCase());
      }
    }
  }
  macs.sort();
  const cpuModel = cpus()[0]?.model ?? "unknown-cpu";
  const raw = [hostname().toLowerCase(), platform(), arch(), cpuModel, macs[0] ?? "no-mac"].join("|");
  return createHash("sha256").update(raw).digest("hex").slice(0, 16).toUpperCase();
}
function verifyLicense(rawLicenseKey, publicKeyPem, options = {}) {
  const trimmed = rawLicenseKey?.trim() ?? "";
  if (!trimmed) {
    return { valid: false, code: "missing", message: "No license key is configured. Activate a valid EngiAxis Connector license key." };
  }
  if (!publicKeyPem || !publicKeyPem.includes("BEGIN PUBLIC KEY")) {
    return { valid: false, code: "missing-public-key", message: "Connector public verification key is missing." };
  }
  const parts = trimmed.split(".");
  if (parts.length !== 3 || parts[0] !== LICENSE_PREFIX) {
    return { valid: false, code: "malformed", message: "License key format is invalid (expected EA1.<payload>.<signature>)." };
  }
  const [, payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) {
    return { valid: false, code: "malformed", message: "License key is incomplete." };
  }
  let signatureValid = false;
  try {
    const signingInput = Buffer.from(`${LICENSE_PREFIX}.${payloadB64}`, "utf8");
    const signature = Buffer.from(sigB64, "base64url");
    signatureValid = verify(null, signingInput, publicKeyPem, signature);
  } catch {
    signatureValid = false;
  }
  if (!signatureValid) {
    return { valid: false, code: "invalid-signature", message: "License signature verification failed." };
  }
  let parsed;
  try {
    parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return { valid: false, code: "invalid-payload", message: "License payload JSON is corrupted." };
  }
  if (!parsed || typeof parsed !== "object") {
    return { valid: false, code: "invalid-payload", message: "License payload is not an object." };
  }
  const record = parsed;
  if (record.v !== 1 || typeof record.id !== "string" || record.id.trim() === "" || typeof record.edition !== "string" || !isEditionId(record.edition) || typeof record.customer !== "string" || record.customer.trim() === "" || typeof record.issuedAt !== "string" || record.expiresAt !== null && typeof record.expiresAt !== "string" || record.machine !== null && typeof record.machine !== "string") {
    return { valid: false, code: "invalid-payload", message: "License payload fields are invalid." };
  }
  const payload = {
    v: 1,
    id: record.id,
    edition: record.edition,
    customer: record.customer,
    issuedAt: record.issuedAt,
    expiresAt: record.expiresAt,
    machine: record.machine,
    ...typeof record.seats === "number" ? { seats: record.seats } : {}
  };
  const now = options.now ?? /* @__PURE__ */ new Date();
  if (payload.expiresAt !== null) {
    const expiryMs = Date.parse(payload.expiresAt);
    if (!Number.isFinite(expiryMs) || now.getTime() > expiryMs) {
      return { valid: false, code: "expired", message: `License ${payload.id} expired on ${payload.expiresAt}.` };
    }
  }
  if (payload.machine !== null) {
    const currentMachine = (options.machineFingerprint ?? computeMachineFingerprint()).toUpperCase();
    if (payload.machine.toUpperCase() !== currentMachine) {
      return {
        valid: false,
        code: "machine-mismatch",
        message: `License ${payload.id} is bound to machine ${payload.machine}, but this machine is ${currentMachine}.`
      };
    }
  }
  return { valid: true, payload };
}
function checkAdapterAuthorization(adapterId, installedEdition, rawLicenseKey, publicKeyPem, options = {}) {
  const adapter = adapterById(adapterId);
  if (!adapter || !isAdapterInEdition(adapterId, installedEdition)) {
    return {
      valid: false,
      code: "sku-not-included",
      message: `Adapter "${adapterId}" is not included in the installed ${installedEdition.toUpperCase()} edition package.`
    };
  }
  if (options.allowDevBypass && process.env.ENGIAXIS_DEV_BYPASS_LICENSE === "1") {
    return {
      valid: true,
      payload: {
        v: 1,
        id: "DEV-BYPASS",
        edition: installedEdition,
        customer: "Developer Mode",
        issuedAt: (/* @__PURE__ */ new Date(0)).toISOString(),
        expiresAt: null,
        machine: null
      }
    };
  }
  const verified = verifyLicense(rawLicenseKey, publicKeyPem, options);
  if (!verified.valid)
    return verified;
  if (!editionCoversCategory(verified.payload.edition, adapter.category)) {
    return {
      valid: false,
      code: "edition-not-covered",
      message: `License ${verified.payload.id} (${verified.payload.edition.toUpperCase()}) does not authorize ${adapter.category.toUpperCase()} software (${adapter.title}).`
    };
  }
  return verified;
}
function licenseFilePath(homeDir) {
  return join2(homeDir, "license.key");
}
function resolveActiveLicenseKey(homeDir) {
  const fromEnv = process.env.ENGIAXIS_LICENSE_KEY?.trim();
  if (fromEnv)
    return fromEnv;
  const filePath = licenseFilePath(homeDir);
  if (existsSync2(filePath)) {
    const content = readFileSync(filePath, "utf8").trim();
    if (content)
      return content;
  }
  return void 0;
}
function saveStoredLicenseKey(homeDir, licenseKey) {
  const filePath = licenseFilePath(homeDir);
  mkdirSync(dirname3(filePath), { recursive: true });
  writeFileSync(filePath, `${licenseKey.trim()}
`, "utf8");
  return filePath;
}

// packages/core/dist/activation.js
import { existsSync as existsSync4, readFileSync as readFileSync3 } from "node:fs";
import { hostname as hostname2 } from "node:os";
import { dirname as dirname5, join as join4 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";

// packages/core/dist/public-key.js
import { existsSync as existsSync3, readFileSync as readFileSync2 } from "node:fs";
import { dirname as dirname4, join as join3 } from "node:path";
import { fileURLToPath } from "node:url";
var BUNDLED_PUBLIC_KEY_PEM = "";
function resolvePublicKeyPem(extraSearchDirs = []) {
  const fromEnv = process.env.ENGIAXIS_PUBLIC_KEY_PEM?.trim();
  if (fromEnv && fromEnv.includes("BEGIN PUBLIC KEY"))
    return fromEnv;
  const envPath = process.env.ENGIAXIS_PUBLIC_KEY_PATH?.trim();
  if (envPath && existsSync3(envPath)) {
    const content = readFileSync2(envPath, "utf8").trim();
    if (content.includes("BEGIN PUBLIC KEY"))
      return content;
  }
  const moduleDir = dirname4(fileURLToPath(import.meta.url));
  const searchDirs = [
    ...extraSearchDirs,
    moduleDir,
    dirname4(moduleDir),
    join3(dirname4(moduleDir), "runtime"),
    process.cwd()
  ];
  for (const dir of searchDirs) {
    const candidate = join3(dir, "public-key.pem");
    if (existsSync3(candidate)) {
      const content = readFileSync2(candidate, "utf8").trim();
      if (content.includes("BEGIN PUBLIC KEY"))
        return content;
    }
  }
  if (BUNDLED_PUBLIC_KEY_PEM.includes("BEGIN PUBLIC KEY")) {
    return BUNDLED_PUBLIC_KEY_PEM;
  }
  return void 0;
}

// packages/core/dist/activation.js
var DEFAULT_ACTIVATION_API_URL = "";
var REDEEM_CODE_PATTERN = /^EA-(CAD|CAE|EDA|SUITE)-([23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4})-([23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4})-([23456789ABCDEFGHJKMNPQRSTUVWXYZ]{4})$/;
function normalizeRedeemCode(raw) {
  return raw.trim().toUpperCase().replace(/[\s_]+/g, "-");
}
function isShortRedeemCode(raw) {
  if (!raw)
    return false;
  return REDEEM_CODE_PATTERN.test(normalizeRedeemCode(raw));
}
function resolveActivationApiUrl(extraSearchDirs = []) {
  const fromEnv = process.env.ENGIAXIS_ACTIVATION_URL?.trim();
  if (fromEnv)
    return fromEnv.replace(/\/+$/, "");
  const moduleDir = dirname5(fileURLToPath2(import.meta.url));
  const searchDirs = [
    ...extraSearchDirs,
    moduleDir,
    dirname5(moduleDir),
    join4(dirname5(moduleDir), "runtime"),
    process.cwd()
  ];
  for (const dir of searchDirs) {
    const candidate = join4(dir, "activation-url.txt");
    if (existsSync4(candidate)) {
      const content = readFileSync3(candidate, "utf8").trim();
      if (/^https?:\/\//i.test(content)) {
        return content.replace(/\/+$/, "");
      }
    }
  }
  if (DEFAULT_ACTIVATION_API_URL && /^https?:\/\//i.test(DEFAULT_ACTIVATION_API_URL)) {
    return DEFAULT_ACTIVATION_API_URL.replace(/\/+$/, "");
  }
  return void 0;
}
async function activateLicenseInput(rawInput, options) {
  const trimmed = rawInput.trim();
  const pubKey = options.publicKeyPem ?? resolvePublicKeyPem([options.homeDir]);
  const machineFingerprint = (options.machineFingerprint ?? computeMachineFingerprint()).toUpperCase();
  if (!trimmed) {
    return {
      ok: false,
      code: "missing",
      message: "\u8BF7\u8F93\u5165\u5361\u5BC6\uFF08EA-CAD-XXXX-XXXX-XXXX\uFF09\u6216\u79BB\u7EBF\u6388\u6743\u7801\uFF08EA1.xxx\uFF09\u3002"
    };
  }
  if (isShortRedeemCode(trimmed)) {
    const code = normalizeRedeemCode(trimmed);
    const apiUrl = options.activationApiUrl?.replace(/\/+$/, "") ?? resolveActivationApiUrl([options.homeDir]);
    if (!apiUrl) {
      return {
        ok: false,
        code: "activation-url-missing",
        message: "\u672A\u914D\u7F6E\u5728\u7EBF\u5361\u5BC6\u6FC0\u6D3B\u670D\u52A1\u5730\u5740\uFF08activation-url.txt \u6216 ENGIAXIS_ACTIVATION_URL\uFF09\u3002\u8BF7\u8054\u7CFB\u5356\u5BB6\u83B7\u53D6\u5DF2\u914D\u7F6E\u6FC0\u6D3B\u670D\u52A1\u7684\u63D2\u4EF6\u5305\uFF0C\u6216\u76F4\u63A5\u8F93\u5165 EA1.xxx \u79BB\u7EBF\u6388\u6743\u7801\u3002"
      };
    }
    const fetchFn = options.fetchImpl ?? globalThis.fetch;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 15e3);
    let response;
    try {
      response = await fetchFn(`${apiUrl}/v1/activate`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          code,
          machineFingerprint,
          ...options.edition ? { edition: options.edition } : {},
          deviceName: hostname2()
        }),
        signal: controller.signal
      });
    } catch (err) {
      clearTimeout(timer);
      const detail = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        code: "network-error",
        message: `\u65E0\u6CD5\u8FDE\u63A5\u6FC0\u6D3B\u670D\u52A1\u5668\uFF08${detail}\uFF09\u3002\u8BF7\u68C0\u67E5\u7F51\u7EDC\u8FDE\u63A5\u540E\u91CD\u8BD5\u3002`
      };
    }
    clearTimeout(timer);
    let body;
    try {
      body = await response.json();
    } catch {
      return {
        ok: false,
        code: "server-error",
        message: `\u6FC0\u6D3B\u670D\u52A1\u5668\u8FD4\u56DE\u4E86\u65E0\u6548\u54CD\u5E94\uFF08HTTP ${response.status}\uFF09\u3002`
      };
    }
    if (!response.ok || body.ok !== true || typeof body.licenseKey !== "string") {
      const serverCode = typeof body.code === "string" ? body.code : "server-error";
      const serverMsg = typeof body.message === "string" ? body.message : `\u5361\u5BC6\u6FC0\u6D3B\u5931\u8D25\uFF08HTTP ${response.status}\uFF09\u3002`;
      return {
        ok: false,
        code: serverCode,
        message: serverMsg
      };
    }
    const verified2 = verifyLicense(body.licenseKey, pubKey, { machineFingerprint });
    if (!verified2.valid) {
      return {
        ok: false,
        code: verified2.code,
        message: `\u6FC0\u6D3B\u670D\u52A1\u5668\u7B7E\u53D1\u7684\u79BB\u7EBF\u8BC1\u4E66\u672C\u5730\u9A8C\u7B7E\u5931\u8D25\uFF1A${verified2.message}`
      };
    }
    const savedPath2 = saveStoredLicenseKey(options.homeDir, body.licenseKey);
    return {
      ok: true,
      mode: "redeem-code",
      savedPath: savedPath2,
      license: verified2.payload,
      ...typeof body.devicesUsed === "number" ? { devicesUsed: body.devicesUsed } : {},
      ...typeof body.maxDevices === "number" ? { maxDevices: body.maxDevices } : {}
    };
  }
  const verified = verifyLicense(trimmed, pubKey, { machineFingerprint });
  if (!verified.valid) {
    return {
      ok: false,
      code: verified.code,
      message: verified.message
    };
  }
  const savedPath = saveStoredLicenseKey(options.homeDir, trimmed);
  return {
    ok: true,
    mode: "offline",
    savedPath,
    license: verified.payload
  };
}

// packages/core/dist/mcp-probe.js
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
function terminateChild(child) {
  if (child.exitCode !== null || child.killed)
    return;
  try {
    child.stdin?.end();
  } catch {
  }
  try {
    child.kill("SIGTERM");
  } catch {
  }
  const timer = setTimeout(() => {
    if (child.exitCode === null) {
      try {
        child.kill("SIGKILL");
      } catch {
      }
    }
  }, 1500);
  timer.unref();
}
async function withMcpSession(launch, timeoutMs, action, signal) {
  const child = spawn(launch.command, [...launch.args], {
    cwd: launch.cwd,
    env: { ...process.env, ...launch.env },
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true
  });
  let stderr = "";
  const maxStderr = 16 * 1024;
  child.stderr?.on("data", (chunk) => {
    if (stderr.length < maxStderr) {
      stderr += chunk.toString("utf8").slice(0, maxStderr - stderr.length);
    }
  });
  let nextId = 1;
  const pending = /* @__PURE__ */ new Map();
  const rejectAll = (err) => {
    for (const entry of pending.values())
      entry.reject(err);
    pending.clear();
  };
  child.once("error", (err) => {
    rejectAll(err instanceof Error ? err : new Error(String(err)));
  });
  child.once("exit", (code, sig) => {
    rejectAll(new Error(`MCP server exited unexpectedly (code=${String(code)}, signal=${String(sig)}).${stderr ? ` stderr: ${stderr.trim()}` : ""}`));
  });
  const rl = createInterface({ input: child.stdout });
  rl.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{"))
      return;
    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      return;
    }
    if (typeof msg.id !== "number")
      return;
    const waiter = pending.get(msg.id);
    if (!waiter)
      return;
    pending.delete(msg.id);
    if (msg.error) {
      waiter.reject(new Error(msg.error.message || `JSON-RPC error ${String(msg.error.code ?? -1)}`));
    } else {
      waiter.resolve(msg.result ?? {});
    }
  });
  const onAbort = () => {
    rejectAll(new Error("MCP operation cancelled."));
    terminateChild(child);
  };
  signal?.addEventListener("abort", onAbort, { once: true });
  const timeoutHandle = setTimeout(() => {
    rejectAll(new Error(`MCP stdio operation timed out after ${timeoutMs}ms.`));
    terminateChild(child);
  }, timeoutMs);
  timeoutHandle.unref();
  const sendMessage = (payload) => {
    if (!child.stdin || child.stdin.destroyed) {
      throw new Error("MCP server stdin is closed.");
    }
    child.stdin.write(`${JSON.stringify(payload)}
`);
  };
  const rpc = (method, params) => {
    const id = nextId++;
    return new Promise((resolve2, reject) => {
      pending.set(id, { resolve: resolve2, reject });
      try {
        sendMessage({ jsonrpc: "2.0", id, method, ...params ? { params } : {} });
      } catch (err) {
        pending.delete(id);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  };
  const notify = (method, params) => {
    sendMessage({ jsonrpc: "2.0", method, ...params ? { params } : {} });
  };
  try {
    const value = await action(rpc, notify);
    return { ok: true, value, stderr: stderr.trim() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err), stderr: stderr.trim() };
  } finally {
    clearTimeout(timeoutHandle);
    signal?.removeEventListener("abort", onAbort);
    rl.close();
    terminateChild(child);
  }
}
async function probeMcpStdio(launch, options = {}) {
  const started = Date.now();
  const timeoutMs = options.timeoutMs ?? 25e3;
  const session = await withMcpSession(launch, timeoutMs, async (rpc, notify) => {
    const init = await rpc("initialize", {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "engiaxis-connector-probe", version: "1.0.0" }
    });
    notify("notifications/initialized");
    const listed = await rpc("tools/list", {});
    const rawTools = Array.isArray(listed.tools) ? listed.tools : [];
    const tools = rawTools.filter((t) => Boolean(t && typeof t === "object" && typeof t.name === "string")).map((t) => ({
      name: String(t.name),
      ...typeof t.description === "string" ? { description: t.description } : {},
      ...t.inputSchema && typeof t.inputSchema === "object" ? { inputSchema: t.inputSchema } : {}
    }));
    const serverInfo = init.serverInfo && typeof init.serverInfo === "object" ? init.serverInfo : {};
    return {
      serverName: typeof serverInfo.name === "string" ? serverInfo.name : void 0,
      serverVersion: typeof serverInfo.version === "string" ? serverInfo.version : void 0,
      protocolVersion: typeof init.protocolVersion === "string" ? init.protocolVersion : void 0,
      tools
    };
  }, options.signal);
  const durationMs = Date.now() - started;
  if (!session.ok) {
    return {
      ok: false,
      toolNames: [],
      tools: [],
      durationMs,
      error: session.error,
      ...session.stderr ? { stderr: session.stderr } : {}
    };
  }
  return {
    ok: session.value.tools.length > 0,
    ...session.value.serverName ? { serverName: session.value.serverName } : {},
    ...session.value.serverVersion ? { serverVersion: session.value.serverVersion } : {},
    ...session.value.protocolVersion ? { protocolVersion: session.value.protocolVersion } : {},
    toolNames: session.value.tools.map((t) => t.name),
    tools: session.value.tools,
    durationMs,
    ...session.value.tools.length === 0 ? { error: "MCP handshake succeeded without advertising any tools." } : {},
    ...session.stderr ? { stderr: session.stderr } : {}
  };
}
async function callMcpStdioTool(launch, toolName, args, options = {}) {
  const timeoutMs = options.timeoutMs ?? 6e4;
  const session = await withMcpSession(launch, timeoutMs, async (rpc, notify) => {
    await rpc("initialize", {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "engiaxis-connector-proxy", version: "1.0.0" }
    });
    notify("notifications/initialized");
    const result = await rpc("tools/call", { name: toolName, arguments: args });
    const content = Array.isArray(result.content) ? result.content : [];
    return {
      isError: result.isError === true,
      content
    };
  }, options.signal);
  if (!session.ok) {
    return { ok: false, content: [], error: session.error };
  }
  return {
    ok: !session.value.isError,
    isError: session.value.isError,
    content: session.value.content
  };
}

// packages/core/dist/provisioner.js
import { randomBytes } from "node:crypto";
import { spawn as spawn2 } from "node:child_process";
import { existsSync as existsSync5, mkdirSync as mkdirSync2, readFileSync as readFileSync4, writeFileSync as writeFileSync2 } from "node:fs";
import { cp, mkdir as mkdir2, readdir, readFile, rename, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname as dirname6, isAbsolute, join as join5 } from "node:path";
function defaultConnectorHomeDir() {
  const fromEnv = process.env.ENGIAXIS_CONNECTOR_HOME?.trim();
  if (fromEnv)
    return fromEnv;
  return join5(homedir(), ".engiaxis-connector");
}
function createDefaultConfig(overrides = {}) {
  const homeDir = overrides.homeDir ?? defaultConnectorHomeDir();
  const defaultHubRoots = [];
  if (process.env.ENGIAXIS_HUB_ROOTS) {
    defaultHubRoots.push(...process.env.ENGIAXIS_HUB_ROOTS.split(";").map((s) => s.trim()).filter(Boolean));
  }
  return {
    edition: overrides.edition ?? "suite",
    homeDir,
    bundledMcpDir: overrides.bundledMcpDir,
    hubRoots: overrides.hubRoots ?? defaultHubRoots,
    sourceArchiveBaseUrl: overrides.sourceArchiveBaseUrl ?? "https://codeload.github.com/Cai-aa",
    sourceArchiveRef: overrides.sourceArchiveRef ?? "refs/heads/main",
    sourceDownloadTimeoutMs: overrides.sourceDownloadTimeoutMs ?? 25e3,
    installTimeoutMs: overrides.installTimeoutMs ?? 3e5,
    probeTimeoutMs: overrides.probeTimeoutMs ?? 3e4,
    uvExecutable: overrides.uvExecutable ?? "uv",
    pythonCandidates: overrides.pythonCandidates ?? ["python", "py", "python3"],
    executablePaths: overrides.executablePaths,
    publicKeyPem: overrides.publicKeyPem,
    activationApiUrl: overrides.activationApiUrl,
    allowDevBypass: overrides.allowDevBypass ?? false
  };
}
function runtimePythonPath(runtimesDir, id, platform2 = process.platform) {
  return platform2 === "win32" ? join5(runtimesDir, id, "Scripts", "python.exe") : join5(runtimesDir, id, "bin", "python");
}
async function readAllPythonSources(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    if (entry.name === ".venv" || entry.name === "__pycache__" || entry.name === ".git" || entry.name === "node_modules")
      continue;
    const full = join5(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await readAllPythonSources(full));
    } else if (entry.name.endsWith(".py")) {
      out.push(await readFile(full, "utf8"));
    }
  }
  return out;
}
function runSubprocess(argv, cwd, timeoutMs, signal) {
  return new Promise((resolve2) => {
    const [cmd, ...args] = argv;
    if (!cmd) {
      resolve2({ ok: false, notFound: true, diagnostic: "Empty command." });
      return;
    }
    const child = spawn2(cmd, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
      shell: process.platform === "win32" && (cmd === "npm" || cmd === "npx")
    });
    let stdout = "";
    let stderr = "";
    const maxBytes = 64 * 1024;
    child.stdout?.on("data", (c) => {
      if (stdout.length < maxBytes)
        stdout += c.toString("utf8").slice(0, maxBytes - stdout.length);
    });
    child.stderr?.on("data", (c) => {
      if (stderr.length < maxBytes)
        stderr += c.toString("utf8").slice(0, maxBytes - stderr.length);
    });
    let settled = false;
    const finish = (res) => {
      if (settled)
        return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      resolve2(res);
    };
    const onAbort = () => {
      try {
        child.kill("SIGTERM");
      } catch {
      }
      finish({ ok: false, notFound: false, diagnostic: "Operation cancelled." });
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(() => {
      try {
        child.kill("SIGTERM");
      } catch {
      }
      finish({ ok: false, notFound: false, diagnostic: `Command timed out after ${timeoutMs}ms: ${argv.join(" ")}` });
    }, timeoutMs);
    timer.unref();
    child.once("error", (err) => {
      const code = Reflect.get(Object(err), "code");
      finish({
        ok: false,
        notFound: code === "ENOENT",
        diagnostic: err instanceof Error ? err.message : String(err)
      });
    });
    child.once("close", (code) => {
      const output = stderr.trim() || stdout.trim();
      finish({
        ok: code === 0,
        notFound: false,
        diagnostic: output || (code === 0 ? "" : `Command exited with code ${String(code)}`)
      });
    });
  });
}
function validateSourceDir(dir, spec) {
  const launch = spec.launch;
  if (launch.kind === "python-module") {
    const ok2 = existsSync5(join5(dir, "pyproject.toml")) && existsSync5(join5(dir, ...launch.checkFile.split("/")));
    return {
      checkOk: ok2,
      launchArgs: ["-m", launch.module],
      pythonPath: join5(dir, launch.pythonPathSubdir)
    };
  }
  if (launch.kind === "python-script") {
    if (!existsSync5(join5(dir, "pyproject.toml")))
      return { checkOk: false, launchArgs: [] };
    for (const script of launch.scripts) {
      if (existsSync5(join5(dir, script))) {
        return { checkOk: true, launchArgs: [join5(dir, script)], pythonPath: dir };
      }
    }
    return { checkOk: false, launchArgs: [] };
  }
  const entry = join5(dir, ...launch.entryScript.split("/"));
  const pkgJson = launch.packageDir ? join5(dir, launch.packageDir, "package.json") : join5(dir, "package.json");
  const ok = existsSync5(entry) || launch.buildCommand !== void 0 && existsSync5(pkgJson);
  return { checkOk: ok, launchArgs: [entry] };
}
function ensureAdsBridgeConfig(runtimeDir, homeDir) {
  const configPath = join5(runtimeDir, "bridge_config.json");
  mkdirSync2(runtimeDir, { recursive: true });
  if (existsSync5(configPath))
    return configPath;
  const token = randomBytes(32).toString("hex");
  const payload = {
    host: "127.0.0.1",
    port: 48326,
    token,
    workspace_root: join5(homeDir, "workspaces", "ads"),
    timeout: 60,
    max_message_bytes: 16777216
  };
  mkdirSync2(payload.workspace_root, { recursive: true });
  writeFileSync2(configPath, `${JSON.stringify(payload, null, 2)}
`, "utf8");
  return configPath;
}
var ConnectorProvisioner = class {
  config;
  registryPath;
  sourcesDir;
  runtimesDir;
  constructor(config) {
    this.config = config;
    this.registryPath = join5(config.homeDir, "provisioned.json");
    this.sourcesDir = join5(config.homeDir, "sources");
    this.runtimesDir = join5(config.homeDir, "runtimes");
  }
  getEdition() {
    return this.config.edition;
  }
  getHomeDir() {
    return this.config.homeDir;
  }
  readRegistry() {
    if (!existsSync5(this.registryPath))
      return {};
    try {
      const parsed = JSON.parse(readFileSync4(this.registryPath, "utf8"));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
    }
    return {};
  }
  saveRecord(record) {
    const current = this.readRegistry();
    current[record.id] = record;
    mkdirSync2(dirname6(this.registryPath), { recursive: true });
    writeFileSync2(this.registryPath, `${JSON.stringify(current, null, 2)}
`, "utf8");
  }
  removeRecord(id) {
    const current = this.readRegistry();
    if (!(id in current))
      return false;
    delete current[id];
    mkdirSync2(dirname6(this.registryPath), { recursive: true });
    writeFileSync2(this.registryPath, `${JSON.stringify(current, null, 2)}
`, "utf8");
    return true;
  }
  async inspectAdapter(id) {
    const spec = adapterById(id);
    if (!spec)
      throw new Error(`Unknown software adapter: ${id}`);
    const app = await detectSoftwareExecutable(id, this.config.executablePaths?.[id]);
    const bridgeReady = spec.bridgePort ? await probeTcpPort(spec.bridgePort) : null;
    const registry = this.readRegistry();
    const record = registry[id];
    const provisioned = Boolean(record && existsSync5(record.command));
    return {
      id: spec.id,
      title: spec.title,
      titleZh: spec.titleZh,
      category: spec.category,
      runtime: spec.runtime,
      sourceUrl: spec.sourceUrl,
      prerequisitesEn: spec.prerequisitesEn,
      prerequisitesZh: spec.prerequisitesZh,
      capabilities: spec.capabilities,
      iconFile: spec.iconFile,
      platformSupported: !spec.platformWindowsOnly || process.platform === "win32",
      appInstalled: app.installed,
      appDetail: app.detail,
      ...spec.bridgePort ? { bridgePort: spec.bridgePort } : {},
      bridgeReady,
      bridgeDetail: spec.bridgePort ? `127.0.0.1:${spec.bridgePort} TCP ${bridgeReady ? "open" : "unreachable"}` : "not-required",
      provisioned,
      toolCount: provisioned && record ? record.toolCount : 0,
      toolNames: provisioned && record ? record.toolNames : [],
      ...provisioned && record ? { launch: { command: record.command, args: record.args, cwd: record.cwd, env: record.env } } : {}
    };
  }
  async listEditionAdapters() {
    const specs = adaptersForEdition(this.config.edition);
    return Promise.all(specs.map((spec) => this.inspectAdapter(spec.id)));
  }
  async setup(id, options = {}) {
    const spec = adapterById(id);
    if (!spec) {
      return { ok: false, id, stage: "license", code: "unknown-software", detail: `Unknown software adapter: ${id}` };
    }
    options.onStage?.("license");
    const activeKey = options.licenseKey ?? resolveActiveLicenseKey(this.config.homeDir);
    const pubKey = this.config.publicKeyPem ?? resolvePublicKeyPem([this.config.homeDir]);
    const auth = checkAdapterAuthorization(id, this.config.edition, activeKey, pubKey, {
      allowDevBypass: this.config.allowDevBypass
    });
    if (!auth.valid) {
      return {
        ok: false,
        id,
        stage: "license",
        code: auth.code,
        detail: auth.message,
        licenseError: auth.code
      };
    }
    options.onStage?.("source");
    const resolvedSource = await this.resolveSource(spec, options.signal);
    if (!resolvedSource.ok) {
      return { ok: false, id, stage: "source", code: "source-unavailable", detail: resolvedSource.detail };
    }
    options.onStage?.("runtime");
    const runtime = await this.provisionRuntime(spec, resolvedSource.sourceDir, options.signal);
    if (!runtime.ok) {
      return { ok: false, id, stage: "runtime", code: runtime.code, detail: runtime.detail };
    }
    const detected = await detectSoftwareExecutable(id, this.config.executablePaths?.[id]);
    const runtimeConfigPath = spec.requiresBridgeTokenConfig ? ensureAdsBridgeConfig(runtime.runtimeDir, this.config.homeDir) : void 0;
    const env = {
      ...spec.buildEnv({
        homeDir: this.config.homeDir,
        sourceDir: resolvedSource.sourceDir,
        ...detected.installed && isAbsolute(detected.detail) ? { discoveredExecutable: detected.detail } : {},
        ...runtimeConfigPath ? { runtimeConfigPath } : {}
      }),
      ...resolvedSource.pythonPath ? { PYTHONPATH: resolvedSource.pythonPath } : {}
    };
    const launch = {
      command: runtime.command,
      args: resolvedSource.launchArgs,
      cwd: resolvedSource.sourceDir,
      env
    };
    options.onStage?.("probe");
    const probe = await probeMcpStdio(launch, {
      timeoutMs: this.config.probeTimeoutMs,
      signal: options.signal
    });
    if (!probe.ok) {
      return {
        ok: false,
        id,
        stage: "probe",
        code: "probe-failed",
        detail: probe.error ?? "MCP stdio handshake failed."
      };
    }
    options.onStage?.("save");
    const record = {
      id,
      command: launch.command,
      args: launch.args,
      cwd: launch.cwd,
      env: launch.env,
      sourceOrigin: resolvedSource.sourceOrigin,
      sourceDir: resolvedSource.sourceDir,
      runtimeDir: runtime.runtimeDir,
      toolCount: probe.toolNames.length,
      toolNames: probe.toolNames,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.saveRecord(record);
    return { ok: true, id, record, probe };
  }
  async resolveSource(spec, signal) {
    const repoNames = [spec.source.repo, ...spec.source.localRepoAliases ?? []];
    for (const root of this.config.hubRoots) {
      const candidates = [
        join5(root, ...spec.source.repoSubpath.split("/")),
        ...repoNames.map((repo) => join5(root, repo, ...spec.source.repoSubpath.split("/")))
      ];
      for (const candidate of candidates) {
        const checked = validateSourceDir(candidate, spec);
        if (checked.checkOk) {
          return {
            ok: true,
            sourceDir: candidate,
            sourceOrigin: "local",
            launchArgs: checked.launchArgs,
            ...checked.pythonPath ? { pythonPath: checked.pythonPath } : {}
          };
        }
      }
    }
    if (this.config.bundledMcpDir) {
      const bundledSource = join5(this.config.bundledMcpDir, spec.source.bundledDir);
      const checked = validateSourceDir(bundledSource, spec);
      if (checked.checkOk) {
        const writableCopy = join5(this.sourcesDir, "bundled", spec.id);
        if (!existsSync5(writableCopy)) {
          await mkdir2(dirname6(writableCopy), { recursive: true });
          await cp(bundledSource, writableCopy, { recursive: true });
        }
        const copiedCheck = validateSourceDir(writableCopy, spec);
        return {
          ok: true,
          sourceDir: writableCopy,
          sourceOrigin: "bundled",
          launchArgs: copiedCheck.launchArgs,
          ...copiedCheck.pythonPath ? { pythonPath: copiedCheck.pythonPath } : {}
        };
      }
    }
    const cachedDir = join5(this.sourcesDir, spec.source.repo, ...spec.source.repoSubpath.split("/"));
    const cachedCheck = validateSourceDir(cachedDir, spec);
    if (cachedCheck.checkOk) {
      return {
        ok: true,
        sourceDir: cachedDir,
        sourceOrigin: "github",
        launchArgs: cachedCheck.launchArgs,
        ...cachedCheck.pythonPath ? { pythonPath: cachedCheck.pythonPath } : {}
      };
    }
    const stagingDir = `${cachedDir}.staging`;
    const archiveUrl = `${this.config.sourceArchiveBaseUrl.replace(/\/+$/gu, "")}/${spec.source.repo}/tar.gz/${this.config.sourceArchiveRef}`;
    const deadline = AbortSignal.timeout(this.config.sourceDownloadTimeoutMs);
    const downloadSignal = signal ? AbortSignal.any([signal, deadline]) : deadline;
    try {
      const response = await fetch(archiveUrl, { signal: downloadSignal });
      if (!response.ok || !response.body) {
        return { ok: false, detail: `Archive HTTP ${response.status} from ${archiveUrl}` };
      }
      await rm(stagingDir, { recursive: true, force: true });
      await mkdir2(stagingDir, { recursive: true });
      await extractTarGzStreamSubpath(response.body, spec.source.repoSubpath, stagingDir, {
        maxCompressedBytes: 128 * 1024 * 1024,
        maxExtractedBytes: 384 * 1024 * 1024,
        signal: downloadSignal
      });
      const downloadedCheck = validateSourceDir(stagingDir, spec);
      if (!downloadedCheck.checkOk) {
        await rm(stagingDir, { recursive: true, force: true });
        return { ok: false, detail: `Subpath ${spec.source.repoSubpath} not found in ${archiveUrl}.` };
      }
      await rm(cachedDir, { recursive: true, force: true });
      await mkdir2(dirname6(cachedDir), { recursive: true });
      await rename(stagingDir, cachedDir);
      const finalCheck = validateSourceDir(cachedDir, spec);
      return {
        ok: true,
        sourceDir: cachedDir,
        sourceOrigin: "github",
        launchArgs: finalCheck.launchArgs,
        ...finalCheck.pythonPath ? { pythonPath: finalCheck.pythonPath } : {}
      };
    } catch (err) {
      await rm(stagingDir, { recursive: true, force: true });
      return { ok: false, detail: err instanceof Error ? err.message : String(err) };
    }
  }
  async provisionRuntime(spec, sourceDir, signal) {
    const runtimeDir = join5(this.runtimesDir, spec.id);
    await mkdir2(runtimeDir, { recursive: true });
    if (spec.runtime === "node") {
      const launch = spec.launch;
      if (launch.kind !== "node-script") {
        return { ok: false, code: "invalid-recipe", detail: "Node runtime requires a node-script launch spec." };
      }
      const pkgDir = launch.packageDir ? join5(sourceDir, launch.packageDir) : sourceDir;
      if (existsSync5(join5(pkgDir, "package.json")) && !existsSync5(join5(pkgDir, "node_modules"))) {
        const installCmd = existsSync5(join5(pkgDir, "package-lock.json")) ? ["npm", "ci"] : ["npm", "install"];
        const res = await runSubprocess(installCmd, pkgDir, this.config.installTimeoutMs, signal);
        if (!res.ok)
          return { ok: false, code: "dependency-failed", detail: res.diagnostic };
      }
      const entry = join5(sourceDir, ...launch.entryScript.split("/"));
      if (!existsSync5(entry) && launch.buildCommand) {
        const buildRes = await runSubprocess(launch.buildCommand, pkgDir, this.config.installTimeoutMs, signal);
        if (!buildRes.ok)
          return { ok: false, code: "build-failed", detail: buildRes.diagnostic };
      }
      if (!existsSync5(entry)) {
        return { ok: false, code: "entry-missing", detail: `Node MCP entry script not found: ${entry}` };
      }
      return { ok: true, command: process.execPath, runtimeDir };
    }
    const toml = await readFile(join5(sourceDir, "pyproject.toml"), "utf8");
    const pySources = await readAllPythonSources(sourceDir);
    const deps = constrainFastMcpDependencies(parsePyprojectDependencies(toml), pySources);
    const venvPython = runtimePythonPath(this.runtimesDir, spec.id);
    let provisionedWithUv = false;
    if (!existsSync5(venvPython)) {
      const uvVenv = await runSubprocess([this.config.uvExecutable, "venv", runtimeDir], sourceDir, this.config.installTimeoutMs, signal);
      if (uvVenv.ok)
        provisionedWithUv = true;
    } else {
      const uvCheck = await runSubprocess([this.config.uvExecutable, "--version"], sourceDir, 5e3, signal);
      provisionedWithUv = uvCheck.ok;
    }
    if (provisionedWithUv) {
      if (deps.length > 0) {
        const uvPip = await runSubprocess([this.config.uvExecutable, "pip", "install", "--python", venvPython, ...deps], sourceDir, this.config.installTimeoutMs, signal);
        if (!uvPip.ok)
          return { ok: false, code: "dependency-failed", detail: uvPip.diagnostic };
      }
      return { ok: true, command: venvPython, runtimeDir };
    }
    if (!existsSync5(venvPython)) {
      let created = false;
      const errors = [];
      for (const candidate of this.config.pythonCandidates) {
        const args = candidate === "py" ? ["py", "-3", "-m", "venv", runtimeDir] : [candidate, "-m", "venv", runtimeDir];
        const res = await runSubprocess(args, sourceDir, this.config.installTimeoutMs, signal);
        if (res.notFound)
          continue;
        if (res.ok) {
          created = true;
          break;
        }
        errors.push(`${candidate}: ${res.diagnostic}`);
      }
      if (!created) {
        return {
          ok: false,
          code: errors.length === 0 ? "python-missing" : "venv-failed",
          detail: errors.length === 0 ? `No Python 3 interpreter found (${this.config.pythonCandidates.join(", ")}).` : errors.join("\n")
        };
      }
    }
    if (deps.length > 0) {
      const pipRes = await runSubprocess([venvPython, "-m", "pip", "install", "--disable-pip-version-check", "--no-input", ...deps], sourceDir, this.config.installTimeoutMs, signal);
      if (!pipRes.ok)
        return { ok: false, code: "dependency-failed", detail: pipRes.diagnostic };
    }
    return { ok: true, command: venvPython, runtimeDir };
  }
};

// packages/core/dist/hosts/chatgpt-desktop.js
import { existsSync as existsSync6, mkdirSync as mkdirSync3, readFileSync as readFileSync5, writeFileSync as writeFileSync3 } from "node:fs";
import { homedir as homedir2 } from "node:os";
import { dirname as dirname7, join as join6 } from "node:path";
function resolveChatGptConfigTomlPath() {
  const codexHome = process.env.CODEX_HOME?.trim();
  if (codexHome)
    return join6(codexHome, "config.toml");
  return join6(homedir2(), ".codex", "config.toml");
}
function tomlLiteralString(value) {
  if (!value.includes("'") && !value.includes("\n") && !value.includes("\r")) {
    return `'${value}'`;
  }
  return JSON.stringify(value);
}
function tomlKey(key) {
  return /^[A-Za-z0-9_-]+$/.test(key) ? key : JSON.stringify(key);
}
function renderCodexMcpTomlSection(server) {
  const sectionKey = tomlKey(server.name);
  const lines = [
    `[mcp_servers.${sectionKey}]`,
    `enabled = ${server.enabled === false ? "false" : "true"}`,
    `command = ${tomlLiteralString(server.command)}`,
    `args = [${server.args.map(tomlLiteralString).join(", ")}]`
  ];
  if (server.cwd) {
    lines.push(`cwd = ${tomlLiteralString(server.cwd)}`);
  }
  const envEntries = Object.entries(server.env ?? {});
  if (envEntries.length > 0) {
    lines.push("");
    lines.push(`[mcp_servers.${sectionKey}.env]`);
    for (const [k, v] of envEntries) {
      lines.push(`${tomlKey(k)} = ${tomlLiteralString(v)}`);
    }
  }
  return lines.join("\n");
}
function upsertCodexConfigToml(existingContent, servers) {
  const lines = existingContent.replace(/\r\n/g, "\n").split("\n");
  const namesToReplace = new Set(servers.map((s) => s.name));
  const kept = [];
  let skipping = false;
  for (const line of lines) {
    const headerMatch = /^\s*\[\s*mcp_servers\.([^.\]\s"]+|"[^"]+")(?:\.env)?\s*\]\s*$/.exec(line);
    if (headerMatch) {
      const rawName = headerMatch[1]?.replace(/^"|"$/g, "") ?? "";
      if (namesToReplace.has(rawName)) {
        skipping = true;
        continue;
      }
      skipping = false;
    } else if (/^\s*\[/.test(line)) {
      skipping = false;
    }
    if (!skipping)
      kept.push(line);
  }
  const base = kept.join("\n").trimEnd();
  const additions = servers.map(renderCodexMcpTomlSection).join("\n\n");
  if (!base)
    return `${additions}
`;
  return `${base}

${additions}
`;
}
function syncChatGptDesktopConfig(servers, configPath = resolveChatGptConfigTomlPath()) {
  const existing = existsSync6(configPath) ? readFileSync5(configPath, "utf8") : "";
  const next = upsertCodexConfigToml(existing, servers);
  mkdirSync3(dirname7(configPath), { recursive: true });
  writeFileSync3(configPath, next, "utf8");
  return { configPath, updatedServers: servers.map((s) => s.name) };
}

// packages/core/dist/hosts/workbuddy.js
import { existsSync as existsSync7, mkdirSync as mkdirSync4, readFileSync as readFileSync6, writeFileSync as writeFileSync4 } from "node:fs";
import { homedir as homedir3 } from "node:os";
import { dirname as dirname8, join as join7 } from "node:path";
function resolveWorkBuddyMcpJsonPath() {
  const override = process.env.WORKBUDDY_MCP_CONFIG?.trim();
  if (override)
    return override;
  const modernDir = join7(homedir3(), ".workbuddy-ai");
  const legacyDir = join7(homedir3(), ".workbuddy");
  if (existsSync7(join7(modernDir, "mcp.json")))
    return join7(modernDir, "mcp.json");
  if (existsSync7(legacyDir))
    return join7(legacyDir, "mcp.json");
  if (existsSync7(modernDir))
    return join7(modernDir, "mcp.json");
  return join7(legacyDir, "mcp.json");
}
function upsertWorkBuddyMcpJson(existingContent, servers) {
  let root = {};
  if (existingContent.trim()) {
    try {
      const parsed = JSON.parse(existingContent);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        root = parsed;
      }
    } catch {
      root = {};
    }
  }
  const existingMap = root.mcpServers && typeof root.mcpServers === "object" && !Array.isArray(root.mcpServers) ? { ...root.mcpServers } : {};
  for (const server of servers) {
    existingMap[server.name] = {
      type: "stdio",
      command: server.command,
      args: [...server.args],
      ...server.cwd ? { cwd: server.cwd } : {},
      ...server.env && Object.keys(server.env).length > 0 ? { env: { ...server.env } } : {}
    };
  }
  root.mcpServers = existingMap;
  return `${JSON.stringify(root, null, 2)}
`;
}
function syncWorkBuddyDesktopConfig(servers, configPath = resolveWorkBuddyMcpJsonPath()) {
  const existing = existsSync7(configPath) ? readFileSync6(configPath, "utf8") : "";
  const next = upsertWorkBuddyMcpJson(existing, servers);
  mkdirSync4(dirname8(configPath), { recursive: true });
  writeFileSync4(configPath, next, "utf8");
  return { configPath, updatedServers: servers.map((s) => s.name) };
}

// packages/core/dist/hosts/dsh.js
import { existsSync as existsSync8, mkdirSync as mkdirSync5, readFileSync as readFileSync7, writeFileSync as writeFileSync5 } from "node:fs";
import { homedir as homedir4 } from "node:os";
import { dirname as dirname9, join as join8 } from "node:path";
function resolveDshHomeDir() {
  const fromEnv = process.env.DSH_HOME?.trim();
  if (fromEnv)
    return fromEnv;
  return join8(homedir4(), ".dsh");
}
function resolveDshProfilePatchPath(profile = "desktop") {
  return join8(resolveDshHomeDir(), "profiles", profile, "cordis.patch.yml");
}
function yamlQuote(value) {
  return JSON.stringify(value);
}
function renderDshMcpClientPatchEntry(server) {
  const lines = [
    `    - id: engiaxis-mcp-${server.name}`,
    `      name: '@deepseek-ai/dsh-mcp-client'`,
    `      config:`,
    `        serverName: ${yamlQuote(server.name)}`,
    `        transport: stdio`,
    `        command: ${yamlQuote(server.command)}`,
    `        args:`
  ];
  for (const arg of server.args) {
    lines.push(`          - ${yamlQuote(arg)}`);
  }
  if (server.cwd) {
    lines.push(`        cwd: ${yamlQuote(server.cwd)}`);
  }
  const envEntries = Object.entries(server.env ?? {});
  if (envEntries.length > 0) {
    lines.push(`        env:`);
    for (const [k, v] of envEntries) {
      lines.push(`          ${k}: ${yamlQuote(v)}`);
    }
  }
  return lines.join("\n");
}
var BEGIN_MARKER = "# >>> engiaxis-connector managed block >>>";
var END_MARKER = "# <<< engiaxis-connector managed block <<<";
function upsertDshCordisPatchYml(existingContent, servers) {
  const escapedBegin = BEGIN_MARKER.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
  const escapedEnd = END_MARKER.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
  const blockPattern = new RegExp(`\\n?${escapedBegin}[\\s\\S]*?${escapedEnd}\\n?`, "g");
  const cleaned = existingContent.replace(/\r\n/g, "\n").replace(blockPattern, "").trimEnd();
  const renderedEntries = servers.map(renderDshMcpClientPatchEntry).join("\n\n");
  const managedBlock = [
    BEGIN_MARKER,
    "- insert:",
    renderedEntries,
    END_MARKER
  ].join("\n");
  return cleaned ? `${cleaned}

${managedBlock}
` : `${managedBlock}
`;
}
function syncDshProfileConfig(servers, profile = "desktop", patchPath = resolveDshProfilePatchPath(profile)) {
  const existing = existsSync8(patchPath) ? readFileSync7(patchPath, "utf8") : "";
  const next = upsertDshCordisPatchYml(existing, servers);
  mkdirSync5(dirname9(patchPath), { recursive: true });
  writeFileSync5(patchPath, next, "utf8");
  return { configPath: patchPath, updatedServers: servers.map((s) => s.name) };
}

// packages/mcp-server/src/mcp-server.ts
import { createInterface as createInterface2 } from "node:readline";

// packages/mcp-server/src/software-icons.ts
var SOFTWARE_ICON_DATA_URIS = {
  "solidworks": "data:image/png;base64,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",
  "catia": "data:image/png;base64,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",
  "nx": "data:image/png;base64,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",
  "abaqus": "data:image/png;base64,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",
  "ansys-workbench": "data:image/png;base64,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",
  "ansys-fluent": "data:image/png;base64,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",
  "ansys-aedt": "data:image/png;base64,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",
  "comsol": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAMAAAC5zwKfAAADAFBMVEUAAADo5ufo6Oja2dr+/v75+Pf39vLy6XPX2dhzls4yZ61veIwaNnP6+vrp6YvNzc2wx9CLqM739/eHqfCqqqpSaYqLuO/a049NdsoyRXE0WI6tt5dQhs7o5ufMyJIUK2iZtdH5+fnp23ZESm4neMzp5+gZWq4rVq739/bU2+hHdrDP1a4ZJ1UbR43Y5vLj2YclN29wlfKtuLDM584qSLJzhJFvivJuiK7r6emKlZGNl6ccZLamuc7R6LAoSom0xbIbVJf39/fGya4ease/v79IZ83l8rMZRscladLs6usyh9NWhfZoeesWNI+RqK+t1q7g3t6DhpRzp/exyOxUZXgriOw3l/lMWKtJXIRMVG8xdLEzNU5NauxLm+9kbYh/f39ypc8aSKlvufUaOc2SyO1RZ7e12Mza5ZPExshNtfXt7OtWdpIvSsdNpvdWdutRhKvy8ojm5ua0xY0dM1OSm84kOKxxlbVRltI2aeyU1rHa2NnX88yH1+uata7h4d4iNZAyWM+Wo5QWKopZutGt1vE3ZZYiPMOmt/Gv5ef48HR51vY6VHnc3uNodnGoqayhqJFmispylY/N2Xbi7KdWk45MpM8cQX1qqbbb29vg3d4zc+xTipOS2tF2xs8iLlhjeFAySFmIiaVlZ3q7587d29vW4nIjSeKJm+0qW+lMo7xwx/iMxbCdyddleaTY09MNKaKw3Z5zd8Lb2dlvt9B7q3g7gLpYxv88qv/f4OBHRldyubJMWVALGFDFzPBDWczf4d87oNv/f3//v//f4t9ecWJMg3//zMxcm6Vla73a2tpvr5JnwL1/0K3m+seHi8uGjvKfn5/h3+WSt1Hl39+DtnAA//8fcOC4yHsXYPgKXdOt0Xzg39+/4qbg398WMrTR9eIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwQVRAAABAHRSTlMA59vcBOva/+f9/v3+Lv/b+/lN9AP++P/9/v7//6///v1w//7/k//+juz+//7/9f/+//r9/v3//XD99//3//7//6///gT////+V////////9v2/fj+/////v3//f///QL8/////v///+r/Kv/9/////w///v/+/////zH////b//7////+//75/////97/7P/6/////////5Dg//////7////4/1D///////////4U////aP//////2//////x/93/AgRQ//8F//+2////////EOz/Wv8B//////+Q/6j//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAc97nUgAACDpJREFUeNrtmPdbGlsax2eGGaQviAoiCCYiARRRQCyoNyjWWKLGVbPWNfZoTKyxl5RN2/Te7s3eXndv3Vu29957+Vf2PTMMziBY7s2zP+XrIw+P4sfvW86Z9xwMe6ZniiySJOPor6cCgu+NH3xuDvkDkveDoSF5Zawcwzo/B64zhCLHx+WxuWbz7Z8LCFwEMsh375GEvyDlsZWVuWYDQRA4I5EIp4SEYEBA7o6IaJg8N8TBCUZ3cIqi0JsBM7kLIFkKL5VmLgmpHmdxSDsOmqaBOZwjgo6Z4uCEVOXOgEzmzDwcAHE+DgH37QRI4yoN+GYBjRs9EIXj2xFJhBvKJSLSwnDIYuzWQLposVHMUUzU3BptHTNdCDKaOSqsPEHgfjJa5zBNZ46Gi8iDHAqHIlvcshA8Gp8JSYzgkHbNa7rfO3CHg+OOCkoY0nZJjDVz/7/ysrihQZ3Q6HA41nsTWKnVDWpWZ4I8CJqM4K+SnzmrGHTmMwdubVRnZWWJc6pHq0dnAjMB7XL5S19lNPKZMJjFTY1D/tkcliAV8CbWHdZGX4NJnaVayMoZrRbnewPaN6XxIyPuycnTk0urIxcYh1RKGJDEcvEIQLHpjFqtSlCqVQsNWTne0Sxt4Dszy27dSCB+aen05KrzbS1jERoH4+++40KKL7yxESGVqpd9SgD6GhJqvQfatYEjgbuWotMvuZ1Lk6dXjTX/aQyWhb/jAJ7Aw4AO68SUWJygNJmUyjeKTeo3ar35We3SK9q7libp8rLTWVNek+5cZSxCzJynDAOk+F3nM52ZkIrFvet9JmXf2ScmU+/861PVDz4OBEa7hnWWVyyJLZPlMmON2ypkYsa2ACKJxS9PHPSKTU/O9ilFDldfdu+T+Vuqng9uXdE3H7K4X5mxNLnLu42ytxMYoDAsiZiZvxKs4pzfTjwvFatcLpfS9d+5wmLl2bN1Uz2zD8Zm2o9WxNv+ZmuqcZcnOlcvCyPtOJ3YSZwLpACYA0Cv2DU3Zy+c+3WZvdg117fw7vy5G9r2D6cvjsxcKZK5y5s+MS4H6xzeOJiBB1SKcw78Jv+i97KrrKzQXlZW1u8vdBUe75o/966tee2Wxa1P7XZ2l+s+MbodTJ33x/FwpdgfuRYpHwC/mS99Uy+6dk2hAaBCU1hYeLz2/rm16/q1G/cuVlRYZDXupsfGjEZhpMbpxN4iNgGfl0q1ddcUikzFMYXiaj8AF+7fn31Pv/bxvaKKirTEJYtOdqImgW0crJS/VrhrjzKJsw78THpQqi1WMMCYPZn9/VeTZt+ZfW9q8HttRRXvD/+otbwbgOpgEvfxtzASysIBqgB4pAMBwVyM4lhMzB6gvni8rm72etXgq2MXJbZ4maw7A4BidoMgNy0WKgzYAiFnfy0GRL/ExLz417p36v7007VfXD9fUZHx6HE5AI0sEA/bcUq5+wOl0gOw9QWpNolBBZFX667+4w9Xblz/8aNT9x49PtF980Q6CyTwsF0WYia4wBwAtnq0SUFzSIr+/rp/1c2+/uBXv3y1qiq1pKAkLc3SHQIS4XssZuABR7+899tSfdKxEE5xrdDl6lufP/faB4ODHzY3Hzp09y8lFX/vEkaZceKwb7CPXASs/goA4/VJihAw0263i/rWe3tf6xk8inipqSUlJWkqFoinhMc8Xr/hUIuAh1v0xYo9jDIzNcBTKht7e4B3NMgrKEgzhYD7yM6wmP8ZDtTp/RoNy9PY/QNKZUJCT8PR9uZDVcArAF6aMhQyQWLRWpHy2Rhgql2j0WRmIpzG7/crlSaa117F8NKgKtYQD9/0qPqJIPQMDQIlIntyMsA0ycnJfn+xz2dSdXVNTyOehOY9J9kwGN44UJZvsWWx2rQATJRI7PbjyYz8xdnZ2cATT0/rq1LbJAVpz4EyvBygIWzGicNOLrIWbUcAeF5iK/YnJdHIJMBl19YCT69/v61NIkG0jAyZT8iZ7OSbLP6btXhZEnAnSiy2heIkVpdqa/OnprxjYwino3E3ZUVWoTB6EslQK1IqyRGLTmIZW8muXVn5OmhlJS8v3+sds9naTp3S6YrAHMgYz510IgDfErBbtoSWx5NXm8fooMfjkQ4Px9O4opsyWsaB0EgHcm0qcxx2O2jRaqOBw8OefI9UCiikeJAOcImJTgQzGj/t4GaQwOVYXDjw5B0aaBWKEQ8RPNKmpg5pR0cHvG9pQTSEMxrT09M/3SuoF4RwAjzCVEeShqBFEQK2tJw/H9/RuhcJOE7nw/SgHj48fPjwCwJCEBQhEOH7IoydnFb0SSSJSK3SJtgYQZ6DoLx80KVLl7KzBwZEIRwI3x8bcSrGhgTssc4KZ02YewU4nXJisX5xkZuw+hCrHn0mhcQiTu5kpxnnTZ5wioUhmOtlk+Dz++XRTuIk9kORgDeZw6AXkfclFkfgMMBiUQ8W2DghYi3CyI7cUXgkHojBQTGwLU64MMxuWESnRMg3HpkHROBFj5Z9+g2JBETomIjfQRWMzEO/EaZg2DYHcLoVRUEcLhIJIlhkcSjabc+2cfCAphcnw0NAER7OQ9n7iG49cicXKgYRQW9KIlrICoFWGOq4CwRTX1TbFBLb0XUDfMwA1phWuYAzwA0J2NrKd3wJRNInUtrad4PrKkS8IBB8RGzTepv1fUSNNSwiJlpkMKxt+CN2E23YhUiKAaWQ3umoDdz2rRcZGRe8FaGR6BJJSJ/rULS7tcc730PoNFPI8HDhTlpv6+sROvRgVZhov9CdIXOrIb9Nr+/dFyN66L+rTElJ+SLRhlWok8N+SneupST5FHHP9H/W/wCDarHcPW5QTQAAAABJRU5ErkJggg==",
  "cst": "data:image/png;base64,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",
  "ansa": "data:image/png;base64,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",
  "easyeda-pro": "data:image/png;base64,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",
  "kicad": "data:image/png;base64,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",
  "calculix": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxOCIgZmlsbD0iIzEyMzAyQiIvPjxwYXRoIGQ9Ik00MCAxM0w2MiAyNS41VjUwLjVMNDAgNjNMMTggNTAuNVYyNS41TDQwIDEzWiIgc3Ryb2tlPSIjMkRENEJGIiBzdHJva2Utd2lkdGg9IjMuMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MCAxM1Y2M00xOCAyNS41TDYyIDUwLjVNNjIgMjUuNUwxOCA1MC41IiBzdHJva2U9IiMyREQ0QkYiIHN0cm9rZS1vcGFjaXR5PSIwLjU1IiBzdHJva2Utd2lkdGg9IjIuMiIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iMzgiIHI9IjUuNSIgZmlsbD0iIzJERDRCRiIvPjx0ZXh0IHg9IjQwIiB5PSI3NCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5RjZFNCIgZm9udC1mYW1pbHk9InN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExIiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMC44Ij5DQ1g8L3RleHQ+PC9zdmc+",
  "ads": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxOCIgZmlsbD0iIzJBMTIxOCIvPjxwYXRoIGQ9Ik0xMiA0MEgyMkwyOCAyM0wzNSA1NEw0MiAxN0w0OSA1MUw1NSAzM0w2MCA0MEg2OCIgc3Ryb2tlPSIjRkI3MTg1IiBzdHJva2Utd2lkdGg9IjMuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iNDAiIHk9IjcyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkVDREQzIiBmb250LWZhbWlseT0ic3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjIiPkFEUzwvdGV4dD48L3N2Zz4="
};
function softwareIconsForEdition(edition) {
  const out = {};
  for (const adapter of adaptersForEdition(edition)) {
    out[adapter.id] = SOFTWARE_ICON_DATA_URIS[adapter.id];
  }
  return out;
}

// packages/mcp-server/src/mcp-app-ui.ts
var MCP_APP_MIME_TYPE = "text/html;profile=mcp-app";
var MCP_APP_URIS = {
  global: "ui://engiaxis-connector/global-v1",
  thread: "ui://engiaxis-connector/thread-v1",
  widget: "ui://engiaxis-connector/widget-v1"
};
function buildEditionSidebarSvg(edition, stroke) {
  if (edition === "cad") {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">',
      `<path d="M10 2.4L16.4 6.1V13.6L10 17.3L3.6 13.6V6.1L10 2.4Z" stroke="${stroke}" stroke-width="1.35" stroke-linejoin="round"/>`,
      `<path d="M10 9.8V17.3M10 9.8L16.4 6.1M10 9.8L3.6 6.1" stroke="${stroke}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="M10 2.4V0.9M16.4 13.6L17.9 14.5M3.6 13.6L2.1 14.5" stroke="${stroke}" stroke-width="1.4" stroke-linecap="round"/>`,
      `<path d="M6.8 8.0V11.8L10 13.6" stroke="${stroke}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>`,
      "</svg>"
    ].join("");
  }
  if (edition === "cae") {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">',
      `<path d="M10 2.3L16.6 6.1V13.8L10 17.6L3.4 13.8V6.1L10 2.3Z" stroke="${stroke}" stroke-width="1.35" stroke-linejoin="round"/>`,
      `<path d="M10 2.3V17.6M3.4 6.1L16.6 13.8M16.6 6.1L3.4 13.8" stroke="${stroke}" stroke-width="1.15" stroke-linecap="round"/>`,
      `<path d="M6.7 4.2L13.3 8.0M13.3 4.2L6.7 8.0" stroke="${stroke}" stroke-width="1.0" stroke-linecap="round"/>`,
      `<circle cx="10" cy="9.95" r="1.3" fill="${stroke}"/>`,
      "</svg>"
    ].join("");
  }
  if (edition === "eda") {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">',
      `<rect x="5" y="5" width="10" height="10" rx="2" stroke="${stroke}" stroke-width="1.4"/>`,
      `<path d="M10 7.1L12.7 10L10 12.9L7.3 10L10 7.1Z" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round"/>`,
      `<path d="M7.6 5V2.3M12.4 5V2.3M7.6 17.7V15M12.4 17.7V15M5 7.6H2.3M5 12.4H2.3M17.7 7.6H15M17.7 12.4H15" stroke="${stroke}" stroke-width="1.35" stroke-linecap="round"/>`,
      "</svg>"
    ].join("");
  }
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">',
    `<path d="M10 2.3L16.5 6.0V13.6L10 17.4L3.5 13.6V6.0L10 2.3Z" stroke="${stroke}" stroke-width="1.35" stroke-linejoin="round"/>`,
    `<path d="M10 9.6L16.5 6.0M10 9.6L3.5 6.0M10 9.6V17.4" stroke="${stroke}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<path d="M10 4.6L12.6 6.1L10 7.6L7.4 6.1L10 4.6Z" fill="${stroke}"/>`,
    `<circle cx="10" cy="2.3" r="1.15" fill="${stroke}"/>`,
    `<circle cx="16.5" cy="13.6" r="1.15" fill="${stroke}"/>`,
    `<circle cx="3.5" cy="13.6" r="1.15" fill="${stroke}"/>`,
    "</svg>"
  ].join("");
}
function entrypointIconsForEdition(edition) {
  return [
    {
      src: `data:image/svg+xml,${encodeURIComponent(buildEditionSidebarSvg(edition, "#0D0D0D"))}`,
      mimeType: "image/svg+xml",
      sizes: ["any"],
      theme: "light"
    },
    {
      src: `data:image/svg+xml,${encodeURIComponent(buildEditionSidebarSvg(edition, "#F5F5F5"))}`,
      mimeType: "image/svg+xml",
      sizes: ["any"],
      theme: "dark"
    }
  ];
}
var ENTRYPOINT_ICONS = entrypointIconsForEdition("suite");
var EDITION_ACCENT_PALETTE = {
  cad: { light: "#0284C7", lightSoft: "rgba(14, 165, 233, 0.12)", dark: "#38BDF8", darkSoft: "rgba(56, 189, 248, 0.16)", tag: "CAD" },
  cae: { light: "#EA580C", lightSoft: "rgba(234, 88, 12, 0.12)", dark: "#FB923C", darkSoft: "rgba(251, 146, 60, 0.16)", tag: "CAE" },
  eda: { light: "#059669", lightSoft: "rgba(5, 150, 105, 0.12)", dark: "#34D399", darkSoft: "rgba(52, 211, 153, 0.16)", tag: "EDA" },
  suite: { light: "#7C3AED", lightSoft: "rgba(124, 58, 237, 0.12)", dark: "#A78BFA", darkSoft: "rgba(167, 139, 250, 0.16)", tag: "Suite" }
};
var SIDEBAR_TITLE_BY_EDITION = {
  cad: "EngiAxis CAD",
  cae: "EngiAxis CAE",
  eda: "EngiAxis EDA",
  suite: "EngiAxis Connector"
};
function sidebarTitleForEdition(edition) {
  return SIDEBAR_TITLE_BY_EDITION[edition];
}
function renderMcpAppHtml(edition, surface) {
  const spec = EDITION_SPECS[edition];
  const title = sidebarTitleForEdition(edition);
  const accent = EDITION_ACCENT_PALETTE[edition];
  const iconsJson = JSON.stringify(softwareIconsForEdition(edition));
  const cacheKey = `engiaxis-connector:state:${edition}:v3`;
  return `<!doctype html>
<html lang="zh-CN" data-surface="${surface}" data-edition="${edition}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    :root {
      color-scheme: light dark;
      --ea-bg: var(--color-background-primary, #ffffff);
      --ea-sidebar-bg: var(--color-background-secondary, #f9f9fa);
      --ea-surface: #f4f4f6;
      --ea-input-bg: #ffffff;
      --ea-row-hover: rgba(13, 13, 13, 0.04);
      --ea-nav-active: rgba(13, 13, 13, 0.07);
      --ea-pill-active-bg: rgba(13, 13, 13, 0.08);
      --ea-act-hover: rgba(13, 13, 13, 0.08);
      --ea-icon-bg: #f3f4f6;
      --ea-icon-border: rgba(13, 13, 13, 0.08);
      --ea-border: var(--color-border-primary, rgba(13, 13, 13, 0.09));
      --ea-border-strong: rgba(13, 13, 13, 0.18);
      --ea-text: var(--color-text-primary, #0d0d0d);
      --ea-muted: var(--color-text-secondary, #6b7280);
      --ea-primary: #18181b;
      --ea-primary-fg: #ffffff;
      --ea-accent: ${accent.light};
      --ea-accent-soft: ${accent.lightSoft};
      --ea-modal-bg: #ffffff;
      --ea-backdrop: rgba(15, 23, 42, 0.42);
      --ea-toggle-on: #18181b;
      --ea-toggle-on-thumb: #ffffff;
      --ea-toggle-off: rgba(13, 13, 13, 0.18);
      --ea-toggle-off-thumb: #ffffff;
      --ea-ok: #16a34a;
      --ea-ok-soft: rgba(22, 163, 74, 0.11);
      --ea-warn: #d97706;
      --ea-warn-soft: rgba(217, 119, 6, 0.12);
      --ea-err: #dc2626;
      --ea-err-soft: rgba(220, 38, 38, 0.12);
      --ea-safe-top: 0px;
      --ea-safe-right: 0px;
      --ea-safe-bottom: 0px;
      --ea-safe-left: 0px;
    }

    html[data-theme="dark"] {
      --ea-bg: var(--color-background-primary, #171717);
      --ea-sidebar-bg: var(--color-background-secondary, #1c1c1e);
      --ea-surface: #222226;
      --ea-input-bg: #222225;
      --ea-row-hover: rgba(255, 255, 255, 0.045);
      --ea-nav-active: rgba(255, 255, 255, 0.085);
      --ea-pill-active-bg: rgba(255, 255, 255, 0.11);
      --ea-act-hover: rgba(255, 255, 255, 0.1);
      --ea-icon-bg: #242529;
      --ea-icon-border: rgba(255, 255, 255, 0.09);
      --ea-border: var(--color-border-primary, rgba(255, 255, 255, 0.09));
      --ea-border-strong: rgba(255, 255, 255, 0.2);
      --ea-text: var(--color-text-primary, #f3f4f6);
      --ea-muted: var(--color-text-secondary, #9ca3af);
      --ea-primary: #f5f5f5;
      --ea-primary-fg: #111111;
      --ea-accent: ${accent.dark};
      --ea-accent-soft: ${accent.darkSoft};
      --ea-modal-bg: #1e1e22;
      --ea-backdrop: rgba(0, 0, 0, 0.62);
      --ea-toggle-on: #f5f5f5;
      --ea-toggle-on-thumb: #171717;
      --ea-toggle-off: rgba(255, 255, 255, 0.18);
      --ea-toggle-off-thumb: #d4d4d8;
      --ea-ok: #4ade80;
      --ea-ok-soft: rgba(74, 222, 128, 0.14);
      --ea-warn: #fbbf24;
      --ea-warn-soft: rgba(251, 191, 36, 0.14);
      --ea-err: #f87171;
      --ea-err-soft: rgba(248, 113, 113, 0.14);
    }

    @media (prefers-color-scheme: dark) {
      html:not([data-theme="light"]) {
        --ea-bg: var(--color-background-primary, #171717);
        --ea-sidebar-bg: var(--color-background-secondary, #1c1c1e);
        --ea-surface: #222226;
        --ea-input-bg: #222225;
        --ea-row-hover: rgba(255, 255, 255, 0.045);
        --ea-nav-active: rgba(255, 255, 255, 0.085);
        --ea-pill-active-bg: rgba(255, 255, 255, 0.11);
        --ea-act-hover: rgba(255, 255, 255, 0.1);
        --ea-icon-bg: #242529;
        --ea-icon-border: rgba(255, 255, 255, 0.09);
        --ea-border: var(--color-border-primary, rgba(255, 255, 255, 0.09));
        --ea-border-strong: rgba(255, 255, 255, 0.2);
        --ea-text: var(--color-text-primary, #f3f4f6);
        --ea-muted: var(--color-text-secondary, #9ca3af);
        --ea-primary: #f5f5f5;
        --ea-primary-fg: #111111;
        --ea-accent: ${accent.dark};
        --ea-accent-soft: ${accent.darkSoft};
        --ea-modal-bg: #1e1e22;
        --ea-backdrop: rgba(0, 0, 0, 0.62);
        --ea-toggle-on: #f5f5f5;
        --ea-toggle-on-thumb: #171717;
        --ea-toggle-off: rgba(255, 255, 255, 0.18);
        --ea-toggle-off-thumb: #d4d4d8;
        --ea-ok: #4ade80;
        --ea-ok-soft: rgba(74, 222, 128, 0.14);
        --ea-warn: #fbbf24;
        --ea-warn-soft: rgba(251, 191, 36, 0.14);
        --ea-err: #f87171;
        --ea-err-soft: rgba(248, 113, 113, 0.14);
      }
    }

    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--ea-bg);
      color: var(--ea-text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }

    /* Two-pane workspace matching EngiAxis Software Connections */
    .workspace {
      display: flex;
      min-height: 100vh;
      padding: var(--ea-safe-top) var(--ea-safe-right) var(--ea-safe-bottom) var(--ea-safe-left);
    }

    .sidebar {
      width: 224px;
      flex-shrink: 0;
      background: var(--ea-sidebar-bg);
      border-right: 1px solid var(--ea-border);
      padding: 20px 12px 24px;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    html[data-surface="thread"] .sidebar,
    html[data-surface="widget"] .sidebar {
      display: none;
    }

    @media (max-width: 780px) {
      .sidebar { display: none; }
    }

    .sb-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 2px 10px 14px;
      gap: 6px;
    }
    .sb-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--ea-text);
      letter-spacing: -0.01em;
    }
    .ed-tag {
      display: inline-flex;
      align-items: center;
      font-size: 10.5px;
      font-weight: 600;
      padding: 1.5px 7px;
      border-radius: 999px;
      background: var(--ea-accent-soft);
      color: var(--ea-accent);
      letter-spacing: 0.02em;
    }

    .sb-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sb-nav-btn {
      display: flex;
      align-items: center;
      gap: 9px;
      width: 100%;
      padding: 8px 10px;
      border-radius: 9px;
      border: none;
      background: transparent;
      color: var(--ea-muted);
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition: background 0.14s ease, color 0.14s ease;
    }
    .sb-nav-btn:hover {
      background: var(--ea-row-hover);
      color: var(--ea-text);
    }
    .sb-nav-btn.active {
      background: var(--ea-nav-active);
      color: var(--ea-text);
    }
    .sb-nav-btn svg { flex-shrink: 0; opacity: 0.85; }
    .sb-nav-dot {
      margin-left: auto;
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: var(--ea-warn);
      flex-shrink: 0;
    }
    .sb-nav-dot.ok { background: var(--ea-ok); }

    .sb-divider {
      height: 1px;
      background: var(--ea-border);
      margin: 14px 8px;
    }

    .sb-section {
      font-size: 11.5px;
      font-weight: 500;
      color: var(--ea-muted);
      padding: 0 10px 8px;
    }

    .sb-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sb-empty {
      font-size: 12px;
      color: var(--ea-muted);
      opacity: 0.72;
      padding: 6px 10px;
    }
    .sb-item {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 36px;
      padding: 0 6px 0 8px;
      border-radius: 9px;
      transition: background 0.14s ease;
    }
    .sb-item:hover { background: var(--ea-row-hover); }
    .sb-item-main {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
      border: none;
      background: transparent;
      color: var(--ea-text);
      font: inherit;
      font-size: 12.5px;
      text-align: left;
      padding: 0;
      cursor: pointer;
    }
    .sb-item-ico {
      width: 19px;
      height: 19px;
      border-radius: 5px;
      overflow: hidden;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--ea-icon-bg);
    }
    .sb-item-ico img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .sb-item-ico.bleed img { object-fit: cover; }
    .sb-item-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 450;
    }
    .sb-gear {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--ea-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      opacity: 0.72;
      transition: opacity 0.14s ease, color 0.14s ease, background 0.14s ease;
    }
    .sb-gear:hover {
      opacity: 1;
      color: var(--ea-text);
      background: var(--ea-act-hover);
    }

    /* Crisp pill toggle matching EngiAxis sidebar */
    .toggle {
      position: relative;
      width: 32px;
      height: 18px;
      border-radius: 999px;
      border: none;
      padding: 0;
      background: var(--ea-toggle-off);
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.16s ease;
    }
    .toggle::after {
      content: "";
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      border-radius: 999px;
      background: var(--ea-toggle-off-thumb);
      transition: transform 0.16s ease, background 0.16s ease;
    }
    .toggle.on {
      background: var(--ea-toggle-on);
    }
    .toggle.on::after {
      transform: translateX(14px);
      background: var(--ea-toggle-on-thumb);
    }
    .toggle:disabled { opacity: 0.5; cursor: wait; }

    /* Main content pane */
    .main {
      flex: 1;
      min-width: 0;
      overflow-y: auto;
    }
    .container {
      max-width: 920px;
      margin: 0 auto;
      padding: 28px 36px 56px;
    }
    html[data-surface="thread"] .container {
      max-width: 100%;
      padding: 18px 18px 32px;
    }
    html[data-surface="widget"] .container {
      max-width: 100%;
      padding: 14px 16px 20px;
    }
    @media (max-width: 780px) {
      .container { padding: 20px 18px 36px; }
    }

    /* Page header matching EngiAxis */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }
    .page-title-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .page-title {
      margin: 0;
      font-size: 26px;
      font-weight: 650;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    html[data-surface="widget"] .page-title,
    html[data-surface="thread"] .page-title {
      font-size: 20px;
    }
    .page-subtitle {
      margin: 5px 0 0;
      font-size: 13px;
      color: var(--ea-muted);
    }

    .header-controls {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-top: 3px;
    }
    .search-box {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-box svg {
      position: absolute;
      left: 11px;
      color: var(--ea-muted);
      pointer-events: none;
    }
    .search-input {
      width: 224px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--ea-border);
      background: var(--ea-input-bg);
      color: var(--ea-text);
      font: inherit;
      font-size: 13px;
      padding: 0 12px 0 34px;
      outline: none;
      transition: border-color 0.14s ease, box-shadow 0.14s ease;
    }
    .search-input::placeholder { color: var(--ea-muted); }
    .search-input:focus { border-color: var(--ea-border-strong); }
    html[data-surface="thread"] .search-input,
    html[data-surface="widget"] .search-input { width: 168px; }

    .icon-btn {
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 9px;
      border: none;
      background: transparent;
      color: var(--ea-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.14s ease, color 0.14s ease;
    }
    .icon-btn:hover {
      background: var(--ea-row-hover);
      color: var(--ea-text);
    }
    .icon-btn.active {
      background: var(--ea-nav-active);
      color: var(--ea-text);
    }
    .icon-btn:disabled { opacity: 0.45; cursor: wait; }
    .icon-dot {
      position: absolute;
      top: 7px;
      right: 7px;
      width: 6.5px;
      height: 6.5px;
      border-radius: 999px;
      background: var(--ea-warn);
      box-shadow: 0 0 0 2px var(--ea-bg);
    }
    .icon-dot.ok { background: var(--ea-ok); }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin { animation: spin 0.8s linear infinite; }

    /* Filter pills row */
    .filter-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 22px;
      flex-wrap: wrap;
    }
    .filter-pills {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }
    .filter-pill {
      padding: 5px 14px;
      border-radius: 999px;
      border: none;
      background: transparent;
      color: var(--ea-muted);
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.14s ease, color 0.14s ease;
    }
    .filter-pill:hover {
      color: var(--ea-text);
      background: var(--ea-row-hover);
    }
    .filter-pill.active {
      background: var(--ea-pill-active-bg);
      color: var(--ea-text);
    }
    .summary-hint {
      font-size: 12px;
      color: var(--ea-muted);
    }

    /* Inline license bar (only rendered on Connections view when unlicensed / edition mismatch) */
    .lic-banner {
      border-radius: 12px;
      border: 1px solid var(--ea-border);
      background: var(--ea-surface);
      padding: 13px 15px;
      margin-bottom: 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .lic-banner.hidden { display: none; }
    .lic-banner-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }
    .lic-status-inline {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 12.5px;
      font-weight: 500;
      color: var(--ea-warn);
    }
    .lic-dot {
      width: 7px;
      height: 7px;
      border-radius: 999px;
      background: currentColor;
      flex-shrink: 0;
    }
    .fp-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 11.5px;
      color: var(--ea-muted);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
    .lic-form {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .text-input {
      flex: 1;
      min-width: 0;
      height: 36px;
      border-radius: 9px;
      border: 1px solid var(--ea-border);
      background: var(--ea-input-bg);
      color: var(--ea-text);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 12.5px;
      padding: 0 12px;
      outline: none;
    }
    .text-input:focus { border-color: var(--ea-border-strong); }

    /* Category-grouped 2-column borderless software rows (exact EngiAxis aesthetic) */
    .cat-group {
      margin-bottom: 26px;
    }
    .cat-group:last-child { margin-bottom: 0; }
    .cat-heading {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--ea-muted);
      margin: 0 0 10px 4px;
      letter-spacing: 0.01em;
    }

    .conn-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      column-gap: 28px;
      row-gap: 6px;
    }
    html[data-surface="thread"] .conn-grid,
    html[data-surface="widget"] .conn-grid {
      grid-template-columns: 1fr;
    }
    @media (max-width: 680px) {
      .conn-grid { grid-template-columns: 1fr; }
    }

    .conn-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 11px 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.14s ease;
      min-width: 0;
    }
    .conn-row:hover {
      background: var(--ea-row-hover);
    }

    .conn-icon {
      width: 44px;
      height: 44px;
      border-radius: 11px;
      flex-shrink: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--ea-icon-bg);
      border: 1px solid var(--ea-icon-border);
      padding: 5px;
    }
    .conn-icon.bleed {
      padding: 0;
      background: #0b0b0d;
    }
    .conn-icon img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .conn-icon.bleed img {
      object-fit: cover;
    }

    .conn-body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .conn-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--ea-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }
    .conn-cat {
      font-size: 12px;
      color: var(--ea-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.35;
    }
    .conn-status {
      font-size: 11.5px;
      line-height: 1.35;
      margin-top: 1px;
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .st-ok { color: var(--ea-ok); font-weight: 500; }
    .st-warn { color: var(--ea-warn); }
    .st-muted { color: var(--ea-muted); opacity: 0.78; }
    .st-sub { color: var(--ea-muted); opacity: 0.8; }

    .conn-act {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: var(--ea-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.14s ease, color 0.14s ease;
    }
    .conn-act:hover {
      background: var(--ea-act-hover);
      color: var(--ea-text);
    }
    .conn-act:disabled { opacity: 0.5; cursor: wait; }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 34px;
      padding: 0 13px;
      border-radius: 9px;
      border: 1px solid var(--ea-border);
      background: var(--ea-bg);
      color: var(--ea-text);
      font: inherit;
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.14s ease, border-color 0.14s ease, opacity 0.14s ease;
    }
    .btn:hover { background: var(--ea-row-hover); border-color: var(--ea-border-strong); }
    .btn:disabled { opacity: 0.5; cursor: wait; }
    .btn.primary {
      background: var(--ea-primary);
      color: var(--ea-primary-fg);
      border-color: transparent;
    }
    .btn.primary:hover { opacity: 0.88; }
    .btn.sm { height: 29px; padding: 0 10px; font-size: 12px; border-radius: 7px; }
    .btn.ghost { border-color: transparent; background: transparent; color: var(--ea-muted); }
    .btn.ghost:hover { background: var(--ea-row-hover); color: var(--ea-text); }

    /* Settings & License View */
    .view.hidden { display: none; }
    .settings-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .s-card {
      border-radius: 13px;
      border: 1px solid var(--ea-border);
      background: var(--ea-surface);
      padding: 18px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .s-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .s-card-title {
      font-size: 14.5px;
      font-weight: 600;
      margin: 0;
    }
    .s-card-desc {
      font-size: 12.5px;
      color: var(--ea-muted);
      margin: 0;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      padding: 3px 10px;
      border-radius: 999px;
      background: var(--ea-row-hover);
      color: var(--ea-muted);
    }
    .badge.ok { background: var(--ea-ok-soft); color: var(--ea-ok); }
    .badge.warn { background: var(--ea-warn-soft); color: var(--ea-warn); }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px 18px;
      padding: 10px 12px;
      border-radius: 10px;
      background: var(--ea-bg);
      border: 1px solid var(--ea-border);
    }
    @media (max-width: 560px) {
      .meta-grid { grid-template-columns: 1fr; }
    }
    .meta-item { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .meta-label { font-size: 11px; color: var(--ea-muted); }
    .meta-val {
      font-size: 12.5px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .meta-val.mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; }

    .log-box {
      margin: 0;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid var(--ea-border);
      background: var(--ea-bg);
      color: var(--ea-muted);
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11.5px;
      line-height: 1.5;
      max-height: 220px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Software Detail Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: var(--ea-backdrop);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      z-index: 90;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.16s ease;
    }
    .modal-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
    .modal {
      width: 100%;
      max-width: 520px;
      max-height: 86vh;
      overflow-y: auto;
      border-radius: 16px;
      border: 1px solid var(--ea-border);
      background: var(--ea-modal-bg);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
      padding: 20px 22px 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transform: translateY(6px);
      transition: transform 0.16s ease;
    }
    .modal-backdrop.open .modal { transform: translateY(0); }
    .modal-head {
      display: flex;
      align-items: center;
      gap: 13px;
    }
    .modal-ident { flex: 1; min-width: 0; }
    .modal-title {
      margin: 0;
      font-size: 16px;
      font-weight: 650;
      line-height: 1.25;
    }
    .modal-sub {
      margin-top: 2px;
      font-size: 12px;
      color: var(--ea-muted);
    }
    .modal-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .modal-path {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11.5px;
      color: var(--ea-muted);
      background: var(--ea-surface);
      border: 1px solid var(--ea-border);
      border-radius: 9px;
      padding: 8px 10px;
      word-break: break-all;
    }
    .modal-prereq {
      font-size: 12.5px;
      color: var(--ea-muted);
      line-height: 1.5;
    }
    .modal-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding-top: 4px;
    }
    .tools-wrap {
      border-top: 1px solid var(--ea-border);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .tools-label { font-size: 12px; font-weight: 500; color: var(--ea-muted); }
    .tools-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      max-height: 180px;
      overflow-y: auto;
    }
    .tool-chip {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 6px;
      background: var(--ea-surface);
      border: 1px solid var(--ea-border);
      color: var(--ea-text);
    }

    .empty {
      padding: 40px 16px;
      text-align: center;
      font-size: 13px;
      color: var(--ea-muted);
    }

    .toast {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translateX(-50%) translateY(10px);
      background: var(--ea-primary);
      color: var(--ea-primary-fg);
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 500;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.16s ease, transform 0.16s ease;
      z-index: 120;
      max-width: 88vw;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  </style>
</head>
<body>
  <div class="workspace">
    <!-- Left Navigation Sidebar (shown on fullscreen global view) -->
    <aside class="sidebar" aria-label="Software connections navigation">
      <div class="sb-head">
        <span class="sb-title" id="sbTitle">\u8F6F\u4EF6\u8FDE\u63A5</span>
        <span class="ed-tag">${accent.tag}</span>
      </div>

      <nav class="sb-nav">
        <button type="button" class="sb-nav-btn active" id="navConnections" data-nav="connections">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          <span id="navConnectionsLabel">\u8FDE\u63A5</span>
        </button>
        <button type="button" class="sb-nav-btn" id="navSettings" data-nav="settings">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
          <span id="navSettingsLabel">\u6388\u6743\u4E0E\u8BBE\u7F6E</span>
          <span class="sb-nav-dot" id="sbLicenseDot"></span>
        </button>
      </nav>

      <div class="sb-divider"></div>
      <div class="sb-section" id="sbInstalledTitle">\u5DF2\u5B89\u88C5</div>
      <div class="sb-list" id="sidebarInstalled"></div>
    </aside>

    <!-- Main Right Pane -->
    <main class="main">
      <div class="container">
        <!-- View 1: Connections -->
        <section class="view" id="viewConnections">
          <div class="page-header">
            <div>
              <div class="page-title-row">
                <h1 class="page-title" id="pageTitle">\u8FDE\u63A5</h1>
                <span class="ed-tag">${accent.tag}</span>
              </div>
              <p class="page-subtitle" id="pageSubtitle">\u8FDE\u63A5\u5DE5\u7A0B\u8F6F\u4EF6\uFF0C\u4E0E Agent \u534F\u540C\u5DE5\u4F5C</p>
            </div>
            <div class="header-controls">
              <div class="search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input id="searchInput" class="search-input" type="search" placeholder="\u641C\u7D22\u8FDE\u63A5" />
              </div>
              <button type="button" class="icon-btn" id="btnRefresh" title="\u5237\u65B0\u626B\u63CF" aria-label="\u5237\u65B0\u626B\u63CF">
                <svg id="refreshIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>
              </button>
              <button type="button" class="icon-btn" id="btnOpenSettings" title="\u6388\u6743\u4E0E\u8BBE\u7F6E" aria-label="\u6388\u6743\u4E0E\u8BBE\u7F6E">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
                <span class="icon-dot" id="hdrLicenseDot"></span>
              </button>
            </div>
          </div>

          <div class="filter-bar">
            <div class="filter-pills" id="filterPills"></div>
            <div class="summary-hint" id="summaryHint"></div>
          </div>

          <!-- Inline activation banner (auto-hides once activated) -->
          <div class="lic-banner hidden" id="inlineLicenseBanner">
            <div class="lic-banner-top">
              <div class="lic-status-inline" id="inlineLicenseMsg">
                <span class="lic-dot"></span>
                <span>\u5C1A\u672A\u6FC0\u6D3B\u6388\u6743</span>
              </div>
              <div class="fp-chip">
                <span id="inlineFpText">\u673A\u5668\u7801: --</span>
                <button type="button" class="btn sm" id="btnCopyFpInline">\u590D\u5236</button>
              </div>
            </div>
            <div class="lic-form">
              <input id="inlineLicenseInput" class="text-input" type="text" placeholder="\u8F93\u5165\u6FC0\u6D3B\u5361\u5BC6\uFF08EA-CAD-XXXX-XXXX-XXXX\uFF09\u6216\u79BB\u7EBF\u6388\u6743\u7801\uFF08EA1.xxx\uFF09" />
              <button type="button" class="btn primary" id="btnActivateInline">\u6FC0\u6D3B\u6388\u6743</button>
            </div>
          </div>

          <div id="connectionsContainer">
            <div class="empty">\u6B63\u5728\u68C0\u6D4B\u672C\u673A\u5DE5\u7A0B\u8F6F\u4EF6\u4E0E MCP \u9002\u914D\u5668...</div>
          </div>
        </section>

        <!-- View 2: License & Settings -->
        <section class="view hidden" id="viewSettings">
          <div class="page-header">
            <div>
              <div class="page-title-row">
                <h1 class="page-title" id="settingsTitle">\u6388\u6743\u4E0E\u8BBE\u7F6E</h1>
                <span class="ed-tag">${spec.sku}</span>
              </div>
              <p class="page-subtitle" id="settingsSubtitle">${spec.nameZh} \xB7 \u7BA1\u7406\u5546\u4E1A\u6388\u6743\u3001\u5BBF\u4E3B\u540C\u6B65\u4E0E\u8FD0\u884C\u65E5\u5FD7</p>
            </div>
            <div class="header-controls">
              <button type="button" class="btn" id="btnBackToConnections">\u8FD4\u56DE\u8FDE\u63A5</button>
            </div>
          </div>

          <div class="settings-stack">
            <div class="s-card">
              <div class="s-card-head">
                <div>
                  <h2 class="s-card-title" id="secLicTitle">\u5546\u4E1A\u6388\u6743</h2>
                  <p class="s-card-desc" id="secLicDesc">\u652F\u6301\u5728\u7EBF\u6FC0\u6D3B\u5361\u5BC6\uFF08\u81EA\u52A8\u7ED1\u5B9A\u672C\u673A\u6C38\u4E45\u751F\u6548\uFF09\u53CA\u79BB\u7EBF Ed25519 \u6388\u6743\u7801\u3002</p>
                </div>
                <span class="badge warn" id="settingsLicBadge">\u672A\u6FC0\u6D3B</span>
              </div>
              <div class="meta-grid" id="settingsLicMeta"></div>
              <div class="lic-form">
                <input id="settingsLicenseInput" class="text-input" type="text" placeholder="\u8F93\u5165\u6FC0\u6D3B\u5361\u5BC6\uFF08EA-CAD-XXXX-XXXX-XXXX\uFF09\u6216\u79BB\u7EBF\u6388\u6743\u7801\uFF08EA1.xxx\uFF09" />
                <button type="button" class="btn primary" id="btnActivateSettings">\u6FC0\u6D3B\u6388\u6743</button>
                <button type="button" class="btn" id="btnCopyFpSettings">\u590D\u5236\u673A\u5668\u7801</button>
              </div>
            </div>

            <div class="s-card">
              <div class="s-card-head">
                <div>
                  <h2 class="s-card-title" id="secSyncTitle">\u540C\u6B65\u5230 ChatGPT Desktop</h2>
                  <p class="s-card-desc" id="secSyncDesc">\u5C06\u6240\u6709\u5DF2\u914D\u7F6E\u7684\u672C\u5730\u5DE5\u7A0B\u8F6F\u4EF6 MCP \u9002\u914D\u5668\u5199\u5165 ~/.codex/config.toml\u3002</p>
                </div>
                <button type="button" class="btn" id="btnSync">\u540C\u6B65\u5230 ChatGPT</button>
              </div>
            </div>

            <div class="s-card">
              <div class="s-card-head">
                <h2 class="s-card-title" id="secLogTitle">\u8FDE\u63A5\u4E0E\u914D\u7F6E\u65E5\u5FD7</h2>
                <button type="button" class="btn sm ghost" id="btnClearLog">\u6E05\u7A7A</button>
              </div>
              <pre class="log-box" id="logContent">\u5C31\u7EEA\u3002</pre>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>

  <!-- Software Detail Modal -->
  <div class="modal-backdrop" id="detailBackdrop" role="dialog" aria-modal="true" aria-hidden="true">
    <div class="modal" id="detailModal"></div>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  <script>
    (function () {
      const EDITION = ${JSON.stringify(edition)};
      const EDITION_SKU = ${JSON.stringify(spec.sku)};
      const CACHE_KEY = ${JSON.stringify(cacheKey)};
      const SOFTWARE_ICONS = ${iconsJson};
      const BLEED_ICONS = new Set(['ansys-aedt', 'ansys-fluent', 'ansys-workbench', 'catia', 'calculix', 'ads']);
      const PROTOCOL_VERSION = '2026-01-26';

      let isZh = (navigator.language || 'zh').toLowerCase().startsWith('zh');
      let state = null;
      let activeView = 'connections';
      let activeFilter = 'all';
      let selectedAdapterId = null;
      let busyIds = new Set();
      let toolsBySoftware = {};
      let hostConnected = false;
      let nextRpcId = 1;
      const pending = new Map();

      const CAT_ORDER = ['cad', 'cae', 'eda'];
      const CAT_LABELS = {
        zh: {
          cad: 'CAD \xB7 \u4E09\u7EF4\u5EFA\u6A21\u4E0E\u5DE5\u7A0B\u56FE',
          cae: 'CAE \xB7 \u4EFF\u771F\u8BA1\u7B97\u4E0E\u5DE5\u7A0B\u5206\u6790',
          eda: 'EDA \xB7 \u7535\u8DEF\u4E0EPCB\u8BBE\u8BA1',
        },
        en: {
          cad: 'CAD \xB7 3D Modeling & Drafting',
          cae: 'CAE \xB7 Simulation & Engineering Analysis',
          eda: 'EDA \xB7 Circuits & PCB Design',
        },
      };

      const STR = {
        zh: {
          sbTitle: '\u8F6F\u4EF6\u8FDE\u63A5',
          navConnections: '\u8FDE\u63A5',
          navSettings: '\u6388\u6743\u4E0E\u8BBE\u7F6E',
          sbInstalled: '\u5DF2\u5B89\u88C5',
          sbEmpty: '\u6682\u672A\u68C0\u6D4B\u5230\u672C\u673A\u8F6F\u4EF6',
          pageTitle: '\u8FDE\u63A5',
          pageSubtitle: '\u8FDE\u63A5\u5DE5\u7A0B\u8F6F\u4EF6\uFF0C\u4E0E Agent \u534F\u540C\u5DE5\u4F5C',
          search: '\u641C\u7D22\u8FDE\u63A5',
          refreshTitle: '\u5237\u65B0\u626B\u63CF',
          settingsTitle: '\u6388\u6743\u4E0E\u8BBE\u7F6E',
          settingsSubtitle: '\u7BA1\u7406\u5546\u4E1A\u6388\u6743\u3001\u5BBF\u4E3B\u540C\u6B65\u4E0E\u8FD0\u884C\u65E5\u5FD7',
          backToConnections: '\u8FD4\u56DE\u8FDE\u63A5',
          all: '\u5168\u90E8',
          connectedOnly: '\u5DF2\u8FDE\u63A5',
          pendingOnly: '\u5F85\u63A5\u5165',
          mcpConnected: 'MCP \u5DF2\u8FDE\u63A5',
          installedLocal: '\u672C\u673A\u5DF2\u5B89\u88C5',
          notConnected: '\u5F85\u63A5\u5165',
          bridgeOffline: '\u6865\u63A5\u672A\u542F\u52A8',
          bridgeOnline: '\u6865\u63A5\u5728\u7EBF',
          toolsUnit: '\u4E2A\u5DE5\u5177',
          noMatch: '\u6CA1\u6709\u5339\u914D\u7684\u8F6F\u4EF6\u8FDE\u63A5\u3002',
          licensed: '\u6388\u6743\u5DF2\u6FC0\u6D3B',
          unlicensed: '\u5C1A\u672A\u6FC0\u6D3B\u6388\u6743',
          editionMismatch: '\u5F53\u524D\u6388\u6743\u7248\u672C\u4E0D\u5339\u914D',
          perpetual: '\u6C38\u4E45 / Perpetual',
          activate: '\u6FC0\u6D3B\u6388\u6743',
          copy: '\u590D\u5236',
          copyFp: '\u590D\u5236\u673A\u5668\u7801',
          fpPrefix: '\u673A\u5668\u7801: ',
          copied: '\u673A\u5668\u7801\u5DF2\u590D\u5236',
          needKey: '\u8BF7\u5148\u8F93\u5165\u6FC0\u6D3B\u5361\u5BC6\uFF08EA-...\uFF09\u6216\u79BB\u7EBF\u6388\u6743\u7801\uFF08EA1....\uFF09',
          keyPlaceholder: '\u8F93\u5165\u6FC0\u6D3B\u5361\u5BC6\uFF08EA-CAD-XXXX-XXXX-XXXX\uFF09\u6216\u79BB\u7EBF\u6388\u6743\u7801\uFF08EA1.xxx\uFF09',
          secLicTitle: '\u5546\u4E1A\u6388\u6743',
          secLicDesc: '\u652F\u6301\u5728\u7EBF\u6FC0\u6D3B\u5361\u5BC6\uFF08\u81EA\u52A8\u7ED1\u5B9A\u672C\u673A\u6C38\u4E45\u751F\u6548\uFF09\u53CA\u79BB\u7EBF Ed25519 \u6388\u6743\u7801\u3002',
          secSyncTitle: '\u540C\u6B65\u5230 ChatGPT Desktop',
          secSyncDesc: '\u5C06\u6240\u6709\u5DF2\u914D\u7F6E\u7684\u672C\u5730\u5DE5\u7A0B\u8F6F\u4EF6 MCP \u9002\u914D\u5668\u5199\u5165 ~/.codex/config.toml\u3002',
          syncBtn: '\u540C\u6B65\u5230 ChatGPT',
          secLogTitle: '\u8FDE\u63A5\u4E0E\u914D\u7F6E\u65E5\u5FD7',
          clearLog: '\u6E05\u7A7A',
          btnSetup: '\u4E00\u952E\u914D\u7F6E\u63A5\u5165',
          btnReconfigure: '\u91CD\u65B0\u914D\u7F6E',
          btnProbe: '\u6D4B\u8BD5\u8FDE\u63A5',
          btnTools: '\u67E5\u770B\u5DE5\u5177',
          btnUseInChat: '\u5728\u5BF9\u8BDD\u4E2D\u4F7F\u7528',
          working: '\u5904\u7406\u4E2D...',
          detected: '\u672C\u673A\u5DF2\u5B89\u88C5',
          notDetected: '\u672A\u68C0\u6D4B\u5230\u5B89\u88C5',
          toolsListTitle: '\u5DF2\u53D1\u73B0 MCP \u5DE5\u5177',
          metaEdition: '\u5F53\u524D\u63D2\u4EF6\u7248\u672C',
          metaLicenseEdition: '\u5DF2\u6FC0\u6D3B\u6388\u6743',
          metaCustomer: '\u6388\u6743\u5F52\u5C5E',
          metaExpiry: '\u6709\u6548\u671F',
          metaMachine: '\u672C\u673A\u673A\u5668\u7801',
          needLicenseFirst: '\u8BF7\u5148\u6FC0\u6D3B\u8986\u76D6\u8BE5\u7248\u672C\u7684\u5546\u4E1A\u6388\u6743\u540E\u518D\u63A5\u5165\u3002',
          summaryFmt: function (ready, total) { return '\u5DF2\u8FDE\u63A5 ' + ready + ' / ' + total; },
        },
        en: {
          sbTitle: 'Connections',
          navConnections: 'Connections',
          navSettings: 'License & Settings',
          sbInstalled: 'Installed',
          sbEmpty: 'No local software detected',
          pageTitle: 'Connections',
          pageSubtitle: 'Connect engineering software to collaborate with your Agent',
          search: 'Search connections',
          refreshTitle: 'Refresh scan',
          settingsTitle: 'License & Settings',
          settingsSubtitle: 'Manage commercial license, host sync, and activity logs',
          backToConnections: 'Back',
          all: 'All',
          connectedOnly: 'Connected',
          pendingOnly: 'Pending',
          mcpConnected: 'MCP Connected',
          installedLocal: 'Installed locally',
          notConnected: 'Not connected',
          bridgeOffline: 'Bridge offline',
          bridgeOnline: 'Bridge online',
          toolsUnit: 'tools',
          noMatch: 'No matching software connections.',
          licensed: 'License Active',
          unlicensed: 'Not Activated',
          editionMismatch: 'License Edition Mismatch',
          perpetual: 'Perpetual',
          activate: 'Activate',
          copy: 'Copy',
          copyFp: 'Copy Machine ID',
          fpPrefix: 'Machine ID: ',
          copied: 'Machine ID copied',
          needKey: 'Please enter a redeem code (EA-...) or offline key (EA1....).',
          keyPlaceholder: 'Enter redeem code (EA-CAD-XXXX-XXXX-XXXX) or offline key (EA1.xxx)',
          secLicTitle: 'Commercial License',
          secLicDesc: 'Supports online redeem codes (auto-bound permanently) and offline Ed25519 keys.',
          secSyncTitle: 'Sync to ChatGPT Desktop',
          secSyncDesc: 'Register all provisioned engineering MCP adapters into ~/.codex/config.toml.',
          syncBtn: 'Sync to ChatGPT',
          secLogTitle: 'Activity Log',
          clearLog: 'Clear',
          btnSetup: 'One-Click Connect',
          btnReconfigure: 'Reconfigure',
          btnProbe: 'Test Connection',
          btnTools: 'View Tools',
          btnUseInChat: 'Use in Chat',
          working: 'Working...',
          detected: 'Installed',
          notDetected: 'Not found',
          toolsListTitle: 'Discovered MCP Tools',
          metaEdition: 'Plugin Edition',
          metaLicenseEdition: 'Active License',
          metaCustomer: 'License Holder',
          metaExpiry: 'Validity',
          metaMachine: 'Machine Fingerprint',
          needLicenseFirst: 'Activate a matching commercial license before connecting.',
          summaryFmt: function (ready, total) { return ready + ' / ' + total + ' connected'; },
        },
      };

      const t = function (k) {
        return (isZh ? STR.zh[k] : STR.en[k]) || k;
      };

      function catLabel(cat) {
        const key = String(cat || '').toLowerCase();
        return (isZh ? CAT_LABELS.zh[key] : CAT_LABELS.en[key]) || key.toUpperCase();
      }

      function esc(s) {
        return String(s ?? '').replace(/[&<>"']/g, function (c) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
      }

      function toast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { el.classList.remove('show'); }, 2600);
      }

      function appendLog(msg) {
        const el = document.getElementById('logContent');
        const line = '[' + new Date().toLocaleTimeString() + '] ' + msg;
        el.textContent = (el.textContent === '\u5C31\u7EEA\u3002' || !el.textContent) ? line : (el.textContent + '\\n' + line);
        el.scrollTop = el.scrollHeight;
      }

      function renderSoftwareIcon(id, sizeClass) {
        const src = SOFTWARE_ICONS[id];
        const bleed = BLEED_ICONS.has(id) ? ' bleed' : '';
        if (src) {
          return '<div class="' + sizeClass + bleed + '"><img src="' + src + '" alt="" /></div>';
        }
        return '<div class="' + sizeClass + '"><span style="font-size:11px;font-weight:700">' + esc(id.slice(0, 3).toUpperCase()) + '</span></div>';
      }

      function iconSvg(kind) {
        if (kind === 'plus') {
          return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
        }
        if (kind === 'dots') {
          return '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
        }
        if (kind === 'spinner') {
          return '<svg class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>';
        }
        if (kind === 'gear') {
          return '<svg width="13.5" height="13.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>';
        }
        return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
      }

      function applyStaticLabels() {
        document.getElementById('sbTitle').textContent = t('sbTitle');
        document.getElementById('navConnectionsLabel').textContent = t('navConnections');
        document.getElementById('navSettingsLabel').textContent = t('navSettings');
        document.getElementById('sbInstalledTitle').textContent = t('sbInstalled');
        document.getElementById('pageTitle').textContent = t('pageTitle');
        document.getElementById('pageSubtitle').textContent = t('pageSubtitle');
        document.getElementById('searchInput').placeholder = t('search');
        document.getElementById('btnRefresh').title = t('refreshTitle');
        document.getElementById('btnOpenSettings').title = t('settingsTitle');
        document.getElementById('settingsTitle').textContent = t('settingsTitle');
        document.getElementById('settingsSubtitle').textContent = t('settingsSubtitle');
        document.getElementById('btnBackToConnections').textContent = t('backToConnections');
        document.getElementById('btnCopyFpInline').textContent = t('copy');
        document.getElementById('btnActivateInline').textContent = t('activate');
        document.getElementById('inlineLicenseInput').placeholder = t('keyPlaceholder');
        document.getElementById('settingsLicenseInput').placeholder = t('keyPlaceholder');
        document.getElementById('btnActivateSettings').textContent = t('activate');
        document.getElementById('btnCopyFpSettings').textContent = t('copyFp');
        document.getElementById('secLicTitle').textContent = t('secLicTitle');
        document.getElementById('secLicDesc').textContent = t('secLicDesc');
        document.getElementById('secSyncTitle').textContent = t('secSyncTitle');
        document.getElementById('secSyncDesc').textContent = t('secSyncDesc');
        document.getElementById('btnSync').textContent = t('syncBtn');
        document.getElementById('secLogTitle').textContent = t('secLogTitle');
        document.getElementById('btnClearLog').textContent = t('clearLog');
      }

      function applyHostContext(ctx) {
        if (!ctx || typeof ctx !== 'object') return;
        if (ctx.theme === 'dark' || ctx.theme === 'light') {
          document.documentElement.setAttribute('data-theme', ctx.theme);
        }
        if (typeof ctx.locale === 'string' && ctx.locale) {
          isZh = ctx.locale.toLowerCase().startsWith('zh');
          applyStaticLabels();
          if (state) render();
        }
        if (ctx.styles && ctx.styles.variables && typeof ctx.styles.variables === 'object') {
          for (const [k, v] of Object.entries(ctx.styles.variables)) {
            if (typeof k === 'string' && typeof v === 'string') {
              document.documentElement.style.setProperty(k.startsWith('--') ? k : ('--' + k), v);
            }
          }
        }
        if (ctx.safeAreaInsets && typeof ctx.safeAreaInsets === 'object') {
          const ins = ctx.safeAreaInsets;
          if (typeof ins.top === 'number') document.documentElement.style.setProperty('--ea-safe-top', ins.top + 'px');
          if (typeof ins.right === 'number') document.documentElement.style.setProperty('--ea-safe-right', ins.right + 'px');
          if (typeof ins.bottom === 'number') document.documentElement.style.setProperty('--ea-safe-bottom', ins.bottom + 'px');
          if (typeof ins.left === 'number') document.documentElement.style.setProperty('--ea-safe-left', ins.left + 'px');
        }
      }

      function rpcRequest(method, params) {
        return new Promise(function (resolve, reject) {
          const id = nextRpcId++;
          const timer = setTimeout(function () {
            pending.delete(id);
            reject(new Error('Host RPC timeout: ' + method));
          }, 120000);
          pending.set(id, {
            resolve: function (val) { clearTimeout(timer); resolve(val); },
            reject: function (err) { clearTimeout(timer); reject(err); },
          });
          window.parent.postMessage({ jsonrpc: '2.0', id: id, method: method, params: params }, '*');
        });
      }

      function extractToolPayload(result) {
        if (!result || typeof result !== 'object') return null;
        if (result.structuredContent && typeof result.structuredContent === 'object') {
          return result.structuredContent;
        }
        if (Array.isArray(result.content)) {
          const txt = result.content.find(function (c) { return c && c.type === 'text' && typeof c.text === 'string'; });
          if (txt) {
            try { return JSON.parse(txt.text); } catch { return { text: txt.text }; }
          }
        }
        return result;
      }

      async function callTool(name, args) {
        const res = await rpcRequest('tools/call', { name: name, arguments: args || {} });
        return { raw: res, data: extractToolPayload(res), isError: Boolean(res && res.isError) };
      }

      function updateModelContext() {
        if (!hostConnected || !state) return;
        const ready = (state.adapters || []).filter(function (a) { return a.provisioned; }).map(function (a) { return a.id; });
        const detected = (state.adapters || []).filter(function (a) { return Boolean(a.appInstalled); }).map(function (a) { return a.id; });
        rpcRequest('ui/update-model-context', {
          structuredContent: {
            edition: EDITION,
            licensed: Boolean(state.license && state.license.activated),
            detectedAdapters: detected,
            connectedAdapters: ready,
          },
        }).catch(function () {});
      }

      function setView(view) {
        activeView = view === 'settings' ? 'settings' : 'connections';
        document.getElementById('viewConnections').classList.toggle('hidden', activeView !== 'connections');
        document.getElementById('viewSettings').classList.toggle('hidden', activeView !== 'settings');
        document.getElementById('navConnections').classList.toggle('active', activeView === 'connections');
        document.getElementById('navSettings').classList.toggle('active', activeView === 'settings');
        document.getElementById('btnOpenSettings').classList.toggle('active', activeView === 'settings');
      }

      function setState(next) {
        if (!next || !Array.isArray(next.adapters)) return;
        state = next;
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch {}
        render();
        updateModelContext();
      }

      async function refreshStatus(silent) {
        const btn = document.getElementById('btnRefresh');
        const ico = document.getElementById('refreshIcon');
        btn.disabled = true;
        ico.classList.add('spin');
        try {
          const res = await callTool('connector_status', {});
          setState(res.data);
          if (!silent) {
            appendLog('\u5DF2\u5237\u65B0\u626B\u63CF\uFF1A\u5171 ' + (res.data && res.data.adapters ? res.data.adapters.length : 0) + ' \u4E2A\u9002\u914D\u5668\u3002');
          }
        } catch (err) {
          appendLog('\u5237\u65B0\u5931\u8D25: ' + (err && err.message ? err.message : String(err)));
        } finally {
          btn.disabled = false;
          ico.classList.remove('spin');
        }
      }

      function renderLicenseState(lic) {
        const activated = Boolean(lic && lic.activated);
        const mismatch = Boolean(lic && lic.editionMismatch);
        const fp = (lic && lic.machineFingerprint) || '--';

        document.getElementById('sbLicenseDot').classList.toggle('ok', activated);
        document.getElementById('hdrLicenseDot').classList.toggle('ok', activated);

        // Inline banner on Connections view: show ONLY when unlicensed or edition mismatch
        const banner = document.getElementById('inlineLicenseBanner');
        banner.classList.toggle('hidden', activated);
        document.getElementById('inlineFpText').textContent = t('fpPrefix') + fp;
        if (!activated) {
          let msg = t('unlicensed');
          if (mismatch && lic.edition) {
            msg = isZh
              ? ('\u5F53\u524D\u672C\u673A\u6388\u6743\u4E3A ' + String(lic.edition).toUpperCase() + ' \u7248\uFF0C\u4E0D\u542B ' + EDITION.toUpperCase() + '\uFF1B\u8BF7\u8F93\u5165 ' + EDITION.toUpperCase() + ' \u6216 Suite \u6FC0\u6D3B\u5361\u5BC6')
              : ('Current license is ' + String(lic.edition).toUpperCase() + ' only; enter a ' + EDITION.toUpperCase() + ' or Suite code.');
          }
          document.getElementById('inlineLicenseMsg').innerHTML = '<span class="lic-dot"></span><span>' + esc(msg) + '</span>';
        }

        // Settings view license card
        const badge = document.getElementById('settingsLicBadge');
        badge.className = 'badge ' + (activated ? 'ok' : 'warn');
        badge.textContent = activated ? t('licensed') : (mismatch ? t('editionMismatch') : t('unlicensed'));

        const licEditionLabel = lic && lic.edition ? String(lic.edition).toUpperCase() : '--';
        const customerLabel = (lic && (lic.customer || lic.licenseId)) || '--';
        const expiryLabel = lic && lic.edition
          ? (lic.expiresAt ? String(lic.expiresAt).slice(0, 10) : t('perpetual'))
          : '--';

        document.getElementById('settingsLicMeta').innerHTML = [
          '<div class="meta-item"><span class="meta-label">' + esc(t('metaEdition')) + '</span><span class="meta-val">' + esc(EDITION_SKU) + '</span></div>',
          '<div class="meta-item"><span class="meta-label">' + esc(t('metaLicenseEdition')) + '</span><span class="meta-val">' + esc(licEditionLabel) + '</span></div>',
          '<div class="meta-item"><span class="meta-label">' + esc(t('metaCustomer')) + '</span><span class="meta-val">' + esc(customerLabel) + '</span></div>',
          '<div class="meta-item"><span class="meta-label">' + esc(t('metaExpiry')) + '</span><span class="meta-val">' + esc(expiryLabel) + '</span></div>',
          '<div class="meta-item" style="grid-column:1/-1"><span class="meta-label">' + esc(t('metaMachine')) + '</span><span class="meta-val mono">' + esc(fp) + '</span></div>',
        ].join('');
      }

      function renderSidebarInstalled(adapters) {
        const el = document.getElementById('sidebarInstalled');
        const list = adapters
          .filter(function (a) { return a.provisioned || a.appInstalled; })
          .sort(function (a, b) {
            if (Boolean(a.provisioned) !== Boolean(b.provisioned)) return a.provisioned ? -1 : 1;
            return 0;
          });

        if (list.length === 0) {
          el.innerHTML = '<div class="sb-empty">' + esc(t('sbEmpty')) + '</div>';
          return;
        }

        el.innerHTML = list.map(function (a) {
          const name = isZh ? (a.titleZh || a.title || a.id) : (a.title || a.id);
          const busy = busyIds.has(a.id);
          return [
            '<div class="sb-item">',
            '  <button type="button" class="sb-item-main" data-open-detail="' + esc(a.id) + '" title="' + esc(name) + '">',
            '    ' + renderSoftwareIcon(a.id, 'sb-item-ico'),
            '    <span class="sb-item-name">' + esc(name) + '</span>',
            '  </button>',
            '  <button type="button" class="sb-gear" data-open-detail="' + esc(a.id) + '" title="' + esc(name) + '">' + iconSvg('gear') + '</button>',
            '  <button type="button" class="toggle ' + (a.provisioned ? 'on' : '') + '" data-toggle-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + ' aria-pressed="' + (a.provisioned ? 'true' : 'false') + '" title="' + esc(a.provisioned ? t('btnProbe') : t('btnSetup')) + '"></button>',
            '</div>',
          ].join('');
        }).join('');
      }

      function renderFilterPills(adapters) {
        const cats = Array.from(new Set(adapters.map(function (a) { return String(a.category).toLowerCase(); })));
        const pillsEl = document.getElementById('filterPills');

        let options;
        if (cats.length > 1) {
          options = [{ id: 'all', label: t('all') }].concat(
            CAT_ORDER.filter(function (c) { return cats.includes(c); }).map(function (c) {
              return { id: c, label: c.toUpperCase() };
            })
          );
        } else {
          options = [
            { id: 'all', label: t('all') },
            { id: 'connected', label: t('connectedOnly') },
            { id: 'pending', label: t('pendingOnly') },
          ];
        }

        if (!options.some(function (o) { return o.id === activeFilter; })) {
          activeFilter = 'all';
        }

        pillsEl.innerHTML = options.map(function (o) {
          return '<button type="button" class="filter-pill ' + (activeFilter === o.id ? 'active' : '') + '" data-filter="' + esc(o.id) + '">' + esc(o.label) + '</button>';
        }).join('');

        const readyCount = adapters.filter(function (a) { return a.provisioned; }).length;
        document.getElementById('summaryHint').textContent = STR[isZh ? 'zh' : 'en'].summaryFmt(readyCount, adapters.length);
      }

      function renderConnectionsList(adapters) {
        const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
        const filtered = adapters.filter(function (a) {
          const cat = String(a.category || '').toLowerCase();
          if (activeFilter === 'connected' && !a.provisioned) return false;
          if (activeFilter === 'pending' && a.provisioned) return false;
          if (CAT_ORDER.includes(activeFilter) && cat !== activeFilter) return false;
          if (!q) return true;
          return [
            a.id,
            a.title,
            a.titleZh,
            a.category,
            a.prerequisitesZh,
            a.prerequisitesEn,
            a.appDetail,
          ].join(' ').toLowerCase().includes(q);
        });

        const container = document.getElementById('connectionsContainer');
        if (filtered.length === 0) {
          container.innerHTML = '<div class="empty">' + esc(t('noMatch')) + '</div>';
          return;
        }

        const groupedHtml = [];
        for (const cat of CAT_ORDER) {
          const groupItems = filtered.filter(function (a) { return String(a.category || '').toLowerCase() === cat; });
          if (groupItems.length === 0) continue;

          const rowsHtml = groupItems.map(function (a) {
            const busy = busyIds.has(a.id);
            const name = isZh ? (a.titleZh || a.title || a.id) : (a.title || a.id);
            const toolCount = typeof a.toolCount === 'number'
              ? a.toolCount
              : (Array.isArray(a.toolNames) ? a.toolNames.length : 0);

            let statusHtml = '';
            if (a.provisioned) {
              statusHtml = '<span class="st-ok">' + esc(t('mcpConnected')) + '</span>';
              if (a.bridgeReady === false) {
                statusHtml += '<span class="st-warn">\xB7 ' + esc(t('bridgeOffline')) + (a.bridgePort ? ' :' + esc(a.bridgePort) : '') + '</span>';
              } else if (toolCount > 0) {
                statusHtml += '<span class="st-sub">\xB7 ' + esc(toolCount) + ' ' + esc(t('toolsUnit')) + '</span>';
              }
            } else if (a.appInstalled) {
              statusHtml = '<span class="st-muted">' + esc(t('installedLocal')) + '</span>';
            } else {
              statusHtml = '<span class="st-muted">' + esc(t('notConnected')) + '</span>';
            }

            const actKind = busy ? 'spinner' : (a.provisioned ? 'dots' : 'plus');
            const actType = a.provisioned ? 'detail' : 'setup';
            const actTitle = a.provisioned ? name : t('btnSetup');

            return [
              '<div class="conn-row" data-row-id="' + esc(a.id) + '">',
              '  ' + renderSoftwareIcon(a.id, 'conn-icon'),
              '  <div class="conn-body">',
              '    <div class="conn-name">' + esc(name) + '</div>',
              '    <div class="conn-cat">' + esc(catLabel(a.category)) + '</div>',
              '    <div class="conn-status">' + statusHtml + '</div>',
              '  </div>',
              '  <button type="button" class="conn-act" data-quick-action="' + actType + '" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + ' title="' + esc(actTitle) + '" aria-label="' + esc(actTitle) + '">' + iconSvg(actKind) + '</button>',
              '</div>',
            ].join('');
          }).join('');

          groupedHtml.push(
            '<div class="cat-group">' +
            '  <div class="cat-heading">' + esc(catLabel(cat)) + '</div>' +
            '  <div class="conn-grid">' + rowsHtml + '</div>' +
            '</div>'
          );
        }

        container.innerHTML = groupedHtml.join('');
      }

      function renderDetailModal() {
        const backdrop = document.getElementById('detailBackdrop');
        const modal = document.getElementById('detailModal');
        if (!selectedAdapterId || !state || !Array.isArray(state.adapters)) {
          backdrop.classList.remove('open');
          backdrop.setAttribute('aria-hidden', 'true');
          return;
        }
        const a = state.adapters.find(function (item) { return item.id === selectedAdapterId; });
        if (!a) {
          backdrop.classList.remove('open');
          backdrop.setAttribute('aria-hidden', 'true');
          return;
        }

        const busy = busyIds.has(a.id);
        const name = isZh ? (a.titleZh || a.title || a.id) : (a.title || a.id);
        const prereq = isZh ? (a.prerequisitesZh || a.prerequisitesEn || '') : (a.prerequisitesEn || '');
        const toolCount = typeof a.toolCount === 'number'
          ? a.toolCount
          : (Array.isArray(a.toolNames) ? a.toolNames.length : 0);
        const tools = toolsBySoftware[a.id] || (Array.isArray(a.toolNames) && a.toolNames.length > 0 ? a.toolNames : null);

        let badgesHtml = '';
        badgesHtml += a.appInstalled
          ? '<span class="badge ok">' + esc(t('detected')) + '</span>'
          : '<span class="badge">' + esc(t('notDetected')) + '</span>';
        badgesHtml += a.provisioned
          ? '<span class="badge ok">' + esc(t('mcpConnected')) + (toolCount ? ' \xB7 ' + esc(toolCount) + ' ' + esc(t('toolsUnit')) : '') + '</span>'
          : '<span class="badge warn">' + esc(t('notConnected')) + '</span>';
        if (a.bridgeReady === true) {
          badgesHtml += '<span class="badge ok">' + esc(t('bridgeOnline')) + (a.bridgePort ? ' :' + esc(a.bridgePort) : '') + '</span>';
        } else if (a.bridgeReady === false) {
          badgesHtml += '<span class="badge warn">' + esc(t('bridgeOffline')) + (a.bridgePort ? ' :' + esc(a.bridgePort) : '') + '</span>';
        }

        const detailText = a.appDetail || a.bridgeDetail || '';
        const pathHtml = detailText ? ('<div class="modal-path">' + esc(detailText) + '</div>') : '';
        const prereqHtml = prereq ? ('<div class="modal-prereq">' + esc(prereq) + '</div>') : '';

        let actionsHtml = '';
        if (a.provisioned) {
          actionsHtml = [
            '<button type="button" class="btn primary" data-modal-action="chat" data-id="' + esc(a.id) + '">' + esc(t('btnUseInChat')) + '</button>',
            '<button type="button" class="btn" data-modal-action="probe" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(busy ? t('working') : t('btnProbe')) + '</button>',
            '<button type="button" class="btn" data-modal-action="tools" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(t('btnTools')) + '</button>',
            '<button type="button" class="btn" data-modal-action="setup" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(t('btnReconfigure')) + '</button>',
          ].join('');
        } else {
          actionsHtml = '<button type="button" class="btn primary" data-modal-action="setup" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(busy ? t('working') : t('btnSetup')) + '</button>';
        }

        const toolsHtml = Array.isArray(tools) && tools.length > 0
          ? '<div class="tools-wrap"><div class="tools-label">' + esc(t('toolsListTitle')) + ' (' + esc(tools.length) + ')</div><div class="tools-grid">' +
            tools.map(function (tn) { return '<span class="tool-chip">' + esc(tn) + '</span>'; }).join('') +
            '</div></div>'
          : '';

        modal.innerHTML = [
          '<div class="modal-head">',
          '  ' + renderSoftwareIcon(a.id, 'conn-icon'),
          '  <div class="modal-ident">',
          '    <h3 class="modal-title">' + esc(name) + '</h3>',
          '    <div class="modal-sub">' + esc(catLabel(a.category)) + ' \xB7 ' + esc(a.runtime === 'node' ? 'Node.js MCP' : 'Python MCP') + '</div>',
          '  </div>',
          '  <button type="button" class="icon-btn" data-close-modal="1" aria-label="Close">' + iconSvg('close') + '</button>',
          '</div>',
          '<div class="modal-badges">' + badgesHtml + '</div>',
          pathHtml,
          prereqHtml,
          '<div class="modal-actions">' + actionsHtml + '</div>',
          toolsHtml,
        ].join('');

        backdrop.classList.add('open');
        backdrop.setAttribute('aria-hidden', 'false');
      }

      function render() {
        if (!state || !Array.isArray(state.adapters)) return;
        renderLicenseState(state.license);
        renderSidebarInstalled(state.adapters);
        renderFilterPills(state.adapters);
        renderConnectionsList(state.adapters);
        renderDetailModal();
      }

      function copyMachineFingerprint() {
        const fp = state && state.license && state.license.machineFingerprint;
        if (!fp) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(fp).then(function () { toast(t('copied')); }).catch(function () { toast(fp); });
        } else {
          toast(fp);
        }
      }

      async function handleActivate(inputEl, btnEl) {
        const key = (inputEl.value || '').trim();
        if (!key) { toast(t('needKey')); return; }
        btnEl.disabled = true;
        try {
          const res = await callTool('connector_activate_license', { license_key: key });
          if (res.isError || !res.data || !res.data.ok) {
            const msg = (res.data && res.data.message) || 'License activation failed';
            toast(msg);
            appendLog('\u6388\u6743\u6FC0\u6D3B\u5931\u8D25: ' + msg);
          } else {
            inputEl.value = '';
            toast(t('licensed'));
            appendLog('\u6388\u6743\u5DF2\u6FC0\u6D3B: ' + (res.data.license && res.data.license.id ? res.data.license.id : 'OK'));
            await refreshStatus(true);
          }
        } catch (err) {
          toast(err.message);
          appendLog('\u6388\u6743\u6FC0\u6D3B\u5F02\u5E38: ' + err.message);
        } finally {
          btnEl.disabled = false;
        }
      }

      async function runAdapterAction(action, id) {
        if (!id) return;
        if (action === 'detail') {
          selectedAdapterId = id;
          renderDetailModal();
          return;
        }
        if (action === 'chat') {
          const prompt = isZh
            ? ('\u8BF7\u4F7F\u7528\u5DF2\u8FDE\u63A5\u7684 ' + id + ' \u5DE5\u7A0B\u8F6F\u4EF6\u9002\u914D\u5668\u5E2E\u6211\u67E5\u770B\u5F53\u524D\u6A21\u578B/\u9879\u76EE\u72B6\u6001\u3002')
            : ('Use the connected ' + id + ' adapter to inspect the active model/project.');
          selectedAdapterId = null;
          renderDetailModal();
          rpcRequest('ui/message', {
            role: 'user',
            content: [{ type: 'text', text: prompt }],
          }).then(function () { toast(isZh ? '\u5DF2\u53D1\u9001\u5230\u5BF9\u8BDD' : 'Sent to chat'); })
            .catch(function () { toast(prompt); });
          return;
        }

        if (action === 'setup' && state && state.license && !state.license.activated) {
          toast(t('needLicenseFirst'));
          const bannerInput = document.getElementById('inlineLicenseInput');
          if (activeView === 'connections' && bannerInput) bannerInput.focus();
          return;
        }

        busyIds.add(id);
        render();
        try {
          if (action === 'setup') {
            appendLog('\u5F00\u59CB\u914D\u7F6E ' + id + ' ...');
            const res = await callTool('connector_setup', { software_id: id, sync_host: 'chatgpt' });
            if (res.isError || !res.data || !res.data.ok) {
              const msg = (res.data && (res.data.detail || res.data.error || res.data.message)) || '\u914D\u7F6E\u5931\u8D25';
              toast(msg);
              appendLog(id + ' \u914D\u7F6E\u5931\u8D25: ' + msg);
            } else {
              const n = res.data.probe && Array.isArray(res.data.probe.tools) ? res.data.probe.tools.length : 0;
              if (res.data.probe && Array.isArray(res.data.probe.tools)) {
                toolsBySoftware[id] = res.data.probe.tools;
              }
              toast(id + ' \u5DF2\u8FDE\u63A5 (' + n + ' ' + t('toolsUnit') + ')');
              appendLog(id + ' \u914D\u7F6E\u6210\u529F\uFF0C\u63A2\u6D4B\u5230 ' + n + ' \u4E2A MCP \u5DE5\u5177\u3002');
              await refreshStatus(true);
            }
          } else if (action === 'probe') {
            appendLog('\u6D4B\u8BD5\u8FDE\u63A5 ' + id + ' ...');
            const res = await callTool('connector_probe', { software_id: id });
            const probe = res.data && res.data.probe;
            if (probe && probe.ok) {
              const list = Array.isArray(probe.tools) ? probe.tools : [];
              toolsBySoftware[id] = list;
              toast(id + ' \u8FDE\u901A\u6B63\u5E38 (' + list.length + ' ' + t('toolsUnit') + ')');
              appendLog(id + ' \u63A2\u6D4B\u6210\u529F (' + probe.latencyMs + 'ms, ' + list.length + ' tools)');
            } else {
              const errMsg = (probe && probe.error) || (res.data && res.data.error) || '\u8FDE\u63A5\u5931\u8D25';
              toast(errMsg);
              appendLog(id + ' \u63A2\u6D4B\u5931\u8D25: ' + errMsg);
            }
          } else if (action === 'tools') {
            const res = await callTool('connector_list_adapter_tools', { software_id: id });
            if (res.data && res.data.ok && Array.isArray(res.data.tools)) {
              toolsBySoftware[id] = res.data.tools;
              toast(id + ': ' + res.data.tools.length + ' ' + t('toolsUnit'));
              appendLog(id + ' \u5DE5\u5177\u5217\u8868: ' + res.data.tools.join(', '));
            } else {
              toast((res.data && res.data.error) || '\u8BFB\u53D6\u5DE5\u5177\u5931\u8D25');
            }
          }
        } catch (err) {
          toast(err.message);
          appendLog(id + ' \u64CD\u4F5C\u5F02\u5E38: ' + err.message);
        } finally {
          busyIds.delete(id);
          render();
        }
      }

      // Event bindings
      document.getElementById('navConnections').addEventListener('click', function () { setView('connections'); });
      document.getElementById('navSettings').addEventListener('click', function () { setView('settings'); });
      document.getElementById('btnOpenSettings').addEventListener('click', function () {
        setView(activeView === 'settings' ? 'connections' : 'settings');
      });
      document.getElementById('btnBackToConnections').addEventListener('click', function () { setView('connections'); });

      document.getElementById('searchInput').addEventListener('input', render);
      document.getElementById('btnRefresh').addEventListener('click', function () { refreshStatus(false); });
      document.getElementById('btnCopyFpInline').addEventListener('click', copyMachineFingerprint);
      document.getElementById('btnCopyFpSettings').addEventListener('click', copyMachineFingerprint);

      document.getElementById('btnActivateInline').addEventListener('click', function () {
        handleActivate(document.getElementById('inlineLicenseInput'), document.getElementById('btnActivateInline'));
      });
      document.getElementById('btnActivateSettings').addEventListener('click', function () {
        handleActivate(document.getElementById('settingsLicenseInput'), document.getElementById('btnActivateSettings'));
      });

      document.getElementById('btnClearLog').addEventListener('click', function () {
        document.getElementById('logContent').textContent = '\u5C31\u7EEA\u3002';
      });

      document.getElementById('btnSync').addEventListener('click', async function () {
        const btn = document.getElementById('btnSync');
        btn.disabled = true;
        try {
          const res = await callTool('connector_sync_host', { host: 'chatgpt' });
          const msg = (res.data && res.data.synced)
            ? ('\u5DF2\u540C\u6B65 ' + res.data.count + ' \u4E2A\u9002\u914D\u5668\u5230 ChatGPT \u914D\u7F6E')
            : ((res.data && res.data.message) || '\u65E0\u53EF\u540C\u6B65\u9002\u914D\u5668');
          toast(msg);
          appendLog(msg + (res.isError ? ' (error)' : ''));
        } catch (err) {
          toast(err.message);
          appendLog('\u540C\u6B65\u5931\u8D25: ' + err.message);
        } finally {
          btn.disabled = false;
        }
      });

      document.getElementById('filterPills').addEventListener('click', function (e) {
        const btn = e.target.closest('button[data-filter]');
        if (!btn) return;
        activeFilter = btn.getAttribute('data-filter') || 'all';
        render();
      });

      document.getElementById('sidebarInstalled').addEventListener('click', function (e) {
        const toggleBtn = e.target.closest('button[data-toggle-id]');
        if (toggleBtn) {
          const id = toggleBtn.getAttribute('data-toggle-id');
          const a = state && state.adapters ? state.adapters.find(function (x) { return x.id === id; }) : null;
          if (!a) return;
          runAdapterAction(a.provisioned ? 'probe' : 'setup', id);
          return;
        }
        const detailTrigger = e.target.closest('[data-open-detail]');
        if (detailTrigger) {
          selectedAdapterId = detailTrigger.getAttribute('data-open-detail');
          renderDetailModal();
        }
      });

      document.getElementById('connectionsContainer').addEventListener('click', function (e) {
        const actBtn = e.target.closest('button[data-quick-action]');
        if (actBtn) {
          e.stopPropagation();
          runAdapterAction(actBtn.getAttribute('data-quick-action'), actBtn.getAttribute('data-id'));
          return;
        }
        const row = e.target.closest('.conn-row[data-row-id]');
        if (row) {
          selectedAdapterId = row.getAttribute('data-row-id');
          renderDetailModal();
        }
      });

      document.getElementById('detailBackdrop').addEventListener('click', function (e) {
        if (e.target === document.getElementById('detailBackdrop') || e.target.closest('[data-close-modal]')) {
          selectedAdapterId = null;
          renderDetailModal();
          return;
        }
        const btn = e.target.closest('button[data-modal-action]');
        if (btn) {
          runAdapterAction(btn.getAttribute('data-modal-action'), btn.getAttribute('data-id'));
        }
      });

      window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && selectedAdapterId) {
          selectedAdapterId = null;
          renderDetailModal();
        }
      });

      // Hydrate from localStorage for instant sidebar rendering (stale-while-revalidate)
      applyStaticLabels();
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.adapters)) {
            state = parsed;
            render();
          }
        }
      } catch {}

      // MCP Apps postMessage JSON-RPC 2.0 bridge
      let receivedInitialToolResult = false;
      window.addEventListener('message', function (event) {
        const msg = event.data;
        if (!msg || msg.jsonrpc !== '2.0') return;

        if (msg.id !== undefined && pending.has(msg.id)) {
          const waiter = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) waiter.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else waiter.resolve(msg.result);
          return;
        }

        if (msg.method === 'ui/notifications/host-context-changed') {
          applyHostContext(msg.params);
        } else if (msg.method === 'ui/notifications/tool-result') {
          receivedInitialToolResult = true;
          const payload = extractToolPayload(msg.params);
          if (payload && Array.isArray(payload.adapters)) {
            setState(payload);
            appendLog('\u5DF2\u63A5\u6536\u5BBF\u4E3B\u5DE5\u5177\u72B6\u6001\u3002');
          }
        } else if (msg.method === 'ping' && msg.id !== undefined) {
          window.parent.postMessage({ jsonrpc: '2.0', id: msg.id, result: {} }, '*');
        }
      });

      async function bootBridge() {
        if (window.parent === window) return;
        try {
          const initRes = await rpcRequest('ui/initialize', {
            protocolVersion: PROTOCOL_VERSION,
            appInfo: { name: 'engiaxis-connector-' + EDITION, version: '1.0.0' },
            appCapabilities: { availableDisplayModes: ['fullscreen', 'inline'] },
          });
          hostConnected = true;
          if (initRes && initRes.hostContext) applyHostContext(initRes.hostContext);
          window.parent.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/initialized', params: {} }, '*');

          setTimeout(function () {
            if (!receivedInitialToolResult) {
              refreshStatus(true);
            }
          }, 350);
        } catch (err) {
          appendLog('MCP App \u6865\u63A5\u521D\u59CB\u5316\u5931\u8D25: ' + (err && err.message ? err.message : String(err)));
        }
      }

      if (document.documentElement.getAttribute('data-surface') === 'widget' && window.parent !== window && typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(function () {
          const h = Math.ceil(document.documentElement.scrollHeight);
          window.parent.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/size-changed', params: { height: h } }, '*');
        });
        ro.observe(document.body);
      }

      bootBridge();
    })();
  </script>
</body>
</html>
`;
}

// packages/mcp-server/src/mcp-server.ts
var ConnectorMcpServer = class {
  constructor(config) {
    this.config = config;
    this.provisioner = new ConnectorProvisioner(config);
  }
  provisioner;
  getToolDefinitions() {
    const editionSpec = EDITION_SPECS[this.config.edition];
    const sidebarTitle = sidebarTitleForEdition(this.config.edition);
    const adapterIds = adaptersForEdition(this.config.edition).map((a) => a.id);
    const readOnlyAnnotations = {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: false
    };
    return [
      {
        name: "connector_app",
        title: sidebarTitle,
        description: `Open the ${editionSpec.nameEn} fullscreen Software Connections workspace to inspect installed software, activate licenses, run one-click setup, and verify MCP connections.`,
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false
        },
        icons: entrypointIconsForEdition(this.config.edition),
        annotations: readOnlyAnnotations,
        _meta: {
          ui: {
            resourceUri: MCP_APP_URIS.global,
            visibility: ["app"]
          },
          "openai/ui": {
            entrypoints: [{ type: "global" }]
          },
          "openai/iconStyle": "monochrome"
        }
      },
      {
        name: "connector_panel",
        title: `${sidebarTitle} Panel`,
        description: `Open the ${editionSpec.nameEn} Software Connections side panel beside the current conversation thread.`,
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false
        },
        icons: entrypointIconsForEdition(this.config.edition),
        annotations: readOnlyAnnotations,
        _meta: {
          ui: {
            resourceUri: MCP_APP_URIS.thread
          },
          "openai/ui": {
            entrypoints: [{ type: "thread" }]
          },
          "openai/iconStyle": "monochrome"
        }
      },
      {
        name: "connector_status",
        title: "Connector Status",
        description: `Inspect ${editionSpec.nameEn} status: license state, machine fingerprint, local CAD/CAE/EDA installations, bridge TCP ports, and provisioned MCP servers.`,
        inputSchema: {
          type: "object",
          properties: {},
          additionalProperties: false
        },
        annotations: readOnlyAnnotations,
        _meta: {
          ui: {
            resourceUri: MCP_APP_URIS.widget
          }
        }
      },
      {
        name: "connector_detect",
        title: "Detect Installed Software",
        description: "Scan local Windows/system paths, vendor environment variables, PATH, and TCP bridge ports for one or all software adapters in this edition.",
        inputSchema: {
          type: "object",
          properties: {
            software_id: {
              type: "string",
              enum: adapterIds,
              description: "Optional specific software ID to inspect. Omit to scan all adapters in this edition."
            }
          },
          additionalProperties: false
        },
        annotations: readOnlyAnnotations
      },
      {
        name: "connector_activate_license",
        title: "Activate Offline License",
        description: "Verify and store an offline Ed25519 EngiAxis Connector license key (EA1.xxx).",
        inputSchema: {
          type: "object",
          required: ["license_key"],
          properties: {
            license_key: {
              type: "string",
              description: "Commercial license key starting with EA1."
            }
          },
          additionalProperties: false
        }
      },
      {
        name: "connector_setup",
        title: "Setup Software Adapter",
        description: "Provision an isolated runtime, verify MCP stdio handshake, and optionally register a software adapter into ChatGPT Desktop, WorkBuddy Desktop, or DeepSeek Harness. Requires a valid license covering the software category.",
        inputSchema: {
          type: "object",
          required: ["software_id"],
          properties: {
            software_id: {
              type: "string",
              enum: adapterIds,
              description: "Canonical software adapter identifier."
            },
            sync_host: {
              type: "string",
              enum: ["none", "chatgpt", "workbuddy", "dsh", "all"],
              description: "Optional host client config to update automatically after verification."
            },
            dsh_profile: {
              type: "string",
              description: 'DeepSeek Harness profile name when sync_host is dsh or all (defaults to "desktop").'
            }
          },
          additionalProperties: false
        }
      },
      {
        name: "connector_probe",
        title: "Probe MCP Adapter",
        description: "Run a live MCP stdio handshake and tool discovery check against an already provisioned engineering software server.",
        inputSchema: {
          type: "object",
          required: ["software_id"],
          properties: {
            software_id: {
              type: "string",
              enum: adapterIds,
              description: "Canonical software adapter identifier."
            }
          },
          additionalProperties: false
        },
        annotations: readOnlyAnnotations
      },
      {
        name: "connector_sync_host",
        title: "Sync Host Client Config",
        description: "Register all provisioned engineering MCP servers into ChatGPT Desktop (~/.codex/config.toml), WorkBuddy Desktop (~/.workbuddy/mcp.json), or DeepSeek Harness (cordis.patch.yml).",
        inputSchema: {
          type: "object",
          required: ["host"],
          properties: {
            host: {
              type: "string",
              enum: ["chatgpt", "workbuddy", "dsh", "all"],
              description: "Target desktop client to synchronize."
            },
            dsh_profile: {
              type: "string",
              description: 'DeepSeek Harness profile name (defaults to "desktop").'
            }
          },
          additionalProperties: false
        }
      },
      {
        name: "connector_list_adapter_tools",
        title: "List Adapter Tools",
        description: "List live MCP tools exposed by a provisioned engineering software adapter so they can be invoked via connector_call_adapter_tool.",
        inputSchema: {
          type: "object",
          required: ["software_id"],
          properties: {
            software_id: {
              type: "string",
              enum: adapterIds,
              description: "Provisioned software adapter ID."
            }
          },
          additionalProperties: false
        },
        annotations: readOnlyAnnotations
      },
      {
        name: "connector_call_adapter_tool",
        title: "Call Engineering Tool",
        description: "Proxy a licensed tool invocation to a provisioned CAD/CAE/EDA MCP server without requiring a client restart.",
        inputSchema: {
          type: "object",
          required: ["software_id", "tool_name"],
          properties: {
            software_id: {
              type: "string",
              enum: adapterIds,
              description: "Provisioned software adapter ID."
            },
            tool_name: {
              type: "string",
              description: "Tool name reported by connector_list_adapter_tools or connector_probe."
            },
            arguments: {
              type: "object",
              description: "JSON argument object passed to the target engineering tool."
            }
          },
          additionalProperties: false
        }
      }
    ];
  }
  getResourceDefinitions() {
    const title = sidebarTitleForEdition(this.config.edition);
    return [
      {
        uri: MCP_APP_URIS.global,
        name: `engiaxis-connector-${this.config.edition}-global`,
        title,
        description: "Fullscreen sidebar UI for managing EngiAxis engineering software connections.",
        mimeType: MCP_APP_MIME_TYPE
      },
      {
        uri: MCP_APP_URIS.thread,
        name: `engiaxis-connector-${this.config.edition}-thread`,
        title: `${title} Panel`,
        description: "Thread side panel UI for managing EngiAxis engineering software connections.",
        mimeType: MCP_APP_MIME_TYPE
      },
      {
        uri: MCP_APP_URIS.widget,
        name: `engiaxis-connector-${this.config.edition}-widget`,
        title: `${title} Status`,
        description: "Inline status widget for EngiAxis engineering software connections.",
        mimeType: MCP_APP_MIME_TYPE
      }
    ];
  }
  readResource(uri) {
    const entries = [
      ["global", MCP_APP_URIS.global],
      ["thread", MCP_APP_URIS.thread],
      ["widget", MCP_APP_URIS.widget]
    ];
    const match = entries.find(([, u]) => u === uri);
    if (!match) return null;
    const [surface] = match;
    const preferredDisplayMode = surface === "widget" ? "inline" : "fullscreen";
    const availableDisplayModes = surface === "widget" ? ["inline", "fullscreen"] : ["fullscreen"];
    return {
      contents: [
        {
          uri,
          mimeType: MCP_APP_MIME_TYPE,
          text: renderMcpAppHtml(this.config.edition, surface),
          _meta: {
            "openai/ui": {
              preferredDisplayMode,
              availableDisplayModes
            },
            ui: {
              prefersBorder: surface === "widget",
              csp: {
                connectDomains: [],
                resourceDomains: []
              }
            }
          }
        }
      ]
    };
  }
  resolveLicenseState() {
    const pubKey = this.config.publicKeyPem ?? resolvePublicKeyPem([this.config.homeDir]);
    const activeKey = resolveActiveLicenseKey(this.config.homeDir);
    if (this.config.allowDevBypass && process.env.ENGIAXIS_DEV_BYPASS_LICENSE === "1") {
      return {
        activated: true,
        devBypass: true,
        edition: this.config.edition,
        customer: "Developer Mode",
        expiresAt: null,
        machineFingerprint: computeMachineFingerprint()
      };
    }
    const verified = verifyLicense(activeKey, pubKey);
    if (verified.valid) {
      const coversEdition = verified.payload.edition === "suite" || verified.payload.edition === this.config.edition;
      return {
        activated: coversEdition,
        editionMismatch: !coversEdition,
        licenseId: verified.payload.id,
        edition: verified.payload.edition,
        expectedEdition: this.config.edition,
        customer: verified.payload.customer,
        expiresAt: verified.payload.expiresAt,
        machineBound: verified.payload.machine !== null,
        machineFingerprint: computeMachineFingerprint()
      };
    }
    return {
      activated: false,
      errorCode: verified.code,
      message: verified.message,
      machineFingerprint: computeMachineFingerprint()
    };
  }
  async buildStatusPayload() {
    const adapters = await this.provisioner.listEditionAdapters();
    return {
      edition: EDITION_SPECS[this.config.edition],
      homeDir: this.config.homeDir,
      license: this.resolveLicenseState(),
      adapters
    };
  }
  collectProvisionedHostServers() {
    const registry = this.provisioner.readRegistry();
    const allowed = new Set(adaptersForEdition(this.config.edition).map((a) => a.id));
    return Object.values(registry).filter((record) => allowed.has(record.id)).map((record) => ({
      name: record.id,
      command: record.command,
      args: record.args,
      cwd: record.cwd,
      env: record.env,
      enabled: true
    }));
  }
  syncHosts(host, dshProfile = "desktop") {
    const servers = this.collectProvisionedHostServers();
    if (servers.length === 0) {
      return { synced: false, message: "No provisioned adapters in this edition yet. Run connector_setup first." };
    }
    const results = {};
    if (host === "chatgpt" || host === "all") {
      results.chatgpt = syncChatGptDesktopConfig(servers);
    }
    if (host === "workbuddy" || host === "all") {
      results.workbuddy = syncWorkBuddyDesktopConfig(servers);
    }
    if (host === "dsh" || host === "all") {
      results.dsh = syncDshProfileConfig(servers, dshProfile);
    }
    return { synced: true, count: servers.length, targets: results };
  }
  async callTool(name, rawArgs = {}) {
    const jsonText = (data, isError = false) => ({
      ...isError ? { isError: true } : {},
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: data
    });
    if (name === "connector_app" || name === "connector_panel" || name === "connector_status") {
      return jsonText(await this.buildStatusPayload());
    }
    if (name === "connector_detect") {
      const softwareId = typeof rawArgs.software_id === "string" ? rawArgs.software_id : void 0;
      if (softwareId) {
        if (!adapterById(softwareId) || !isAdapterInEdition(softwareId, this.config.edition)) {
          return jsonText({ error: `Software "${softwareId}" is not included in the ${this.config.edition.toUpperCase()} edition.` }, true);
        }
        const status = await this.provisioner.inspectAdapter(softwareId);
        return jsonText({ adapter: status });
      }
      const adapters = await this.provisioner.listEditionAdapters();
      return jsonText({ edition: this.config.edition, adapters });
    }
    if (name === "connector_activate_license") {
      const key = typeof rawArgs.license_key === "string" ? rawArgs.license_key.trim() : "";
      const outcome = await activateLicenseInput(key, {
        homeDir: this.config.homeDir,
        edition: this.config.edition,
        publicKeyPem: this.config.publicKeyPem,
        activationApiUrl: this.config.activationApiUrl
      });
      return jsonText(outcome, !outcome.ok);
    }
    if (name === "connector_setup") {
      const softwareId = typeof rawArgs.software_id === "string" ? rawArgs.software_id : "";
      if (!adapterById(softwareId) || !isAdapterInEdition(softwareId, this.config.edition)) {
        return jsonText({ ok: false, error: `Software "${softwareId}" is not included in this edition.` }, true);
      }
      const stages = [];
      const outcome = await this.provisioner.setup(softwareId, {
        onStage: (stage) => stages.push(stage)
      });
      if (!outcome.ok) {
        return jsonText({ ...outcome, stages }, true);
      }
      const syncHost = typeof rawArgs.sync_host === "string" ? rawArgs.sync_host : "none";
      const dshProfile = typeof rawArgs.dsh_profile === "string" ? rawArgs.dsh_profile : "desktop";
      const hostSync = syncHost !== "none" ? this.syncHosts(syncHost, dshProfile) : void 0;
      return jsonText({ ok: true, stages, record: outcome.record, probe: outcome.probe, ...hostSync ? { hostSync } : {} });
    }
    if (name === "connector_probe") {
      const softwareId = typeof rawArgs.software_id === "string" ? rawArgs.software_id : "";
      const record = this.provisioner.readRegistry()[softwareId];
      if (!record) {
        return jsonText({ ok: false, error: `Software "${softwareId}" is not provisioned yet. Run connector_setup first.` }, true);
      }
      const probe = await probeMcpStdio(
        { command: record.command, args: record.args, cwd: record.cwd, env: record.env },
        { timeoutMs: this.config.probeTimeoutMs }
      );
      return jsonText({ software_id: softwareId, probe }, !probe.ok);
    }
    if (name === "connector_sync_host") {
      const host = typeof rawArgs.host === "string" ? rawArgs.host : "all";
      const dshProfile = typeof rawArgs.dsh_profile === "string" ? rawArgs.dsh_profile : "desktop";
      const res = this.syncHosts(host, dshProfile);
      return jsonText(res, !res.synced);
    }
    if (name === "connector_list_adapter_tools" || name === "connector_call_adapter_tool") {
      const softwareId = typeof rawArgs.software_id === "string" ? rawArgs.software_id : void 0;
      if (!softwareId || !adapterById(softwareId)) {
        return jsonText({ ok: false, error: "Valid software_id is required." }, true);
      }
      const activeKey = resolveActiveLicenseKey(this.config.homeDir);
      const pubKey = this.config.publicKeyPem ?? resolvePublicKeyPem([this.config.homeDir]);
      const auth = checkAdapterAuthorization(softwareId, this.config.edition, activeKey, pubKey, {
        allowDevBypass: this.config.allowDevBypass
      });
      if (!auth.valid) {
        return jsonText({ ok: false, code: auth.code, error: auth.message }, true);
      }
      const record = this.provisioner.readRegistry()[softwareId];
      if (!record) {
        return jsonText({ ok: false, error: `Software "${softwareId}" is not provisioned yet. Run connector_setup first.` }, true);
      }
      const launch = { command: record.command, args: record.args, cwd: record.cwd, env: record.env };
      if (name === "connector_list_adapter_tools") {
        const probe = await probeMcpStdio(launch, { timeoutMs: this.config.probeTimeoutMs });
        return jsonText({ software_id: softwareId, ok: probe.ok, tools: probe.tools, error: probe.error }, !probe.ok);
      }
      const toolName = typeof rawArgs.tool_name === "string" ? rawArgs.tool_name : "";
      const args = rawArgs.arguments && typeof rawArgs.arguments === "object" && !Array.isArray(rawArgs.arguments) ? rawArgs.arguments : {};
      const callResult = await callMcpStdioTool(launch, toolName, args);
      return jsonText({ ...callResult }, !callResult.ok);
    }
    return jsonText({ error: `Unknown tool: ${name}` }, true);
  }
  async handleJsonRpc(request) {
    const id = request.id;
    const method = request.method ?? "";
    if (method === "notifications/initialized" || method === "notifications/cancelled") {
      return null;
    }
    if (method === "ping") {
      return { jsonrpc: "2.0", id, result: {} };
    }
    if (method === "initialize") {
      const requestedVersion = typeof request.params?.protocolVersion === "string" ? request.params.protocolVersion : "2025-03-26";
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: requestedVersion,
          capabilities: {
            tools: {},
            resources: {}
          },
          serverInfo: {
            name: `engiaxis-connector-${this.config.edition}`,
            title: sidebarTitleForEdition(this.config.edition),
            version: "1.0.0",
            icons: entrypointIconsForEdition(this.config.edition)
          }
        }
      };
    }
    if (method === "tools/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          tools: this.getToolDefinitions()
        }
      };
    }
    if (method === "tools/call") {
      const params = request.params ?? {};
      const toolName = typeof params.name === "string" ? params.name : "";
      const toolArgs = params.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : {};
      const result = await this.callTool(toolName, toolArgs);
      return { jsonrpc: "2.0", id, result };
    }
    if (method === "resources/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: {
          resources: this.getResourceDefinitions()
        }
      };
    }
    if (method === "resources/templates/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: { resourceTemplates: [] }
      };
    }
    if (method === "resources/read") {
      const uri = typeof request.params?.uri === "string" ? request.params.uri : "";
      const res = this.readResource(uri);
      if (!res) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32002, message: `Resource not found: ${uri}` }
        };
      }
      return { jsonrpc: "2.0", id, result: res };
    }
    if (method === "prompts/list") {
      return {
        jsonrpc: "2.0",
        id,
        result: { prompts: [] }
      };
    }
    if (id === void 0) return null;
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` }
    };
  }
  startStdio() {
    const rl = createInterface2({ input: process.stdin, crlfDelay: Infinity });
    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      void (async () => {
        try {
          const req = JSON.parse(trimmed);
          const response = await this.handleJsonRpc(req);
          if (response !== null) {
            process.stdout.write(`${JSON.stringify(response)}
`);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: msg } })}
`);
        }
      })();
    });
  }
};

// packages/mcp-server/src/wizard-server.ts
import { createServer } from "node:http";
function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(payload));
}
async function readJson(req) {
  const chunks = [];
  let total = 0;
  for await (const raw of req) {
    const buf = raw;
    total += buf.byteLength;
    if (total > 64 * 1024) throw new Error("Request body too large.");
    chunks.push(buf);
  }
  const text = Buffer.concat(chunks).toString("utf8").trim();
  return text ? JSON.parse(text) : {};
}
function renderWizardHtml(editionTitle, editionSlug) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${editionTitle} \u2014 \u8F6F\u4EF6\u8FDE\u63A5\u914D\u7F6E\u5411\u5BFC</title>
  <style>
    :root {
      --bg: #0f1117; --surface: #171a23; --surface2: #1f2430; --border: #2a3142;
      --text: #e6e9f2; --muted: #8f9bb3; --accent: #4c8dff; --ok: #2ecc71; --warn: #f1c40f; --err: #e74c3c;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); }
    .wrap { max-width: 1120px; margin: 0 auto; padding: 28px 24px 48px; }
    header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 1px solid var(--border); padding-bottom: 20px; margin-bottom: 20px; flex-wrap: wrap; }
    h1 { margin: 0 0 6px; font-size: 22px; font-weight: 600; }
    .sub { color: var(--muted); font-size: 13px; }
    .badge { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 600; background: rgba(76,141,255,.15); color: #8ab4ff; border: 1px solid rgba(76,141,255,.35); }
    .badge.ok { background: rgba(46,204,113,.14); color: #6ee7a8; border-color: rgba(46,204,113,.35); }
    .badge.warn { background: rgba(241,196,15,.14); color: #f7dc6f; border-color: rgba(241,196,15,.35); }
    .bar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 18px; }
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 18px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
    .card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
    .card-title { font-size: 15px; font-weight: 600; }
    .meta { font-size: 12px; color: var(--muted); line-height: 1.5; }
    .pills { display: flex; gap: 6px; flex-wrap: wrap; }
    .btn { background: var(--surface2); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 7px 12px; font-size: 12px; cursor: pointer; font-weight: 500; }
    .btn:hover { border-color: var(--accent); }
    .btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    input[type="text"], input[type="password"] { background: var(--bg); color: var(--text); border: 1px solid var(--border); border-radius: 8px; padding: 8px 11px; font-size: 13px; }
    .tabs { display: flex; gap: 6px; }
    .tab { padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; background: var(--surface); border: 1px solid var(--border); color: var(--muted); }
    .tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }
    .log { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 12px; color: #b8c2d8; white-space: pre-wrap; max-height: 160px; overflow: auto; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <h1>${editionTitle}</h1>
        <div class="sub">\u7EDF\u4E00\u7BA1\u7406 CAD / CAE / EDA \u8F6F\u4EF6\u8FDE\u63A5\uFF0C\u4E00\u952E\u540C\u6B65\u81F3 ChatGPT \u684C\u9762\u7AEF\u3001WorkBuddy \u684C\u9762\u7AEF\u4E0E DeepSeek Harness\uFF08${editionSlug}\uFF09</div>
      </div>
      <div class="bar" style="margin:0">
        <button class="btn" onclick="syncHost('chatgpt')">\u540C\u6B65\u81F3 ChatGPT \u684C\u9762\u7AEF</button>
        <button class="btn" onclick="syncHost('workbuddy')">\u540C\u6B65\u81F3 WorkBuddy</button>
        <button class="btn" onclick="syncHost('dsh')">\u540C\u6B65\u81F3 DeepSeek Harness</button>
        <button class="btn primary" onclick="refresh()">\u5237\u65B0\u72B6\u6001</button>
      </div>
    </header>

    <div class="panel" id="licenseBox">\u6B63\u5728\u8BFB\u53D6\u6388\u6743\u72B6\u6001...</div>

    <div class="bar">
      <div class="tabs" id="tabs"></div>
      <input type="text" id="search" placeholder="\u641C\u7D22\u8F6F\u4EF6\u540D\u79F0..." oninput="render()" style="min-width:220px" />
    </div>

    <div class="grid" id="cards"></div>

    <div class="panel" style="margin-top:20px">
      <div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--muted)">\u64CD\u4F5C\u65E5\u5FD7</div>
      <div class="log" id="log">\u5C31\u7EEA\u3002</div>
    </div>
  </div>

  <script>
    let state = null;
    let activeCategory = 'all';

    function appendLog(msg) {
      const el = document.getElementById('log');
      el.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg + '
' + el.textContent;
    }

    async function refresh() {
      const res = await fetch('/api/status');
      state = await res.json();
      renderLicense();
      renderTabs();
      render();
    }

    function renderLicense() {
      const box = document.getElementById('licenseBox');
      const lic = state.license;
      if (lic.activated) {
        box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">'
          + '<div><span class="badge ok">\u5DF2\u6FC0\u6D3B</span> <strong style="margin-left:8px">' + lic.customer + '</strong>'
          + ' <span class="sub">\u7248\u672C: ' + lic.edition.toUpperCase() + ' \xB7 \u5230\u671F: ' + (lic.expiresAt || '\u6C38\u4E45') + ' \xB7 \u672C\u673A\u6307\u7EB9: <code>' + lic.machineFingerprint + '</code></span></div>'
          + '<span class="sub">\u6570\u636E\u76EE\u5F55: <code>' + state.homeDir + '</code></span></div>';
      } else {
        box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">'
          + '<div><span class="badge warn">\u672A\u6FC0\u6D3B\uFF08\u4EC5\u63A2\u6D4B\u6A21\u5F0F\uFF09</span> <span class="sub" style="margin-left:8px">' + lic.message + ' \xB7 \u672C\u673A\u6307\u7EB9: <code>' + lic.machineFingerprint + '</code></span></div>'
          + '<div style="display:flex;gap:8px;align-items:center"><input type="password" id="licKey" placeholder="\u8F93\u5165\u5361\u5BC6 (EA-CAD-xxxx) \u6216 EA1.xxx \u79BB\u7EBF\u7801" style="width:280px" />'
          + '<button class="btn primary" onclick="activate()">\u6FC0\u6D3B\u6388\u6743</button></div></div>';
      }
    }

    function renderTabs() {
      const cats = ['all', ...state.edition.categories];
      const labels = { all: '\u5168\u90E8', cad: 'CAD', cae: 'CAE', eda: 'EDA' };
      document.getElementById('tabs').innerHTML = cats.map(c =>
        '<button class="tab ' + (activeCategory === c ? 'active' : '') + '" onclick="setCategory('' + c + '')">' + (labels[c] || c) + '</button>'
      ).join('');
    }

    function setCategory(c) { activeCategory = c; renderTabs(); render(); }

    function render() {
      if (!state) return;
      const q = document.getElementById('search').value.trim().toLowerCase();
      const items = state.adapters.filter(a =>
        (activeCategory === 'all' || a.category === activeCategory)
        && (!q || a.title.toLowerCase().includes(q) || a.titleZh.toLowerCase().includes(q) || a.id.includes(q))
      );
      document.getElementById('cards').innerHTML = items.map(a => {
        const appBadge = a.appInstalled ? '<span class="badge ok">\u5DF2\u68C0\u6D4B\u5230\u8F6F\u4EF6</span>' : '<span class="badge">\u672A\u81EA\u52A8\u68C0\u6D4B\u5230\u8F6F\u4EF6</span>';
        const provBadge = a.provisioned ? '<span class="badge ok">\u5DF2\u914D\u7F6E (' + a.toolCount + ' \u5DE5\u5177)</span>' : '<span class="badge">\u672A\u5B89\u88C5 MCP</span>';
        const bridgeBadge = a.bridgePort ? ('<span class="badge ' + (a.bridgeReady ? 'ok' : 'warn') + '">\u6865\u63A5 :' + a.bridgePort + (a.bridgeReady ? ' \u5728\u7EBF' : ' \u672A\u542F\u52A8') + '</span>') : '';
        return '<div class="card">'
          + '<div class="card-top"><div><div class="card-title">' + a.titleZh + '</div><div class="sub">' + a.id + ' \xB7 ' + a.category.toUpperCase() + ' \xB7 ' + a.runtime + '</div></div>'
          + '<button class="btn primary" onclick="setupAdapter('' + a.id + '')">' + (a.provisioned ? '\u91CD\u65B0\u68C0\u6D4B' : '+ \u4E00\u952E\u914D\u7F6E') + '</button></div>'
          + '<div class="pills">' + appBadge + provBadge + bridgeBadge + '</div>'
          + '<div class="meta">' + a.prerequisitesZh + '</div>'
          + '<div class="meta">\u8DEF\u5F84: <code>' + a.appDetail + '</code></div>'
          + '</div>';
      }).join('');
    }

    async function activate() {
      const key = document.getElementById('licKey').value.trim();
      if (!key) return;
      const res = await fetch('/api/license', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ licenseKey: key }) });
      const data = await res.json();
      appendLog(data.ok ? '\u6388\u6743\u6FC0\u6D3B\u6210\u529F: ' + data.license.id : '\u6FC0\u6D3B\u5931\u8D25: ' + data.message);
      await refresh();
    }

    async function setupAdapter(id) {
      appendLog('\u5F00\u59CB\u914D\u7F6E ' + id + ' (\u6E90\u7801\u89E3\u6790 -> \u72EC\u7ACB\u8FD0\u884C\u73AF\u5883 -> MCP \u63E1\u624B\u63A2\u6D3B)...');
      const res = await fetch('/api/setup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json();
      appendLog(data.ok ? ('\u914D\u7F6E\u6210\u529F: ' + id + '\uFF0C\u53D1\u73B0 ' + data.record.toolCount + ' \u4E2A\u5DE5\u5177') : ('\u914D\u7F6E\u5931\u8D25 [' + data.stage + ']: ' + data.detail));
      await refresh();
    }

    async function syncHost(host) {
      const res = await fetch('/api/sync-host', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ host }) });
      const data = await res.json();
      appendLog(data.synced ? ('\u5DF2\u540C\u6B65 ' + data.count + ' \u4E2A\u5DF2\u914D\u7F6E\u8FDE\u63A5\u5230 ' + host + ': ' + JSON.stringify(data.targets)) : ('\u540C\u6B65\u8DF3\u8FC7: ' + data.message));
    }

    refresh();
  </script>
</body>
</html>`;
}
async function startWizardServer(config, options = {}) {
  const provisioner = new ConnectorProvisioner(config);
  const editionSpec = EDITION_SPECS[config.edition];
  const html = renderWizardHtml(editionSpec.nameZh, editionSpec.slug);
  const server = createServer((req, res) => {
    void (async () => {
      const url = new URL(req.url ?? "/", "http://127.0.0.1");
      try {
        if (req.method === "GET" && url.pathname === "/") {
          res.statusCode = 200;
          res.setHeader("content-type", "text/html; charset=utf-8");
          res.end(html);
          return;
        }
        if (req.method === "GET" && url.pathname === "/api/status") {
          const pubKey = config.publicKeyPem ?? resolvePublicKeyPem([config.homeDir]);
          const activeKey = resolveActiveLicenseKey(config.homeDir);
          const devBypass = Boolean(config.allowDevBypass && process.env.ENGIAXIS_DEV_BYPASS_LICENSE === "1");
          const verified = verifyLicense(activeKey, pubKey);
          const license = devBypass ? { activated: true, edition: config.edition, customer: "Developer Mode", expiresAt: null, machineFingerprint: computeMachineFingerprint() } : verified.valid ? { activated: true, licenseId: verified.payload.id, edition: verified.payload.edition, customer: verified.payload.customer, expiresAt: verified.payload.expiresAt, machineFingerprint: computeMachineFingerprint() } : { activated: false, code: verified.code, message: verified.message, machineFingerprint: computeMachineFingerprint() };
          const adapters = await provisioner.listEditionAdapters();
          sendJson(res, 200, { edition: editionSpec, homeDir: config.homeDir, license, adapters });
          return;
        }
        if (req.method === "POST" && url.pathname === "/api/license") {
          const body = await readJson(req);
          const key = typeof body.licenseKey === "string" ? body.licenseKey.trim() : "";
          const outcome = await activateLicenseInput(key, {
            homeDir: config.homeDir,
            edition: config.edition,
            publicKeyPem: config.publicKeyPem,
            activationApiUrl: config.activationApiUrl
          });
          sendJson(res, outcome.ok ? 200 : 400, outcome);
          return;
        }
        if (req.method === "POST" && url.pathname === "/api/setup") {
          const body = await readJson(req);
          const id = typeof body.id === "string" ? body.id : void 0;
          if (!id || !isAdapterInEdition(id, config.edition)) {
            sendJson(res, 400, { ok: false, stage: "license", detail: "Software adapter is not part of this edition." });
            return;
          }
          const outcome = await provisioner.setup(id);
          sendJson(res, outcome.ok ? 200 : 400, outcome);
          return;
        }
        if (req.method === "POST" && url.pathname === "/api/sync-host") {
          const body = await readJson(req);
          const host2 = typeof body.host === "string" ? body.host : "all";
          const dshProfile = typeof body.dshProfile === "string" ? body.dshProfile : "desktop";
          const registry = provisioner.readRegistry();
          const allowed = new Set(adaptersForEdition(config.edition).map((a) => a.id));
          const servers = Object.values(registry).filter((r) => allowed.has(r.id)).map((r) => ({ name: r.id, command: r.command, args: r.args, cwd: r.cwd, env: r.env, enabled: true }));
          if (servers.length === 0) {
            sendJson(res, 200, { synced: false, message: "\u8BF7\u5148\u81F3\u5C11\u914D\u7F6E\u4E00\u4E2A\u5DE5\u7A0B\u8F6F\u4EF6\u9002\u914D\u5668\u3002" });
            return;
          }
          const targets = {};
          if (host2 === "chatgpt" || host2 === "all") targets.chatgpt = syncChatGptDesktopConfig(servers);
          if (host2 === "workbuddy" || host2 === "all") targets.workbuddy = syncWorkBuddyDesktopConfig(servers);
          if (host2 === "dsh" || host2 === "all") targets.dsh = syncDshProfileConfig(servers, dshProfile);
          sendJson(res, 200, { synced: true, count: servers.length, targets });
          return;
        }
        sendJson(res, 404, { error: "Not found" });
      } catch (err) {
        sendJson(res, 500, { error: err instanceof Error ? err.message : String(err) });
      }
    })();
  });
  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 48760;
  await new Promise((resolve2, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve2());
  });
  const addr = server.address();
  const actualPort = typeof addr === "object" && addr ? addr.port : port;
  return {
    url: `http://${host}:${actualPort}`,
    close: () => new Promise((resolve2, reject) => server.close((err) => err ? reject(err) : resolve2()))
  };
}

// packages/mcp-server/src/cli.ts
function readFlag(args, name) {
  const idx = args.indexOf(name);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return void 0;
}
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "status";
  const edition = parseEditionId(readFlag(args, "--edition") ?? process.env.ENGIAXIS_EDITION, "suite");
  const homeDir = readFlag(args, "--home");
  const bundledMcpDir = readFlag(args, "--bundled-mcp") ?? process.env.ENGIAXIS_BUNDLED_MCP_DIR;
  const publicKeyPath = readFlag(args, "--public-key");
  if (publicKeyPath) process.env.ENGIAXIS_PUBLIC_KEY_PATH = publicKeyPath;
  const config = createDefaultConfig({
    edition,
    ...homeDir ? { homeDir } : {},
    ...bundledMcpDir ? { bundledMcpDir } : {},
    allowDevBypass: process.env.ENGIAXIS_DEV_BYPASS_LICENSE === "1"
  });
  if (command === "mcp") {
    const server = new ConnectorMcpServer(config);
    server.startStdio();
    return;
  }
  if (command === "wizard") {
    const portArg = readFlag(args, "--port");
    const port = portArg ? Number.parseInt(portArg, 10) : 48760;
    const wizard = await startWizardServer(config, { port });
    console.log(`EngiAxis Connector Wizard (${EDITION_SPECS[edition].nameZh}) running at ${wizard.url}`);
    return;
  }
  if (command === "machine-id") {
    console.log(computeMachineFingerprint());
    return;
  }
  if (command === "activate") {
    const key = args[1] ?? "";
    const outcome = await activateLicenseInput(key, {
      homeDir: config.homeDir,
      edition: config.edition,
      publicKeyPem: config.publicKeyPem,
      activationApiUrl: config.activationApiUrl
    });
    if (!outcome.ok) {
      console.error(`License activation failed (${outcome.code}): ${outcome.message}`);
      process.exitCode = 1;
      return;
    }
    console.log(JSON.stringify(outcome, null, 2));
    return;
  }
  const provisioner = new ConnectorProvisioner(config);
  if (command === "status" || command === "detect") {
    const adapters = await provisioner.listEditionAdapters();
    const pubKey = resolvePublicKeyPem([config.homeDir]);
    const verified = verifyLicense(resolveActiveLicenseKey(config.homeDir), pubKey);
    console.log(JSON.stringify({
      edition: EDITION_SPECS[edition],
      homeDir: config.homeDir,
      machineFingerprint: computeMachineFingerprint(),
      license: verified,
      adapters
    }, null, 2));
    return;
  }
  if (command === "setup") {
    const id = args[1];
    if (!id) {
      console.error("Usage: engiaxis-connector setup <software-id> [--edition cad|cae|eda|suite]");
      process.exitCode = 2;
      return;
    }
    const result = await provisioner.setup(id, {
      onStage: (stage) => console.error(`[stage] ${id}: ${stage}`)
    });
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
    return;
  }
  if (command === "probe") {
    const id = args[1];
    if (!id) {
      console.error("Usage: engiaxis-connector probe <software-id>");
      process.exitCode = 2;
      return;
    }
    const record = provisioner.readRegistry()[id];
    if (!record) {
      console.error(`Adapter "${id}" is not provisioned yet.`);
      process.exitCode = 1;
      return;
    }
    const probe = await probeMcpStdio({ command: record.command, args: record.args, cwd: record.cwd, env: record.env });
    console.log(JSON.stringify(probe, null, 2));
    if (!probe.ok) process.exitCode = 1;
    return;
  }
  if (command === "sync-host") {
    const host = args[1] ?? "all";
    const profile = readFlag(args, "--profile") ?? "desktop";
    const registry = provisioner.readRegistry();
    const servers = Object.values(registry).map((r) => ({
      name: r.id,
      command: r.command,
      args: r.args,
      cwd: r.cwd,
      env: r.env,
      enabled: true
    }));
    const out = {};
    if (host === "chatgpt" || host === "all") out.chatgpt = syncChatGptDesktopConfig(servers);
    if (host === "workbuddy" || host === "all") out.workbuddy = syncWorkBuddyDesktopConfig(servers);
    if (host === "dsh" || host === "all") out.dsh = syncDshProfileConfig(servers, profile);
    console.log(JSON.stringify({ ok: true, count: servers.length, targets: out }, null, 2));
    return;
  }
  console.error(`Unknown command: ${command}`);
  console.error("Available commands: mcp | wizard | status | detect | setup | probe | activate | sync-host | machine-id");
  process.exitCode = 2;
}
void main();
