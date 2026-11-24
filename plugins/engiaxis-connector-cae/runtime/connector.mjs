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
    descriptionEn: "Connect SolidWorks, CATIA V5, UG / Siemens NX, EPLAN, and planned CAD tools (Creo, Inventor, AutoCAD, Fusion) to AI desktop clients.",
    descriptionZh: "\u8986\u76D6 SolidWorks\u3001CATIA V5\u3001UG / Siemens NX\u3001EPLAN \u53CA\u89C4\u5212\u4E2D\u7684 Creo\u3001Inventor\u3001AutoCAD\u3001Fusion \u7B49 8 \u6B3E CAD \u5DE5\u7A0B\u8F6F\u4EF6\u3002",
    categories: ["cad"]
  },
  cae: {
    id: "cae",
    sku: "EA-CONN-CAE",
    slug: "engiaxis-connector-cae",
    nameEn: "EngiAxis Connector \u2014 CAE Edition",
    nameZh: "EngiAxis \u5DE5\u7A0B\u8FDE\u63A5\u5668 \xB7 CAE \u7248",
    shortLabel: "CAE",
    descriptionEn: "Connect Abaqus, Ansys (Workbench / Fluent / AEDT), COMSOL, CST, ANSA, HyperWorks, Adams, CalculiX, and planned CAE solvers (STAR-CCM+, FloTHERM, FLAC3D).",
    descriptionZh: "\u8986\u76D6 Abaqus\u3001Ansys\uFF08Workbench / Fluent / AEDT\uFF09\u3001COMSOL\u3001CST\u3001ANSA\u3001HyperWorks\u3001Adams\u3001CalculiX \u53CA\u89C4\u5212\u4E2D\u7684 STAR-CCM+\u3001FloTHERM\u3001FLAC3D \u7B49 13 \u6B3E CAE \u4EFF\u771F\u8F6F\u4EF6\u3002",
    categories: ["cae"]
  },
  eda: {
    id: "eda",
    sku: "EA-CONN-EDA",
    slug: "engiaxis-connector-eda",
    nameEn: "EngiAxis Connector \u2014 EDA Edition",
    nameZh: "EngiAxis \u5DE5\u7A0B\u8FDE\u63A5\u5668 \xB7 EDA \u7248",
    shortLabel: "EDA",
    descriptionEn: "Connect EasyEDA Pro (JLC EDA), KiCad, Keysight ADS, and planned Altium Designer to AI desktop clients.",
    descriptionZh: "\u8986\u76D6\u5609\u7ACB\u521BEDA\uFF08EasyEDA Pro\uFF09\u3001KiCad\u3001Keysight ADS \u53CA\u89C4\u5212\u4E2D\u7684 Altium Designer \u7B49 4 \u6B3E EDA \u7535\u8DEF\u8F6F\u4EF6\u3002",
    categories: ["eda"]
  },
  suite: {
    id: "suite",
    sku: "EA-CONN-SUITE",
    slug: "engiaxis-connector-suite",
    nameEn: "EngiAxis Connector \u2014 All-in-One Suite (CAD + CAE + EDA)",
    nameZh: "EngiAxis \u5DE5\u7A0B\u8FDE\u63A5\u5668 \xB7 \u5168\u80FD\u7248\uFF08CAD + CAE + EDA\uFF09",
    shortLabel: "CAD + CAE + EDA",
    descriptionEn: "Complete engineering connector bundle synchronized with EngiAxis across all 25 CAD, CAE, and EDA desktop software entries.",
    descriptionZh: "\u4E09\u5408\u4E00\u5DE5\u7A0B\u8F6F\u4EF6\u8FDE\u63A5\u5168\u80FD\u7248\uFF0C\u5B8C\u6574\u540C\u6B65 EngiAxis \u5168\u90E8 25 \u6B3E CAD\u3001CAE \u4E0E EDA \u5DE5\u7A0B\u8F6F\u4EF6\u5217\u8868\u3002",
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
function hyperworksRootFromExecutable(executable) {
  const match = executable.match(/^(.+?)[\\/]hwdesktop[\\/]/iu);
  return match?.[1] ?? dirname(executable);
}
function adamsRootFromExecutable(executable) {
  const dir = dirname(executable);
  return /[\\/]common$/iu.test(dir) ? dirname(dir) : dir;
}
var SOFTWARE_CATALOG = [
  // ── CAD Edition (8) ───────────────────────────────────────────────────────
  {
    id: "solidworks",
    title: "SolidWorks",
    titleZh: "SolidWorks",
    category: "cad",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAD_REPO}/Solidworks`,
    prerequisitesEn: "Licensed Windows SolidWorks running under the same user and integrity level (COM automation).",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Windows SolidWorks\uFF0C\u5E76\u4EE5\u76F8\u540C\u7528\u6237\u6743\u9650\u901A\u8FC7 COM \u63A5\u53E3\u9644\u7740\u5230\u8FD0\u884C\u5B9E\u4F8B\u3002",
    capabilities: ["Part modeling", "Assemblies", "Drawings", "STEP / STL / PDF export", "Mass properties"],
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
    buildEnv: () => ({
      SOLIDWORKS_INTERACTIVE_MODE: "true",
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "catia",
    title: "CATIA V5",
    titleZh: "CATIA V5",
    category: "cad",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAD_REPO}/CATIA`,
    prerequisitesEn: "Licensed Windows CATIA V5 with COM automation enabled.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Windows CATIA V5 \u5E76\u542F\u7528 COM \u81EA\u52A8\u5316\u63A5\u53E3\u3002",
    capabilities: ["PartDesign & Sketcher", "Product assemblies", "Drafting", "Parameters & STEP export"],
    iconFile: "catia.png",
    source: {
      repo: "CAD-Agent-Hub",
      localRepoAliases: ["CAD-Agent-HUb"],
      repoSubpath: "MCP/CATIA",
      bundledDir: "catia"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py", "mcp_server.py"]
    },
    buildEnv: () => ({
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "nx",
    title: "UG / Siemens NX",
    titleZh: "UG / Siemens NX",
    category: "cad",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAD_REPO}/UG`,
    bridgePort: 48161,
    prerequisitesEn: "Licensed Siemens NX with the NXOpen Remoting bridge running on loopback port 48161 (NX_MCP_ALLOW_EXECUTE defaults to 0).",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Siemens NX \u5E76\u5728 NX \u5185\u542F\u52A8 NXOpen Remoting \u6865\u63A5\uFF08\u7AEF\u53E3 48161\uFF09\uFF1B\u9ED8\u8BA4\u5173\u95ED\u4EFB\u610F\u4EE3\u7801\u6267\u884C\u3002",
    capabilities: ["NXOpen modeling", "Assemblies", "Expressions & features", "STEP / JT export"],
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
      NX_MCP_HOST: "127.0.0.1",
      NX_MCP_PORT: "48161",
      NX_MCP_ALLOW_EXECUTE: "0",
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "creo",
    title: "Creo Parametric",
    titleZh: "Creo Parametric",
    category: "cad",
    integration: "planned",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: "https://www.ptc.com/en/products/creo/parametric",
    prerequisitesEn: "Planned CAD integration. Local Creo Parametric installations are auto-detected; one-click MCP provisioning will be enabled in an upcoming update.",
    prerequisitesZh: "\u89C4\u5212\u4E2D\u7684 CAD \u9002\u914D\u5668\u3002\u5DF2\u652F\u6301\u81EA\u52A8\u68C0\u6D4B\u672C\u673A Creo Parametric \u5B89\u88C5\uFF0C\u4E00\u952E MCP \u63A5\u5165\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E0A\u7EBF\u3002",
    capabilities: ["Parametric parts", "Assemblies", "Drawings"],
    iconFile: null,
    buildEnv: () => ({})
  },
  {
    id: "inventor",
    title: "Inventor",
    titleZh: "Inventor",
    category: "cad",
    integration: "planned",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: "https://www.autodesk.com/products/inventor",
    prerequisitesEn: "Planned CAD integration. Local Autodesk Inventor installations are auto-detected; one-click MCP provisioning will be enabled in an upcoming update.",
    prerequisitesZh: "\u89C4\u5212\u4E2D\u7684 CAD \u9002\u914D\u5668\u3002\u5DF2\u652F\u6301\u81EA\u52A8\u68C0\u6D4B\u672C\u673A Autodesk Inventor \u5B89\u88C5\uFF0C\u4E00\u952E MCP \u63A5\u5165\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E0A\u7EBF\u3002",
    capabilities: ["Mechanical parts", "Assemblies", "iLogic & drawings"],
    iconFile: null,
    buildEnv: () => ({})
  },
  {
    id: "autocad",
    title: "AutoCAD",
    titleZh: "AutoCAD",
    category: "cad",
    integration: "planned",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: "https://www.autodesk.com/products/autocad",
    prerequisitesEn: "Planned CAD integration. Local AutoCAD installations are auto-detected; one-click MCP provisioning will be enabled in an upcoming update.",
    prerequisitesZh: "\u89C4\u5212\u4E2D\u7684 CAD \u9002\u914D\u5668\u3002\u5DF2\u652F\u6301\u81EA\u52A8\u68C0\u6D4B\u672C\u673A AutoCAD \u5B89\u88C5\uFF0C\u4E00\u952E MCP \u63A5\u5165\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E0A\u7EBF\u3002",
    capabilities: ["2D drafting", "DWG / DXF", "Blocks & layers"],
    iconFile: null,
    buildEnv: () => ({})
  },
  {
    id: "fusion",
    title: "Autodesk Fusion",
    titleZh: "Autodesk Fusion",
    category: "cad",
    integration: "planned",
    runtime: "python",
    platformWindowsOnly: false,
    sourceUrl: "https://www.autodesk.com/products/fusion-360",
    prerequisitesEn: "Planned CAD integration. Local Autodesk Fusion installations are auto-detected; one-click MCP provisioning will be enabled in an upcoming update.",
    prerequisitesZh: "\u89C4\u5212\u4E2D\u7684 CAD \u9002\u914D\u5668\u3002\u5DF2\u652F\u6301\u81EA\u52A8\u68C0\u6D4B\u672C\u673A Autodesk Fusion \u5B89\u88C5\uFF0C\u4E00\u952E MCP \u63A5\u5165\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E0A\u7EBF\u3002",
    capabilities: ["Cloud CAD", "Parametric & surface modeling", "CAM"],
    iconFile: null,
    buildEnv: () => ({})
  },
  {
    id: "eplan",
    title: "EPLAN",
    titleZh: "EPLAN",
    category: "cad",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAD_REPO}/EPLAN`,
    prerequisitesEn: "Licensed Windows EPLAN Electric P8 (2.9 baseline) with the local named-pipe C# Add-in when native project inspection is required; defaults to read-only review profile.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Windows EPLAN Electric P8\uFF082.9 \u57FA\u7EBF\uFF09\u53CA\u672C\u5730\u547D\u540D\u7BA1\u9053 C# Add-in\uFF1B\u9ED8\u8BA4\u542F\u7528\u53EA\u8BFB\u5BA1\u67E5\u6A21\u5F0F\u3002",
    capabilities: ["Electrical schematics", "BOM & terminal strips", "Three-phase & rule audit", "Local help search"],
    iconFile: null,
    source: {
      repo: "CAD-Agent-Hub",
      localRepoAliases: ["CAD-Agent-HUb"],
      repoSubpath: "MCP/EPLAN",
      bundledDir: "eplan"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py"]
    },
    buildEnv: ({ discoveredExecutable }) => ({
      ...executableEnv("EPLAN_EXE", discoveredExecutable),
      PYTHONUTF8: "1",
      PYTHONUNBUFFERED: "1"
    })
  },
  // ── CAE Edition (13) ──────────────────────────────────────────────────────
  {
    id: "abaqus",
    title: "Abaqus",
    titleZh: "Abaqus",
    category: "cae",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: false,
    sourceUrl: `${CAE_REPO}/Abaqus`,
    bridgePort: 48152,
    prerequisitesEn: "Licensed Abaqus/CAE with the Abaqus MCP GUI plugin or kernel bridge listening on loopback TCP 48152.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Abaqus/CAE \u5E76\u52A0\u8F7D Abaqus MCP \u63D2\u4EF6/\u5185\u6838\u6865\u63A5\uFF08\u9ED8\u8BA4\u7AEF\u53E3 48152\uFF09\u3002",
    capabilities: ["Geometry & mesh", "Materials & BCs", "Job submission", "ODB field/history extraction"],
    iconFile: "abaqus.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/Abaqus",
      bundledDir: "abaqus"
    },
    launch: {
      kind: "python-script",
      scripts: ["mcp_server.py", "server.py"]
    },
    buildEnv: ({ homeDir }) => ({
      ABAQUS_MCP_HOST: "127.0.0.1",
      ABAQUS_MCP_PORT: "48152",
      ABAQUS_MCP_TIMEOUT: "60",
      ABAQUS_MCP_HOME: join(homeDir, "workspaces", "abaqus"),
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "ansys-workbench",
    title: "Ansys Workbench",
    titleZh: "Ansys Workbench",
    category: "cae",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/Ansys/Workbench%20MCP`,
    bridgePort: 9885,
    prerequisitesEn: "Licensed Ansys Workbench/Mechanical with the ACT/Workbench bridge running on loopback TCP 9885.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Ansys Workbench/Mechanical \u5E76\u542F\u52A8 ACT/Workbench \u6865\u63A5\uFF08\u9ED8\u8BA4\u7AEF\u53E3 9885\uFF09\u3002",
    capabilities: ["Project schematic", "Mechanical mesh & loads", "Static/modal/thermal solve", "Result probes"],
    iconFile: "ansys-workbench.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/Ansys/Workbench MCP",
      bundledDir: "ansys-workbench"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py", "mcp_server.py"]
    },
    buildEnv: ({ homeDir }) => ({
      WORKBENCH_MCP_ROOT: join(homeDir, "workspaces", "ansys-workbench"),
      WORKBENCH_MCP_QUEUE_ROOT: join(homeDir, "workspaces", "ansys-workbench", "queue"),
      WORKBENCH_MCP_HOST: "127.0.0.1",
      WORKBENCH_MCP_PORT: "9885",
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "ansys-fluent",
    title: "Ansys Fluent",
    titleZh: "Ansys Fluent",
    category: "cae",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: false,
    sourceUrl: `${CAE_REPO}/Ansys/Fluent%20MCP`,
    prerequisitesEn: "Licensed Ansys Fluent with a compatible PyFluent session or launch environment.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Ansys Fluent \u5E76\u652F\u6301 PyFluent \u8FDE\u63A5\u3002",
    capabilities: ["CFD mesh & case setup", "Turbulence & boundary conditions", "Solver control", "Field & report post-processing"],
    iconFile: "ansys-fluent.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/Ansys/Fluent MCP",
      bundledDir: "ansys-fluent"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py", "mcp_server.py"]
    },
    buildEnv: () => ({
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "ansys-aedt",
    title: "Ansys Electronics Desktop",
    titleZh: "Ansys Electronics Desktop (AEDT)",
    category: "cae",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/Ansys/AEDT%20MCP`,
    prerequisitesEn: "Licensed Ansys Electronics Desktop (HFSS / Maxwell / Icepak) with PyAEDT.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Ansys Electronics Desktop\uFF08HFSS / Maxwell / Icepak \u7B49\uFF09\u53CA PyAEDT \u517C\u5BB9\u73AF\u5883\u3002",
    capabilities: ["HFSS / Maxwell / Icepak", "3D EM geometry", "Excitations & sweeps", "S-parameters & fields"],
    iconFile: "ansys-aedt.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/Ansys/AEDT MCP",
      bundledDir: "ansys-aedt"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py", "mcp_server.py"]
    },
    buildEnv: () => ({
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "comsol",
    title: "COMSOL Multiphysics",
    titleZh: "COMSOL Multiphysics",
    category: "cae",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: false,
    sourceUrl: `${CAE_REPO}/COMSOL`,
    prerequisitesEn: "Licensed COMSOL Multiphysics installation with compatible Java/MPh desktop bridge.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 COMSOL Multiphysics \u53CA\u5BF9\u5E94\u7684 Java/MPh \u6865\u63A5\u73AF\u5883\u3002",
    capabilities: ["Multiphysics geometry", "Materials & physics nodes", "Studies & sweeps", "Derived values & plots"],
    iconFile: "comsol.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/COMSOL",
      bundledDir: "comsol"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py", "mcp_server.py"]
    },
    buildEnv: ({ discoveredExecutable }) => ({
      ...executableEnv("COMSOL_ROOT", discoveredExecutable, comsolRootFromExecutable),
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "cst",
    title: "CST Studio Suite",
    titleZh: "CST Studio Suite",
    category: "cae",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/CST`,
    prerequisitesEn: "Licensed Windows CST Studio Suite with a compatible Python automation environment.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Windows CST Studio Suite \u4E0E\u517C\u5BB9\u7684 Python \u81EA\u52A8\u5316\u73AF\u5883\u3002",
    capabilities: ["RF / antenna modeling", "Ports & materials", "Time/frequency solvers", "S-parameter & far-field export"],
    iconFile: "cst.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/CST",
      bundledDir: "cst"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py", "mcp_server.py"]
    },
    buildEnv: () => ({
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "ansa",
    title: "BETA CAE ANSA",
    titleZh: "BETA CAE ANSA",
    category: "cae",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: false,
    sourceUrl: `${CAE_REPO}/ANSA`,
    prerequisitesEn: "Licensed BETA CAE ANSA installation and the documented ANSA bridge.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 BETA CAE ANSA \u53CA\u5BF9\u5E94\u7684 ANSA \u6865\u63A5\u63D2\u4EF6\u3002",
    capabilities: ["CAD cleanup & topology", "Surface/volume meshing", "Solver deck export"],
    iconFile: "ansa.png",
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/ANSA",
      bundledDir: "ansa"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py", "mcp_server.py"]
    },
    buildEnv: ({ discoveredExecutable }) => ({
      ...executableEnv("ANSA_EXECUTABLE", discoveredExecutable),
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "hyperworks",
    title: "HyperWorks",
    titleZh: "HyperWorks",
    category: "cae",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/HyperWorks`,
    prerequisitesEn: "Licensed Altair HyperWorks/HyperMesh and optional OptiStruct/Radioss solvers; configure HYPERWORKS_HOME and enable the HyperWorks MCP Bridge extension for live GUI operations.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Altair HyperWorks/HyperMesh\uFF08\u53EF\u9009 OptiStruct/Radioss \u6C42\u89E3\u5668\uFF09\uFF0C\u914D\u7F6E HYPERWORKS_HOME \u5E76\u542F\u7528 HyperWorks MCP Bridge \u6269\u5C55\u3002",
    capabilities: ["HyperMesh pre-processing", "OptiStruct / Radioss", "HyperView post-processing", "Live GUI bridge"],
    iconFile: null,
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/HyperWorks",
      bundledDir: "hyperworks"
    },
    launch: {
      kind: "python-module",
      module: "hyperworks_mcp",
      checkFile: "src/hyperworks_mcp/server.py",
      pythonPathSubdir: "src"
    },
    buildEnv: ({ homeDir, discoveredExecutable }) => ({
      ...executableEnv("HYPERWORKS_HOME", discoveredExecutable, hyperworksRootFromExecutable),
      HYPERWORKS_MCP_WORKSPACE: join(homeDir, "workspaces", "hyperworks"),
      PYTHONUTF8: "1",
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "star-ccm",
    title: "STAR-CCM+",
    titleZh: "STAR-CCM+",
    category: "cae",
    integration: "planned",
    runtime: "python",
    platformWindowsOnly: false,
    sourceUrl: "https://plm.sw.siemens.com/en-US/simcenter/fluids-thermal-simulation/star-ccm/",
    prerequisitesEn: "Planned CFD integration. Local Simcenter STAR-CCM+ installations are auto-detected; one-click MCP provisioning will be enabled in an upcoming update.",
    prerequisitesZh: "\u89C4\u5212\u4E2D\u7684 CFD \u4EFF\u771F\u9002\u914D\u5668\u3002\u5DF2\u652F\u6301\u81EA\u52A8\u68C0\u6D4B\u672C\u673A Simcenter STAR-CCM+ \u5B89\u88C5\uFF0C\u4E00\u952E MCP \u63A5\u5165\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E0A\u7EBF\u3002",
    capabilities: ["Multiphase CFD", "Polyhedral meshing", "Thermal & aero simulation"],
    iconFile: null,
    buildEnv: () => ({})
  },
  {
    id: "flotherm",
    title: "FloTHERM",
    titleZh: "FloTHERM",
    category: "cae",
    integration: "planned",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: "https://eda.sw.siemens.com/en-US/ic-packaging/flotherm/",
    prerequisitesEn: "Planned electronics thermal simulation integration. Local Simcenter FloTHERM installations are auto-detected; one-click MCP provisioning will be enabled in an upcoming update.",
    prerequisitesZh: "\u89C4\u5212\u4E2D\u7684\u7535\u5B50\u6563\u70ED\u4EFF\u771F\u9002\u914D\u5668\u3002\u5DF2\u652F\u6301\u81EA\u52A8\u68C0\u6D4B\u672C\u673A Simcenter FloTHERM \u5B89\u88C5\uFF0C\u4E00\u952E MCP \u63A5\u5165\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E0A\u7EBF\u3002",
    capabilities: ["Electronics cooling", "Thermal impedance", "Heatsink optimization"],
    iconFile: null,
    buildEnv: () => ({})
  },
  {
    id: "adams",
    title: "Adams",
    titleZh: "Adams",
    category: "cae",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${CAE_REPO}/Adams`,
    prerequisitesEn: "Licensed Windows Hexagon Adams/View (2024.1 baseline, Python >= 3.11) with ADAMS_ROOT or ADAMS_LAUNCHER configured; start the localhost Command Server when live queries are needed.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Windows Hexagon Adams/View\uFF082024.1 \u57FA\u7EBF\uFF0CPython >= 3.11\uFF09\u5E76\u914D\u7F6E ADAMS_ROOT / ADAMS_LAUNCHER\uFF1B\u5B9E\u65F6\u67E5\u8BE2\u9700\u542F\u52A8\u672C\u5730 Command Server\u3002",
    capabilities: ["Multibody dynamics", "Joints & constraints", "Kinematic / dynamic simulation", "Result curves"],
    iconFile: null,
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/Adams",
      bundledDir: "adams"
    },
    launch: {
      kind: "python-module",
      module: "adams_mcp.server",
      checkFile: "src/adams_mcp/server.py",
      pythonPathSubdir: "src"
    },
    buildEnv: ({ discoveredExecutable }) => ({
      ...executableEnv("ADAMS_LAUNCHER", discoveredExecutable),
      ...executableEnv("ADAMS_ROOT", discoveredExecutable, adamsRootFromExecutable),
      PYTHONUTF8: "1",
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "flac3d",
    title: "FLAC3D",
    titleZh: "FLAC3D",
    category: "cae",
    integration: "planned",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: "https://www.itascacg.com/software/flac3d",
    prerequisitesEn: "Planned geomechanical CAE integration. Local Itasca FLAC3D installations are auto-detected; one-click MCP provisioning will be enabled in an upcoming update.",
    prerequisitesZh: "\u89C4\u5212\u4E2D\u7684\u5CA9\u571F\u529B\u5B66\u4EFF\u771F\u9002\u914D\u5668\u3002\u5DF2\u652F\u6301\u81EA\u52A8\u68C0\u6D4B\u672C\u673A Itasca FLAC3D \u5B89\u88C5\uFF0C\u4E00\u952E MCP \u63A5\u5165\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E0A\u7EBF\u3002",
    capabilities: ["Geomechanics", "Slope stability", "Tunnel & foundation modeling"],
    iconFile: null,
    buildEnv: () => ({})
  },
  {
    id: "calculix",
    title: "CalculiX",
    titleZh: "CalculiX (\u5F00\u6E90\u6709\u9650\u5143)",
    category: "cae",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: false,
    sourceUrl: `${CAE_REPO}/CalculiX`,
    prerequisitesEn: "Working CalculiX solver (ccx) installed locally or specified via CCX_EXE.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u5F00\u6E90 CalculiX (ccx) \u6C42\u89E3\u5668\u6216\u914D\u7F6E CCX_EXE \u8DEF\u5F84\u3002",
    capabilities: ["INP deck authoring", "Static/modal/thermal FEA", "FRD/DAT post-processing"],
    iconFile: null,
    source: {
      repo: "CAE-Agent-Hub",
      repoSubpath: "MCP/CalculiX",
      bundledDir: "calculix"
    },
    launch: {
      kind: "python-script",
      scripts: ["server.py", "mcp_server.py"]
    },
    buildEnv: ({ discoveredExecutable }) => ({
      ...executableEnv("CCX_EXE", discoveredExecutable),
      PYTHONUNBUFFERED: "1"
    })
  },
  // ── EDA Edition (4) ───────────────────────────────────────────────────────
  {
    id: "easyeda-pro",
    title: "EasyEDA Pro (JLC EDA)",
    titleZh: "\u5609\u7ACB\u521BEDA \u4E13\u4E1A\u7248 (EasyEDA Pro)",
    category: "eda",
    integration: "source",
    runtime: "node",
    platformWindowsOnly: false,
    sourceUrl: `${EDA_REPO}/easyeda-agent`,
    prerequisitesEn: "EasyEDA Pro desktop client with the EasyEDA Agent WebSocket bridge extension enabled.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u5609\u7ACB\u521BEDA \u4E13\u4E1A\u7248\u5E76\u542F\u7528 EasyEDA Agent \u6865\u63A5\u6269\u5C55\uFF08Node.js \u8FD0\u884C\u65F6\uFF09\u3002",
    capabilities: ["Schematic capture", "PCB placement & routing", "BOM & DRC checks", "JLCPCB library lookup"],
    iconFile: "easyeda-pro.png",
    source: {
      repo: "EDA-Agent-Hub",
      repoSubpath: "MCP/easyeda-agent",
      bundledDir: "easyeda-pro"
    },
    launch: {
      kind: "node-script",
      packageDir: "packages/mcp-server",
      entryScript: "packages/mcp-server/dist/index.js",
      buildCommand: ["npm", "run", "build"]
    },
    buildEnv: () => ({})
  },
  {
    id: "kicad",
    title: "KiCad",
    titleZh: "KiCad",
    category: "eda",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: false,
    sourceUrl: `${EDA_REPO}/KiCAD-MCP-Server`,
    prerequisitesEn: "KiCad 8/9 installed locally with kicad-cli available in PATH or standard installation folder.",
    prerequisitesZh: "\u9700\u5B89\u88C5 KiCad 8/9\uFF0C\u5E76\u786E\u4FDD kicad-cli \u5728\u7CFB\u7EDF PATH \u6216\u6807\u51C6\u5B89\u88C5\u76EE\u5F55\u4E2D\u53EF\u7528\u3002",
    capabilities: ["Schematic & PCB editing", "ERC / DRC verification", "Gerber / Drill / 3D export"],
    iconFile: "kicad.png",
    source: {
      repo: "EDA-Agent-Hub",
      repoSubpath: "MCP/KiCAD-MCP-Server",
      bundledDir: "kicad"
    },
    launch: {
      kind: "python-script",
      scripts: ["python/kicad_interface.py", "server.py", "mcp_server.py"]
    },
    buildEnv: () => ({
      PYTHONUNBUFFERED: "1"
    })
  },
  {
    id: "altium-designer",
    title: "Altium Designer",
    titleZh: "Altium Designer",
    category: "eda",
    integration: "planned",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: "https://www.altium.com/altium-designer",
    prerequisitesEn: "Planned EDA integration. Local Altium Designer installations are auto-detected; one-click MCP provisioning will be enabled in an upcoming update.",
    prerequisitesZh: "\u89C4\u5212\u4E2D\u7684 EDA \u9002\u914D\u5668\u3002\u5DF2\u652F\u6301\u81EA\u52A8\u68C0\u6D4B\u672C\u673A Altium Designer \u5B89\u88C5\uFF0C\u4E00\u952E MCP \u63A5\u5165\u5C06\u5728\u540E\u7EED\u7248\u672C\u4E0A\u7EBF\u3002",
    capabilities: ["Multi-layer PCB", "High-speed routing", "Schematic & BOM"],
    iconFile: null,
    buildEnv: () => ({})
  },
  {
    id: "ads",
    title: "Keysight ADS",
    titleZh: "Keysight ADS (\u5148\u8FDB\u8BBE\u8BA1\u7CFB\u7EDF)",
    category: "eda",
    integration: "source",
    runtime: "python",
    platformWindowsOnly: true,
    sourceUrl: `${EDA_REPO}/ADS`,
    bridgePort: 48326,
    requiresBridgeTokenConfig: true,
    prerequisitesEn: "Licensed Keysight ADS (HPEESOF_DIR) with the ADS MCP loopback token bridge running on TCP 48326.",
    prerequisitesZh: "\u9700\u5B89\u88C5\u6B63\u7248 Keysight ADS\uFF08\u914D\u7F6E HPEESOF_DIR\uFF09\u5E76\u542F\u52A8\u672C\u5730 ADS MCP \u4EE4\u724C\u6865\u63A5\uFF08\u7AEF\u53E3 48326\uFF09\u3002",
    capabilities: ["RF / Microwave schematic", "Harmonic balance & S-param", "Layout & EM co-simulation"],
    iconFile: null,
    source: {
      repo: "EDA-Agent-Hub",
      repoSubpath: "MCP/ADS",
      bundledDir: "ads"
    },
    launch: {
      kind: "python-module",
      module: "ads_mcp.server",
      checkFile: "src/ads_mcp/server.py",
      pythonPathSubdir: "src"
    },
    buildEnv: ({ discoveredExecutable, runtimeConfigPath }) => ({
      ...executableEnv("HPEESOF_DIR", discoveredExecutable, adsRootFromExecutable),
      ...runtimeConfigPath ? { ADS_MCP_CONFIG: runtimeConfigPath } : {},
      PYTHONUNBUFFERED: "1"
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
  return spec ? editionCoversCategory(edition, spec.category) : false;
}
var HOST_SERVER_ALIASES = {
  solidworks: ["solidworks", "solidworks-mcp", "solidworks-agent"],
  catia: ["catia", "catia-v5", "catia-mcp", "catia-agent"],
  nx: ["nx", "siemens-nx", "ug-nx", "nx-mcp"],
  creo: ["creo", "creo-parametric", "creo-mcp"],
  inventor: ["inventor", "autodesk-inventor", "inventor-mcp"],
  autocad: ["autocad", "autodesk-autocad", "autocad-mcp"],
  fusion: ["fusion", "autodesk-fusion", "fusion360", "fusion-360", "fusion-mcp"],
  eplan: ["eplan", "eplan-p8", "eplan-mcp"],
  abaqus: ["abaqus", "abaqus-mcp"],
  "ansys-workbench": ["ansys-workbench", "workbench-mcp"],
  "ansys-fluent": ["ansys-fluent", "fluent-mcp", "pyfluent", "pyfluent-mcp"],
  "ansys-aedt": ["ansys-aedt", "aedt-mcp", "pyaedt", "pyaedt-mcp"],
  comsol: ["comsol", "comsol-multiphysics", "comsol-mcp"],
  cst: ["cst", "cst-studio-suite", "cst-mcp"],
  ansa: ["ansa", "beta-cae-ansa", "ansa-mcp"],
  hyperworks: ["hyperworks", "altair-hyperworks", "hyperworks-mcp"],
  "star-ccm": ["star-ccm", "starccm", "star-ccm-plus", "starccm-mcp"],
  flotherm: ["flotherm", "simcenter-flotherm", "flotherm-mcp"],
  adams: ["adams", "hexagon-adams", "adams-mcp"],
  flac3d: ["flac3d", "itasca-flac3d", "flac3d-mcp"],
  calculix: ["calculix", "ccx", "calculix-mcp"],
  "easyeda-pro": ["easyeda-pro", "easyeda", "jlc-eda", "lceda-pro", "easyeda-mcp"],
  kicad: ["kicad", "kicad-mcp", "kicad-mcp-server"],
  "altium-designer": ["altium-designer", "altium", "altium-mcp"],
  ads: ["ads", "keysight-ads", "pathwave-ads", "ads-mcp"]
};
function resolveAdapterHostServerNames(id) {
  return HOST_SERVER_ALIASES[id] ?? [id];
}

// packages/core/dist/detect.js
import { execFile } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { createConnection } from "node:net";
import { win32 } from "node:path";
import { promisify } from "node:util";
var execFileAsync = promisify(execFile);
var ENV_DISCOVERY_RULES = {
  solidworks: {
    directKeys: ["SOLIDWORKS_EXE"],
    rootKeys: ["SOLIDWORKS_ROOT"],
    rootPatterns: [],
    relativePaths: ["SLDWORKS.exe", win32.join("SOLIDWORKS", "SLDWORKS.exe")]
  },
  catia: {
    directKeys: ["CATIA_EXE"],
    rootKeys: ["CATIA_ROOT"],
    rootPatterns: [],
    relativePaths: [win32.join("win_b64", "code", "bin", "CNEXT.exe")]
  },
  nx: {
    directKeys: ["NX_EXE"],
    rootKeys: ["UGII_BASE_DIR"],
    rootPatterns: [],
    relativePaths: [win32.join("NXBIN", "ugraf.exe"), win32.join("UGII", "ugraf.exe")]
  },
  eplan: {
    directKeys: ["EPLAN_EXE"],
    rootKeys: [],
    rootPatterns: [],
    relativePaths: []
  },
  abaqus: {
    directKeys: ["ABAQUS_CMD", "ABAQUS_BAT"],
    rootKeys: ["SIMULIA_ROOT", "ABAQUS_ROOT"],
    rootPatterns: [],
    relativePaths: [win32.join("Commands", "abaqus.bat"), "abaqus.bat"]
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
  hyperworks: {
    directKeys: ["HYPERWORKS_EXE"],
    rootKeys: ["HYPERWORKS_HOME", "ALTAIR_HOME"],
    rootPatterns: [],
    relativePaths: [
      win32.join("hwdesktop", "hwx", "bin", "win64", "runhwx.exe"),
      win32.join("hwdesktop", "hm", "bin", "win64", "hmbatch.exe")
    ]
  },
  adams: {
    directKeys: ["ADAMS_LAUNCHER"],
    rootKeys: ["ADAMS_ROOT"],
    rootPatterns: [],
    relativePaths: [win32.join("common", "mdi.bat"), "mdi.bat"]
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
    relativePaths: [win32.join("bin", "ads.exe"), win32.join("bin", "hpeesofde.exe"), "ads.exe"]
  }
};
function isFile(filePath) {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}
function subdirectories(root) {
  if (!existsSync(root))
    return [];
  try {
    return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => win32.join(root, entry.name));
  } catch {
    return [];
  }
}
function defaultWindowsDrives() {
  return Array.from({ length: 24 }, (_, idx) => `${String.fromCharCode(67 + idx)}:\\`).filter(existsSync);
}
function ansysVersionRoots(drive) {
  const parents = [
    win32.join(drive, "Program Files", "ANSYS Inc"),
    win32.join(drive, "ANSYS Inc"),
    ...subdirectories(drive).filter((dir) => /[\\/]ansys[^\\/]*$/i.test(dir)).map((dir) => win32.join(dir, "ANSYS Inc"))
  ];
  return parents.flatMap(subdirectories);
}
function environmentCandidates(id, env) {
  const rule = ENV_DISCOVERY_RULES[id];
  if (!rule)
    return [];
  const direct = rule.directKeys.flatMap((key) => env[key] ? [env[key]] : []);
  const patternRoots = Object.entries(env).filter(([key]) => rule.rootPatterns.some((pattern) => pattern.test(key))).map(([, val]) => val);
  const roots = [...rule.rootKeys.map((key) => env[key]), ...patternRoots];
  const expanded = roots.flatMap((root) => root ? rule.relativePaths.map((rel) => win32.join(root, rel)) : []);
  return [...direct, ...expanded];
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
      case "creo":
        return subdirectories(win32.join(programs, "PTC")).map((root) => win32.join(root, "Parametric", "bin", "parametric.exe"));
      case "inventor":
        return subdirectories(win32.join(programs, "Autodesk")).filter((dir) => /inventor/i.test(dir)).map((root) => win32.join(root, "Bin", "Inventor.exe"));
      case "autocad":
        return subdirectories(win32.join(programs, "Autodesk")).filter((dir) => /autocad/i.test(dir)).map((root) => win32.join(root, "acad.exe"));
      case "fusion":
        return subdirectories(win32.join(drive, "Users")).flatMap((userDir) => subdirectories(win32.join(userDir, "AppData", "Local", "Autodesk", "webdeploy", "production"))).map((prod) => win32.join(prod, "Fusion360.exe"));
      case "eplan":
        return subdirectories(win32.join(programs, "EPLAN", "Platform")).flatMap((ver) => [win32.join(ver, "Bin", "W3u.exe"), win32.join(ver, "Bin", "EPLAN.exe")]);
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
      case "hyperworks":
        return [
          ...subdirectories(win32.join(programs, "Altair")),
          ...subdirectories(drive).filter((dir) => /[\\/]altair[^\\/]*$/i.test(dir))
        ].map((root) => win32.join(root, "hwdesktop", "hwx", "bin", "win64", "runhwx.exe"));
      case "star-ccm":
        return subdirectories(win32.join(programs, "Siemens")).flatMap(subdirectories).filter((dir) => /star-ccm/i.test(dir)).map((root) => win32.join(root, "star", "bin", "starccm+.exe"));
      case "flotherm":
        return [win32.join(programs, "Siemens"), win32.join(programs, "Mentor Graphics")].flatMap(subdirectories).filter((dir) => /flotherm/i.test(dir)).map((root) => win32.join(root, "flosuite", "bin", "flotherm.exe"));
      case "adams":
        return [win32.join(programs, "MSC.Software", "Adams"), win32.join(programs, "Hexagon", "Adams")].flatMap(subdirectories).map((ver) => win32.join(ver, "common", "mdi.bat"));
      case "flac3d":
        return subdirectories(win32.join(programs, "Itasca")).filter((dir) => /flac3d/i.test(dir)).flatMap((root) => [
          win32.join(root, "exe64", "flac3d900_gui.exe"),
          win32.join(root, "exe64", "flac3d800_gui.exe"),
          win32.join(root, "exe64", "flac3d700_gui.exe")
        ]);
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
      case "altium-designer":
        return subdirectories(win32.join(programs, "Altium")).map((root) => win32.join(root, "X2.EXE"));
      case "ads":
        return [win32.join(programs, "Keysight"), win32.join(drive, "Keysight")].flatMap(subdirectories).filter((dir) => /ads/i.test(dir)).flatMap((root) => [win32.join(root, "bin", "ads.exe"), win32.join(root, "bin", "hpeesofde.exe")]);
    }
  });
}
var PATH_COMMANDS = {
  solidworks: "SLDWORKS.exe",
  catia: "CNEXT.exe",
  nx: "ugraf.exe",
  creo: "parametric.exe",
  inventor: "Inventor.exe",
  autocad: "acad.exe",
  fusion: "Fusion360.exe",
  eplan: "W3u.exe",
  abaqus: "abaqus",
  "ansys-workbench": "RunWB2.exe",
  "ansys-fluent": "fluent.exe",
  "ansys-aedt": "ansysedt.exe",
  comsol: "comsol.exe",
  cst: "CST DESIGN ENVIRONMENT_AMD64.exe",
  ansa: "ansa64.bat",
  hyperworks: "runhwx.exe",
  "star-ccm": "starccm+.exe",
  flotherm: "flotherm.exe",
  adams: "adams2024_1",
  flac3d: "flac3d900_gui.exe",
  calculix: "ccx",
  kicad: "kicad.exe",
  "easyeda-pro": "lceda-pro.exe",
  "altium-designer": "X2.EXE",
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
import { existsSync as existsSync6, mkdirSync as mkdirSync3, readFileSync as readFileSync5, writeFileSync as writeFileSync3 } from "node:fs";
import { cp, mkdir as mkdir2, readdir, readFile, rename, rm } from "node:fs/promises";
import { homedir as homedir2 } from "node:os";
import { dirname as dirname7, isAbsolute as isAbsolute2, join as join6 } from "node:path";

// packages/core/dist/hosts/chatgpt-desktop.js
import { existsSync as existsSync5, mkdirSync as mkdirSync2, readFileSync as readFileSync4, writeFileSync as writeFileSync2 } from "node:fs";
import { homedir } from "node:os";
import { dirname as dirname6, isAbsolute, join as join5 } from "node:path";
function resolveChatGptConfigTomlPath() {
  const codexHome = process.env.CODEX_HOME?.trim();
  if (codexHome)
    return join5(codexHome, "config.toml");
  return join5(homedir(), ".codex", "config.toml");
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
function unquoteTomlScalar(raw) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
}
function stripTomlInlineComment(raw) {
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (inDouble && ch === "\\") {
      escaped = true;
      continue;
    }
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      continue;
    }
    if (!inSingle && !inDouble && ch === "#") {
      return raw.slice(0, i).trim();
    }
  }
  return raw.trim();
}
function parseTomlStringArray(raw) {
  const trimmed = stripTomlInlineComment(raw);
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]"))
    return [];
  const inner = trimmed.slice(1, -1).trim();
  if (!inner)
    return [];
  const items = [];
  let current = "";
  let inSingle = false;
  let inDouble = false;
  let escaped = false;
  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }
    if (inDouble && ch === "\\") {
      current += ch;
      escaped = true;
      continue;
    }
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      current += ch;
      continue;
    }
    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      current += ch;
      continue;
    }
    if (!inSingle && !inDouble && ch === ",") {
      const token = stripTomlInlineComment(current);
      if (token)
        items.push(unquoteTomlScalar(token));
      current = "";
      continue;
    }
    current += ch;
  }
  const tail = stripTomlInlineComment(current);
  if (tail)
    items.push(unquoteTomlScalar(tail));
  return items;
}
function matchMcpServerSectionHeader(line) {
  const match = /^\s*\[\s*mcp_servers\.([^.\]\s"']+|"[^"]+"|'[^']+')(?:\.([^\]]+))?\s*\]\s*(?:#.*)?$/.exec(line);
  if (!match)
    return null;
  const rawName = match[1] ?? "";
  const serverName = unquoteTomlScalar(rawName);
  const subPath = match[2] ? match[2].trim() : null;
  return serverName ? { serverName, subPath } : null;
}
function isCommandExecutableAvailable(command) {
  if (!command || !command.trim())
    return false;
  const trimmed = command.trim();
  const looksLikePath = isAbsolute(trimmed) || /^[A-Za-z]:[\\/]/.test(trimmed) || trimmed.includes("/") || trimmed.includes("\\");
  if (looksLikePath) {
    return existsSync5(trimmed);
  }
  return true;
}
function parseCodexConfigTomlMcpServers(content) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const entries = /* @__PURE__ */ new Map();
  let activeServer = null;
  let activeSubPath = null;
  let pendingArrayKey = null;
  let pendingArrayBuffer = "";
  const ensureEntry = (name) => {
    let entry = entries.get(name);
    if (!entry) {
      entry = { name, enabled: true, args: [], env: {} };
      entries.set(name, entry);
    }
    return entry;
  };
  for (const rawLine of lines) {
    if (pendingArrayKey && activeServer && activeSubPath === null) {
      pendingArrayBuffer += " " + stripTomlInlineComment(rawLine);
      if (pendingArrayBuffer.includes("]")) {
        if (pendingArrayKey === "args") {
          activeServer.args = parseTomlStringArray(pendingArrayBuffer);
        }
        pendingArrayKey = null;
        pendingArrayBuffer = "";
      }
      continue;
    }
    const mcpHeader = matchMcpServerSectionHeader(rawLine);
    if (mcpHeader) {
      activeServer = ensureEntry(mcpHeader.serverName);
      activeSubPath = mcpHeader.subPath;
      pendingArrayKey = null;
      pendingArrayBuffer = "";
      continue;
    }
    if (/^\s*\[/.test(rawLine)) {
      activeServer = null;
      activeSubPath = null;
      pendingArrayKey = null;
      pendingArrayBuffer = "";
      continue;
    }
    if (!activeServer)
      continue;
    const cleaned = stripTomlInlineComment(rawLine);
    if (!cleaned)
      continue;
    const eqIdx = cleaned.indexOf("=");
    if (eqIdx <= 0)
      continue;
    const key = unquoteTomlScalar(cleaned.slice(0, eqIdx));
    const rawVal = cleaned.slice(eqIdx + 1).trim();
    if (activeSubPath === null) {
      if (key === "enabled") {
        if (rawVal === "false")
          activeServer.enabled = false;
        else if (rawVal === "true")
          activeServer.enabled = true;
      } else if (key === "command") {
        activeServer.command = unquoteTomlScalar(rawVal);
      } else if (key === "cwd") {
        activeServer.cwd = unquoteTomlScalar(rawVal);
      } else if (key === "url") {
        activeServer.url = unquoteTomlScalar(rawVal);
      } else if (key === "args") {
        if (rawVal.startsWith("[") && !rawVal.includes("]")) {
          pendingArrayKey = "args";
          pendingArrayBuffer = rawVal;
        } else {
          activeServer.args = parseTomlStringArray(rawVal);
        }
      }
    } else if (activeSubPath === "env") {
      activeServer.env[key] = unquoteTomlScalar(rawVal);
    }
  }
  const out = [];
  for (const item of entries.values()) {
    const isHttp = Boolean(item.url && !item.command);
    const transport = isHttp ? "http" : "stdio";
    const commandValid = isHttp ? Boolean(item.url) : isCommandExecutableAvailable(item.command);
    out.push({
      name: item.name,
      enabled: item.enabled,
      transport,
      ...item.command ? { command: item.command } : {},
      args: item.args,
      ...item.cwd ? { cwd: item.cwd } : {},
      ...item.url ? { url: item.url } : {},
      env: item.env,
      commandValid
    });
  }
  return out;
}
function readChatGptDesktopMcpServers(configPath = resolveChatGptConfigTomlPath()) {
  if (!existsSync5(configPath)) {
    return { exists: false, configPath, servers: [] };
  }
  try {
    const raw = readFileSync4(configPath, "utf8");
    return { exists: true, configPath, servers: parseCodexConfigTomlMcpServers(raw) };
  } catch {
    return { exists: true, configPath, servers: [] };
  }
}
function setCodexMcpServerEnabled(existingContent, serverName, enabled) {
  const lines = existingContent.replace(/\r\n/g, "\n").split("\n");
  let inTargetMain = false;
  let foundSection = false;
  let replacedEnabledLine = false;
  let sectionHeaderIndex = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const mcpHeader = matchMcpServerSectionHeader(line);
    if (mcpHeader) {
      if (mcpHeader.serverName === serverName && mcpHeader.subPath === null) {
        inTargetMain = true;
        foundSection = true;
        sectionHeaderIndex = i;
      } else {
        inTargetMain = false;
      }
      continue;
    }
    if (/^\s*\[/.test(line)) {
      inTargetMain = false;
      continue;
    }
    if (inTargetMain) {
      const cleaned = stripTomlInlineComment(line);
      const eqIdx = cleaned.indexOf("=");
      if (eqIdx > 0 && unquoteTomlScalar(cleaned.slice(0, eqIdx)) === "enabled") {
        lines[i] = `enabled = ${enabled ? "true" : "false"}`;
        replacedEnabledLine = true;
        inTargetMain = false;
      }
    }
  }
  if (!foundSection) {
    return { updated: false, content: existingContent };
  }
  if (!replacedEnabledLine && sectionHeaderIndex >= 0) {
    lines.splice(sectionHeaderIndex + 1, 0, `enabled = ${enabled ? "true" : "false"}`);
  }
  const joined = lines.join("\n").replace(/\n*$/, "\n");
  return { updated: true, content: joined };
}
function toggleChatGptDesktopServer(serverName, enabled, configPath = resolveChatGptConfigTomlPath()) {
  if (!existsSync5(configPath))
    return { updated: false, configPath };
  const existing = readFileSync4(configPath, "utf8");
  const res = setCodexMcpServerEnabled(existing, serverName, enabled);
  if (res.updated) {
    writeFileSync2(configPath, res.content, "utf8");
  }
  return { updated: res.updated, configPath };
}
function removeCodexConfigTomlServers(existingContent, serverNames) {
  const lines = existingContent.replace(/\r\n/g, "\n").split("\n");
  const targetSet = new Set(serverNames);
  const removedSet = /* @__PURE__ */ new Set();
  const kept = [];
  let skipping = false;
  for (const line of lines) {
    const mcpHeader = matchMcpServerSectionHeader(line);
    if (mcpHeader) {
      if (targetSet.has(mcpHeader.serverName)) {
        removedSet.add(mcpHeader.serverName);
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
  const normalized = kept.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
  return {
    removed: [...removedSet],
    content: normalized ? `${normalized}
` : ""
  };
}
function removeChatGptDesktopServers(serverNames, configPath = resolveChatGptConfigTomlPath()) {
  if (!existsSync5(configPath))
    return { removed: [], configPath };
  const existing = readFileSync4(configPath, "utf8");
  const res = removeCodexConfigTomlServers(existing, serverNames);
  if (res.removed.length > 0) {
    writeFileSync2(configPath, res.content, "utf8");
  }
  return { removed: res.removed, configPath };
}
function upsertCodexConfigToml(existingContent, servers) {
  const { content: stripped } = removeCodexConfigTomlServers(existingContent, servers.map((s) => s.name));
  const base = stripped.trimEnd();
  const additions = servers.map(renderCodexMcpTomlSection).join("\n\n");
  if (!base)
    return `${additions}
`;
  return `${base}

${additions}
`;
}
function syncChatGptDesktopConfig(servers, configPath = resolveChatGptConfigTomlPath()) {
  const existing = existsSync5(configPath) ? readFileSync4(configPath, "utf8") : "";
  const next = upsertCodexConfigToml(existing, servers);
  mkdirSync2(dirname6(configPath), { recursive: true });
  writeFileSync2(configPath, next, "utf8");
  return { configPath, updatedServers: servers.map((s) => s.name) };
}

// packages/core/dist/provisioner.js
function defaultConnectorHomeDir() {
  const fromEnv = process.env.ENGIAXIS_CONNECTOR_HOME?.trim();
  if (fromEnv)
    return fromEnv;
  return join6(homedir2(), ".engiaxis-connector");
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
    allowDevBypass: overrides.allowDevBypass ?? false,
    codexConfigPath: overrides.codexConfigPath !== void 0 ? overrides.codexConfigPath : overrides.homeDir === void 0 ? resolveChatGptConfigTomlPath() : null
  };
}
function runtimePythonPath(runtimesDir, id, platform2 = process.platform) {
  return platform2 === "win32" ? join6(runtimesDir, id, "Scripts", "python.exe") : join6(runtimesDir, id, "bin", "python");
}
async function readAllPythonSources(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    if (entry.name === ".venv" || entry.name === "__pycache__" || entry.name === ".git" || entry.name === "node_modules")
      continue;
    const full = join6(dir, entry.name);
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
  if (!launch)
    return { checkOk: false, launchArgs: [] };
  if (launch.kind === "python-module") {
    const hasPyproject = existsSync6(join6(dir, "pyproject.toml"));
    const hasModuleEntry = existsSync6(join6(dir, ...launch.checkFile.split("/")));
    if (hasPyproject && hasModuleEntry) {
      return {
        checkOk: true,
        launchArgs: ["-m", launch.module],
        pythonPath: join6(dir, launch.pythonPathSubdir)
      };
    }
    if (hasPyproject && existsSync6(join6(dir, "server.py"))) {
      return {
        checkOk: true,
        launchArgs: [join6(dir, "server.py")],
        pythonPath: dir
      };
    }
    return {
      checkOk: false,
      launchArgs: ["-m", launch.module],
      pythonPath: join6(dir, launch.pythonPathSubdir)
    };
  }
  if (launch.kind === "python-script") {
    if (!existsSync6(join6(dir, "pyproject.toml")))
      return { checkOk: false, launchArgs: [] };
    for (const script of launch.scripts) {
      if (existsSync6(join6(dir, script))) {
        return { checkOk: true, launchArgs: [join6(dir, script)], pythonPath: dir };
      }
    }
    return { checkOk: false, launchArgs: [] };
  }
  const entry = join6(dir, ...launch.entryScript.split("/"));
  const pkgJson = launch.packageDir ? join6(dir, launch.packageDir, "package.json") : join6(dir, "package.json");
  const ok = existsSync6(entry) || launch.buildCommand !== void 0 && existsSync6(pkgJson);
  return { checkOk: ok, launchArgs: [entry] };
}
function ensureAdsBridgeConfig(runtimeDir, homeDir) {
  const configPath = join6(runtimeDir, "bridge_config.json");
  mkdirSync3(runtimeDir, { recursive: true });
  if (existsSync6(configPath))
    return configPath;
  const token = randomBytes(32).toString("hex");
  const payload = {
    host: "127.0.0.1",
    port: 48326,
    token,
    workspace_root: join6(homeDir, "workspaces", "ads"),
    timeout: 60,
    max_message_bytes: 16777216
  };
  mkdirSync3(payload.workspace_root, { recursive: true });
  writeFileSync3(configPath, `${JSON.stringify(payload, null, 2)}
`, "utf8");
  return configPath;
}
function matchHostServerForAdapter(id, servers) {
  const candidates = resolveAdapterHostServerNames(id).map((name) => servers.get(name)).filter((item) => item !== void 0);
  if (candidates.length === 0)
    return void 0;
  return candidates.find((c) => c.enabled && c.commandValid) ?? candidates.find((c) => c.enabled) ?? candidates.find((c) => c.commandValid) ?? candidates[0];
}
function parseLoopbackHttpPort(rawUrl) {
  if (!rawUrl)
    return void 0;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return void 0;
    const host = parsed.hostname.toLowerCase();
    if (host !== "127.0.0.1" && host !== "localhost" && host !== "::1" && host !== "[::1]")
      return void 0;
    const port = Number.parseInt(parsed.port, 10);
    return Number.isInteger(port) && port > 0 && port <= 65535 ? port : void 0;
  } catch {
    return void 0;
  }
}
var ConnectorProvisioner = class _ConnectorProvisioner {
  config;
  registryPath;
  probeCachePath;
  sourcesDir;
  runtimesDir;
  constructor(config) {
    this.config = config;
    this.registryPath = join6(config.homeDir, "provisioned.json");
    this.probeCachePath = join6(config.homeDir, "host-probe-cache.json");
    this.sourcesDir = join6(config.homeDir, "sources");
    this.runtimesDir = join6(config.homeDir, "runtimes");
  }
  static launchSignature(launch) {
    return JSON.stringify([launch.command, launch.args]);
  }
  readProbeCache() {
    if (!existsSync6(this.probeCachePath))
      return {};
    try {
      const parsed = JSON.parse(readFileSync5(this.probeCachePath, "utf8"));
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
    }
    return {};
  }
  saveProbeCache(id, launch, toolNames) {
    const current = this.readProbeCache();
    current[id] = {
      signature: _ConnectorProvisioner.launchSignature(launch),
      toolCount: toolNames.length,
      toolNames: [...toolNames],
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    mkdirSync3(dirname7(this.probeCachePath), { recursive: true });
    writeFileSync3(this.probeCachePath, `${JSON.stringify(current, null, 2)}
`, "utf8");
  }
  removeProbeCache(id) {
    const current = this.readProbeCache();
    if (!(id in current))
      return false;
    delete current[id];
    mkdirSync3(dirname7(this.probeCachePath), { recursive: true });
    writeFileSync3(this.probeCachePath, `${JSON.stringify(current, null, 2)}
`, "utf8");
    return true;
  }
  getEdition() {
    return this.config.edition;
  }
  getHomeDir() {
    return this.config.homeDir;
  }
  readRegistry() {
    if (!existsSync6(this.registryPath))
      return {};
    try {
      const parsed = JSON.parse(readFileSync5(this.registryPath, "utf8"));
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
    mkdirSync3(dirname7(this.registryPath), { recursive: true });
    writeFileSync3(this.registryPath, `${JSON.stringify(current, null, 2)}
`, "utf8");
  }
  removeRecord(id) {
    const current = this.readRegistry();
    if (!(id in current))
      return false;
    delete current[id];
    mkdirSync3(dirname7(this.registryPath), { recursive: true });
    writeFileSync3(this.registryPath, `${JSON.stringify(current, null, 2)}
`, "utf8");
    return true;
  }
  async inspectAdapter(id, preloadedHostServers) {
    const spec = adapterById(id);
    if (!spec)
      throw new Error(`Unknown software adapter: ${id}`);
    const app = await detectSoftwareExecutable(id, this.config.executablePaths?.[id]);
    const registry = this.readRegistry();
    const record = registry[id];
    const provisioned = Boolean(record && existsSync6(record.command));
    const codexPath = this.config.codexConfigPath;
    let hostServers = null;
    if (preloadedHostServers !== void 0) {
      hostServers = preloadedHostServers;
    } else if (codexPath) {
      const readRes = readChatGptDesktopMcpServers(codexPath);
      if (readRes.exists) {
        hostServers = new Map(readRes.servers.map((s) => [s.name, s]));
      }
    }
    const matched = hostServers ? matchHostServerForAdapter(id, hostServers) : void 0;
    const hostConfigured = hostServers ? Boolean(matched) : provisioned;
    const hostEnabled = hostServers ? Boolean(matched?.enabled) : provisioned;
    const connected = hostServers ? Boolean(matched && matched.enabled && matched.commandValid) : provisioned;
    const launch = matched && matched.transport === "stdio" && matched.command && matched.commandValid ? {
      command: matched.command,
      args: matched.args,
      cwd: matched.cwd ?? process.cwd(),
      env: matched.env
    } : provisioned && record ? { command: record.command, args: record.args, cwd: record.cwd, env: record.env } : void 0;
    const cachedProbe = launch ? this.readProbeCache()[id] : void 0;
    const cacheValid = Boolean(launch && cachedProbe && cachedProbe.signature === _ConnectorProvisioner.launchSignature(launch));
    const recordMatchesLaunch = Boolean(provisioned && record && (!matched || matched.command === record.command));
    const toolNames = cacheValid && cachedProbe ? cachedProbe.toolNames : recordMatchesLaunch && record ? record.toolNames : [];
    const toolCount = cacheValid && cachedProbe ? cachedProbe.toolCount : recordMatchesLaunch && record ? record.toolCount : 0;
    const effectiveBridgePort = spec.bridgePort ?? (matched?.transport === "http" ? parseLoopbackHttpPort(matched.url) : void 0);
    const bridgeReady = effectiveBridgePort ? await probeTcpPort(effectiveBridgePort) : null;
    const bridgeDetail = effectiveBridgePort ? `127.0.0.1:${effectiveBridgePort} TCP ${bridgeReady ? "open" : "unreachable"}` : matched?.transport === "http" && matched.url ? matched.url : "not-required";
    return {
      id: spec.id,
      title: spec.title,
      titleZh: spec.titleZh,
      category: spec.category,
      integration: spec.integration,
      runtime: spec.runtime,
      sourceUrl: spec.sourceUrl,
      prerequisitesEn: spec.prerequisitesEn,
      prerequisitesZh: spec.prerequisitesZh,
      capabilities: spec.capabilities,
      iconFile: spec.iconFile,
      platformSupported: !spec.platformWindowsOnly || process.platform === "win32",
      appInstalled: app.installed,
      appDetail: app.detail,
      ...effectiveBridgePort ? { bridgePort: effectiveBridgePort } : {},
      bridgeReady,
      bridgeDetail,
      provisioned,
      connected,
      hostConfigured,
      hostEnabled,
      ...matched ? { hostServerName: matched.name, hostTransport: matched.transport } : {},
      toolCount,
      toolNames,
      ...launch ? { launch } : {}
    };
  }
  async listEditionAdapters() {
    const specs = adaptersForEdition(this.config.edition);
    const codexPath = this.config.codexConfigPath;
    let preloadedHostServers = null;
    if (codexPath) {
      const readRes = readChatGptDesktopMcpServers(codexPath);
      if (readRes.exists) {
        preloadedHostServers = new Map(readRes.servers.map((s) => [s.name, s]));
      }
    }
    return Promise.all(specs.map((spec) => this.inspectAdapter(spec.id, preloadedHostServers)));
  }
  async setup(id, options = {}) {
    const spec = adapterById(id);
    if (!spec) {
      return { ok: false, id, stage: "license", code: "unknown-software", detail: `Unknown software adapter: ${id}` };
    }
    if (spec.integration === "planned" || !spec.source || !spec.launch) {
      return {
        ok: false,
        id,
        stage: "source",
        code: "adapter-planned",
        detail: `${spec.title} integration is planned and will be enabled in a future release.`
      };
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
        ...detected.installed && isAbsolute2(detected.detail) ? { discoveredExecutable: detected.detail } : {},
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
    const source = spec.source;
    if (!source) {
      return { ok: false, detail: `${spec.title} does not have an automated MCP source package yet.` };
    }
    const repoNames = [source.repo, ...source.localRepoAliases ?? []];
    for (const root of this.config.hubRoots) {
      const candidates = [
        join6(root, ...source.repoSubpath.split("/")),
        ...repoNames.map((repo) => join6(root, repo, ...source.repoSubpath.split("/")))
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
      const bundledSource = join6(this.config.bundledMcpDir, spec.source.bundledDir);
      const checked = validateSourceDir(bundledSource, spec);
      if (checked.checkOk) {
        const writableCopy = join6(this.sourcesDir, "bundled", spec.id);
        if (!existsSync6(writableCopy)) {
          await mkdir2(dirname7(writableCopy), { recursive: true });
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
    const cachedDir = join6(this.sourcesDir, spec.source.repo, ...spec.source.repoSubpath.split("/"));
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
      await mkdir2(dirname7(cachedDir), { recursive: true });
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
    const runtimeDir = join6(this.runtimesDir, spec.id);
    await mkdir2(runtimeDir, { recursive: true });
    if (spec.runtime === "node") {
      const launch = spec.launch;
      if (!launch || launch.kind !== "node-script") {
        return { ok: false, code: "invalid-recipe", detail: "Node runtime requires a node-script launch spec." };
      }
      const pkgDir = launch.packageDir ? join6(sourceDir, launch.packageDir) : sourceDir;
      if (existsSync6(join6(pkgDir, "package.json")) && !existsSync6(join6(pkgDir, "node_modules"))) {
        const installCmd = existsSync6(join6(pkgDir, "package-lock.json")) ? ["npm", "ci"] : ["npm", "install"];
        const res = await runSubprocess(installCmd, pkgDir, this.config.installTimeoutMs, signal);
        if (!res.ok)
          return { ok: false, code: "dependency-failed", detail: res.diagnostic };
      }
      const entry = join6(sourceDir, ...launch.entryScript.split("/"));
      if (!existsSync6(entry) && launch.buildCommand) {
        const buildRes = await runSubprocess(launch.buildCommand, pkgDir, this.config.installTimeoutMs, signal);
        if (!buildRes.ok)
          return { ok: false, code: "build-failed", detail: buildRes.diagnostic };
      }
      if (!existsSync6(entry)) {
        return { ok: false, code: "entry-missing", detail: `Node MCP entry script not found: ${entry}` };
      }
      return { ok: true, command: process.execPath, runtimeDir };
    }
    const toml = await readFile(join6(sourceDir, "pyproject.toml"), "utf8");
    const pySources = await readAllPythonSources(sourceDir);
    const deps = constrainFastMcpDependencies(parsePyprojectDependencies(toml), pySources);
    const venvPython = runtimePythonPath(this.runtimesDir, spec.id);
    let provisionedWithUv = false;
    if (!existsSync6(venvPython)) {
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
    if (!existsSync6(venvPython)) {
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
import { existsSync as existsSync9 } from "node:fs";
import { createInterface as createInterface2 } from "node:readline";

// packages/mcp-server/src/software-icons.ts
var SOFTWARE_ICON_DATA_URIS = {
  "solidworks": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX3NvbGlkd29ya3MiIHgxPSIxMiIgeTE9IjYiIHgyPSI2OCIgeTI9Ijc2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzRBMTIxOSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzIxMDcwQiIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJoaV9zb2xpZHdvcmtzIiB4MT0iNDAiIHkxPSIwIiB4Mj0iNDAiIHkyPSIzNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMC4xOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9Ijc4IiBoZWlnaHQ9Ijc4IiByeD0iMTgiIGZpbGw9InVybCgjYmdfc29saWR3b3JrcykiIHN0cm9rZT0icmdiYSgyNTEsMTEzLDEzMywwLjM4KSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTkgMkg2MUM3MC40IDIgNzggOS42IDc4IDE5VjI4QzYyIDM0IDE4IDM0IDIgMjhWMTlDMiA5LjYgOS42IDIgMTkgMloiIGZpbGw9InVybCgjaGlfc29saWR3b3JrcykiLz48cG9seWdvbiBwb2ludHM9IjQwLDEyIDU4LDIxIDQ5LDI1LjUgMzEsMTYuNSIgZmlsbD0iI0ZCNzE4NSIvPjxwb2x5Z29uIHBvaW50cz0iMjIsMjEgNDAsMzAgNDAsNTIgMjIsNDMiIGZpbGw9IiNGNDNGNUUiLz48cG9seWdvbiBwb2ludHM9IjQwLDMwIDQ5LDI1LjUgNDksMzUuNSA1OCwzMSA1OCw0MyA0MCw1MiIgZmlsbD0iIzlGMTIzOSIvPjxwb2x5Z29uIHBvaW50cz0iNDksMjUuNSA1OCwyMSA1OCwzMSA0OSwzNS41IiBmaWxsPSIjQkUxMjNDIi8+PHBhdGggZD0iTTQwLDEyIEw1OCwyMSBMNTgsNDMgTDQwLDUyIEwyMiw0MyBMMjIsMjEgWiIgc3Ryb2tlPSIjRkZFNEU2IiBzdHJva2Utb3BhY2l0eT0iMC43IiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMiwyMSBMNDAsMzAgTDQwLDUyIE00MCwzMCBMNDksMjUuNSIgc3Ryb2tlPSIjRkZFNEU2IiBzdHJva2Utb3BhY2l0eT0iMC44NSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjx0ZXh0IHg9IjQwIiB5PSI3MC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkRBNEFGIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsJ1NlZ29lIFVJJyxzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMS41IiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMS4xIj5TVzwvdGV4dD48L3N2Zz4=",
  "catia": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2NhdGlhIiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxMDJBNTQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwODE1MkIiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfY2F0aWEiIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19jYXRpYSkiIHN0cm9rZT0icmdiYSg5NiwxNjUsMjUwLDAuNCkiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHBhdGggZD0iTTE5IDJINjFDNzAuNCAyIDc4IDkuNiA3OCAxOVYyOEM2MiAzNCAxOCAzNCAyIDI4VjE5QzIgOS42IDkuNiAyIDE5IDJaIiBmaWxsPSJ1cmwoI2hpX2NhdGlhKSIvPjxwYXRoIGQ9Ik0xNiw0MiBDMjQsMjAgNDQsMTQgNjQsMjIgQzU4LDQyIDM4LDUyIDE2LDQyIFoiIGZpbGw9IiMyNTYzRUIiIGZpbGwtb3BhY2l0eT0iMC40NSIgc3Ryb2tlPSIjOTNDNUZEIiBzdHJva2Utd2lkdGg9IjEuOCIvPjxwYXRoIGQ9Ik0yMCwzNSBDMzAsMjIgNDYsMjAgNjAsMjciIHN0cm9rZT0iI0RCRUFGRSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yNiw0NCBDMzQsMzEgNDgsMjYgNTcsMzMiIHN0cm9rZT0iIzYwQTVGQSIgc3Ryb2tlLXdpZHRoPSIxLjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0zMSwyMSBDMzQsMzEgMzMsMzkgMjksNDYgTTQ2LDE4IEM0OCwyOCA0NiwzOCA0MSw0NyIgc3Ryb2tlPSIjOTNDNUZEIiBzdHJva2Utb3BhY2l0eT0iMC44NSIgc3Ryb2tlLXdpZHRoPSIxLjM1IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSIzMSIgY3k9IjIxIiByPSIyLjMiIGZpbGw9IiNFRkY2RkYiLz48Y2lyY2xlIGN4PSI0NiIgY3k9IjE4IiByPSIyLjMiIGZpbGw9IiNFRkY2RkYiLz48dGV4dCB4PSI0MCIgeT0iNzAuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzkzQzVGRCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCdTZWdvZSBVSScsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEuNSIgZm9udC13ZWlnaHQ9IjcwMCIgbGV0dGVyLXNwYWNpbmc9IjEuMSI+VjU8L3RleHQ+PC9zdmc+",
  "nx": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX254IiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwRTNBM0UiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNjFCMUUiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfbngiIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19ueCkiIHN0cm9rZT0icmdiYSg0NSwyMTIsMTkxLDAuNCkiIHN0cm9rZS13aWR0aD0iMS41Ii8+PHBhdGggZD0iTTE5IDJINjFDNzAuNCAyIDc4IDkuNiA3OCAxOVYyOEM2MiAzNCAxOCAzNCAyIDI4VjE5QzIgOS42IDkuNiAyIDE5IDJaIiBmaWxsPSJ1cmwoI2hpX254KSIvPjxwb2x5Z29uIHBvaW50cz0iNDAsMTUgNTUsMjMuNSA0MCwzMiAyNSwyMy41IiBmaWxsPSIjMkRENEJGIiBmaWxsLW9wYWNpdHk9IjAuOSIvPjxwb2x5Z29uIHBvaW50cz0iMjUsMjMuNSA0MCwzMiA0MCw0OSAyNSw0MC41IiBmaWxsPSIjMEQ5NDg4Ii8+PHBvbHlnb24gcG9pbnRzPSI0MCwzMiA1NSwyMy41IDU1LDQwLjUgNDAsNDkiIGZpbGw9IiMxMTVFNTkiLz48cGF0aCBkPSJNNDAsMTUgVjkgTTU1LDQwLjUgTDYyLDQ0LjUgTTI1LDQwLjUgTDE4LDQ0LjUiIHN0cm9rZT0iIzk5RjZFNCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjMyIiByPSIyLjYiIGZpbGw9IiNGMEZERkEiLz48cGF0aCBkPSJNNDAsMTUgTDU1LDIzLjUgVjQwLjUgTDQwLDQ5IEwyNSw0MC41IFYyMy41IFoiIHN0cm9rZT0iI0NDRkJGMSIgc3Ryb2tlLW9wYWNpdHk9IjAuNjUiIHN0cm9rZS13aWR0aD0iMS40IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM1RUVBRDQiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPk5YPC90ZXh0Pjwvc3ZnPg==",
  "creo": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2NyZW8iIHgxPSIxMiIgeTE9IjYiIHgyPSI2OCIgeTI9Ijc2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzEzM0EyMiIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzA4MUIxMCIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJoaV9jcmVvIiB4MT0iNDAiIHkxPSIwIiB4Mj0iNDAiIHkyPSIzNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMC4xOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9Ijc4IiBoZWlnaHQ9Ijc4IiByeD0iMTgiIGZpbGw9InVybCgjYmdfY3JlbykiIHN0cm9rZT0icmdiYSg3NCwyMjIsMTI4LDAuNDIpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9jcmVvKSIvPjxwb2x5Z29uIHBvaW50cz0iNDAsMTMgNTgsMjMgNDAsMzMgMjIsMjMiIGZpbGw9IiM0QURFODAiIGZpbGwtb3BhY2l0eT0iMC45Ii8+PHBvbHlnb24gcG9pbnRzPSIyMiwyMyA0MCwzMyA0MCw1MSAyMiw0MSIgZmlsbD0iIzE2QTM0QSIvPjxwb2x5Z29uIHBvaW50cz0iNDAsMzMgNTgsMjMgNTgsNDEgNDAsNTEiIGZpbGw9IiMxNjY1MzQiLz48cGF0aCBkPSJNMjIsMTcgSDU4IE0yMiwxNCBWMjAgTTU4LDE0IFYyMCIgc3Ryb2tlPSIjQkJGN0QwIiBzdHJva2Utb3BhY2l0eT0iMC43IiBzdHJva2Utd2lkdGg9IjEuNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTQwLDEzIEw1OCwyMyBWNDEgTDQwLDUxIEwyMiw0MSBWMjMgWiIgc3Ryb2tlPSIjRENGQ0U3IiBzdHJva2Utb3BhY2l0eT0iMC43NSIgc3Ryb2tlLXdpZHRoPSIxLjQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48dGV4dCB4PSI0MCIgeT0iNzAuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg2RUZBQyIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCdTZWdvZSBVSScsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIwLjUiPkNSRU88L3RleHQ+PC9zdmc+",
  "inventor": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2ludmVudG9yIiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0NTMxMEIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxRjE1MDUiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfaW52ZW50b3IiIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19pbnZlbnRvcikiIHN0cm9rZT0icmdiYSgyNTAsMjA0LDIxLDAuNDIpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9pbnZlbnRvcikiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjMzIiByPSIxNCIgZmlsbD0iI0NBOEEwNCIgZmlsbC1vcGFjaXR5PSIwLjQ1IiBzdHJva2U9IiNGQUNDMTUiIHN0cm9rZS13aWR0aD0iMi4yIi8+PGNpcmNsZSBjeD0iNDAiIGN5PSIzMyIgcj0iNiIgZmlsbD0iI0ZFRjA4QSIgc3Ryb2tlPSIjNzEzRjEyIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxwYXRoIGQ9Ik00MCwxMyBWMTkgTTQwLDQ3IFY1MyBNMjAsMzMgSDI2IE01NCwzMyBINjAgTTI2LDE5IEwzMCwyMyBNNTAsNDMgTDU0LDQ3IE01NCwxOSBMNTAsMjMgTTMwLDQzIEwyNiw0NyIgc3Ryb2tlPSIjRkRFMDQ3IiBzdHJva2Utd2lkdGg9IjIuNiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGREUwNDciIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPklOVjwvdGV4dD48L3N2Zz4=",
  "autocad": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2F1dG9jYWQiIHgxPSIxMiIgeTE9IjYiIHgyPSI2OCIgeTI9Ijc2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzRCMTYyMCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzIxMDkwRSIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJoaV9hdXRvY2FkIiB4MT0iNDAiIHkxPSIwIiB4Mj0iNDAiIHkyPSIzNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMC4xOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9Ijc4IiBoZWlnaHQ9Ijc4IiByeD0iMTgiIGZpbGw9InVybCgjYmdfYXV0b2NhZCkiIHN0cm9rZT0icmdiYSgyNDgsMTEzLDExMywwLjQyKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTkgMkg2MUM3MC40IDIgNzggOS42IDc4IDE5VjI4QzYyIDM0IDE4IDM0IDIgMjhWMTlDMiA5LjYgOS42IDIgMTkgMloiIGZpbGw9InVybCgjaGlfYXV0b2NhZCkiLz48cmVjdCB4PSIxOCIgeT0iMTYiIHdpZHRoPSI0NCIgaGVpZ2h0PSIzNCIgcng9IjQiIGZpbGw9IiM5OTFCMUIiIGZpbGwtb3BhY2l0eT0iMC4zNSIgc3Ryb2tlPSIjRkNBNUE1IiBzdHJva2Utd2lkdGg9IjEuNiIvPjxwYXRoIGQ9Ik0yNCw0MyBMNDAsMjEgTDU2LDQzIE0zMCwzNiBINTAiIHN0cm9rZT0iI0ZFRjJGMiIgc3Ryb2tlLXdpZHRoPSIyLjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xOCwyNCBIMjMgTTE4LDMyIEgyMyBNMTgsNDAgSDIzIiBzdHJva2U9IiNGODcxNzEiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48dGV4dCB4PSI0MCIgeT0iNzAuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0ZDQTVBNSIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCdTZWdvZSBVSScsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIwLjUiPkFDQUQ8L3RleHQ+PC9zdmc+",
  "fusion": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2Z1c2lvbiIgeDE9IjEyIiB5MT0iNiIgeDI9IjY4IiB5Mj0iNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNEIyMzBCIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMjIwRjA1Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImhpX2Z1c2lvbiIgeDE9IjQwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iMzQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAuMTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjEiIHk9IjEiIHdpZHRoPSI3OCIgaGVpZ2h0PSI3OCIgcng9IjE4IiBmaWxsPSJ1cmwoI2JnX2Z1c2lvbikiIHN0cm9rZT0icmdiYSgyNTEsMTQ2LDYwLDAuNDQpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9mdXNpb24pIi8+PHBhdGggZD0iTTIyLDI1IEMyOCwxNCA1MiwxNCA1OCwyNSBDNjIsMzQgNTIsNTAgNDAsNTAgQzI4LDUwIDE4LDM0IDIyLDI1IFoiIGZpbGw9IiNFQTU4MEMiIGZpbGwtb3BhY2l0eT0iMC41NSIgc3Ryb2tlPSIjRkVEN0FBIiBzdHJva2Utd2lkdGg9IjEuOCIvPjxwYXRoIGQ9Ik0yMywyOSBDMzIsMjIgNDgsMjIgNTcsMjkgTTI2LDM4IEMzNSwzMiA0NSwzMiA1NCwzOCIgc3Ryb2tlPSIjRkZFREQ1IiBzdHJva2Utb3BhY2l0eT0iMC44IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNDAiIGN5PSIyNyIgcj0iMyIgZmlsbD0iI0ZGRjdFRCIvPjx0ZXh0IHg9IjQwIiB5PSI3MC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkRCQTc0IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsJ1NlZ29lIFVJJyxzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMS41IiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMS4xIj5GVVM8L3RleHQ+PC9zdmc+",
  "eplan": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2VwbGFuIiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0QjEwMkEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMyMTA2MTIiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfZXBsYW4iIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19lcGxhbikiIHN0cm9rZT0icmdiYSgyNDQsMTE0LDE4MiwwLjQ0KSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTkgMkg2MUM3MC40IDIgNzggOS42IDc4IDE5VjI4QzYyIDM0IDE4IDM0IDIgMjhWMTlDMiA5LjYgOS42IDIgMTkgMloiIGZpbGw9InVybCgjaGlfZXBsYW4pIi8+PHBhdGggZD0iTTIyLDE2IFYyOCBMMjgsMzkgVjUwIE00MCwxNiBWMjggTDQ2LDM5IFY1MCBNNTgsMTYgVjI4IEw2NCwzOSBWNTAiIHN0cm9rZT0iI0Y0NzJCNiIgc3Ryb2tlLXdpZHRoPSIyLjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xOSwzMyBINjEiIHN0cm9rZT0iI0ZDRTdGMyIgc3Ryb2tlLWRhc2hhcnJheT0iMyAzIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iMjIiIGN5PSIyOCIgcj0iMi4yIiBmaWxsPSIjRkRGMkY4Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSIyOCIgcj0iMi4yIiBmaWxsPSIjRkRGMkY4Ii8+PGNpcmNsZSBjeD0iNTgiIGN5PSIyOCIgcj0iMi4yIiBmaWxsPSIjRkRGMkY4Ii8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGOUE4RDQiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPkVQTDwvdGV4dD48L3N2Zz4=",
  "abaqus": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2FiYXF1cyIgeDE9IjEyIiB5MT0iNiIgeDI9IjY4IiB5Mj0iNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMjkxRDU0Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTMwRDJCIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImhpX2FiYXF1cyIgeDE9IjQwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iMzQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAuMTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjEiIHk9IjEiIHdpZHRoPSI3OCIgaGVpZ2h0PSI3OCIgcng9IjE4IiBmaWxsPSJ1cmwoI2JnX2FiYXF1cykiIHN0cm9rZT0icmdiYSgxNjcsMTM5LDI1MCwwLjQyKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTkgMkg2MUM3MC40IDIgNzggOS42IDc4IDE5VjI4QzYyIDM0IDE4IDM0IDIgMjhWMTlDMiA5LjYgOS42IDIgMTkgMloiIGZpbGw9InVybCgjaGlfYWJhcXVzKSIvPjxwb2x5Z29uIHBvaW50cz0iNDAsMTIgNTgsMjIgNDAsMzIgMjIsMjIiIGZpbGw9IiNBNzhCRkEiLz48cG9seWdvbiBwb2ludHM9IjIyLDIyIDQwLDMyIDQwLDUxIDIyLDQxIiBmaWxsPSIjN0MzQUVEIi8+PHBvbHlnb24gcG9pbnRzPSI0MCwzMiA1OCwyMiA1OCw0MSA0MCw1MSIgZmlsbD0iIzRDMUQ5NSIvPjxwYXRoIGQ9Ik0zMSwxNyBMNDksMjcgTTQ5LDE3IEwzMSwyNyBNMzEsMjcgVjQ2IE00OSwyNyBWNDYgTTIyLDMxLjUgTDQwLDQxLjUgTDU4LDMxLjUiIHN0cm9rZT0iI0VERTlGRSIgc3Ryb2tlLW9wYWNpdHk9IjAuOCIgc3Ryb2tlLXdpZHRoPSIxLjM1Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSIzMiIgcj0iMi44IiBmaWxsPSIjRkRFMDQ3Ii8+PHBhdGggZD0iTTQwLDEyIEw1OCwyMiBWNDEgTDQwLDUxIEwyMiw0MSBWMjIgWiIgc3Ryb2tlPSIjRERENkZFIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjx0ZXh0IHg9IjQwIiB5PSI3MC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjQzRCNUZEIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsJ1NlZ29lIFVJJyxzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMS41IiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMS4xIj5BQlE8L3RleHQ+PC9zdmc+",
  "ansys-workbench": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2Fuc3lzd29ya2JlbmNoIiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzMzI4MTAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxNzEyMDgiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfYW5zeXN3b3JrYmVuY2giIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19hbnN5c3dvcmtiZW5jaCkiIHN0cm9rZT0icmdiYSgyNTAsMjA0LDIxLDAuNDIpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9hbnN5c3dvcmtiZW5jaCkiLz48cGF0aCBkPSJNMjYsMjQgSDU0IE0yNiwyNCBMNDAsNDIgTTU0LDI0IEw0MCw0MiIgc3Ryb2tlPSIjRkFDQzE1IiBzdHJva2Utb3BhY2l0eT0iMC43IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxyZWN0IHg9IjE2IiB5PSIxNSIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI0VBQjMwOCIgc3Ryb2tlPSIjRkVGOUMzIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxyZWN0IHg9IjQ2IiB5PSIxNSIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI0NBOEEwNCIgc3Ryb2tlPSIjRkVGMDhBIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxyZWN0IHg9IjMxIiB5PSIzNiIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE2IiByeD0iNCIgZmlsbD0iI0Y1OUUwQiIgc3Ryb2tlPSIjRkVGOUMzIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwYXRoIGQ9Ik0yMSwyMyBIMjkgTTUxLDIzIEg1OSBNMzYsNDQgSDQ0IiBzdHJva2U9IiMxQzE5MTciIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGREUwNDciIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPldCPC90ZXh0Pjwvc3ZnPg==",
  "ansys-fluent": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2Fuc3lzZmx1ZW50IiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwRTJENDUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwNzE1MjIiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfYW5zeXNmbHVlbnQiIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19hbnN5c2ZsdWVudCkiIHN0cm9rZT0icmdiYSg1NiwxODksMjQ4LDAuNDIpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9hbnN5c2ZsdWVudCkiLz48cGF0aCBkPSJNMTQsMjIgQzI2LDE2IDM4LDE0IDUyLDIwIEM1OCwyMiA2MywyMSA2NiwxOCIgc3Ryb2tlPSIjRkJCRjI0IiBzdHJva2Utd2lkdGg9IjIuNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTE0LDMyIEMyNCwyNiAzNiwyNCA1MCwzMCBDNTcsMzMgNjMsMzEgNjYsMjgiIHN0cm9rZT0iIzM4QkRGOCIgc3Ryb2tlLXdpZHRoPSIyLjYiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xNCw0MiBDMjYsNDYgNDAsNDcgNTQsNDAgQzYwLDM3IDY0LDM5IDY2LDQyIiBzdHJva2U9IiMwRUE1RTkiIHN0cm9rZS13aWR0aD0iMi4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cGF0aCBkPSJNMjgsMzMgQzM2LDI3IDQ4LDI4IDUzLDMzIEM0NywzOCAzNSwzOCAyOCwzMyBaIiBmaWxsPSIjRkRFNjhBIiBzdHJva2U9IiNGRUYzQzciIHN0cm9rZS13aWR0aD0iMS4yIi8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3REQzRkMiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPkZMVTwvdGV4dD48L3N2Zz4=",
  "ansys-aedt": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2Fuc3lzYWVkdCIgeDE9IjEyIiB5MT0iNiIgeDI9IjY4IiB5Mj0iNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMzYyMTBCIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTgwRTA1Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImhpX2Fuc3lzYWVkdCIgeDE9IjQwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iMzQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAuMTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjEiIHk9IjEiIHdpZHRoPSI3OCIgaGVpZ2h0PSI3OCIgcng9IjE4IiBmaWxsPSJ1cmwoI2JnX2Fuc3lzYWVkdCkiIHN0cm9rZT0icmdiYSgyNTEsMTQ2LDYwLDAuNDIpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9hbnN5c2FlZHQpIi8+PHBhdGggZD0iTTI0LDIwIEMxNywyNyAxNywzOSAyNCw0NiBNNTYsMjAgQzYzLDI3IDYzLDM5IDU2LDQ2IiBzdHJva2U9IiNGQjkyM0MiIHN0cm9rZS1vcGFjaXR5PSIwLjU1IiBzdHJva2Utd2lkdGg9IjIuMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHBhdGggZD0iTTMwLDI0IEMyNSwyOSAyNSwzNyAzMCw0MiBNNTAsMjQgQzU1LDI5IDU1LDM3IDUwLDQyIiBzdHJva2U9IiNGQkJGMjQiIHN0cm9rZS13aWR0aD0iMi40IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjMzIiByPSI2IiBmaWxsPSIjRjk3MzE2IiBzdHJva2U9IiNGRUYzQzciIHN0cm9rZS13aWR0aD0iMS44Ii8+PHBhdGggZD0iTTQwLDM5IFY1MSBNMzQsNTEgSDQ2IiBzdHJva2U9IiNGREJBNzQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGREJBNzQiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMC41Ij5BRURUPC90ZXh0Pjwvc3ZnPg==",
  "comsol": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2NvbXNvbCIgeDE9IjEyIiB5MT0iNiIgeDI9IjY4IiB5Mj0iNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTMzMTYzIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMDkxOTM2Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImhpX2NvbXNvbCIgeDE9IjQwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iMzQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAuMTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjEiIHk9IjEiIHdpZHRoPSI3OCIgaGVpZ2h0PSI3OCIgcng9IjE4IiBmaWxsPSJ1cmwoI2JnX2NvbXNvbCkiIHN0cm9rZT0icmdiYSg5NiwxNjUsMjUwLDAuNDUpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9jb21zb2wpIi8+PGNpcmNsZSBjeD0iNDAiIGN5PSIzMyIgcj0iMTgiIGZpbGw9IiMyNTYzRUIiIGZpbGwtb3BhY2l0eT0iMC41NSIgc3Ryb2tlPSIjOTNDNUZEIiBzdHJva2Utd2lkdGg9IjEuOCIvPjxlbGxpcHNlIGN4PSI0MCIgY3k9IjMzIiByeD0iMTgiIHJ5PSI3LjUiIHRyYW5zZm9ybT0icm90YXRlKC0yNCA0MCAzMykiIHN0cm9rZT0iI0UwRjJGRSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48ZWxsaXBzZSBjeD0iNDAiIGN5PSIzMyIgcng9IjE4IiByeT0iNy41IiB0cmFuc2Zvcm09InJvdGF0ZSgzMiA0MCAzMykiIHN0cm9rZT0iIzM4QkRGOCIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjMzIiByPSIzIiBmaWxsPSIjRjhGQUZDIi8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNCRkRCRkUiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPkNPTTwvdGV4dD48L3N2Zz4=",
  "cst": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2NzdCIgeDE9IjEyIiB5MT0iNiIgeDI9IjY4IiB5Mj0iNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTYyNDUyIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMEExMTI4Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImhpX2NzdCIgeDE9IjQwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iMzQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAuMTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjEiIHk9IjEiIHdpZHRoPSI3OCIgaGVpZ2h0PSI3OCIgcng9IjE4IiBmaWxsPSJ1cmwoI2JnX2NzdCkiIHN0cm9rZT0icmdiYSgxMjksMTQwLDI0OCwwLjQyKSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTkgMkg2MUM3MC40IDIgNzggOS42IDc4IDE5VjI4QzYyIDM0IDE4IDM0IDIgMjhWMTlDMiA5LjYgOS42IDIgMTkgMloiIGZpbGw9InVybCgjaGlfY3N0KSIvPjxwb2x5Z29uIHBvaW50cz0iNDAsMTMgNTksMjMgNDAsMzMgMjEsMjMiIGZpbGw9IiM0RjQ2RTUiIGZpbGwtb3BhY2l0eT0iMC42NSIgc3Ryb2tlPSIjQzdEMkZFIiBzdHJva2Utd2lkdGg9IjEuNCIvPjxwb2x5Z29uIHBvaW50cz0iMjEsMjMgNDAsMzMgNDAsNTEgMjEsNDEiIGZpbGw9IiMzNzMwQTMiIGZpbGwtb3BhY2l0eT0iMC43IiBzdHJva2U9IiM4MThDRjgiIHN0cm9rZS13aWR0aD0iMS4zIi8+PHBvbHlnb24gcG9pbnRzPSI0MCwzMyA1OSwyMyA1OSw0MSA0MCw1MSIgZmlsbD0iIzMxMkU4MSIgZmlsbC1vcGFjaXR5PSIwLjg1IiBzdHJva2U9IiM4MThDRjgiIHN0cm9rZS13aWR0aD0iMS4zIi8+PHBhdGggZD0iTTIyLDMzIFEyOCwyMyAzNCwzMyBUNDYsMzMgVDU4LDMzIiBzdHJva2U9IiMzOEJERjgiIHN0cm9rZS13aWR0aD0iMi40IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48dGV4dCB4PSI0MCIgeT0iNzAuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0E1QjRGQyIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCdTZWdvZSBVSScsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEuNSIgZm9udC13ZWlnaHQ9IjcwMCIgbGV0dGVyLXNwYWNpbmc9IjEuMSI+Q1NUPC90ZXh0Pjwvc3ZnPg==",
  "ansa": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2Fuc2EiIHgxPSIxMiIgeTE9IjYiIHgyPSI2OCIgeTI9Ijc2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzBFMzc2NCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzA3MUIzMyIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJoaV9hbnNhIiB4MT0iNDAiIHkxPSIwIiB4Mj0iNDAiIHkyPSIzNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMC4xOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9Ijc4IiBoZWlnaHQ9Ijc4IiByeD0iMTgiIGZpbGw9InVybCgjYmdfYW5zYSkiIHN0cm9rZT0icmdiYSg1NiwxODksMjQ4LDAuNDIpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9hbnNhKSIvPjxwb2x5Z29uIHBvaW50cz0iNDAsMTMgNjAsMjUgNTMsNDggMjcsNDggMjAsMjUiIGZpbGw9IiMwMjg0QzciIGZpbGwtb3BhY2l0eT0iMC40NSIgc3Ryb2tlPSIjN0REM0ZDIiBzdHJva2Utd2lkdGg9IjEuNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik00MCwxMyBMNDAsMzMgTDYwLDI1IE00MCwzMyBMMjAsMjUgTTQwLDMzIEw1Myw0OCBNNDAsMzMgTDI3LDQ4IE0yMCwyNSBMNTMsNDgiIHN0cm9rZT0iI0UwRjJGRSIgc3Ryb2tlLW9wYWNpdHk9IjAuOCIgc3Ryb2tlLXdpZHRoPSIxLjM1Ii8+PGNpcmNsZSBjeD0iNDAiIGN5PSIzMyIgcj0iMi44IiBmaWxsPSIjMzhCREY4Ii8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3REQzRkMiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMC41Ij5BTlNBPC90ZXh0Pjwvc3ZnPg==",
  "hyperworks": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2h5cGVyd29ya3MiIHgxPSIxMiIgeTE9IjYiIHgyPSI2OCIgeTI9Ijc2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzQ3MUMxMCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzIxMEIwNiIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJoaV9oeXBlcndvcmtzIiB4MT0iNDAiIHkxPSIwIiB4Mj0iNDAiIHkyPSIzNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMC4xOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9Ijc4IiBoZWlnaHQ9Ijc4IiByeD0iMTgiIGZpbGw9InVybCgjYmdfaHlwZXJ3b3JrcykiIHN0cm9rZT0icmdiYSgyNTEsMTQ2LDYwLDAuNDQpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9oeXBlcndvcmtzKSIvPjxwYXRoIGQ9Ik0xOCw0NiBMMjYsMjAgSDU0IEw2Miw0NiBaIiBmaWxsPSIjRUE1ODBDIiBmaWxsLW9wYWNpdHk9IjAuMzUiIHN0cm9rZT0iI0ZEQkE3NCIgc3Ryb2tlLXdpZHRoPSIxLjgiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjYsMjAgTDQwLDQ2IEw1NCwyMCBNMjEsMzQgSDU5IiBzdHJva2U9IiNGRUQ3QUEiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQ2IiByPSIzIiBmaWxsPSIjRkI5MjNDIi8+PGNpcmNsZSBjeD0iMjYiIGN5PSIyMCIgcj0iMi41IiBmaWxsPSIjRkVGM0M3Ii8+PGNpcmNsZSBjeD0iNTQiIGN5PSIyMCIgcj0iMi41IiBmaWxsPSIjRkVGM0M3Ii8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGREJBNzQiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPkhXPC90ZXh0Pjwvc3ZnPg==",
  "star-ccm": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX3N0YXJjY20iIHgxPSIxMiIgeTE9IjYiIHgyPSI2OCIgeTI9Ijc2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzBFMzc0NyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzA2MUEyMiIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJoaV9zdGFyY2NtIiB4MT0iNDAiIHkxPSIwIiB4Mj0iNDAiIHkyPSIzNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMC4xOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9Ijc4IiBoZWlnaHQ9Ijc4IiByeD0iMTgiIGZpbGw9InVybCgjYmdfc3RhcmNjbSkiIHN0cm9rZT0icmdiYSgzNCwyMTEsMjM4LDAuNDQpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9zdGFyY2NtKSIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iMzMiIHI9IjE2IiBzdHJva2U9IiMyMkQzRUUiIHN0cm9rZS1vcGFjaXR5PSIwLjQ1IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWRhc2hhcnJheT0iNCAzIi8+PHBhdGggZD0iTTQwLDMzIEM0MCwyMSA1MSwxOSA1NCwyNiBNNDAsMzMgQzUyLDMzIDU0LDQ0IDQ3LDQ3IE00MCwzMyBDNDAsNDUgMjksNDcgMjYsNDAgTTQwLDMzIEMyOCwzMyAyNiwyMiAzMywxOSIgc3Ryb2tlPSIjNjdFOEY5IiBzdHJva2Utd2lkdGg9IjIuNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNDAiIGN5PSIzMyIgcj0iNCIgZmlsbD0iI0NGRkFGRSIvPjx0ZXh0IHg9IjQwIiB5PSI3MC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjdFOEY5IiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsJ1NlZ29lIFVJJyxzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMS41IiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMS4xIj5DQ008L3RleHQ+PC9zdmc+",
  "flotherm": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2Zsb3RoZXJtIiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM0QTE5MEUiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMyMjBBMDUiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfZmxvdGhlcm0iIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19mbG90aGVybSkiIHN0cm9rZT0icmdiYSgyNDgsMTEzLDExMywwLjQ0KSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTkgMkg2MUM3MC40IDIgNzggOS42IDc4IDE5VjI4QzYyIDM0IDE4IDM0IDIgMjhWMTlDMiA5LjYgOS42IDIgMTkgMloiIGZpbGw9InVybCgjaGlfZmxvdGhlcm0pIi8+PHBhdGggZD0iTTI0LDI1IEMyMSwyMCAyNywxNyAyNCwxMiBNNDAsMjUgQzM3LDIwIDQzLDE3IDQwLDEyIE01NiwyNSBDNTMsMjAgNTksMTcgNTYsMTIiIHN0cm9rZT0iI0Y5NzMxNiIgc3Ryb2tlLXdpZHRoPSIyLjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxyZWN0IHg9IjE4IiB5PSI0NSIgd2lkdGg9IjQ0IiBoZWlnaHQ9IjYiIHJ4PSIyIiBmaWxsPSIjRUY0NDQ0Ii8+PHBhdGggZD0iTTIyLDQ1IFYzMCBNMzEsNDUgVjMwIE00MCw0NSBWMzAgTTQ5LDQ1IFYzMCBNNTgsNDUgVjMwIiBzdHJva2U9IiNGREUwNDciIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGQ0E1QTUiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPkZMTzwvdGV4dD48L3N2Zz4=",
  "adams": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2FkYW1zIiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyNDFFNTQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMDBEMkIiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfYWRhbXMiIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19hZGFtcykiIHN0cm9rZT0icmdiYSgxMjksMTQwLDI0OCwwLjQ0KSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTkgMkg2MUM3MC40IDIgNzggOS42IDc4IDE5VjI4QzYyIDM0IDE4IDM0IDIgMjhWMTlDMiA5LjYgOS42IDIgMTkgMloiIGZpbGw9InVybCgjaGlfYWRhbXMpIi8+PHBhdGggZD0iTTIwLDQ2IEwyOSwyMiBMNTMsMjcgTDYwLDQ2IiBzdHJva2U9IiM4MThDRjgiIHN0cm9rZS13aWR0aD0iMy4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMjksMjIgTDQ2LDQyIiBzdHJva2U9IiMzOEJERjgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtZGFzaGFycmF5PSIzIDMiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjQ2IiByPSI0IiBmaWxsPSIjRTBFN0ZGIiBzdHJva2U9IiM0MzM4Q0EiIHN0cm9rZS13aWR0aD0iMS42Ii8+PGNpcmNsZSBjeD0iMjkiIGN5PSIyMiIgcj0iNCIgZmlsbD0iI0ZERTA0NyIgc3Ryb2tlPSIjNDMzOENBIiBzdHJva2Utd2lkdGg9IjEuNiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMjciIHI9IjQiIGZpbGw9IiMzOEJERjgiIHN0cm9rZT0iIzQzMzhDQSIgc3Ryb2tlLXdpZHRoPSIxLjYiLz48Y2lyY2xlIGN4PSI2MCIgY3k9IjQ2IiByPSI0IiBmaWxsPSIjRTBFN0ZGIiBzdHJva2U9IiM0MzM4Q0EiIHN0cm9rZS13aWR0aD0iMS42Ii8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNDN0QyRkUiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPkFETTwvdGV4dD48L3N2Zz4=",
  "flac3d": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2ZsYWMzZCIgeDE9IjEyIiB5MT0iNiIgeDI9IjY4IiB5Mj0iNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjM0QyQjEyIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMUMxMzA3Ii8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImhpX2ZsYWMzZCIgeDE9IjQwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iMzQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAuMTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjEiIHk9IjEiIHdpZHRoPSI3OCIgaGVpZ2h0PSI3OCIgcng9IjE4IiBmaWxsPSJ1cmwoI2JnX2ZsYWMzZCkiIHN0cm9rZT0icmdiYSgyNTEsMTkxLDM2LDAuNDIpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9mbGFjM2QpIi8+PHBvbHlnb24gcG9pbnRzPSIxOCwyMiA0NCwxOCA2MiwyOCA2Miw0OCAxOCw0OCIgZmlsbD0iI0I0NTMwOSIgZmlsbC1vcGFjaXR5PSIwLjQ1IiBzdHJva2U9IiNGQ0QzNEQiIHN0cm9rZS13aWR0aD0iMS42IiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTE4LDMxIFEzOCwyNyA2MiwzNiBNMTgsNDAgUTQwLDM3IDYyLDQzIE0zMywyMCBWNDggTTQ4LDIxIFY0OCIgc3Ryb2tlPSIjRkRFNjhBIiBzdHJva2Utb3BhY2l0eT0iMC44IiBzdHJva2Utd2lkdGg9IjEuNCIvPjx0ZXh0IHg9IjQwIiB5PSI3MC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkRFNjhBIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsJ1NlZ29lIFVJJyxzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9IjcwMCIgbGV0dGVyLXNwYWNpbmc9IjAuNSI+RkxBQzwvdGV4dD48L3N2Zz4=",
  "calculix": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2NhbGN1bGl4IiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxMjNBMzIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwODFCMTgiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfY2FsY3VsaXgiIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19jYWxjdWxpeCkiIHN0cm9rZT0icmdiYSg0NSwyMTIsMTkxLDAuNDIpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9jYWxjdWxpeCkiLz48cG9seWdvbiBwb2ludHM9IjQwLDEzIDU5LDI0IDU5LDQ0IDQwLDU1IDIxLDQ0IDIxLDI0IiBmaWxsPSIjMEY3NjZFIiBmaWxsLW9wYWNpdHk9IjAuNDUiIHN0cm9rZT0iIzJERDRCRiIgc3Ryb2tlLXdpZHRoPSIyLjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNNDAsMTMgVjU1IE0yMSwyNCBMNTksNDQgTTU5LDI0IEwyMSw0NCIgc3Ryb2tlPSIjNUVFQUQ0IiBzdHJva2Utb3BhY2l0eT0iMC42NSIgc3Ryb2tlLXdpZHRoPSIxLjciLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjM0IiByPSI0LjUiIGZpbGw9IiMyREQ0QkYiIHN0cm9rZT0iI0YwRkRGQSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48dGV4dCB4PSI0MCIgeT0iNzAuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5RjZFNCIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCdTZWdvZSBVSScsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEuNSIgZm9udC13ZWlnaHQ9IjcwMCIgbGV0dGVyLXNwYWNpbmc9IjEuMSI+Q0NYPC90ZXh0Pjwvc3ZnPg==",
  "easyeda-pro": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2Vhc3llZGFwcm8iIHgxPSIxMiIgeTE9IjYiIHgyPSI2OCIgeTI9Ijc2IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzBFMzU2MyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzA3MUIzNiIvPjwvbGluZWFyR3JhZGllbnQ+PGxpbmVhckdyYWRpZW50IGlkPSJoaV9lYXN5ZWRhcHJvIiB4MT0iNDAiIHkxPSIwIiB4Mj0iNDAiIHkyPSIzNCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMC4xOCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9Ijc4IiBoZWlnaHQ9Ijc4IiByeD0iMTgiIGZpbGw9InVybCgjYmdfZWFzeWVkYXBybykiIHN0cm9rZT0icmdiYSg1NiwxODksMjQ4LDAuNDQpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0xOSAySDYxQzcwLjQgMiA3OCA5LjYgNzggMTlWMjhDNjIgMzQgMTggMzQgMiAyOFYxOUMyIDkuNiA5LjYgMiAxOSAyWiIgZmlsbD0idXJsKCNoaV9lYXN5ZWRhcHJvKSIvPjxwYXRoIGQ9Ik0xNiwyMyBIMjggTDM1LDMwIEg0OCBMNTQsMjQgSDY0IiBzdHJva2U9IiMzOEJERjgiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48cGF0aCBkPSJNMTYsMzUgSDI1IEwzMiw0MiBINDggTDU1LDM1IEg2NCIgc3Ryb2tlPSIjMjJEM0VFIiBzdHJva2Utd2lkdGg9IjIuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHBhdGggZD0iTTI0LDQ4IEg0MiBMNDgsNDIiIHN0cm9rZT0iIzYwQTVGQSIgc3Ryb2tlLXdpZHRoPSIyLjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMjMiIHI9IjMuNCIgZmlsbD0iI0ZBQ0MxNSIgc3Ryb2tlPSIjMDgyRjQ5IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjY0IiBjeT0iMjQiIHI9IjMuNCIgZmlsbD0iI0ZBQ0MxNSIgc3Ryb2tlPSIjMDgyRjQ5IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMzUiIHI9IjMuNCIgZmlsbD0iIzM0RDM5OSIgc3Ryb2tlPSIjMDgyRjQ5IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjY0IiBjeT0iMzUiIHI9IjMuNCIgZmlsbD0iIzM0RDM5OSIgc3Ryb2tlPSIjMDgyRjQ5IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxyZWN0IHg9IjM2IiB5PSIyNiIgd2lkdGg9IjkiIGhlaWdodD0iOSIgcng9IjIiIGZpbGw9IiNFMEYyRkUiLz48dGV4dCB4PSI0MCIgeT0iNzAuNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzdERDNGQyIgZm9udC1mYW1pbHk9Ii1hcHBsZS1zeXN0ZW0sQmxpbmtNYWNTeXN0ZW1Gb250LCdTZWdvZSBVSScsc3lzdGVtLXVpLHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTEuNSIgZm9udC13ZWlnaHQ9IjcwMCIgbGV0dGVyLXNwYWNpbmc9IjEuMSI+RURBPC90ZXh0Pjwvc3ZnPg==",
  "kicad": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2tpY2FkIiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxQTJENkIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwRDE3M0EiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfa2ljYWQiIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19raWNhZCkiIHN0cm9rZT0icmdiYSgxMjksMTQwLDI0OCwwLjQ0KSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTkgMkg2MUM3MC40IDIgNzggOS42IDc4IDE5VjI4QzYyIDM0IDE4IDM0IDIgMjhWMTlDMiA5LjYgOS42IDIgMTkgMloiIGZpbGw9InVybCgjaGlfa2ljYWQpIi8+PHJlY3QgeD0iMjUiIHk9IjE4IiB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHJ4PSI2IiBmaWxsPSIjMzEyRTgxIiBzdHJva2U9IiNBNUI0RkMiIHN0cm9rZS13aWR0aD0iMiIvPjxwYXRoIGQ9Ik0zMiwxOCBWMTIgTTQwLDE4IFYxMiBNNDgsMTggVjEyIE0zMiw1NCBWNDggTTQwLDU0IFY0OCBNNDgsNTQgVjQ4IE0yNSwyNSBIMTggTTI1LDMzIEgxOCBNMjUsNDEgSDE4IE02MiwyNSBINTUgTTYyLDMzIEg1NSBNNjIsNDEgSDU1IiBzdHJva2U9IiNGQkJGMjQiIHN0cm9rZS13aWR0aD0iMi4yIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjI1IiByPSIyLjQiIGZpbGw9IiMzNEQzOTkiLz48cGF0aCBkPSJNMzMsMzkgTDQwLDI5IEw0NywzOSIgc3Ryb2tlPSIjRTBFN0ZGIiBzdHJva2Utd2lkdGg9IjIuMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNDN0QyRkUiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPktpPC90ZXh0Pjwvc3ZnPg==",
  "altium-designer": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2FsdGl1bWRlc2lnbmVyIiB4MT0iMTIiIHkxPSI2IiB4Mj0iNjgiIHkyPSI3NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzNjJGMTQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxOTE2MDgiLz48L2xpbmVhckdyYWRpZW50PjxsaW5lYXJHcmFkaWVudCBpZD0iaGlfYWx0aXVtZGVzaWduZXIiIHgxPSI0MCIgeTE9IjAiIHgyPSI0MCIgeTI9IjM0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGRkZGRiIgc3RvcC1vcGFjaXR5PSIwLjE4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iNzgiIGhlaWdodD0iNzgiIHJ4PSIxOCIgZmlsbD0idXJsKCNiZ19hbHRpdW1kZXNpZ25lcikiIHN0cm9rZT0icmdiYSgyMTcsMTk5LDExNywwLjQ1KSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTkgMkg2MUM3MC40IDIgNzggOS42IDc4IDE5VjI4QzYyIDM0IDE4IDM0IDIgMjhWMTlDMiA5LjYgOS42IDIgMTkgMloiIGZpbGw9InVybCgjaGlfYWx0aXVtZGVzaWduZXIpIi8+PHJlY3QgeD0iMjQiIHk9IjE4IiB3aWR0aD0iMzIiIGhlaWdodD0iMzAiIHJ4PSI1IiBmaWxsPSIjNzEzRjEyIiBmaWxsLW9wYWNpdHk9IjAuNTUiIHN0cm9rZT0iI0ZERTA0NyIgc3Ryb2tlLXdpZHRoPSIxLjgiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjI2IiByPSIyLjMiIGZpbGw9IiNGREUwNDciLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjI2IiByPSIyLjMiIGZpbGw9IiNGREUwNDciLz48Y2lyY2xlIGN4PSI0OCIgY3k9IjI2IiByPSIyLjMiIGZpbGw9IiNGREUwNDciLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjM0IiByPSIyLjMiIGZpbGw9IiNGREUwNDciLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjM0IiByPSIyLjMiIGZpbGw9IiMzNEQzOTkiLz48Y2lyY2xlIGN4PSI0OCIgY3k9IjM0IiByPSIyLjMiIGZpbGw9IiNGREUwNDciLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjQyIiByPSIyLjMiIGZpbGw9IiNGREUwNDciLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjQyIiByPSIyLjMiIGZpbGw9IiNGREUwNDciLz48Y2lyY2xlIGN4PSI0OCIgY3k9IjQyIiByPSIyLjMiIGZpbGw9IiNGREUwNDciLz48cGF0aCBkPSJNMTYsMjYgSDI0IE01NiwyNiBINjQgTTE2LDQyIEgyNCBNNTYsNDIgSDY0IiBzdHJva2U9IiNGQUNDMTUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PHRleHQgeD0iNDAiIHk9IjcwLjUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNGRUYwOEEiIGZvbnQtZmFtaWx5PSItYXBwbGUtc3lzdGVtLEJsaW5rTWFjU3lzdGVtRm9udCwnU2Vnb2UgVUknLHN5c3RlbS11aSxzYW5zLXNlcmlmIiBmb250LXNpemU9IjExLjUiIGZvbnQtd2VpZ2h0PSI3MDAiIGxldHRlci1zcGFjaW5nPSIxLjEiPkFEPC90ZXh0Pjwvc3ZnPg==",
  "ads": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDgwIDgwIiBmaWxsPSJub25lIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImJnX2FkcyIgeDE9IjEyIiB5MT0iNiIgeDI9IjY4IiB5Mj0iNzYiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNDUxMjIxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMUUwODEwIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImhpX2FkcyIgeDE9IjQwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iMzQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjRkZGRkZGIiBzdG9wLW9wYWNpdHk9IjAuMTgiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkZGRkYiIHN0b3Atb3BhY2l0eT0iMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHg9IjEiIHk9IjEiIHdpZHRoPSI3OCIgaGVpZ2h0PSI3OCIgcng9IjE4IiBmaWxsPSJ1cmwoI2JnX2FkcykiIHN0cm9rZT0icmdiYSgyNTEsMTEzLDEzMywwLjQ0KSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48cGF0aCBkPSJNMTkgMkg2MUM3MC40IDIgNzggOS42IDc4IDE5VjI4QzYyIDM0IDE4IDM0IDIgMjhWMTlDMiA5LjYgOS42IDIgMTkgMloiIGZpbGw9InVybCgjaGlfYWRzKSIvPjxjaXJjbGUgY3g9IjQwIiBjeT0iMzMiIHI9IjE3IiBzdHJva2U9IiNGQjcxODUiIHN0cm9rZS1vcGFjaXR5PSIwLjM1IiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0yNywyMSBBMTQsMTQgMCAwIDEgNTMsNDUiIHN0cm9rZT0iI0ZEQTRBRiIgc3Ryb2tlLW9wYWNpdHk9IjAuNDUiIHN0cm9rZS13aWR0aD0iMS4zIi8+PHBhdGggZD0iTTEzLDM0IEgyMiBMMjgsMTkgTDM1LDQ4IEw0MiwxNSBMNDksNDUgTDU1LDI5IEw2MCwzNCBINjciIHN0cm9rZT0iI0ZCNzE4NSIgc3Ryb2tlLXdpZHRoPSIyLjgiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjx0ZXh0IHg9IjQwIiB5PSI3MC41IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkVDREQzIiBmb250LWZhbWlseT0iLWFwcGxlLXN5c3RlbSxCbGlua01hY1N5c3RlbUZvbnQsJ1NlZ29lIFVJJyxzeXN0ZW0tdWksc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMS41IiBmb250LXdlaWdodD0iNzAwIiBsZXR0ZXItc3BhY2luZz0iMS4xIj5BRFM8L3RleHQ+PC9zdmc+"
};
function softwareIconsForEdition(edition) {
  const out = {};
  for (const adapter of adaptersForEdition(edition)) {
    out[adapter.id] = SOFTWARE_ICON_DATA_URIS[adapter.id];
  }
  return out;
}

// packages/mcp-server/src/mcp-app-ui.ts
var CONNECTOR_VERSION = "1.0.4";
var MCP_APP_MIME_TYPE = "text/html;profile=mcp-app";
function mcpAppUrisForEdition(edition) {
  return {
    global: `ui://engiaxis-connector/${edition}/global-v${CONNECTOR_VERSION}`,
    thread: `ui://engiaxis-connector/${edition}/thread-v${CONNECTOR_VERSION}`,
    widget: `ui://engiaxis-connector/${edition}/widget-v${CONNECTOR_VERSION}`
  };
}
var MCP_APP_URIS = mcpAppUrisForEdition("suite");
function buildEditionSidebarSvg(edition, theme) {
  const rim = theme === "dark" ? "rgba(255,255,255,0.42)" : "rgba(15,23,42,0.22)";
  const hi = theme === "dark" ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.85)";
  const shadowOpacity = theme === "dark" ? "0.45" : "0.18";
  if (edition === "cad") {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">',
      "<defs>",
      '<linearGradient id="cadTopHi" x1="4" y1="2" x2="16" y2="11" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#E0F2FE"/><stop offset="100%" stop-color="#7DD3FC"/></linearGradient>',
      '<linearGradient id="cadStepTop" x1="12" y1="9" x2="21" y2="14" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#7DD3FC"/><stop offset="100%" stop-color="#38BDF8"/></linearGradient>',
      '<linearGradient id="cadLeft" x1="3" y1="7" x2="12" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#0EA5E9"/><stop offset="100%" stop-color="#0284C7"/></linearGradient>',
      '<linearGradient id="cadRight" x1="12" y1="11" x2="21" y2="20" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#0369A1"/><stop offset="100%" stop-color="#0C4A6E"/></linearGradient>',
      "</defs>",
      `<ellipse cx="12" cy="21.5" rx="7.4" ry="1.6" fill="#0F172A" fill-opacity="${shadowOpacity}"/>`,
      // 1. Raised upper L-tower top face (brightest)
      '<polygon points="12.0,2.2 16.3,4.55 7.7,9.25 3.4,6.9" fill="url(#cadTopHi)"/>',
      // 2. Inner vertical riser face dropping down to the lower shelf (medium-dark shaded)
      '<polygon points="16.3,4.55 16.3,9.35 7.7,14.05 7.7,9.25" fill="#075985"/>',
      // 3. Lower right horizontal step terrace (lit sky-blue shelf)
      '<polygon points="16.3,9.35 20.6,11.7 12.0,16.4 7.7,14.05" fill="url(#cadStepTop)"/>',
      // 4. Left full L-profile front face (tall back-left + low front-right)
      '<polygon points="3.4,6.9 7.7,9.25 7.7,14.05 12.0,16.4 12.0,21.1 3.4,16.4" fill="url(#cadLeft)"/>',
      // 5. Lower right front vertical wall
      '<polygon points="12.0,16.4 20.6,11.7 20.6,16.4 12.0,21.1" fill="url(#cadRight)"/>',
      // Crisp white specular bevel ridges along exposed 3D edges
      `<path d="M3.4,6.9 L7.7,9.25 L16.3,4.55 M7.7,9.25 V14.05 L12.0,16.4 L20.6,11.7 M12.0,16.4 V21.1" stroke="${hi}" stroke-width="0.95" stroke-linecap="round" stroke-linejoin="round"/>`,
      // True non-convex stepped outer silhouette outline
      `<path d="M12.0,2.2 L16.3,4.55 V9.35 L20.6,11.7 V16.4 L12.0,21.1 L3.4,16.4 V6.9 Z" stroke="${rim}" stroke-width="0.85" stroke-linejoin="round"/>`,
      "</svg>"
    ].join("");
  }
  if (edition === "cae") {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">',
      "<defs>",
      '<linearGradient id="caeTop" x1="5" y1="3" x2="19" y2="11" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#EF4444"/><stop offset="52%" stop-color="#F97316"/><stop offset="100%" stop-color="#FACC15"/></linearGradient>',
      '<linearGradient id="caeLeft" x1="4" y1="8" x2="11" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#F97316"/><stop offset="55%" stop-color="#22C55E"/><stop offset="100%" stop-color="#06B6D4"/></linearGradient>',
      '<linearGradient id="caeRight" x1="12" y1="11" x2="21" y2="20" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#84CC16"/><stop offset="50%" stop-color="#0EA5E9"/><stop offset="100%" stop-color="#1D4ED8"/></linearGradient>',
      "</defs>",
      `<ellipse cx="12" cy="21.5" rx="7.2" ry="1.6" fill="#0F172A" fill-opacity="${shadowOpacity}"/>`,
      '<polygon points="12,2.3 20.6,7.1 12,11.9 3.4,7.1" fill="url(#caeTop)"/>',
      '<polygon points="3.4,7.1 12,11.9 12,21.1 3.4,16.3" fill="url(#caeLeft)"/>',
      '<polygon points="12,11.9 20.6,7.1 20.6,16.3 12,21.1" fill="url(#caeRight)"/>',
      // 3D finite-element mesh grid across all 3 visible faces
      '<path d="M7.7,4.7 L16.3,9.5 M16.3,4.7 L7.7,9.5 M7.7,9.5 V18.7 M16.3,9.5 V18.7 M3.4,11.7 L12,16.5 L20.6,11.7" stroke="rgba(255,255,255,0.72)" stroke-width="0.85" stroke-linecap="round"/>',
      // Outer silhouette + lit center ridge
      `<path d="M3.4,7.1 L12,11.9 L20.6,7.1 M12,11.9 V21.1" stroke="${hi}" stroke-width="1.05" stroke-linecap="round"/>`,
      `<path d="M12,2.3 L20.6,7.1 V16.3 L12,21.1 L3.4,16.3 V7.1 Z" stroke="${rim}" stroke-width="0.85" stroke-linejoin="round"/>`,
      '<circle cx="12" cy="11.9" r="1.45" fill="#FFFFFF"/>',
      "</svg>"
    ].join("");
  }
  if (edition === "eda") {
    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">',
      "<defs>",
      '<linearGradient id="pcbTop" x1="3" y1="7" x2="21" y2="17" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#059669"/></linearGradient>',
      '<linearGradient id="chipTop" x1="7" y1="5" x2="17" y2="12" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#475569"/><stop offset="100%" stop-color="#1E293B"/></linearGradient>',
      "</defs>",
      `<ellipse cx="12" cy="21.4" rx="8.0" ry="1.6" fill="#0F172A" fill-opacity="${shadowOpacity}"/>`,
      // 3D PCB board base (thickness sides + top)
      '<polygon points="12,7.2 21.8,12.4 12,17.8 2.2,12.4" fill="url(#pcbTop)"/>',
      '<polygon points="2.2,12.4 12,17.8 12,20.1 2.2,14.7" fill="#047857"/>',
      '<polygon points="12,17.8 21.8,12.4 21.8,14.7 12,20.1" fill="#064E3B"/>',
      // Gold gull-wing IC pins extending onto PCB
      '<path d="M7.6,12.9 L5.2,14.2 M9.8,14.1 L7.4,15.4 M14.2,14.1 L16.6,15.4 M16.4,12.9 L18.8,14.2 M7.8,9.3 L5.5,8.0 M16.2,9.3 L18.5,8.0" stroke="#FCD34D" stroke-width="1.35" stroke-linecap="round"/>',
      // Raised 3D QFP silicon package
      '<polygon points="12,4.4 18.0,7.7 12,11.0 6.0,7.7" fill="url(#chipTop)"/>',
      '<polygon points="6.0,7.7 12,11.0 12,14.2 6.0,10.9" fill="#1E293B"/>',
      '<polygon points="12,11.0 18.0,7.7 18.0,10.9 12,14.2" fill="#0F172A"/>',
      // Chip bevel highlight + glowing emerald die core + pin-1 gold dot
      `<path d="M6.0,7.7 L12,11.0 L18.0,7.7 M12,11.0 V14.2" stroke="${hi}" stroke-width="0.85" stroke-linecap="round"/>`,
      '<polygon points="12,6.2 14.3,7.5 12,8.8 9.7,7.5" fill="#34D399"/>',
      '<circle cx="12" cy="15.8" r="1.0" fill="#FDE047"/>',
      `<path d="M12,7.2 L21.8,12.4 V14.7 L12,20.1 L2.2,14.7 V12.4 Z" stroke="${rim}" stroke-width="0.75" stroke-linejoin="round"/>`,
      "</svg>"
    ].join("");
  }
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">',
    "<defs>",
    '<linearGradient id="stTop" x1="5" y1="2" x2="19" y2="11" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#C4B5FD"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient>',
    '<linearGradient id="stLeft" x1="3" y1="7" x2="12" y2="21" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#6366F1"/><stop offset="100%" stop-color="#312E81"/></linearGradient>',
    '<linearGradient id="stRight" x1="12" y1="10" x2="21" y2="20" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#6D28D9"/><stop offset="100%" stop-color="#2E1065"/></linearGradient>',
    "</defs>",
    `<ellipse cx="12" cy="21.5" rx="7.2" ry="1.6" fill="#0F172A" fill-opacity="${shadowOpacity}"/>`,
    '<polygon points="12,2.2 20.6,7.0 12,11.8 3.4,7.0" fill="url(#stTop)"/>',
    '<polygon points="3.4,7.0 12,11.8 12,21.0 3.4,16.2" fill="url(#stLeft)"/>',
    '<polygon points="12,11.8 20.6,7.0 20.6,16.2 12,21.0" fill="url(#stRight)"/>',
    // Recessed top diamond cavity + floating bright core
    '<polygon points="12,4.1 16.4,6.6 12,9.1 7.6,6.6" fill="#1E1B4B" fill-opacity="0.7"/>',
    '<polygon points="12,5.0 14.7,6.6 12,8.2 9.3,6.6" fill="#F8FAFC"/>',
    // Subtle tri-discipline accent nodes (CAD blue, CAE orange, EDA emerald)
    '<circle cx="12" cy="2.5" r="1.45" fill="#38BDF8"/>',
    '<circle cx="20.2" cy="15.8" r="1.45" fill="#FB923C"/>',
    '<circle cx="3.8" cy="15.8" r="1.45" fill="#34D399"/>',
    `<path d="M3.4,7.0 L12,11.8 L20.6,7.0 M12,11.8 V21.0" stroke="${hi}" stroke-width="1.0" stroke-linecap="round"/>`,
    `<path d="M12,2.2 L20.6,7.0 V16.2 L12,21.0 L3.4,16.2 V7.0 Z" stroke="${rim}" stroke-width="0.8" stroke-linejoin="round"/>`,
    "</svg>"
  ].join("");
}
function entrypointIconsForEdition(edition) {
  return [
    {
      src: `data:image/svg+xml,${encodeURIComponent(buildEditionSidebarSvg(edition, "light"))}`,
      mimeType: "image/svg+xml",
      sizes: ["any"],
      theme: "light"
    },
    {
      src: `data:image/svg+xml,${encodeURIComponent(buildEditionSidebarSvg(edition, "dark"))}`,
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
  const cacheKey = `engiaxis-connector:state:${edition}:v${CONNECTOR_VERSION}`;
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
      background: transparent;
      border-color: transparent;
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
    .btn.danger { color: #dc2626; border-color: rgba(220, 38, 38, 0.28); }
    .btn.danger:hover { background: rgba(220, 38, 38, 0.08); border-color: rgba(220, 38, 38, 0.48); color: #dc2626; }
    html[data-theme="dark"] .btn.danger { color: #f87171; border-color: rgba(248, 113, 113, 0.3); }
    html[data-theme="dark"] .btn.danger:hover { background: rgba(248, 113, 113, 0.12); border-color: rgba(248, 113, 113, 0.5); color: #fca5a5; }

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


    .disclaimer-bar {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid var(--ea-border);
      font-size: 11.5px;
      line-height: 1.55;
      color: var(--ea-muted);
      opacity: 0.78;
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
          <footer class="disclaimer-bar" id="disclaimerFooter"></footer>
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
      const BLEED_ICONS = new Set(Object.keys(SOFTWARE_ICONS));
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
          mcpDisabled: 'MCP \u5DF2\u505C\u7528',
          installedLocal: '\u672C\u673A\u5DF2\u5B89\u88C5',
          notConnected: '\u5F85\u63A5\u5165',
          plannedSoon: '\u5373\u5C06\u652F\u6301',
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
          btnEnable: '\u542F\u7528\u8FDE\u63A5',
          btnDisable: '\u505C\u7528\u8FDE\u63A5',
          btnUninstall: '\u5378\u8F7D\u8FDE\u63A5',
          enabledToast: '\u5DF2\u542F\u7528 MCP \u8FDE\u63A5',
          disabledToast: '\u5DF2\u505C\u7528 MCP \u8FDE\u63A5',
          uninstalledToast: '\u5DF2\u5378\u8F7D MCP \u8FDE\u63A5',
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
          disclaimer: '\u58F0\u660E\uFF1AEngiAxis Connector \u4E3A\u72EC\u7ACB\u7B2C\u4E09\u65B9\u8FDE\u63A5\u5DE5\u5177\uFF0C\u4E0E\u4E0A\u8FF0\u5DE5\u7A0B\u8F6F\u4EF6\u5382\u5546\u65E0\u96B6\u5C5E\u3001\u8D5E\u52A9\u6216\u5B98\u65B9\u6388\u6743\u5173\u7CFB\uFF1B\u76F8\u5173\u8F6F\u4EF6\u540D\u79F0\u4EC5\u7528\u4E8E\u8BF4\u660E\u517C\u5BB9\u6027\uFF0C\u5176\u5546\u6807\u5F52\u5404\u81EA\u6743\u5229\u4EBA\u6240\u6709\u3002',
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
          mcpDisabled: 'MCP Disabled',
          installedLocal: 'Installed locally',
          notConnected: 'Not connected',
          plannedSoon: 'Coming soon',
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
          btnEnable: 'Enable',
          btnDisable: 'Disable',
          btnUninstall: 'Uninstall',
          enabledToast: 'MCP connection enabled',
          disabledToast: 'MCP connection disabled',
          uninstalledToast: 'MCP connection removed',
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
          disclaimer: 'Notice: EngiAxis Connector is an independent third-party tool and is not affiliated with, endorsed by, or sponsored by any CAD, CAE, or EDA software vendor. Software names are used for compatibility reference only; all trademarks belong to their respective owners.',
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
        document.getElementById('disclaimerFooter').textContent = t('disclaimer');
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

      const autoProbedIds = new Set();
      let autoProbing = false;

      function isConnected(a) {
        return Boolean(a && (a.connected !== undefined ? a.connected : a.provisioned));
      }

      function isDisabledInHost(a) {
        return Boolean(a && a.hostConfigured && !a.hostEnabled);
      }

      function normalizeToolNames(list) {
        if (!Array.isArray(list)) return [];
        return list
          .map(function (item) {
            return typeof item === 'string' ? item : (item && typeof item.name === 'string' ? item.name : '');
          })
          .filter(Boolean);
      }

      async function autoProbeMissingToolCounts() {
        if (!hostConnected || autoProbing || !state || !Array.isArray(state.adapters)) return;
        const targets = state.adapters.filter(function (a) {
          const count = typeof a.toolCount === 'number' ? a.toolCount : 0;
          return isConnected(a) && a.hostTransport !== 'http' && count === 0 && !autoProbedIds.has(a.id);
        });
        if (targets.length === 0) return;
        autoProbing = true;
        let updatedAny = false;
        try {
          for (const target of targets) {
            autoProbedIds.add(target.id);
            try {
              const res = await callTool('connector_probe', { software_id: target.id });
              const probe = res.data && res.data.probe;
              if (probe && probe.ok) {
                const names = normalizeToolNames(probe.toolNames || probe.tools);
                if (names.length > 0) {
                  toolsBySoftware[target.id] = names;
                  updatedAny = true;
                }
              }
            } catch {}
          }
          if (updatedAny) {
            const latest = await callTool('connector_status', {});
            if (latest.data && Array.isArray(latest.data.adapters)) {
              state = latest.data;
              try { localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch {}
              render();
              updateModelContext();
            }
          }
        } finally {
          autoProbing = false;
        }
      }

      function updateModelContext() {
        if (!hostConnected || !state) return;
        const ready = (state.adapters || []).filter(function (a) { return isConnected(a); }).map(function (a) { return a.id; });
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
        void autoProbeMissingToolCounts();
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
          .filter(function (a) { return isConnected(a) || a.hostConfigured || a.appInstalled; })
          .sort(function (a, b) {
            const ac = isConnected(a);
            const bc = isConnected(b);
            if (ac !== bc) return ac ? -1 : 1;
            if (Boolean(a.hostConfigured) !== Boolean(b.hostConfigured)) return a.hostConfigured ? -1 : 1;
            return 0;
          });

        if (list.length === 0) {
          el.innerHTML = '<div class="sb-empty">' + esc(t('sbEmpty')) + '</div>';
          return;
        }

        el.innerHTML = list.map(function (a) {
          const name = isZh ? (a.titleZh || a.title || a.id) : (a.title || a.id);
          const busy = busyIds.has(a.id);
          const on = isConnected(a);
          const isPlanned = a.integration === 'planned';
          const canToggle = on || a.hostConfigured || a.provisioned || !isPlanned;
          const toggleTitle = on
            ? t('btnDisable')
            : ((a.hostConfigured || a.provisioned) ? t('btnEnable') : (isPlanned ? t('plannedSoon') : t('btnSetup')));
          return [
            '<div class="sb-item">',
            '  <button type="button" class="sb-item-main" data-open-detail="' + esc(a.id) + '" title="' + esc(name) + '">',
            '    ' + renderSoftwareIcon(a.id, 'sb-item-ico'),
            '    <span class="sb-item-name">' + esc(name) + '</span>',
            '  </button>',
            '  <button type="button" class="sb-gear" data-open-detail="' + esc(a.id) + '" title="' + esc(name) + '">' + iconSvg('gear') + '</button>',
            '  <button type="button" class="toggle ' + (on ? 'on' : '') + '" data-toggle-id="' + esc(a.id) + '" ' + ((busy || !canToggle) ? 'disabled' : '') + ' aria-pressed="' + (on ? 'true' : 'false') + '" title="' + esc(toggleTitle) + '"></button>',
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

        const readyCount = adapters.filter(function (a) { return isConnected(a); }).length;
        document.getElementById('summaryHint').textContent = STR[isZh ? 'zh' : 'en'].summaryFmt(readyCount, adapters.length);
      }

      function renderConnectionsList(adapters) {
        const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
        const filtered = adapters.filter(function (a) {
          const cat = String(a.category || '').toLowerCase();
          if (activeFilter === 'connected' && !isConnected(a)) return false;
          if (activeFilter === 'pending' && isConnected(a)) return false;
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

            const isPlanned = a.integration === 'planned';
            const on = isConnected(a);
            const disabledHost = isDisabledInHost(a);
            let statusHtml = '';
            if (on) {
              statusHtml = '<span class="st-ok">' + esc(t('mcpConnected')) + '</span>';
              if (a.bridgeReady === false) {
                statusHtml += '<span class="st-warn">\xB7 ' + esc(t('bridgeOffline')) + (a.bridgePort ? ' :' + esc(a.bridgePort) : '') + '</span>';
              } else if (toolCount > 0) {
                statusHtml += '<span class="st-sub">\xB7 ' + esc(toolCount) + ' ' + esc(t('toolsUnit')) + '</span>';
              }
            } else if (disabledHost) {
              statusHtml = '<span class="st-warn">' + esc(t('mcpDisabled')) + '</span>';
              if (a.appInstalled) {
                statusHtml += '<span class="st-sub">\xB7 ' + esc(t('installedLocal')) + '</span>';
              }
            } else if (isPlanned) {
              statusHtml = a.appInstalled
                ? '<span class="st-muted">' + esc(t('installedLocal')) + ' \xB7 ' + esc(t('plannedSoon')) + '</span>'
                : '<span class="st-muted">' + esc(t('notConnected')) + '</span>';
            } else if (a.appInstalled) {
              statusHtml = '<span class="st-muted">' + esc(t('installedLocal')) + '</span>';
            } else {
              statusHtml = '<span class="st-muted">' + esc(t('notConnected')) + '</span>';
            }

            const hasExisting = on || disabledHost;
            const actKind = busy ? 'spinner' : (hasExisting ? 'dots' : 'plus');
            const actType = (hasExisting || isPlanned) ? 'detail' : 'setup';
            const actTitle = hasExisting ? name : (isPlanned ? t('plannedSoon') : t('btnSetup'));

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
        const rawTools = toolsBySoftware[a.id] || (Array.isArray(a.toolNames) && a.toolNames.length > 0 ? a.toolNames : null);
        const tools = rawTools ? normalizeToolNames(rawTools) : null;
        const toolCount = tools && tools.length > 0
          ? tools.length
          : (typeof a.toolCount === 'number' ? a.toolCount : 0);

        let badgesHtml = '';
        badgesHtml += a.appInstalled
          ? '<span class="badge ok">' + esc(t('detected')) + '</span>'
          : '<span class="badge">' + esc(t('notDetected')) + '</span>';
        const isPlanned = a.integration === 'planned';
        const on = isConnected(a);
        const disabledHost = isDisabledInHost(a);
        badgesHtml += on
          ? '<span class="badge ok">' + esc(t('mcpConnected')) + (toolCount ? ' \xB7 ' + esc(toolCount) + ' ' + esc(t('toolsUnit')) : '') + '</span>'
          : (disabledHost
              ? '<span class="badge warn">' + esc(t('mcpDisabled')) + '</span>'
              : (isPlanned
                  ? '<span class="badge">' + esc(t('plannedSoon')) + '</span>'
                  : '<span class="badge warn">' + esc(t('notConnected')) + '</span>'));
        if (a.bridgeReady === true) {
          badgesHtml += '<span class="badge ok">' + esc(t('bridgeOnline')) + (a.bridgePort ? ' :' + esc(a.bridgePort) : '') + '</span>';
        } else if (a.bridgeReady === false) {
          badgesHtml += '<span class="badge warn">' + esc(t('bridgeOffline')) + (a.bridgePort ? ' :' + esc(a.bridgePort) : '') + '</span>';
        }

        const detailText = a.appDetail || a.bridgeDetail || '';
        const pathHtml = detailText ? ('<div class="modal-path">' + esc(detailText) + '</div>') : '';
        const prereqHtml = prereq ? ('<div class="modal-prereq">' + esc(prereq) + '</div>') : '';

        let actionsHtml = '';
        if (on) {
          const btns = [
            '<button type="button" class="btn primary" data-modal-action="chat" data-id="' + esc(a.id) + '">' + esc(t('btnUseInChat')) + '</button>',
            '<button type="button" class="btn" data-modal-action="probe" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(busy ? t('working') : t('btnProbe')) + '</button>',
          ];
          if (a.hostTransport !== 'http') {
            btns.push('<button type="button" class="btn" data-modal-action="tools" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(t('btnTools')) + '</button>');
          }
          if (!isPlanned) {
            btns.push('<button type="button" class="btn" data-modal-action="setup" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(t('btnReconfigure')) + '</button>');
          }
          btns.push('<button type="button" class="btn" data-modal-action="disable" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(t('btnDisable')) + '</button>');
          btns.push('<button type="button" class="btn danger" data-modal-action="uninstall" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(t('btnUninstall')) + '</button>');
          actionsHtml = btns.join('');
        } else if (disabledHost || (a.provisioned && !isPlanned)) {
          const btns = [
            '<button type="button" class="btn primary" data-modal-action="enable" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(busy ? t('working') : t('btnEnable')) + '</button>',
          ];
          if (!isPlanned) {
            btns.push('<button type="button" class="btn" data-modal-action="setup" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(t('btnReconfigure')) + '</button>');
          }
          btns.push('<button type="button" class="btn danger" data-modal-action="uninstall" data-id="' + esc(a.id) + '" ' + (busy ? 'disabled' : '') + '>' + esc(t('btnUninstall')) + '</button>');
          actionsHtml = btns.join('');
        } else if (isPlanned) {
          actionsHtml = '<button type="button" class="btn" disabled>' + esc(t('plannedSoon')) + '</button>';
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
              const names = res.data.probe ? normalizeToolNames(res.data.probe.toolNames || res.data.probe.tools) : [];
              if (names.length > 0) {
                toolsBySoftware[id] = names;
              }
              toast(id + ' \u5DF2\u8FDE\u63A5 (' + names.length + ' ' + t('toolsUnit') + ')');
              appendLog(id + ' \u914D\u7F6E\u6210\u529F\uFF0C\u63A2\u6D4B\u5230 ' + names.length + ' \u4E2A MCP \u5DE5\u5177\u3002');
              await refreshStatus(true);
            }
          } else if (action === 'enable' || action === 'disable') {
            const enableFlag = action === 'enable';
            const res = await callTool('connector_toggle', { software_id: id, enabled: enableFlag });
            if (res.isError || !res.data || !res.data.ok) {
              const msg = (res.data && (res.data.error || res.data.message)) || '\u5207\u6362\u72B6\u6001\u5931\u8D25';
              toast(msg);
              appendLog(id + ' \u5207\u6362\u5931\u8D25: ' + msg);
            } else {
              if (Array.isArray(res.data.adapters)) {
                setState(res.data);
              } else {
                await refreshStatus(true);
              }
              toast(enableFlag ? t('enabledToast') : t('disabledToast'));
              appendLog(id + (enableFlag ? ' \u5DF2\u542F\u7528\u8FDE\u63A5\u3002' : ' \u5DF2\u505C\u7528\u8FDE\u63A5\u3002'));
            }
          } else if (action === 'uninstall') {
            const res = await callTool('connector_uninstall', { software_id: id });
            if (res.isError || !res.data || !res.data.ok) {
              const msg = (res.data && (res.data.error || res.data.message)) || '\u5378\u8F7D\u5931\u8D25';
              toast(msg);
              appendLog(id + ' \u5378\u8F7D\u5931\u8D25: ' + msg);
            } else {
              delete toolsBySoftware[id];
              selectedAdapterId = null;
              if (Array.isArray(res.data.adapters)) {
                setState(res.data);
              } else {
                await refreshStatus(true);
              }
              toast(t('uninstalledToast'));
              appendLog(id + ' \u5DF2\u4ECE ChatGPT Desktop \u4E0E\u672C\u5730\u6CE8\u518C\u8868\u79FB\u9664\u3002');
            }
          } else if (action === 'probe') {
            appendLog('\u6D4B\u8BD5\u8FDE\u63A5 ' + id + ' ...');
            const res = await callTool('connector_probe', { software_id: id });
            const probe = res.data && res.data.probe;
            if (probe && probe.ok) {
              const list = normalizeToolNames(probe.toolNames || probe.tools);
              if (list.length > 0) {
                toolsBySoftware[id] = list;
              }
              const ms = probe.durationMs !== undefined ? probe.durationMs : (probe.latencyMs || 0);
              toast(id + ' \u8FDE\u901A\u6B63\u5E38' + (list.length > 0 ? ' (' + list.length + ' ' + t('toolsUnit') + ')' : ''));
              appendLog(id + ' \u63A2\u6D4B\u6210\u529F (' + ms + 'ms, ' + list.length + ' tools)');
              await refreshStatus(true);
            } else {
              const errMsg = (probe && probe.error) || (res.data && res.data.error) || '\u8FDE\u63A5\u5931\u8D25';
              toast(errMsg);
              appendLog(id + ' \u63A2\u6D4B\u5931\u8D25: ' + errMsg);
            }
          } else if (action === 'tools') {
            const res = await callTool('connector_list_adapter_tools', { software_id: id });
            if (res.data && res.data.ok) {
              const names = normalizeToolNames(res.data.toolNames || res.data.tools);
              toolsBySoftware[id] = names;
              toast(id + ': ' + names.length + ' ' + t('toolsUnit'));
              appendLog(id + ' \u5DE5\u5177\u5217\u8868: ' + names.join(', '));
              await refreshStatus(true);
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
          const nextAction = isConnected(a)
            ? 'disable'
            : ((a.hostConfigured || a.provisioned) ? 'enable' : 'setup');
          runAdapterAction(nextAction, id);
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
            appInfo: { name: 'engiaxis-connector-' + EDITION, version: "1.0.4" },
            appCapabilities: { availableDisplayModes: ['fullscreen', 'inline'] },
          });
          hostConnected = true;
          if (initRes && initRes.hostContext) applyHostContext(initRes.hostContext);
          window.parent.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/initialized', params: {} }, '*');

          if (receivedInitialToolResult && state) {
            void autoProbeMissingToolCounts();
          }
          setTimeout(function () {
            if (!receivedInitialToolResult) {
              refreshStatus(true);
            } else {
              void autoProbeMissingToolCounts();
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
    const uris = mcpAppUrisForEdition(this.config.edition);
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
            resourceUri: uris.global,
            visibility: ["app"]
          },
          "openai/ui": {
            entrypoints: [{ type: "global" }]
          }
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
            resourceUri: uris.thread
          },
          "openai/ui": {
            entrypoints: [{ type: "thread" }]
          }
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
            resourceUri: uris.widget
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
        name: "connector_toggle",
        title: "Toggle Software Connection",
        description: "Enable or disable an engineering software MCP connection in ChatGPT Desktop (~/.codex/config.toml).",
        inputSchema: {
          type: "object",
          required: ["software_id", "enabled"],
          properties: {
            software_id: {
              type: "string",
              enum: adapterIds,
              description: "Canonical software adapter identifier."
            },
            enabled: {
              type: "boolean",
              description: "True to enable the MCP server in the host client; false to disable it."
            }
          },
          additionalProperties: false
        }
      },
      {
        name: "connector_uninstall",
        title: "Uninstall Software Connection",
        description: "Remove an engineering software MCP connection from ChatGPT Desktop (~/.codex/config.toml) and clear its localConnector registry entry.",
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
        }
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
    const uris = mcpAppUrisForEdition(this.config.edition);
    return [
      {
        uri: uris.global,
        name: `engiaxis-connector-${this.config.edition}-global`,
        title,
        description: "Fullscreen sidebar UI for managing EngiAxis engineering software connections.",
        mimeType: MCP_APP_MIME_TYPE
      },
      {
        uri: uris.thread,
        name: `engiaxis-connector-${this.config.edition}-thread`,
        title: `${title} Panel`,
        description: "Thread side panel UI for managing EngiAxis engineering software connections.",
        mimeType: MCP_APP_MIME_TYPE
      },
      {
        uri: uris.widget,
        name: `engiaxis-connector-${this.config.edition}-widget`,
        title: `${title} Status`,
        description: "Inline status widget for EngiAxis engineering software connections.",
        mimeType: MCP_APP_MIME_TYPE
      }
    ];
  }
  readResource(uri) {
    const uris = mcpAppUrisForEdition(this.config.edition);
    const entries = [
      ["global", uris.global],
      ["thread", uris.thread],
      ["widget", uris.widget]
    ];
    const exactMatch = entries.find(([, u]) => u === uri);
    const legacyMatch = !exactMatch ? /^ui:\/\/engiaxis-connector\/(?:[a-z]+\/)?(global|thread|widget)-v[\w.-]+$/.exec(uri) : null;
    const surface = exactMatch ? exactMatch[0] : legacyMatch ? legacyMatch[1] : null;
    if (!surface) return null;
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
  resolveTargetCodexConfigPath() {
    return this.config.codexConfigPath ?? resolveChatGptConfigTomlPath();
  }
  collectProvisionedHostServers() {
    const registry = this.provisioner.readRegistry();
    const allowed = new Set(adaptersForEdition(this.config.edition).map((a) => a.id));
    const codexPath = this.config.codexConfigPath;
    const hostRead = codexPath ? readChatGptDesktopMcpServers(codexPath) : null;
    const existingHost = hostRead && hostRead.exists ? new Map(hostRead.servers.map((s) => [s.name, s])) : null;
    return Object.values(registry).filter((record) => allowed.has(record.id) && existsSync9(record.command)).filter((record) => {
      if (!existingHost) return true;
      const aliases = resolveAdapterHostServerNames(record.id);
      return aliases.some((alias) => existingHost.has(alias));
    }).map((record) => {
      const existingEntry = existingHost ? resolveAdapterHostServerNames(record.id).map((alias) => existingHost.get(alias)).find(Boolean) : void 0;
      return {
        name: existingEntry?.name ?? record.id,
        command: record.command,
        args: record.args,
        cwd: record.cwd,
        env: record.env,
        enabled: existingEntry ? existingEntry.enabled : true
      };
    });
  }
  syncSingleHostServer(record, host, dshProfile = "desktop") {
    const server = {
      name: record.id,
      command: record.command,
      args: record.args,
      cwd: record.cwd,
      env: record.env,
      enabled: true
    };
    const results = {};
    if (host === "chatgpt" || host === "all") {
      const targetPath = this.resolveTargetCodexConfigPath();
      const nonCanonicalAliases = resolveAdapterHostServerNames(record.id).filter((alias) => alias !== record.id);
      if (nonCanonicalAliases.length > 0 && existsSync9(targetPath)) {
        removeChatGptDesktopServers(nonCanonicalAliases, targetPath);
      }
      results.chatgpt = syncChatGptDesktopConfig([server], targetPath);
    }
    if (host === "workbuddy" || host === "all") {
      results.workbuddy = syncWorkBuddyDesktopConfig([server]);
    }
    if (host === "dsh" || host === "all") {
      results.dsh = syncDshProfileConfig([server], dshProfile);
    }
    return { synced: true, count: 1, targets: results };
  }
  syncHosts(host, dshProfile = "desktop") {
    const servers = this.collectProvisionedHostServers();
    if (servers.length === 0) {
      return { synced: false, message: "No active provisioned adapters in this edition yet. Run connector_setup first." };
    }
    const results = {};
    if (host === "chatgpt" || host === "all") {
      results.chatgpt = syncChatGptDesktopConfig(servers, this.resolveTargetCodexConfigPath());
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
      const defaultSync = this.config.codexConfigPath ? "chatgpt" : "none";
      const syncHost = typeof rawArgs.sync_host === "string" ? rawArgs.sync_host : defaultSync;
      const dshProfile = typeof rawArgs.dsh_profile === "string" ? rawArgs.dsh_profile : "desktop";
      const hostSync = syncHost !== "none" ? this.syncSingleHostServer(outcome.record, syncHost, dshProfile) : void 0;
      this.provisioner.saveProbeCache(
        outcome.record.id,
        { command: outcome.record.command, args: outcome.record.args, cwd: outcome.record.cwd, env: outcome.record.env },
        outcome.probe.toolNames
      );
      return jsonText({ ok: true, stages, record: outcome.record, probe: outcome.probe, ...hostSync ? { hostSync } : {} });
    }
    if (name === "connector_toggle") {
      const softwareId = typeof rawArgs.software_id === "string" ? rawArgs.software_id : "";
      const enabled = Boolean(rawArgs.enabled);
      if (!adapterById(softwareId) || !isAdapterInEdition(softwareId, this.config.edition)) {
        return jsonText({ ok: false, error: `Software "${softwareId}" is not included in this edition.` }, true);
      }
      const id = softwareId;
      const current = await this.provisioner.inspectAdapter(id);
      const targetConfigPath = this.resolveTargetCodexConfigPath();
      if (current.hostConfigured && current.hostServerName) {
        toggleChatGptDesktopServer(current.hostServerName, enabled, targetConfigPath);
      } else if (enabled) {
        const record = this.provisioner.readRegistry()[id];
        if (!record || !existsSync9(record.command)) {
          return jsonText({ ok: false, error: `Software "${softwareId}" is not configured yet. Run connector_setup first.` }, true);
        }
        syncChatGptDesktopConfig([{
          name: record.id,
          command: record.command,
          args: record.args,
          cwd: record.cwd,
          env: record.env,
          enabled: true
        }], targetConfigPath);
      }
      const payload = await this.buildStatusPayload();
      const updated = payload.adapters.find((a) => a.id === id);
      return jsonText({ ok: true, software_id: id, enabled, adapter: updated, ...payload });
    }
    if (name === "connector_uninstall") {
      const softwareId = typeof rawArgs.software_id === "string" ? rawArgs.software_id : "";
      if (!adapterById(softwareId) || !isAdapterInEdition(softwareId, this.config.edition)) {
        return jsonText({ ok: false, error: `Software "${softwareId}" is not included in this edition.` }, true);
      }
      const id = softwareId;
      if (this.config.codexConfigPath !== null) {
        const targetConfigPath = this.resolveTargetCodexConfigPath();
        if (existsSync9(targetConfigPath)) {
          removeChatGptDesktopServers(resolveAdapterHostServerNames(id), targetConfigPath);
        }
      }
      this.provisioner.removeRecord(id);
      this.provisioner.removeProbeCache(id);
      const payload = await this.buildStatusPayload();
      return jsonText({ ok: true, software_id: id, ...payload });
    }
    if (name === "connector_probe") {
      const softwareId = typeof rawArgs.software_id === "string" ? rawArgs.software_id : "";
      if (!adapterById(softwareId) || !isAdapterInEdition(softwareId, this.config.edition)) {
        return jsonText({ ok: false, error: `Software "${softwareId}" is not included in this edition.` }, true);
      }
      const id = softwareId;
      const status = await this.provisioner.inspectAdapter(id);
      if (status.launch) {
        const probe = await probeMcpStdio(status.launch, { timeoutMs: this.config.probeTimeoutMs });
        if (probe.ok) {
          this.provisioner.saveProbeCache(id, status.launch, probe.toolNames);
        }
        return jsonText({ ok: probe.ok, software_id: softwareId, probe }, !probe.ok);
      }
      if (status.hostConfigured && status.hostTransport === "http") {
        const httpOk = status.bridgeReady !== false;
        return jsonText({
          ok: httpOk,
          software_id: softwareId,
          probe: {
            ok: httpOk,
            durationMs: 0,
            toolNames: status.toolNames,
            tools: [],
            ...httpOk ? {} : { error: `HTTP MCP endpoint unreachable (${status.bridgeDetail})` }
          }
        }, !httpOk);
      }
      return jsonText({ ok: false, error: `Software "${softwareId}" is not provisioned yet. Run connector_setup first.` }, true);
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
      const status = await this.provisioner.inspectAdapter(softwareId);
      if (!status.launch) {
        const detail = status.hostTransport === "http" ? `Software "${softwareId}" uses direct HTTP MCP transport in the host client.` : `Software "${softwareId}" is not provisioned yet. Run connector_setup first.`;
        return jsonText({ ok: false, error: detail }, true);
      }
      if (name === "connector_list_adapter_tools") {
        const probe = await probeMcpStdio(status.launch, { timeoutMs: this.config.probeTimeoutMs });
        if (probe.ok) {
          this.provisioner.saveProbeCache(softwareId, status.launch, probe.toolNames);
        }
        return jsonText({
          software_id: softwareId,
          ok: probe.ok,
          toolNames: probe.toolNames,
          tools: probe.tools,
          error: probe.error
        }, !probe.ok);
      }
      const toolName = typeof rawArgs.tool_name === "string" ? rawArgs.tool_name : "";
      const args = rawArgs.arguments && typeof rawArgs.arguments === "object" && !Array.isArray(rawArgs.arguments) ? rawArgs.arguments : {};
      const callResult = await callMcpStdioTool(status.launch, toolName, args);
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
            version: CONNECTOR_VERSION,
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
        const isConn = a.connected !== undefined ? a.connected : a.provisioned;
        const provBadge = isConn
          ? '<span class="badge ok">MCP \u5DF2\u8FDE\u63A5' + (a.toolCount ? ' (' + a.toolCount + ' \u5DE5\u5177)' : '') + '</span>'
          : (a.hostConfigured && !a.hostEnabled
              ? '<span class="badge warn">MCP \u5DF2\u505C\u7528</span>'
              : '<span class="badge">\u672A\u5B89\u88C5 MCP</span>');
        const bridgeBadge = a.bridgePort ? ('<span class="badge ' + (a.bridgeReady ? 'ok' : 'warn') + '">\u6865\u63A5 :' + a.bridgePort + (a.bridgeReady ? ' \u5728\u7EBF' : ' \u672A\u542F\u52A8') + '</span>') : '';
        return '<div class="card">'
          + '<div class="card-top"><div><div class="card-title">' + a.titleZh + '</div><div class="sub">' + a.id + ' \xB7 ' + a.category.toUpperCase() + ' \xB7 ' + a.runtime + '</div></div>'
          + '<button class="btn primary" onclick="setupAdapter('' + a.id + '')">' + (isConn ? '\u91CD\u65B0\u68C0\u6D4B' : '+ \u4E00\u952E\u914D\u7F6E') + '</button></div>'
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
    const status = await provisioner.inspectAdapter(id);
    if (!status.launch) {
      console.error(`Adapter "${id}" is not provisioned or configured with stdio launch.`);
      process.exitCode = 1;
      return;
    }
    const probe = await probeMcpStdio(status.launch);
    if (probe.ok) {
      provisioner.saveProbeCache(id, status.launch, probe.toolNames);
    }
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
