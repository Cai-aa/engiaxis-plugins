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

// packages/mcp-server/src/mcp-app-ui.ts
var MCP_APP_MIME_TYPE = "text/html;profile=mcp-app";
var MCP_APP_URIS = {
  global: "ui://engiaxis-connector/global-v1",
  thread: "ui://engiaxis-connector/thread-v1",
  widget: "ui://engiaxis-connector/widget-v1"
};
function buildSidebarSvg(stroke) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">',
    `<path d="M10 2.5L16.2 6.1V13.3L10 16.9L3.8 13.3V6.1L10 2.5Z" stroke="${stroke}" stroke-width="1.35" stroke-linejoin="round"/>`,
    `<path d="M10 9.7L16.2 6.1M10 9.7L3.8 6.1M10 9.7V16.9" stroke="${stroke}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<circle cx="10" cy="9.7" r="1.4" fill="${stroke}"/>`,
    "</svg>"
  ].join("");
}
var ENTRYPOINT_ICONS = [
  {
    src: `data:image/svg+xml,${encodeURIComponent(buildSidebarSvg("#0D0D0D"))}`,
    mimeType: "image/svg+xml",
    sizes: ["any"],
    theme: "light"
  },
  {
    src: `data:image/svg+xml,${encodeURIComponent(buildSidebarSvg("#F5F5F5"))}`,
    mimeType: "image/svg+xml",
    sizes: ["any"],
    theme: "dark"
  }
];
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
  const cacheKey = `engiaxis-connector:state:${edition}:v1`;
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
      --ea-surface: var(--color-background-secondary, #f7f7f8);
      --ea-card: var(--color-background-primary, #ffffff);
      --ea-card-hover: var(--color-background-secondary, #f4f5f7);
      --ea-border: var(--color-border-primary, rgba(13, 13, 13, 0.1));
      --ea-border-strong: rgba(13, 13, 13, 0.2);
      --ea-text: var(--color-text-primary, #0d0d0d);
      --ea-muted: var(--color-text-secondary, #6b7280);
      --ea-primary: #0d0d0d;
      --ea-primary-fg: #ffffff;
      --ea-accent: #0f766e;
      --ea-accent-soft: rgba(15, 118, 110, 0.1);
      --ea-ok: #15803d;
      --ea-ok-soft: rgba(21, 128, 61, 0.1);
      --ea-warn: #b45309;
      --ea-warn-soft: rgba(180, 83, 9, 0.1);
      --ea-err: #b91c1c;
      --ea-err-soft: rgba(185, 28, 28, 0.1);
      --ea-radius: 14px;
      --ea-safe-top: 0px;
      --ea-safe-right: 0px;
      --ea-safe-bottom: 0px;
      --ea-safe-left: 0px;
    }

    html[data-theme="dark"] {
      --ea-bg: var(--color-background-primary, #171717);
      --ea-surface: var(--color-background-secondary, #212121);
      --ea-card: var(--color-background-secondary, #1f1f22);
      --ea-card-hover: #29292d;
      --ea-border: var(--color-border-primary, rgba(255, 255, 255, 0.1));
      --ea-border-strong: rgba(255, 255, 255, 0.22);
      --ea-text: var(--color-text-primary, #ececec);
      --ea-muted: var(--color-text-secondary, #9ca3af);
      --ea-primary: #f5f5f5;
      --ea-primary-fg: #0d0d0d;
      --ea-accent: #2dd4bf;
      --ea-accent-soft: rgba(45, 212, 191, 0.14);
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
        --ea-surface: var(--color-background-secondary, #212121);
        --ea-card: var(--color-background-secondary, #1f1f22);
        --ea-card-hover: #29292d;
        --ea-border: var(--color-border-primary, rgba(255, 255, 255, 0.1));
        --ea-border-strong: rgba(255, 255, 255, 0.22);
        --ea-text: var(--color-text-primary, #ececec);
        --ea-muted: var(--color-text-secondary, #9ca3af);
        --ea-primary: #f5f5f5;
        --ea-primary-fg: #0d0d0d;
        --ea-accent: #2dd4bf;
        --ea-accent-soft: rgba(45, 212, 191, 0.14);
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
      font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif);
      font-size: 14px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .shell {
      max-width: 1080px;
      margin: 0 auto;
      padding: calc(24px + var(--ea-safe-top)) calc(24px + var(--ea-safe-right)) calc(120px + var(--ea-safe-bottom)) calc(24px + var(--ea-safe-left));
    }
    html[data-surface="thread"] .shell {
      max-width: 100%;
      padding: calc(16px + var(--ea-safe-top)) calc(16px + var(--ea-safe-right)) calc(28px + var(--ea-safe-bottom)) calc(16px + var(--ea-safe-left));
    }
    html[data-surface="widget"] .shell {
      max-width: 100%;
      padding: 14px 16px 18px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--ea-accent-soft);
      color: var(--ea-accent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand h1 {
      margin: 0;
      font-size: 19px;
      font-weight: 650;
      letter-spacing: -0.01em;
    }
    .brand-sub {
      font-size: 12px;
      color: var(--ea-muted);
    }

    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .search-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .search-input {
      background: var(--ea-surface);
      color: var(--ea-text);
      border: 1px solid var(--ea-border);
      border-radius: 999px;
      padding: 7px 14px;
      font-size: 13px;
      width: 200px;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .search-input:focus { border-color: var(--ea-border-strong); }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: var(--ea-card);
      color: var(--ea-text);
      border: 1px solid var(--ea-border);
      border-radius: 999px;
      padding: 7px 13px;
      font-size: 12.5px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.14s ease, border-color 0.14s ease, opacity 0.14s ease;
      white-space: nowrap;
    }
    .btn:hover:not(:disabled) {
      background: var(--ea-card-hover);
      border-color: var(--ea-border-strong);
    }
    .btn.primary {
      background: var(--ea-primary);
      color: var(--ea-primary-fg);
      border-color: var(--ea-primary);
    }
    .btn.primary:hover:not(:disabled) { opacity: 0.88; background: var(--ea-primary); }
    .btn.accent {
      background: var(--ea-accent-soft);
      color: var(--ea-accent);
      border-color: transparent;
    }
    .btn.accent:hover:not(:disabled) { border-color: var(--ea-accent); }
    .btn.sm { padding: 5px 10px; font-size: 12px; }
    .btn:disabled { opacity: 0.48; cursor: not-allowed; }

    .banner {
      background: var(--ea-surface);
      border: 1px solid var(--ea-border);
      border-radius: var(--ea-radius);
      padding: 14px 16px;
      margin-bottom: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .banner-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }
    .license-form {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    .key-input {
      flex: 1;
      min-width: 220px;
      background: var(--ea-bg);
      color: var(--ea-text);
      border: 1px solid var(--ea-border);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 13px;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      outline: none;
    }
    .key-input:focus { border-color: var(--ea-accent); }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 11.5px;
      font-weight: 550;
      background: var(--ea-surface);
      color: var(--ea-muted);
      border: 1px solid var(--ea-border);
    }
    .pill.ok { background: var(--ea-ok-soft); color: var(--ea-ok); border-color: transparent; }
    .pill.warn { background: var(--ea-warn-soft); color: var(--ea-warn); border-color: transparent; }
    .pill.err { background: var(--ea-err-soft); color: var(--ea-err); border-color: transparent; }
    .pill.accent { background: var(--ea-accent-soft); color: var(--ea-accent); border-color: transparent; }

    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      display: inline-block;
    }

    .tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .tab {
      background: transparent;
      color: var(--ea-muted);
      border: 1px solid var(--ea-border);
      border-radius: 999px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
    }
    .tab.active {
      background: var(--ea-primary);
      color: var(--ea-primary-fg);
      border-color: var(--ea-primary);
    }

    .stats-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
      gap: 14px;
    }
    html[data-surface="thread"] .grid {
      grid-template-columns: 1fr;
    }

    .card {
      background: var(--ea-card);
      border: 1px solid var(--ea-border);
      border-radius: var(--ea-radius);
      padding: 15px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color 0.14s ease, box-shadow 0.14s ease;
    }
    .card:hover {
      border-color: var(--ea-border-strong);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
    }
    .card-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }
    .card-ident {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .mono-badge {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--ea-surface);
      border: 1px solid var(--ea-border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--ea-text);
      flex-shrink: 0;
    }
    .card-name {
      font-size: 14.5px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-sub {
      font-size: 12px;
      color: var(--ea-muted);
    }
    .card-desc {
      font-size: 12.5px;
      color: var(--ea-muted);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .card-path {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11px;
      color: var(--ea-muted);
      background: var(--ea-surface);
      border-radius: 8px;
      padding: 5px 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .card-actions {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      margin-top: auto;
      padding-top: 4px;
    }
    .tools-drawer {
      background: var(--ea-surface);
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 11.5px;
      color: var(--ea-muted);
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .tool-chip {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 6px;
      background: var(--ea-card);
      border: 1px solid var(--ea-border);
      color: var(--ea-text);
    }

    .toast {
      position: fixed;
      top: calc(14px + var(--ea-safe-top));
      left: 50%;
      transform: translateX(-50%);
      background: var(--ea-primary);
      color: var(--ea-primary-fg);
      padding: 8px 14px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 500;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
      z-index: 99;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.18s ease;
    }
    .toast.show { opacity: 1; }

    details.log-box {
      margin-top: 20px;
      background: var(--ea-surface);
      border: 1px solid var(--ea-border);
      border-radius: var(--ea-radius);
      padding: 10px 14px;
    }
    details.log-box summary {
      cursor: pointer;
      font-size: 12.5px;
      font-weight: 550;
      color: var(--ea-muted);
      user-select: none;
    }
    .log-content {
      margin-top: 8px;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 11.5px;
      color: var(--ea-muted);
      white-space: pre-wrap;
      max-height: 180px;
      overflow: auto;
    }

    .empty {
      text-align: center;
      padding: 36px 16px;
      color: var(--ea-muted);
      border: 1px dashed var(--ea-border);
      border-radius: var(--ea-radius);
    }

    @media (max-width: 560px) {
      .search-input { width: 100%; }
      .toolbar { width: 100%; }
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="toast" id="toast"></div>
  <div class="shell">
    <div class="topbar">
      <div class="brand">
        <div class="brand-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2.5L16.2 6.1V13.3L10 16.9L3.8 13.3V6.1L10 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M10 9.7L16.2 6.1M10 9.7L3.8 6.1M10 9.7V16.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <h1 id="pageTitle">${title}</h1>
          <div class="brand-sub" id="pageSub">${spec.nameZh} \xB7 ${spec.sku}</div>
        </div>
      </div>

      <div class="toolbar">
        <div class="search-wrap">
          <input class="search-input" id="searchInput" type="search" placeholder="\u641C\u7D22\u8F6F\u4EF6..." />
        </div>
        <button class="btn" id="btnSync" type="button">\u540C\u6B65\u914D\u7F6E</button>
        <button class="btn primary" id="btnRefresh" type="button">\u5237\u65B0\u626B\u63CF</button>
      </div>
    </div>

    <div class="banner" id="licenseBanner">
      <div class="banner-row">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="pill" id="licenseBadge">\u6B63\u5728\u8BFB\u53D6\u72B6\u6001...</span>
          <span style="font-size:12px;color:var(--ea-muted)" id="licenseMeta"></span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:11.5px;color:var(--ea-muted);font-family:ui-monospace,monospace" id="machineFp"></span>
          <button class="btn sm" id="btnCopyFp" type="button" style="display:none">\u590D\u5236\u673A\u5668\u7801</button>
          <button class="btn sm" id="btnToggleKey" type="button" style="display:none">\u66F4\u6362\u6388\u6743\u7801</button>
        </div>
      </div>
      <div class="license-form" id="licenseForm" style="display:none">
        <input class="key-input" id="licenseInput" type="text" placeholder="\u8F93\u5165\u6FC0\u6D3B\u5361\u5BC6 (EA-CAD-XXXX-XXXX-XXXX) \u6216\u79BB\u7EBF\u6388\u6743\u7801 (EA1.xxxx...)" />
        <button class="btn primary" id="btnActivate" type="button">\u6FC0\u6D3B\u6388\u6743</button>
      </div>
    </div>

    <div class="stats-row" id="statsRow"></div>
    <div class="tabs" id="categoryTabs" style="display:none"></div>
    <div class="grid" id="adapterGrid">
      <div class="empty">\u6B63\u5728\u8FDE\u63A5\u672C\u673A EngiAxis Connector \u670D\u52A1...</div>
    </div>

    <details class="log-box" id="logBox">
      <summary id="logSummary">\u8FDE\u63A5\u4E0E\u914D\u7F6E\u65E5\u5FD7</summary>
      <div class="log-content" id="logContent">\u5C31\u7EEA\u3002</div>
    </details>
  </div>

  <script>
    (function () {
      const CACHE_KEY = ${JSON.stringify(cacheKey)};
      const EDITION = ${JSON.stringify(edition)};
      const PROTOCOL_VERSION = '2026-01-26';

      let nextRpcId = 1;
      const pending = new Map();
      let initialized = false;
      let hostConnected = false;
      let state = null;
      let busyIds = new Set();
      let activeCategory = 'all';
      let showLicenseEditor = false;
      let toolsBySoftware = {};
      let isZh = (navigator.language || 'zh').toLowerCase().startsWith('zh');

      const STR = {
        zh: {
          search: '\u641C\u7D22\u8F6F\u4EF6\u540D\u79F0...',
          sync: '\u540C\u6B65\u5230 ChatGPT',
          refresh: '\u5237\u65B0\u626B\u63CF',
          copyFp: '\u590D\u5236\u673A\u5668\u7801',
          changeKey: '\u66F4\u6362\u6388\u6743\u7801',
          activate: '\u6FC0\u6D3B\u6388\u6743',
          keyPlaceholder: '\u8F93\u5165\u6FC0\u6D3B\u5361\u5BC6 (EA-CAD-XXXX-XXXX-XXXX) \u6216\u79BB\u7EBF\u6388\u6743\u7801 (EA1.xxxx...)',
          licensed: '\u6388\u6743\u5DF2\u6FC0\u6D3B',
          unlicensed: '\u672A\u6FC0\u6D3B\u6388\u6743',
          detected: '\u5DF2\u68C0\u6D4B\u5230\u5B89\u88C5',
          notDetected: '\u672A\u68C0\u6D4B\u5230\u5B89\u88C5',
          provisioned: 'MCP \u5DF2\u5C31\u7EEA',
          notProvisioned: '\u5F85\u914D\u7F6E',
          bridgeOnline: '\u6865\u63A5\u5728\u7EBF',
          bridgeOffline: '\u6865\u63A5\u672A\u542F\u52A8',
          btnSetup: '\u4E00\u952E\u914D\u7F6E',
          btnReconfigure: '\u91CD\u65B0\u914D\u7F6E',
          btnProbe: '\u6D4B\u8BD5\u8FDE\u63A5',
          btnTools: '\u67E5\u770B\u5DE5\u5177',
          btnUseInChat: '\u5728\u5BF9\u8BDD\u4E2D\u4F7F\u7528',
          working: '\u5904\u7406\u4E2D...',
          all: '\u5168\u90E8',
          noMatch: '\u6CA1\u6709\u5339\u914D\u7684\u8F6F\u4EF6\u9002\u914D\u5668\u3002',
          logTitle: '\u8FDE\u63A5\u4E0E\u914D\u7F6E\u65E5\u5FD7',
          fpPrefix: '\u673A\u5668\u7801: ',
          summaryTotal: '\u9002\u914D\u5668\u603B\u6570',
          summaryDetected: '\u672C\u673A\u5DF2\u5B89\u88C5',
          summaryReady: '\u5DF2\u8FDE\u63A5\u53EF\u7528',
          toolsCount: ' \u4E2A\u5DE5\u5177',
          copied: '\u673A\u5668\u7801\u5DF2\u590D\u5236',
          needKey: '\u8BF7\u5148\u8F93\u5165\u6FC0\u6D3B\u5361\u5BC6\uFF08EA-...\uFF09\u6216\u79BB\u7EBF\u6388\u6743\u7801\uFF08EA1....\uFF09',
        },
        en: {
          search: 'Search software...',
          sync: 'Sync to ChatGPT',
          refresh: 'Refresh scan',
          copyFp: 'Copy Machine ID',
          changeKey: 'Update key',
          activate: 'Activate',
          keyPlaceholder: 'Enter redeem code (EA-CAD-XXXX-XXXX-XXXX) or offline key (EA1.xxx)',
          licensed: 'License active',
          unlicensed: 'Not activated',
          detected: 'Installed',
          notDetected: 'Not found',
          provisioned: 'MCP ready',
          notProvisioned: 'Not configured',
          bridgeOnline: 'Bridge online',
          bridgeOffline: 'Bridge offline',
          btnSetup: 'One-Click Setup',
          btnReconfigure: 'Reconfigure',
          btnProbe: 'Test',
          btnTools: 'Tools',
          btnUseInChat: 'Use in Chat',
          working: 'Working...',
          all: 'All',
          noMatch: 'No matching software adapters.',
          logTitle: 'Activity log',
          fpPrefix: 'Machine ID: ',
          summaryTotal: 'Adapters',
          summaryDetected: 'Detected',
          summaryReady: 'Connected',
          toolsCount: ' tools',
          copied: 'Machine ID copied',
          needKey: 'Please enter a redeem code (EA-...) or offline key (EA1....).',
        },
      };
      const t = (k) => (isZh ? STR.zh[k] : STR.en[k]) || k;

      function esc(s) {
        return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      }

      function toast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => el.classList.remove('show'), 2600);
      }

      function appendLog(msg) {
        const el = document.getElementById('logContent');
        const line = '[' + new Date().toLocaleTimeString() + '] ' + msg;
        el.textContent = el.textContent === '\u5C31\u7EEA\u3002' ? line : (el.textContent + '\\n' + line);
        el.scrollTop = el.scrollHeight;
      }

      function applyHostContext(ctx) {
        if (!ctx || typeof ctx !== 'object') return;
        if (ctx.theme === 'dark' || ctx.theme === 'light') {
          document.documentElement.setAttribute('data-theme', ctx.theme);
        }
        if (typeof ctx.locale === 'string' && ctx.locale) {
          isZh = ctx.locale.toLowerCase().startsWith('zh');
          applyStaticLabels();
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

      function applyStaticLabels() {
        document.getElementById('searchInput').placeholder = t('search');
        document.getElementById('btnSync').textContent = t('sync');
        document.getElementById('btnRefresh').textContent = t('refresh');
        document.getElementById('btnCopyFp').textContent = t('copyFp');
        document.getElementById('btnToggleKey').textContent = t('changeKey');
        document.getElementById('btnActivate').textContent = t('activate');
        document.getElementById('licenseInput').placeholder = t('keyPlaceholder');
        document.getElementById('logSummary').textContent = t('logTitle');
      }

      function rpcRequest(method, params) {
        return new Promise((resolve, reject) => {
          const id = nextRpcId++;
          const timer = setTimeout(() => {
            pending.delete(id);
            reject(new Error('Host RPC timeout: ' + method));
          }, 120000);
          pending.set(id, {
            resolve: (val) => { clearTimeout(timer); resolve(val); },
            reject: (err) => { clearTimeout(timer); reject(err); },
          });
          window.parent.postMessage({ jsonrpc: '2.0', id, method, params }, '*');
        });
      }

      function extractToolPayload(result) {
        if (!result || typeof result !== 'object') return null;
        if (result.structuredContent && typeof result.structuredContent === 'object') {
          return result.structuredContent;
        }
        if (Array.isArray(result.content)) {
          const txt = result.content.find((c) => c && c.type === 'text' && typeof c.text === 'string');
          if (txt) {
            try { return JSON.parse(txt.text); } catch { return { text: txt.text }; }
          }
        }
        return result;
      }

      async function callTool(name, args) {
        const res = await rpcRequest('tools/call', { name, arguments: args || {} });
        return { raw: res, data: extractToolPayload(res), isError: Boolean(res && res.isError) };
      }

      function updateModelContext() {
        if (!hostConnected || !state) return;
        const ready = (state.adapters || []).filter((a) => a.provisioned).map((a) => a.id);
        const detected = (state.adapters || []).filter((a) => Boolean(a.appInstalled)).map((a) => a.id);
        rpcRequest('ui/update-model-context', {
          structuredContent: {
            edition: EDITION,
            licensed: Boolean(state.license && state.license.activated),
            detectedAdapters: detected,
            connectedAdapters: ready,
          },
        }).catch(() => {});
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
        btn.disabled = true;
        try {
          const { data } = await callTool('connector_status', {});
          setState(data);
          if (!silent) appendLog('\u5DF2\u5237\u65B0\u72B6\u6001\uFF1A\u53D1\u73B0 ' + (data.adapters || []).length + ' \u4E2A\u9002\u914D\u5668\u3002');
        } catch (err) {
          appendLog('\u5237\u65B0\u5931\u8D25: ' + (err && err.message ? err.message : String(err)));
        } finally {
          btn.disabled = false;
        }
      }

      function monogram(adapter) {
        const map = {
          solidworks: 'SW',
          catia: 'V5',
          nx: 'NX',
          abaqus: 'ABQ',
          'ansys-workbench': 'WB',
          'ansys-fluent': 'FLU',
          'ansys-aedt': 'AEDT',
          comsol: 'COM',
          cst: 'CST',
          ansa: 'ANSA',
          calculix: 'CCX',
          'easyeda-pro': 'EDA',
          kicad: 'Ki',
          ads: 'ADS',
        };
        return map[adapter.id] || adapter.id.slice(0, 3).toUpperCase();
      }

      function render() {
        if (!state) return;
        const lic = state.license || {};
        const adapters = state.adapters || [];

        const badge = document.getElementById('licenseBadge');
        const meta = document.getElementById('licenseMeta');
        const fp = document.getElementById('machineFp');
        const copyBtn = document.getElementById('btnCopyFp');
        const toggleBtn = document.getElementById('btnToggleKey');
        const form = document.getElementById('licenseForm');

        if (lic.activated) {
          badge.className = 'pill ok';
          badge.innerHTML = '<span class="dot"></span> ' + esc(t('licensed'));
          meta.textContent = (lic.customer ? lic.customer + ' \xB7 ' : '') +
            String(lic.edition || EDITION).toUpperCase() +
            (lic.expiresAt ? (' \xB7 ' + String(lic.expiresAt).slice(0, 10)) : ' \xB7 \u6C38\u4E45 / Perpetual');
          toggleBtn.style.display = 'inline-flex';
          form.style.display = showLicenseEditor ? 'flex' : 'none';
        } else {
          badge.className = 'pill warn';
          badge.innerHTML = '<span class="dot"></span> ' + esc(t('unlicensed'));
          meta.textContent = lic.message || '';
          toggleBtn.style.display = 'none';
          form.style.display = 'flex';
        }

        if (lic.machineFingerprint) {
          fp.textContent = t('fpPrefix') + lic.machineFingerprint;
          copyBtn.style.display = 'inline-flex';
        }

        // Summary pills
        const installedCount = adapters.filter((a) => Boolean(a.appInstalled)).length;
        const readyCount = adapters.filter((a) => Boolean(a.provisioned)).length;
        document.getElementById('statsRow').innerHTML =
          '<span class="pill">' + esc(t('summaryTotal')) + ': <strong>' + adapters.length + '</strong></span>' +
          '<span class="pill accent">' + esc(t('summaryDetected')) + ': <strong>' + installedCount + '</strong></span>' +
          '<span class="pill ok">' + esc(t('summaryReady')) + ': <strong>' + readyCount + '</strong></span>';

        // Category tabs (only show when more than 1 category exists)
        const cats = [...new Set(adapters.map((a) => a.category))];
        const tabsEl = document.getElementById('categoryTabs');
        if (cats.length > 1) {
          tabsEl.style.display = 'flex';
          tabsEl.innerHTML = ['all', ...cats].map((c) => {
            const label = c === 'all' ? t('all') : c.toUpperCase();
            return '<button type="button" class="tab ' + (activeCategory === c ? 'active' : '') + '" data-cat="' + esc(c) + '">' + esc(label) + '</button>';
          }).join('');
        } else {
          tabsEl.style.display = 'none';
        }

        const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
        const filtered = adapters.filter((a) => {
          if (activeCategory !== 'all' && a.category !== activeCategory) return false;
          if (!q) return true;
          return [
            a.id,
            a.title,
            a.titleZh,
            a.category,
            a.runtime,
            a.prerequisitesEn,
            a.prerequisitesZh,
            a.appDetail,
            ...(Array.isArray(a.capabilities) ? a.capabilities : []),
          ].join(' ').toLowerCase().includes(q);
        });

        const grid = document.getElementById('adapterGrid');
        if (filtered.length === 0) {
          grid.innerHTML = '<div class="empty">' + esc(t('noMatch')) + '</div>';
          return;
        }

        grid.innerHTML = filtered.map((a) => {
          const isBusy = busyIds.has(a.id);
          const tools = toolsBySoftware[a.id];
          const primaryName = isZh ? (a.titleZh || a.title || a.id) : (a.title || a.id);
          const runtimeLabel = a.runtime === 'node' ? 'Node.js MCP' : 'Python MCP';
          const desc = isZh ? (a.prerequisitesZh || a.prerequisitesEn || '') : (a.prerequisitesEn || '');
          const toolCount = typeof a.toolCount === 'number'
            ? a.toolCount
            : (Array.isArray(a.toolNames) ? a.toolNames.length : 0);

          let badges = '<span class="pill">' + esc(String(a.category).toUpperCase()) + '</span>';
          badges += a.appInstalled
            ? '<span class="pill ok"><span class="dot"></span> ' + esc(t('detected')) + '</span>'
            : '<span class="pill">' + esc(t('notDetected')) + '</span>';
          badges += a.provisioned
            ? '<span class="pill accent"><span class="dot"></span> ' + esc(t('provisioned')) + (toolCount ? ' \xB7 ' + toolCount + esc(t('toolsCount')) : '') + '</span>'
            : '<span class="pill warn">' + esc(t('notProvisioned')) + '</span>';
          if (a.bridgeReady === true) {
            badges += '<span class="pill ok">' + esc(t('bridgeOnline')) + (a.bridgePort ? ' :' + a.bridgePort : '') + '</span>';
          } else if (a.bridgeReady === false) {
            badges += '<span class="pill warn">' + esc(t('bridgeOffline')) + (a.bridgePort ? ' :' + a.bridgePort : '') + '</span>';
          }

          const detailText = a.appDetail || (a.bridgeDetail ? a.bridgeDetail : '');
          const pathRow = detailText
            ? '<div class="card-path" title="' + esc(detailText) + '">' + esc(detailText) + '</div>'
            : '';

          const toolsRow = Array.isArray(tools) && tools.length > 0
            ? '<div class="tools-drawer">' + tools.slice(0, 14).map((tn) => '<span class="tool-chip">' + esc(tn) + '</span>').join('') +
              (tools.length > 14 ? '<span class="tool-chip">+' + (tools.length - 14) + '</span>' : '') + '</div>'
            : '';

          return [
            '<div class="card">',
            '  <div class="card-head">',
            '    <div class="card-ident">',
            '      <div class="mono-badge">' + esc(monogram(a)) + '</div>',
            '      <div style="min-width:0">',
            '        <div class="card-name">' + esc(primaryName) + '</div>',
            '        <div class="card-sub">' + esc(runtimeLabel) + ' \xB7 ' + esc(a.id) + '</div>',
            '      </div>',
            '    </div>',
            '  </div>',
            desc ? '  <div class="card-desc" title="' + esc(desc) + '">' + esc(desc) + '</div>' : '',
            '  <div class="card-badges">' + badges + '</div>',
            pathRow,
            toolsRow,
            '  <div class="card-actions">',
            '    <button type="button" class="btn sm ' + (a.provisioned ? '' : 'primary') + '" data-action="setup" data-id="' + esc(a.id) + '" ' + (isBusy ? 'disabled' : '') + '>' +
                  esc(isBusy ? t('working') : (a.provisioned ? t('btnReconfigure') : t('btnSetup'))) + '</button>',
            a.provisioned
              ? '    <button type="button" class="btn sm" data-action="probe" data-id="' + esc(a.id) + '" ' + (isBusy ? 'disabled' : '') + '>' + esc(t('btnProbe')) + '</button>' +
                '    <button type="button" class="btn sm" data-action="tools" data-id="' + esc(a.id) + '" ' + (isBusy ? 'disabled' : '') + '>' + esc(t('btnTools')) + '</button>' +
                '    <button type="button" class="btn sm accent" data-action="chat" data-id="' + esc(a.id) + '">' + esc(t('btnUseInChat')) + '</button>'
              : '',
            '  </div>',
            '</div>',
          ].join('');
        }).join('');
      }

      // Event bindings
      document.getElementById('searchInput').addEventListener('input', render);
      document.getElementById('btnRefresh').addEventListener('click', () => refreshStatus(false));

      document.getElementById('btnCopyFp').addEventListener('click', () => {
        const fp = state && state.license && state.license.machineFingerprint;
        if (!fp) return;
        navigator.clipboard?.writeText(fp).then(() => toast(t('copied'))).catch(() => toast(fp));
      });

      document.getElementById('btnToggleKey').addEventListener('click', () => {
        showLicenseEditor = !showLicenseEditor;
        render();
      });

      document.getElementById('btnActivate').addEventListener('click', async () => {
        const key = document.getElementById('licenseInput').value.trim();
        if (!key) { toast(t('needKey')); return; }
        const btn = document.getElementById('btnActivate');
        btn.disabled = true;
        try {
          const { data, isError } = await callTool('connector_activate_license', { license_key: key });
          if (isError || !data || !data.ok) {
            const msg = (data && data.message) || 'License activation failed';
            toast(msg);
            appendLog('\u6388\u6743\u6FC0\u6D3B\u5931\u8D25: ' + msg);
          } else {
            showLicenseEditor = false;
            document.getElementById('licenseInput').value = '';
            toast(t('licensed'));
            appendLog('\u6388\u6743\u5DF2\u6FC0\u6D3B: ' + (data.license && data.license.id ? data.license.id : 'OK'));
            await refreshStatus(true);
          }
        } catch (err) {
          toast(err.message);
          appendLog('\u6388\u6743\u6FC0\u6D3B\u5F02\u5E38: ' + err.message);
        } finally {
          btn.disabled = false;
        }
      });

      document.getElementById('btnSync').addEventListener('click', async () => {
        const btn = document.getElementById('btnSync');
        btn.disabled = true;
        try {
          const { data, isError } = await callTool('connector_sync_host', { host: 'chatgpt' });
          const msg = (data && data.synced)
            ? ('\u5DF2\u540C\u6B65 ' + data.count + ' \u4E2A\u9002\u914D\u5668\u5230 ChatGPT \u914D\u7F6E')
            : ((data && data.message) || '\u65E0\u53EF\u540C\u6B65\u9002\u914D\u5668');
          toast(msg);
          appendLog(msg + (isError ? ' (error)' : ''));
        } catch (err) {
          toast(err.message);
          appendLog('\u540C\u6B65\u5931\u8D25: ' + err.message);
        } finally {
          btn.disabled = false;
        }
      });

      document.getElementById('categoryTabs').addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-cat]');
        if (!btn) return;
        activeCategory = btn.getAttribute('data-cat') || 'all';
        render();
      });

      document.getElementById('adapterGrid').addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        if (!id) return;

        if (action === 'chat') {
          const prompt = isZh
            ? ('\u8BF7\u4F7F\u7528\u5DF2\u8FDE\u63A5\u7684 ' + id + ' \u5DE5\u7A0B\u8F6F\u4EF6\u9002\u914D\u5668\u5E2E\u6211\u67E5\u770B\u5F53\u524D\u6A21\u578B/\u9879\u76EE\u72B6\u6001\u3002')
            : ('Use the connected ' + id + ' adapter to inspect the active model/project.');
          rpcRequest('ui/message', {
            role: 'user',
            content: [{ type: 'text', text: prompt }],
          }).then(() => toast(isZh ? '\u5DF2\u53D1\u9001\u5230\u5BF9\u8BDD' : 'Sent to chat'))
            .catch(() => toast(prompt));
          return;
        }

        busyIds.add(id);
        render();
        try {
          if (action === 'setup') {
            appendLog('\u5F00\u59CB\u914D\u7F6E ' + id + ' ...');
            const { data, isError } = await callTool('connector_setup', { software_id: id, sync_host: 'chatgpt' });
            if (isError || !data || !data.ok) {
              const msg = (data && (data.detail || data.error || data.message)) || '\u914D\u7F6E\u5931\u8D25';
              toast(msg);
              appendLog(id + ' \u914D\u7F6E\u5931\u8D25: ' + msg);
            } else {
              const n = data.probe && Array.isArray(data.probe.tools) ? data.probe.tools.length : 0;
              toast(id + ' \u914D\u7F6E\u5B8C\u6210 (' + n + ' \u5DE5\u5177)');
              appendLog(id + ' \u914D\u7F6E\u6210\u529F\uFF0C\u63A2\u6D4B\u5230 ' + n + ' \u4E2A MCP \u5DE5\u5177\u3002');
              await refreshStatus(true);
            }
          } else if (action === 'probe') {
            appendLog('\u6D4B\u8BD5\u8FDE\u63A5 ' + id + ' ...');
            const { data } = await callTool('connector_probe', { software_id: id });
            const probe = data && data.probe;
            if (probe && probe.ok) {
              const list = Array.isArray(probe.tools) ? probe.tools : [];
              toolsBySoftware[id] = list;
              toast(id + ' \u8FDE\u901A\u6B63\u5E38 (' + list.length + ' \u5DE5\u5177)');
              appendLog(id + ' \u63A2\u6D4B\u6210\u529F (' + probe.latencyMs + 'ms, ' + list.length + ' tools)');
            } else {
              const errMsg = (probe && probe.error) || (data && data.error) || '\u8FDE\u63A5\u5931\u8D25';
              toast(errMsg);
              appendLog(id + ' \u63A2\u6D4B\u5931\u8D25: ' + errMsg);
            }
          } else if (action === 'tools') {
            const { data } = await callTool('connector_list_adapter_tools', { software_id: id });
            if (data && data.ok && Array.isArray(data.tools)) {
              toolsBySoftware[id] = data.tools;
              appendLog(id + ' \u5DE5\u5177\u5217\u8868: ' + data.tools.join(', '));
            } else {
              toast((data && data.error) || '\u8BFB\u53D6\u5DE5\u5177\u5931\u8D25');
            }
          }
        } catch (err) {
          toast(err.message);
          appendLog(id + ' \u64CD\u4F5C\u5F02\u5E38: ' + err.message);
        } finally {
          busyIds.delete(id);
          render();
        }
      });

      // Hydrate from localStorage immediately for instant sidebar rendering (stale-while-revalidate)
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
      window.addEventListener('message', (event) => {
        const msg = event.data;
        if (!msg || msg.jsonrpc !== '2.0') return;

        // Response to an outgoing request
        if (msg.id !== undefined && pending.has(msg.id)) {
          const waiter = pending.get(msg.id);
          pending.delete(msg.id);
          if (msg.error) waiter.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          else waiter.resolve(msg.result);
          return;
        }

        // Incoming host notifications
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
          initialized = true;
          if (initRes && initRes.hostContext) applyHostContext(initRes.hostContext);
          window.parent.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/initialized', params: {} }, '*');

          // If host doesn't push tool-result within 350ms, fetch live status directly
          setTimeout(() => {
            if (!receivedInitialToolResult) {
              refreshStatus(true);
            }
          }, 350);
        } catch (err) {
          appendLog('MCP App \u6865\u63A5\u521D\u59CB\u5316\u5931\u8D25: ' + (err && err.message ? err.message : String(err)));
        }
      }

      if (document.documentElement.getAttribute('data-surface') === 'widget' && window.parent !== window && typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
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
        icons: ENTRYPOINT_ICONS,
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
        icons: ENTRYPOINT_ICONS,
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
      return {
        activated: true,
        licenseId: verified.payload.id,
        edition: verified.payload.edition,
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
            icons: ENTRYPOINT_ICONS
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
