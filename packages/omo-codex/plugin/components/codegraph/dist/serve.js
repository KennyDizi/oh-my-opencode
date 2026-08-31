#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};

// src/serve.ts
import { existsSync as existsSync7, realpathSync as realpathSync3 } from "node:fs";
import { homedir as homedir6 } from "node:os";
import { basename as basename4, join as join12, resolve as resolve5 } from "node:path";
import {
  cwd as processCwd,
  env as processEnv,
  stdin as processStdin,
  stderr as processStderr,
  stdout as processStdout
} from "node:process";
import { fileURLToPath } from "node:url";

// ../../../../utils/src/codegraph/env.ts
import { homedir } from "node:os";
import { join } from "node:path";
var CODEGRAPH_INSTALL_DIR_ENV = "CODEGRAPH_INSTALL_DIR";
var CODEGRAPH_NO_DAEMON_ENV = "CODEGRAPH_NO_DAEMON";
var CODEGRAPH_NO_DOWNLOAD_ENV = "CODEGRAPH_NO_DOWNLOAD";
var CODEGRAPH_TELEMETRY_ENV = "CODEGRAPH_TELEMETRY";
var DO_NOT_TRACK_ENV = "DO_NOT_TRACK";
var SAFE_AMBIENT_ENV_KEYS = new Set([
  "APPDATA",
  "CI",
  "CODEX_HOME",
  "ComSpec",
  "HOME",
  "HOMEDRIVE",
  "HOMEPATH",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "LOCALAPPDATA",
  "PATH",
  "PATHEXT",
  "Path",
  "SystemRoot",
  "TEMP",
  "TMP",
  "TMPDIR",
  "USERPROFILE",
  "WINDIR",
  "XDG_CACHE_HOME",
  "XDG_CONFIG_HOME",
  "XDG_DATA_HOME",
  "XDG_STATE_HOME"
]);
var SAFE_CODEGRAPH_RUNTIME_ENV_KEYS = new Set([
  "CODEGRAPH_ALLOW_UNSAFE_NODE",
  "CODEGRAPH_BIN",
  "CODEGRAPH_DAEMON_IDLE_TIMEOUT_MS",
  "CODEGRAPH_FAKE_LOG",
  "CODEGRAPH_NO_DAEMON",
  "CODEGRAPH_NODE_BIN",
  "OMO_CODEGRAPH_BIN",
  "OMO_CODEGRAPH_PROJECT_CWD",
  "OMO_CODEGRAPH_SESSION_START_CWD"
]);
function buildCodegraphEnv(options = {}) {
  const homeDir = options.homeDir ?? homedir();
  return {
    [CODEGRAPH_INSTALL_DIR_ENV]: join(homeDir, ".omo", "codegraph"),
    ...options.daemon === false ? { [CODEGRAPH_NO_DAEMON_ENV]: "1" } : {},
    [CODEGRAPH_NO_DOWNLOAD_ENV]: "1",
    [CODEGRAPH_TELEMETRY_ENV]: "0",
    [DO_NOT_TRACK_ENV]: "1"
  };
}
function copyDefinedEnvKeys(output, input, allowedKeys) {
  for (const key of allowedKeys) {
    const value = input[key];
    if (value !== undefined)
      output[key] = value;
  }
}
function copyDefinedEnv(output, input) {
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined)
      output[key] = value;
  }
}
function buildCodegraphChildEnv(options = {}) {
  const env = {};
  copyDefinedEnvKeys(env, options.ambientEnv ?? {}, SAFE_AMBIENT_ENV_KEYS);
  copyDefinedEnvKeys(env, options.runtimeEnv ?? {}, SAFE_CODEGRAPH_RUNTIME_ENV_KEYS);
  copyDefinedEnv(env, options.codegraphEnv ?? {});
  return env;
}

// ../../../../utils/src/codegraph/managed-runtime.ts
import { existsSync, readFileSync } from "node:fs";
import { join as join2, resolve } from "node:path";

// ../../../../utils/src/record-type-guard.ts
function isPlainRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ../../../../utils/src/codegraph/manifest.ts
var CODEGRAPH_PINNED_VERSION = "1.5.0";
var CODEGRAPH_PROVISION_MANIFEST = {
  assets: {
    "darwin-arm64": {
      executableName: "codegraph",
      sha256: "cf5ee435a6e44d097b2f98f2b7b8b9422bb1094844404efed82519c5da1af2cf",
      url: "https://github.com/colbymchenry/codegraph/releases/download/v1.5.0/codegraph-darwin-arm64.tar.gz"
    },
    "darwin-x64": {
      executableName: "codegraph",
      sha256: "0a0ccc29bf7da9d10be1458d89d7e15c55927ae24cd95e9fa3de4bdfea059dde",
      url: "https://github.com/colbymchenry/codegraph/releases/download/v1.5.0/codegraph-darwin-x64.tar.gz"
    },
    "linux-arm64": {
      executableName: "codegraph",
      sha256: "9f17750aedf45d51f68caae39ed21d6e2a7290b2326e5c53f95a165918ebd1d8",
      url: "https://github.com/colbymchenry/codegraph/releases/download/v1.5.0/codegraph-linux-arm64.tar.gz"
    },
    "linux-x64": {
      executableName: "codegraph",
      sha256: "2ba65e87a1210b706bb1e67d5e48b5fc4a1935e43dbb3fb5f31c5597840d2e58",
      url: "https://github.com/colbymchenry/codegraph/releases/download/v1.5.0/codegraph-linux-x64.tar.gz"
    },
    "win32-arm64": {
      executableName: "codegraph.cmd",
      sha256: "19e0237ea5d8928f705d60e339eb319e7ec37490a69585712933c1534f3c0bc2",
      url: "https://registry.npmjs.org/@colbymchenry/codegraph-win32-arm64/-/codegraph-win32-arm64-1.5.0.tgz"
    },
    "win32-x64": {
      executableName: "codegraph.cmd",
      sha256: "ef64c878acb129885c2d8306ddec6674af865810b4c0f6a9ba9fcd61e21ff9d8",
      url: "https://registry.npmjs.org/@colbymchenry/codegraph-win32-x64/-/codegraph-win32-x64-1.5.0.tgz"
    }
  },
  version: CODEGRAPH_PINNED_VERSION
};

// ../../../../utils/src/codegraph/managed-runtime.ts
function managedBinPath(installDir, platform) {
  return join2(installDir, "bin", platform === "win32" ? "codegraph.cmd" : "codegraph");
}
function hasCodegraphManagedInstall(installDir, options = {}) {
  const fileExists = options.fileExists ?? existsSync;
  return fileExists(managedBinPath(installDir, options.platform ?? process.platform)) || fileExists(join2(installDir, ".provisioned"));
}
function resolvePinnedCodegraphBin(installDir, options = {}) {
  if (installDir === undefined)
    return null;
  const fileExists = options.fileExists ?? existsSync;
  const readText = options.readText ?? ((filePath) => readFileSync(filePath, "utf8"));
  const expectedBin = managedBinPath(installDir, options.platform ?? process.platform);
  const markerPath = join2(installDir, ".provisioned", `codegraph-${CODEGRAPH_PINNED_VERSION}.json`);
  if (!fileExists(expectedBin) || !fileExists(markerPath))
    return null;
  let markerText;
  try {
    markerText = readText(markerPath);
  } catch {
    return null;
  }
  const marker = parseProvisionMarker(markerText);
  if (marker === null || marker.version !== CODEGRAPH_PINNED_VERSION)
    return null;
  return resolve(marker.binPath) === resolve(expectedBin) ? expectedBin : null;
}
function parseProvisionMarker(text) {
  try {
    const value = JSON.parse(text);
    if (!isPlainRecord(value))
      return null;
    const binPath = value["binPath"];
    const version = value["version"];
    if (typeof binPath !== "string" || typeof version !== "string")
      return null;
    return { binPath, version };
  } catch (error) {
    if (error instanceof SyntaxError)
      return null;
    throw error;
  }
}

// ../../../../utils/src/codegraph/node-support.ts
var CODEGRAPH_MIN_NODE_MAJOR = 20;
var CODEGRAPH_BLOCKED_NODE_MAJOR = 25;
var CODEGRAPH_UNSAFE_NODE_ENV = "CODEGRAPH_ALLOW_UNSAFE_NODE";
var CODEGRAPH_NODE_BIN_ENV = "CODEGRAPH_NODE_BIN";
function evaluateCodegraphNodeSupport(options = {}) {
  const nodeVersion = options.nodeVersion ?? process.versions.node;
  const env = options.env ?? process.env;
  const override = (env[CODEGRAPH_UNSAFE_NODE_ENV]?.trim().length ?? 0) > 0;
  const major = parseNodeMajor(nodeVersion);
  if (major >= CODEGRAPH_BLOCKED_NODE_MAJOR) {
    return { major, override, reason: "too-new", supported: override };
  }
  if (major < CODEGRAPH_MIN_NODE_MAJOR) {
    return { major, override, reason: "too-old", supported: override };
  }
  return { major, override, supported: true };
}
function buildCodegraphNodeSkipHint(support) {
  const detail = support.reason === "too-new" ? `Node ${support.major} is unsupported (>= ${CODEGRAPH_BLOCKED_NODE_MAJOR} crashes CodeGraph mid-indexing)` : `Node ${support.major} is too old (CodeGraph requires >= ${CODEGRAPH_MIN_NODE_MAJOR})`;
  return `CodeGraph MCP skipped: ${detail}. Use Node ${CODEGRAPH_MIN_NODE_MAJOR}-${CODEGRAPH_BLOCKED_NODE_MAJOR - 1} (e.g. Node 22 LTS) or set ${CODEGRAPH_UNSAFE_NODE_ENV}=1 to override.
`;
}
function parseNodeMajor(version) {
  const normalized = version.startsWith("v") ? version.slice(1) : version;
  const major = Number.parseInt(normalized.split(".")[0] ?? "", 10);
  return Number.isNaN(major) ? 0 : major;
}

// ../../../../utils/src/codegraph/provision.ts
import { createHash, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { chmod, mkdir, readdir, readFile, rename, rm, rmdir, stat, writeFile } from "node:fs/promises";
import { existsSync as existsSync2 } from "node:fs";
import { homedir as homedir2, hostname } from "node:os";
import { basename, join as join3 } from "node:path";
import { promisify } from "node:util";
var DEFAULT_LOCK_WAIT_MS = 5000;
var DEFAULT_LOCK_STALE_MS = 120000;
var DEFAULT_DOWNLOAD_TIMEOUT_MS = 60000;
var execFileAsync = promisify(execFile);
function platformKey() {
  return `${process.platform}-${process.arch}`;
}
function markerPath(installDir, version) {
  return join3(installDir, ".provisioned", `codegraph-${version}.json`);
}
function defaultInstallDir() {
  return join3(homedir2(), ".omo", "codegraph");
}
function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
function isErrnoException(error) {
  return error instanceof Error && "code" in error;
}
async function removeEmptyDirectory(path) {
  try {
    await rmdir(path);
  } catch (error) {
    if (isErrnoException(error) && error.code === "ENOENT")
      return;
    if (isErrnoException(error) && error.code === "ENOTEMPTY")
      return;
    throw error;
  }
}
function sleep(ms) {
  return new Promise((resolve2) => setTimeout(resolve2, ms));
}
async function defaultDownloader(asset, timeoutMs = DEFAULT_DOWNLOAD_TIMEOUT_MS) {
  const response = await fetch(asset.url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!response.ok)
    throw new Error(`download failed with HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}
function forcedBadChecksumOptions(options) {
  if (options.forceBadChecksum !== true)
    return null;
  const key = options.platformKey ?? platformKey();
  return {
    downloader: async () => new TextEncoder().encode("checksum mismatch"),
    installDir: options.installDir ?? join3(options.lockDir, "codegraph-force-bad-checksum"),
    manifest: {
      assets: {
        [key]: { executableName: process.platform === "win32" ? "codegraph.cmd" : "codegraph", sha256: "0000", url: "memory://bad" }
      },
      version: options.version
    },
    platformKey: key
  };
}
async function readMarker(path, version) {
  if (!existsSync2(path))
    return null;
  try {
    const raw = JSON.parse(await readFile(path, "utf8"));
    if (typeof raw === "object" && raw !== null && "binPath" in raw && "version" in raw) {
      const binPath = raw.binPath;
      return raw.version === version && typeof binPath === "string" && existsSync2(binPath) ? binPath : null;
    }
    return null;
  } catch (error) {
    if (error instanceof Error)
      return null;
    throw error;
  }
}
async function acquireLock(lockPath, waitMs, staleMs) {
  const startedAt = Date.now();
  await mkdir(join3(lockPath, ".."), { recursive: true });
  while (Date.now() - startedAt <= waitMs) {
    try {
      await mkdir(lockPath);
      return () => rm(lockPath, { force: true, recursive: true });
    } catch (error) {
      if (!isErrnoException(error) || error.code !== "EEXIST")
        throw error;
      const lockStat = await stat(lockPath).catch(() => null);
      if (lockStat !== null && Date.now() - lockStat.mtimeMs > staleMs) {
        await rm(lockPath, { force: true, recursive: true });
        continue;
      }
      await sleep(25);
    }
  }
  return null;
}
async function extractTarGz(archivePath, destinationDir) {
  await execFileAsync("tar", ["-xzf", archivePath, "-C", destinationDir]);
}
async function installExtractedBundle(extractDir, installDir, executableName) {
  const roots = await readdir(extractDir);
  if (roots.length !== 1)
    throw new Error(`CodeGraph archive should contain one root directory, found ${roots.length}`);
  const bundleDir = join3(extractDir, roots[0] ?? "");
  const bundleEntries = await readdir(bundleDir);
  await mkdir(installDir, { recursive: true });
  for (const entry of bundleEntries) {
    await rm(join3(installDir, entry), { force: true, recursive: true });
    await rename(join3(bundleDir, entry), join3(installDir, entry));
  }
  const destination = join3(installDir, "bin", executableName);
  if (!existsSync2(destination))
    throw new Error(`CodeGraph archive did not contain bin/${executableName}`);
  await chmod(destination, 493);
  return destination;
}
async function installAsset(layout) {
  const { asset, downloader, installDir, version } = layout;
  const stagingDir = join3(installDir, ".staging", randomUUID());
  const archivePath = join3(stagingDir, basename(asset.url));
  const extractDir = join3(stagingDir, "extract");
  try {
    await mkdir(extractDir, { recursive: true });
    const bytes = await downloader(asset);
    const actualChecksum = sha256(bytes);
    if (actualChecksum !== asset.sha256) {
      throw new Error(`checksum mismatch for ${basename(asset.url)}: expected ${asset.sha256}, got ${actualChecksum}`);
    }
    if (!asset.url.endsWith(".tar.gz") && !asset.url.endsWith(".tgz")) {
      throw new Error(`unsupported CodeGraph archive type for ${basename(asset.url)}`);
    }
    await writeFile(archivePath, bytes);
    await extractTarGz(archivePath, extractDir);
    const destination = await installExtractedBundle(extractDir, installDir, asset.executableName);
    await mkdir(join3(installDir, ".provisioned"), { recursive: true });
    await writeFile(markerPath(installDir, version), `${JSON.stringify({ binPath: destination, version })}
`);
    return destination;
  } finally {
    await rm(stagingDir, { force: true, recursive: true });
    await removeEmptyDirectory(join3(installDir, ".staging"));
  }
}
async function ensureCodegraphProvisioned(options) {
  const forced = forcedBadChecksumOptions(options);
  const installDir = forced?.installDir ?? options.installDir ?? defaultInstallDir();
  const manifest = forced?.manifest ?? options.manifest ?? CODEGRAPH_PROVISION_MANIFEST;
  const activePlatformKey = forced?.platformKey ?? options.platformKey ?? platformKey();
  const downloader = forced?.downloader ?? options.downloader ?? ((asset) => defaultDownloader(asset, options.downloadTimeoutMs));
  const marker = markerPath(installDir, options.version);
  const existing = await readMarker(marker, options.version);
  if (existing !== null)
    return { binPath: existing, provisioned: true };
  const lockPath = join3(options.lockDir, `codegraph-${hostname()}.lock`);
  const release = await acquireLock(lockPath, options.lockWaitMs ?? DEFAULT_LOCK_WAIT_MS, options.lockStaleMs ?? DEFAULT_LOCK_STALE_MS);
  if (release === null)
    return { error: "timed out waiting for codegraph provisioning lock", provisioned: false };
  try {
    const lockedExisting = await readMarker(marker, options.version);
    if (lockedExisting !== null)
      return { binPath: lockedExisting, provisioned: true };
    if (manifest.version !== options.version) {
      return { error: `manifest version ${manifest.version} does not match requested ${options.version}`, provisioned: false };
    }
    const asset = manifest.assets[activePlatformKey];
    if (asset === undefined) {
      return { error: `no CodeGraph ${options.version} asset for ${activePlatformKey}`, provisioned: false };
    }
    const binPath = await installAsset({ asset, downloader, installDir, version: options.version });
    return { binPath, provisioned: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error), provisioned: false };
  } finally {
    await release();
  }
}

// ../../../../utils/src/codegraph/resolve.ts
import { existsSync as existsSync3 } from "node:fs";
import { homedir as homedir3 } from "node:os";
import { spawnSync } from "node:child_process";
import { basename as basename2, dirname, join as join5 } from "node:path";
import { createRequire } from "node:module";

// ../../../../utils/src/runtime/which.ts
import { accessSync, constants } from "node:fs";
import { delimiter, join as join4 } from "node:path";
var runtime = globalThis;
function isUnsafeCommandName(commandName) {
  if (commandName.includes("/") || commandName.includes("\\"))
    return true;
  if (commandName === "." || commandName === ".." || commandName.includes(".."))
    return true;
  if (/^[a-zA-Z]:/.test(commandName))
    return true;
  if (commandName.includes("\x00"))
    return true;
  return false;
}
function isExecutable(filePath) {
  try {
    accessSync(filePath, process.platform === "win32" ? constants.F_OK : constants.X_OK);
    return true;
  } catch (error) {
    if (!(error instanceof Error) && Object.prototype.toString.call(error) !== "[object Error]") {
      throw error;
    }
    return false;
  }
}
function resolvePathValue() {
  if (process.platform === "win32")
    return process.env["Path"] ?? process.env["PATH"];
  return process.env["PATH"];
}
function getWindowsCandidates(commandName) {
  if (process.platform !== "win32")
    return [commandName];
  if (/\.[^\\/]+$/.test(commandName))
    return [commandName];
  return [commandName, `${commandName}.exe`, `${commandName}.cmd`, `${commandName}.bat`, `${commandName}.com`];
}
function bunWhich(commandName) {
  if (!commandName)
    return null;
  if (isUnsafeCommandName(commandName))
    return null;
  const candidateNames = getWindowsCandidates(commandName);
  for (const candidateName of candidateNames) {
    const resolvedPath = runtime.Bun?.which(candidateName) ?? null;
    if (resolvedPath !== null)
      return resolvedPath;
  }
  const pathValue = resolvePathValue();
  if (!pathValue)
    return null;
  const pathEntries = pathValue.split(delimiter).filter((pathEntry) => pathEntry.length > 0);
  if (pathEntries.length === 0)
    return null;
  for (const pathEntry of pathEntries) {
    for (const candidateName of candidateNames) {
      const candidatePath = join4(pathEntry, candidateName);
      if (isExecutable(candidatePath))
        return candidatePath;
    }
  }
  return null;
}

// ../../../../utils/src/codegraph/resolve.ts
function codegraphCommandRequiresSupportedLocalNode(resolution) {
  return resolution.source !== "bundled" && resolution.source !== "env" && resolution.source !== "provisioned";
}
var CODEGRAPH_PACKAGE = "@colbymchenry/codegraph";
var CODEGRAPH_ENV_BIN = "OMO_CODEGRAPH_BIN";
var CODEGRAPH_LEGACY_ENV_BIN = "CODEGRAPH_BIN";
var CODEGRAPH_NODE_CANDIDATES = ["node24", "node22", "node20", "node"];
var CODEGRAPH_NODE_PATH_CANDIDATES = [
  "/opt/homebrew/opt/node@24/bin/node",
  "/opt/homebrew/opt/node@22/bin/node",
  "/opt/homebrew/opt/node@20/bin/node",
  "/usr/local/opt/node@24/bin/node",
  "/usr/local/opt/node@22/bin/node",
  "/usr/local/opt/node@20/bin/node"
];
var requireFromHere = createRequire(import.meta.url);
function defaultRequireResolve(specifier) {
  return requireFromHere.resolve(specifier);
}
function defaultNodeVersion(nodePath) {
  if (nodePath === process.execPath && isNodeExecutableName(nodePath))
    return process.versions.node;
  try {
    const result = spawnSync(nodePath, ["--version"], {
      encoding: "utf8",
      timeout: 2000,
      windowsHide: true
    });
    if (result.error !== undefined || result.status !== 0)
      return null;
    const version = `${result.stdout}
${result.stderr}`.trim().split(/\s+/)[0];
    return version === undefined || version.length === 0 ? null : version;
  } catch (error) {
    if (error instanceof Error)
      return null;
    throw error;
  }
}
function isNodeExecutableName(filePath) {
  const executable = basename2(filePath).toLowerCase();
  return executable === "node" || executable === "node.exe" || /^node\d+(\.exe)?$/.test(executable);
}
function looksLikePath(command) {
  return command.includes("/") || command.includes("\\") || /^[a-zA-Z]:/.test(command);
}
function resolveConfiguredNodeRuntime(configured, fileExists, which) {
  if (looksLikePath(configured))
    return fileExists(configured) ? configured : null;
  return which(configured);
}
function supportsCodegraphNodeRuntime(nodePath, env, nodeVersion) {
  const version = nodeVersion(nodePath);
  if (version === null)
    return false;
  return evaluateCodegraphNodeSupport({ env, nodeVersion: version }).supported;
}
function defaultNodeRuntime(env, fileExists, which, nodeVersion) {
  const configured = env[CODEGRAPH_NODE_BIN_ENV]?.trim();
  if (configured !== undefined && configured.length > 0) {
    const resolved = resolveConfiguredNodeRuntime(configured, fileExists, which);
    return resolved !== null && supportsCodegraphNodeRuntime(resolved, env, nodeVersion) ? resolved : null;
  }
  const candidates = [
    ...isNodeExecutableName(process.execPath) ? [process.execPath] : [],
    ...CODEGRAPH_NODE_CANDIDATES.map((commandName) => which(commandName)).filter((candidate) => candidate !== null),
    ...CODEGRAPH_NODE_PATH_CANDIDATES.filter((candidate) => fileExists(candidate))
  ];
  const seen = new Set;
  for (const candidate of candidates) {
    if (seen.has(candidate))
      continue;
    seen.add(candidate);
    if (supportsCodegraphNodeRuntime(candidate, env, nodeVersion))
      return candidate;
  }
  return null;
}
function defaultProvisionedBin(homeDir, fileExists) {
  return resolvePinnedCodegraphBin(join5(homeDir, ".omo", "codegraph"), { fileExists });
}
function resolveBundledShim(requireResolve, fileExists) {
  try {
    const packageJson = requireResolve(`${CODEGRAPH_PACKAGE}/package.json`);
    const packageRoot = dirname(packageJson);
    const candidates = [join5(packageRoot, "bin", "codegraph.js"), join5(packageRoot, "npm-shim.js")];
    return candidates.find((candidate) => fileExists(candidate)) ?? null;
  } catch (error) {
    if (error instanceof Error)
      return null;
    if (error === null || error === undefined)
      return null;
    if (typeof error === "object" || typeof error === "string" || typeof error === "number")
      return null;
    if (typeof error === "boolean" || typeof error === "bigint" || typeof error === "symbol")
      return null;
    return null;
  }
}
function resolveCodegraphCommand(options = {}) {
  const env = options.env ?? process.env;
  const fileExists = options.fileExists ?? existsSync3;
  const configuredBin = env[CODEGRAPH_ENV_BIN]?.trim() || env[CODEGRAPH_LEGACY_ENV_BIN]?.trim();
  if (configuredBin !== undefined && configuredBin.length > 0) {
    return { argsPrefix: [], command: configuredBin, exists: fileExists(configuredBin), source: "env" };
  }
  const which = options.which ?? bunWhich;
  const nodeRuntime = options.nodeRuntime ?? (() => defaultNodeRuntime(env, fileExists, which, options.nodeVersion ?? defaultNodeVersion));
  const bundled = resolveBundledShim(options.requireResolve ?? defaultRequireResolve, fileExists);
  const runtime2 = nodeRuntime();
  if (bundled !== null && runtime2 !== null) {
    return { argsPrefix: [bundled], command: runtime2, exists: true, source: "bundled" };
  }
  const provisioned = options.provisioned?.() ?? defaultProvisionedBin(options.homeDir ?? homedir3(), fileExists);
  if (provisioned !== null && fileExists(provisioned)) {
    return { argsPrefix: [], command: provisioned, exists: true, source: "provisioned" };
  }
  const pathCommand = which("codegraph");
  return {
    argsPrefix: [],
    command: pathCommand ?? "codegraph",
    exists: pathCommand !== null,
    source: "path"
  };
}

// ../../../../utils/src/codegraph/exclusion.ts
import { realpathSync } from "node:fs";
import { homedir as homedir4, tmpdir as osTmpdir } from "node:os";
import { isAbsolute, join as join6, resolve as resolve2 } from "node:path";
var POSIX_DEFAULT_EXCLUDED_ROOTS = ["/tmp", "/private/tmp"];
function expandHome(path, homeDir) {
  if (path === "~")
    return homeDir;
  if (path.startsWith("~/") || path.startsWith("~\\"))
    return join6(homeDir, path.slice(2));
  return path;
}
function realpathIfPossible(path) {
  try {
    return realpathSync(path);
  } catch (error) {
    if (error instanceof Error)
      return resolve2(path);
    throw error;
  }
}
function resolveConfiguredRoot(path, homeDir) {
  const expanded = expandHome(path, homeDir);
  return realpathIfPossible(isAbsolute(expanded) ? expanded : join6(homeDir, expanded));
}
function normalizeForComparison(path, platform) {
  const normalized = path.replaceAll("\\", "/").replace(/\/+$/, "");
  return platform === "win32" ? normalized.toLowerCase() : normalized;
}
function pathIsWithin(path, root, platform) {
  const candidate = normalizeForComparison(path, platform);
  const normalizedRoot = normalizeForComparison(root, platform);
  return candidate === normalizedRoot || candidate.startsWith(`${normalizedRoot}/`);
}
function hasOmoPathSegment(path) {
  return path.split(/[\\/]+/).includes(".omo");
}
function defaultExcludedRoots(platform, tmpdir) {
  return platform === "win32" ? [tmpdir] : [...POSIX_DEFAULT_EXCLUDED_ROOTS, tmpdir];
}
function shouldExcludeCodegraphProject(workspace, options = {}) {
  const platform = options.platform ?? process.platform;
  const homeDir = options.homeDir ?? homedir4();
  const tmpdir = options.tmpdir ?? osTmpdir();
  const resolvedWorkspace = realpathIfPossible(resolve2(workspace));
  if (hasOmoPathSegment(resolvedWorkspace)) {
    return { excluded: true, matchedRoot: ".omo", reason: "omo-state" };
  }
  for (const root of defaultExcludedRoots(platform, tmpdir)) {
    const resolvedRoot = realpathIfPossible(resolve2(root));
    if (pathIsWithin(resolvedWorkspace, resolvedRoot, platform)) {
      return { excluded: true, matchedRoot: root, reason: "tmp-root" };
    }
  }
  for (const root of options.excludedRoots ?? []) {
    const trimmedRoot = root.trim();
    if (trimmedRoot.length === 0)
      continue;
    const resolvedRoot = resolveConfiguredRoot(trimmedRoot, homeDir);
    if (pathIsWithin(resolvedWorkspace, resolvedRoot, platform)) {
      return { excluded: true, matchedRoot: root, reason: "custom-root" };
    }
  }
  return { excluded: false };
}
// ../../shared/src/config-loader.ts
import { homedir as homedir5 } from "node:os";

// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/util.js
var exports_util = {};
__export(exports_util, {
  BIGINT_FORMAT_RANGES: () => BIGINT_FORMAT_RANGES,
  CONSTANT_CATCH: () => CONSTANT_CATCH,
  Class: () => Class,
  NUMBER_FORMAT_RANGES: () => NUMBER_FORMAT_RANGES,
  aborted: () => aborted,
  allowsEval: () => allowsEval,
  assert: () => assert,
  assertEqual: () => assertEqual,
  assertIs: () => assertIs,
  assertNever: () => assertNever,
  assertNotEqual: () => assertNotEqual,
  assignProp: () => assignProp,
  attachSchema: () => attachSchema,
  base64ToUint8Array: () => base64ToUint8Array,
  base64urlToUint8Array: () => base64urlToUint8Array,
  cached: () => cached,
  captureStackTrace: () => captureStackTrace,
  cleanEnum: () => cleanEnum,
  cleanRegex: () => cleanRegex,
  clone: () => clone,
  cloneDef: () => cloneDef,
  codePointLength: () => codePointLength,
  constantCatch: () => constantCatch,
  createTransparentProxy: () => createTransparentProxy,
  defineLazy: () => defineLazy,
  defineLazyInternal: () => defineLazyInternal,
  esc: () => esc,
  escapeRegex: () => escapeRegex,
  explicitlyAborted: () => explicitlyAborted,
  extend: () => extend,
  finalizeIssue: () => finalizeIssue,
  floatSafeRemainder: () => floatSafeRemainder,
  getElementAtPath: () => getElementAtPath,
  getEnumValues: () => getEnumValues,
  getLengthableOrigin: () => getLengthableOrigin,
  getParsedType: () => getParsedType,
  getSizableOrigin: () => getSizableOrigin,
  hexToUint8Array: () => hexToUint8Array,
  hide: () => hide,
  installLazyProp: () => installLazyProp,
  isObject: () => isObject,
  isPlainObject: () => isPlainObject,
  issue: () => issue,
  joinValues: () => joinValues,
  jsonStringifyReplacer: () => jsonStringifyReplacer,
  members: () => members,
  merge: () => merge,
  mergeDefs: () => mergeDefs,
  normalizeParams: () => normalizeParams,
  nullish: () => nullish,
  numKeys: () => numKeys,
  objectClone: () => objectClone,
  omit: () => omit,
  optionalKeys: () => optionalKeys,
  own: () => own,
  parsedType: () => parsedType,
  partial: () => partial,
  pick: () => pick,
  prefixIssues: () => prefixIssues,
  primitiveTypes: () => primitiveTypes,
  promiseAllObject: () => promiseAllObject,
  propertyKeyTypes: () => propertyKeyTypes,
  randomString: () => randomString,
  required: () => required,
  safeExtend: () => safeExtend,
  shallowClone: () => shallowClone,
  slugify: () => slugify,
  stringifyPrimitive: () => stringifyPrimitive,
  toZod: () => toZod,
  uint8ArrayToBase64: () => uint8ArrayToBase64,
  uint8ArrayToBase64url: () => uint8ArrayToBase64url,
  uint8ArrayToHex: () => uint8ArrayToHex,
  unwrapMessage: () => unwrapMessage
});
function assertEqual(val) {
  return val;
}
function assertNotEqual(val) {
  return val;
}
function toZod() {
  return (schema) => schema;
}
function assertIs(_arg) {}
function assertNever(_x) {
  throw new Error("Unexpected value in exhaustive check");
}
function assert(_) {}
function getEnumValues(entries) {
  const numericValues = Object.values(entries).filter((v) => typeof v === "number");
  const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
  return values;
}
function joinValues(array, separator = "|") {
  return array.map((val) => stringifyPrimitive(val)).join(separator);
}
function jsonStringifyReplacer(_, value) {
  if (typeof value === "bigint")
    return value.toString();
  return value;
}
function cached(getter) {
  const set = false;
  return {
    get value() {
      if (!set) {
        const value = getter();
        Object.defineProperty(this, "value", { value });
        return value;
      }
      throw new Error("cached value already set");
    }
  };
}
function nullish(input) {
  return input === null || input === undefined;
}
function cleanRegex(source) {
  const start = source.startsWith("^") ? 1 : 0;
  const end = source.endsWith("$") ? source.length - 1 : source.length;
  return source.slice(start, end);
}
function floatSafeRemainder(val, step) {
  const ratio = val / step;
  const roundedRatio = Math.round(ratio);
  const tolerance = 4 * Number.EPSILON * Math.max(Math.abs(ratio), 1);
  if (Math.abs(ratio - roundedRatio) < tolerance)
    return 0;
  return ratio - roundedRatio;
}
var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
function defineLazy(object, key, getter) {
  let value = undefined;
  Object.defineProperty(object, key, {
    get() {
      if (value === EVALUATING) {
        return;
      }
      if (value === undefined) {
        value = EVALUATING;
        value = getter();
      }
      return value;
    },
    set(v) {
      Object.defineProperty(object, key, {
        value: v
      });
    },
    configurable: true
  });
}
function objectClone(obj) {
  return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj));
}
function assignProp(target, prop, value) {
  Object.defineProperty(target, prop, {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  });
}
function mergeDefs(...defs) {
  const mergedDescriptors = {};
  for (const def of defs) {
    const descriptors = Object.getOwnPropertyDescriptors(def);
    Object.assign(mergedDescriptors, descriptors);
  }
  return Object.defineProperties({}, mergedDescriptors);
}
function cloneDef(schema) {
  return mergeDefs(schema._zod.def);
}
function getElementAtPath(obj, path) {
  if (!path)
    return obj;
  return path.reduce((acc, key) => acc?.[key], obj);
}
function promiseAllObject(promisesObj) {
  const keys = Object.keys(promisesObj);
  const promises = keys.map((key) => promisesObj[key]);
  return Promise.all(promises).then((results) => {
    const resolvedObj = {};
    for (let i = 0;i < keys.length; i++) {
      resolvedObj[keys[i]] = results[i];
    }
    return resolvedObj;
  });
}
function randomString(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let str = "";
  for (let i = 0;i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}
function esc(str) {
  return JSON.stringify(str);
}
function slugify(input) {
  return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
function isObject(data) {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}
var allowsEval = /* @__PURE__ */ cached(() => {
  if (globalConfig.jitless) {
    return false;
  }
  if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
    return false;
  }
  try {
    const F = Function;
    new F("");
    return true;
  } catch (_) {
    return false;
  }
});
function isPlainObject(o) {
  if (isObject(o) === false)
    return false;
  const ctor = o.constructor;
  if (ctor === undefined)
    return true;
  if (typeof ctor !== "function")
    return true;
  const prot = ctor.prototype;
  if (isObject(prot) === false)
    return false;
  if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
    return false;
  }
  return true;
}
function shallowClone(o) {
  if (isPlainObject(o))
    return { ...o };
  if (Array.isArray(o))
    return [...o];
  if (o instanceof Map)
    return new Map(o);
  if (o instanceof Set)
    return new Set(o);
  return o;
}
function numKeys(data) {
  let keyCount = 0;
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      keyCount++;
    }
  }
  return keyCount;
}
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return "undefined";
    case "string":
      return "string";
    case "number":
      return Number.isNaN(data) ? "nan" : "number";
    case "boolean":
      return "boolean";
    case "function":
      return "function";
    case "bigint":
      return "bigint";
    case "symbol":
      return "symbol";
    case "object":
      if (Array.isArray(data)) {
        return "array";
      }
      if (data === null) {
        return "null";
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return "promise";
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return "map";
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return "set";
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return "date";
      }
      if (typeof File !== "undefined" && data instanceof File) {
        return "file";
      }
      return "object";
    default:
      throw new Error(`Unknown data type: ${t}`);
  }
};
var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
var primitiveTypes = /* @__PURE__ */ new Set([
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
  "undefined"
]);
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function clone(inst, def, params) {
  const cl = new inst._zod.constr(def ?? inst._zod.def);
  if (!def || params?.parent)
    cl._zod.parent = inst;
  return cl;
}
function normalizeParams(_params) {
  const params = _params;
  if (!params)
    return {};
  if (typeof params === "string")
    return { error: () => params };
  if (params?.message !== undefined) {
    if (params?.error !== undefined)
      throw new Error("Cannot specify both `message` and `error` params");
    params.error = params.message;
  }
  delete params.message;
  if (typeof params.error === "string")
    return { ...params, error: () => params.error };
  return params;
}
function createTransparentProxy(getter) {
  let target;
  return new Proxy({}, {
    get(_, prop, receiver) {
      target ?? (target = getter());
      return Reflect.get(target, prop, receiver);
    },
    set(_, prop, value, receiver) {
      target ?? (target = getter());
      return Reflect.set(target, prop, value, receiver);
    },
    has(_, prop) {
      target ?? (target = getter());
      return Reflect.has(target, prop);
    },
    deleteProperty(_, prop) {
      target ?? (target = getter());
      return Reflect.deleteProperty(target, prop);
    },
    ownKeys(_) {
      target ?? (target = getter());
      return Reflect.ownKeys(target);
    },
    getOwnPropertyDescriptor(_, prop) {
      target ?? (target = getter());
      return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    defineProperty(_, prop, descriptor) {
      target ?? (target = getter());
      return Reflect.defineProperty(target, prop, descriptor);
    }
  });
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint")
    return value.toString() + "n";
  if (typeof value === "string")
    return `"${value}"`;
  return `${value}`;
}
function optionalKeys(shape) {
  return Object.keys(shape).filter((k) => {
    return shape[k]._zod.optin !== undefined && shape[k]._zod.optout === "optional";
  });
}
var NUMBER_FORMAT_RANGES = /* @__PURE__ */ (() => ({
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-340282346638528860000000000000000000000, 340282346638528860000000000000000000000],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}))();
var BIGINT_FORMAT_RANGES = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function pick(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = {};
      for (const key of Reflect.ownKeys(mask)) {
        if (!Object.prototype.hasOwnProperty.call(currDef.shape, key)) {
          throw new Error(`Unrecognized key: "${String(key)}"`);
        }
        if (!mask[key])
          continue;
        assignProp(newShape, key, currDef.shape[key]);
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function omit(schema, mask) {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const newShape = { ...schema._zod.def.shape };
      for (const key of Reflect.ownKeys(mask)) {
        if (!Object.prototype.hasOwnProperty.call(currDef.shape, key)) {
          throw new Error(`Unrecognized key: "${String(key)}"`);
        }
        if (!mask[key])
          continue;
        delete newShape[key];
      }
      assignProp(this, "shape", newShape);
      return newShape;
    },
    checks: []
  });
  return clone(schema, def);
}
function extend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to extend: expected a plain object");
  }
  const checks = schema._zod.def.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    const existingShape = schema._zod.def.shape;
    for (const key of Reflect.ownKeys(shape)) {
      if (Object.getOwnPropertyDescriptor(existingShape, key) !== undefined) {
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
      }
    }
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function safeExtend(schema, shape) {
  if (!isPlainObject(shape)) {
    throw new Error("Invalid input to safeExtend: expected a plain object");
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const _shape = { ...schema._zod.def.shape, ...shape };
      assignProp(this, "shape", _shape);
      return _shape;
    }
  });
  return clone(schema, def);
}
function merge(a, b) {
  if (!b?._zod?.def) {
    throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  }
  if (a._zod.def.checks?.length) {
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  }
  const def = mergeDefs(a._zod.def, {
    get shape() {
      const _shape = { ...a._zod.def.shape, ...b._zod.def.shape };
      assignProp(this, "shape", _shape);
      return _shape;
    },
    get catchall() {
      return b._zod.def.catchall;
    },
    checks: b._zod.def.checks ?? []
  });
  return clone(a, def);
}
function partial(Class, schema, mask, name = "partial") {
  const currDef = schema._zod.def;
  const checks = currDef.checks;
  const hasChecks = checks && checks.length > 0;
  if (hasChecks) {
    throw new Error(`.${name}() cannot be used on object schemas containing refinements`);
  }
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key of Reflect.ownKeys(mask)) {
          if (!Object.prototype.hasOwnProperty.call(oldShape, key)) {
            throw new Error(`Unrecognized key: "${String(key)}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = Class ? new Class({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      } else {
        for (const key of Reflect.ownKeys(oldShape)) {
          shape[key] = Class ? new Class({
            type: "optional",
            innerType: oldShape[key]
          }) : oldShape[key];
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    },
    checks: []
  });
  return clone(schema, def);
}
function required(Class, schema, mask) {
  const def = mergeDefs(schema._zod.def, {
    get shape() {
      const oldShape = schema._zod.def.shape;
      const shape = { ...oldShape };
      if (mask) {
        for (const key of Reflect.ownKeys(mask)) {
          if (!Object.prototype.hasOwnProperty.call(shape, key)) {
            throw new Error(`Unrecognized key: "${String(key)}"`);
          }
          if (!mask[key])
            continue;
          shape[key] = new Class({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      } else {
        for (const key of Reflect.ownKeys(oldShape)) {
          shape[key] = new Class({
            type: "nonoptional",
            innerType: oldShape[key]
          });
        }
      }
      assignProp(this, "shape", shape);
      return shape;
    }
  });
  return clone(schema, def);
}
function aborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue !== true) {
      return true;
    }
  }
  return false;
}
function explicitlyAborted(x, startIndex = 0) {
  if (x.aborted === true)
    return true;
  for (let i = startIndex;i < x.issues.length; i++) {
    if (x.issues[i]?.continue === false) {
      return true;
    }
  }
  return false;
}
function prefixIssues(path, issues) {
  return issues.map((iss) => {
    var _a;
    (_a = iss).path ?? (_a.path = []);
    iss.path.unshift(path);
    return iss;
  });
}
function unwrapMessage(message) {
  return typeof message === "string" ? message : message?.message;
}
function attachSchema(issues, start, inst) {
  var _a;
  for (let i = start;i < issues.length; i++) {
    (_a = issues[i]).schema ?? (_a.schema = inst);
  }
}
function finalizeIssue(iss, ctx, config) {
  var _a;
  const traits = iss.inst?._zod?.traits;
  if (traits?.has("$ZodType")) {
    if (traits.has("$ZodCheck"))
      (_a = iss).schema ?? (_a.schema = iss.inst);
    else
      iss.schema = iss.inst;
  }
  const schemaError = iss.schema !== iss.inst ? iss.schema?._zod.def?.error : undefined;
  const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(schemaError?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
  const { inst: _inst, schema: _schema, continue: _continue, input: _input, ...rest } = iss;
  rest.path ?? (rest.path = []);
  rest.message = message;
  if (ctx?.reportInput) {
    rest.input = _input;
  }
  return rest;
}
function getSizableOrigin(input) {
  if (input instanceof Set)
    return "set";
  if (input instanceof Map)
    return "map";
  if (input instanceof File)
    return "file";
  return "unknown";
}
var highSurrogate = /[\uD800-\uDBFF]/;
function codePointLength(str) {
  const units = str.length;
  if (!highSurrogate.test(str))
    return units;
  let count = units;
  for (let i = 0;i < units - 1; i++) {
    if ((str.charCodeAt(i) & 64512) === 55296 && (str.charCodeAt(i + 1) & 64512) === 56320) {
      count--;
      i++;
    }
  }
  return count;
}
function getLengthableOrigin(input) {
  if (Array.isArray(input))
    return "array";
  if (typeof input === "string")
    return "string";
  return "unknown";
}
function parsedType(data) {
  const t = typeof data;
  switch (t) {
    case "number": {
      return Number.isNaN(data) ? "nan" : "number";
    }
    case "object": {
      if (data === null) {
        return "null";
      }
      if (Array.isArray(data)) {
        return "array";
      }
      const obj = data;
      if (obj && Object.getPrototypeOf(obj) !== Object.prototype && "constructor" in obj && obj.constructor) {
        return obj.constructor.name;
      }
    }
  }
  return t;
}
function issue(...args) {
  const [iss, input, inst] = args;
  if (typeof iss === "string") {
    return {
      message: iss,
      code: "custom",
      input,
      inst
    };
  }
  return { ...iss };
}
function cleanEnum(obj) {
  return Object.entries(obj).filter(([k, _]) => {
    return Number.isNaN(Number.parseInt(k, 10));
  }).map((el) => el[1]);
}
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0;i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
function uint8ArrayToBase64(bytes) {
  let binaryString = "";
  for (let i = 0;i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  return btoa(binaryString);
}
function base64urlToUint8Array(base64url) {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - base64.length % 4) % 4);
  return base64ToUint8Array(base64 + padding);
}
function uint8ArrayToBase64url(bytes) {
  return uint8ArrayToBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function hexToUint8Array(hex) {
  const cleanHex = hex.replace(/^0x/, "");
  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0;i < cleanHex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(cleanHex.slice(i, i + 2), 16);
  }
  return bytes;
}
function uint8ArrayToHex(bytes) {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

class Class {
  constructor(..._args) {}
}
function members(proto, table) {
  for (const key in table) {
    const desc = Object.getOwnPropertyDescriptor(table, key);
    if (desc.get)
      Object.defineProperty(proto, key, { ...desc, enumerable: false });
    else
      defineBound(proto, key, desc.value);
  }
}
function own(inst, key, value, enumerable = true) {
  Object.defineProperty(inst, key, { configurable: true, writable: true, enumerable, value });
  return value;
}
function hide(inst, key, value) {
  return own(inst, key, value, false);
}
function defineBound(proto, key, fn) {
  Object.defineProperty(proto, key, {
    configurable: true,
    get() {
      return this == null ? fn : own(this, key, fn.bind(this));
    },
    set(value) {
      own(this, key, value);
    }
  });
}
function claim(inst, sentinel) {
  const proto = Object.getPrototypeOf(inst);
  return sentinel in proto ? undefined : proto;
}
var installing;
var broke = false;
var breaker = {
  configurable: true,
  get() {
    broke = true;
    return;
  }
};
function defineLazyInternal(inst, key, compute) {
  const proto = Object.getPrototypeOf(inst._zod);
  if (key in proto && installing !== inst._zod) {
    installing = undefined;
    return;
  }
  installing = inst._zod;
  Object.defineProperty(proto, key, {
    configurable: true,
    get() {
      Object.defineProperty(this, key, breaker);
      const outer = broke;
      broke = false;
      try {
        const value = compute(this);
        if (broke)
          delete this[key];
        else
          Object.defineProperty(this, key, { configurable: true, writable: true, value });
        broke = broke || outer;
        return value;
      } catch (err) {
        delete this[key];
        broke = broke || outer;
        throw err;
      }
    },
    set(value) {
      Object.defineProperty(this, key, { configurable: true, writable: true, value });
    }
  });
}
function installLazyProp(inst, key, make, enumerable) {
  const proto = claim(inst, key);
  if (!proto)
    return;
  Object.defineProperty(proto, key, {
    configurable: true,
    get() {
      const desc = { configurable: true, writable: true, enumerable, value: undefined };
      Object.defineProperty(this, key, desc);
      desc.value = make(this);
      Object.defineProperty(this, key, desc);
      return desc.value;
    },
    set(value) {
      Object.defineProperty(this, key, { configurable: true, writable: true, enumerable, value });
    }
  });
}
var CONSTANT_CATCH = "~constantCatch";
function constantCatch(value) {
  const fn = () => value;
  fn[CONSTANT_CATCH] = true;
  return fn;
}

// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/core.js
var _a;
var _zodDesc = { value: undefined, enumerable: false };
var _E = "captureStackTrace" in Error ? Error : null;
function newError(Definition) {
  const E = _E;
  if (E) {
    const saved = E.stackTraceLimit;
    if (typeof saved === "number") {
      try {
        E.stackTraceLimit = 0;
      } catch {
        _E = null;
        return new Definition;
      }
      try {
        return new Definition;
      } finally {
        E.stackTraceLimit = saved;
      }
    }
  }
  return new Definition;
}
function $constructor(name, initializer, proto, params) {
  const zodProto = {};
  function Internals(def) {
    this.def = def;
    this.constr = _;
    this.traits = new Set;
  }
  Internals.prototype = zodProto;
  const protoMembers = proto;
  const initialized = protoMembers && new WeakSet;
  function init(inst, def) {
    if (!inst._zod) {
      _zodDesc.value = new Internals(def);
      try {
        Object.defineProperty(inst, "_zod", _zodDesc);
      } finally {
        _zodDesc.value = undefined;
      }
    }
    if (inst._zod.traits.has(name)) {
      return;
    }
    inst._zod.traits.add(name);
    initializer(inst, def);
    if (initialized) {
      const own2 = Object.getPrototypeOf(inst);
      const ctorProto = inst._zod.constr.prototype;
      let up = own2;
      while (up && up !== ctorProto)
        up = Object.getPrototypeOf(up);
      const target = up ?? own2;
      if (!initialized.has(target)) {
        initialized.add(target);
        members(target, protoMembers);
      }
    }
    const proto2 = _.prototype;
    for (const k in proto2) {
      if (!Object.prototype.hasOwnProperty.call(proto2, k))
        continue;
      if (!(k in inst)) {
        inst[k] = proto2[k].bind(inst);
      }
    }
  }
  const Parent = params?.Parent ?? Object;

  class Definition extends Parent {
  }
  Object.defineProperty(Definition, "name", { value: name });
  function _(def) {
    const inst = params?.Parent ? newError(Definition) : this;
    init(inst, def);
    const deferred = inst._zod.deferred;
    if (deferred) {
      for (const fn of deferred) {
        fn();
      }
      inst._zod.deferred = undefined;
    }
    const pp = globalThis.__zod_globalConfig?.postProcessor;
    if (pp)
      pp(inst);
    return inst;
  }
  Object.defineProperty(_, "init", { value: init });
  Object.defineProperty(_, Symbol.hasInstance, {
    value: (inst) => {
      if (params?.Parent && inst instanceof params.Parent)
        return true;
      return inst?._zod?.traits?.has(name);
    }
  });
  Object.defineProperty(_, "name", { value: name });
  return _;
}
class $ZodAsyncError extends Error {
  constructor() {
    super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
  }
}

class $ZodEncodeError extends Error {
  constructor(name) {
    super(`Encountered unidirectional transform during encode: ${name}`);
    this.name = "ZodEncodeError";
  }
}
(_a = globalThis).__zod_globalConfig ?? (_a.__zod_globalConfig = {});
var globalConfig = globalThis.__zod_globalConfig;
function config(newConfig) {
  if (newConfig)
    Object.assign(globalConfig, newConfig);
  return globalConfig;
}
// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/errors.js
function _getMessage() {
  const internals = this._zod;
  internals.message ?? (internals.message = JSON.stringify(internals.def, jsonStringifyReplacer, 2));
  return internals.message;
}
function _setMessage(value) {
  this._zod.message = value;
}
var _messageDesc = {
  get: _getMessage,
  set: _setMessage,
  enumerable: true,
  configurable: true
};
var _zodDesc2 = { value: undefined, enumerable: false };
var _issuesDesc = { value: undefined, enumerable: false };
var _installedToString = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
var initializer = (inst, def) => {
  inst.name = "$ZodError";
  _zodDesc2.value = inst._zod;
  Object.defineProperty(inst, "_zod", _zodDesc2);
  _issuesDesc.value = def;
  Object.defineProperty(inst, "issues", _issuesDesc);
  _zodDesc2.value = undefined;
  _issuesDesc.value = undefined;
  Object.defineProperty(inst, "message", _messageDesc);
  const proto = Object.getPrototypeOf(inst);
  if (!_installedToString.has(proto)) {
    _installedToString.add(proto);
    Object.defineProperty(proto, "toString", {
      configurable: true,
      enumerable: false,
      get() {
        const value = () => this.message;
        Object.defineProperty(this, "toString", { value, configurable: true, writable: true });
        return value;
      },
      set(value) {
        Object.defineProperty(this, "toString", { value, configurable: true, writable: true });
      }
    });
  }
};
var $ZodError = $constructor("$ZodError", initializer);
var $ZodRealError = $constructor("$ZodError", initializer, undefined, {
  Parent: Error
});
function node(obj, key, make) {
  if (!Object.prototype.hasOwnProperty.call(obj, key)) {
    if (key === "__proto__") {
      Object.defineProperty(obj, key, { value: make(), writable: true, enumerable: true, configurable: true });
    } else {
      obj[key] = make();
    }
  }
  return obj[key];
}
function flattenError(error, mapper = (issue2) => issue2.message) {
  const fieldErrors = {};
  const formErrors = [];
  for (const sub of error.issues) {
    if (sub.path.length > 0) {
      node(fieldErrors, sub.path[0], () => []).push(mapper(sub));
    } else {
      formErrors.push(mapper(sub));
    }
  }
  return { formErrors, fieldErrors };
}
function formatError(error, mapper = (issue2) => issue2.message) {
  const fieldErrors = { _errors: [] };
  const processError = (error2, path = []) => {
    for (const issue2 of error2.issues) {
      if (issue2.code === "invalid_union" && issue2.errors.length) {
        issue2.errors.map((issues) => processError({ issues }, [...path, ...issue2.path]));
      } else if (issue2.code === "invalid_key") {
        processError({ issues: issue2.issues }, [...path, ...issue2.path]);
      } else if (issue2.code === "invalid_element") {
        processError({ issues: issue2.issues }, [...path, ...issue2.path]);
      } else {
        const fullpath = [...path, ...issue2.path];
        if (fullpath.length === 0) {
          fieldErrors._errors.push(mapper(issue2));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < fullpath.length) {
            const el = fullpath[i];
            const terminal = i === fullpath.length - 1;
            if (el === "_errors") {
              if (terminal)
                curr._errors.push(mapper(issue2));
              i++;
              continue;
            }
            if (!Object.prototype.hasOwnProperty.call(curr, el)) {
              Object.defineProperty(curr, el, {
                value: { _errors: [] },
                enumerable: true,
                writable: true,
                configurable: true
              });
            }
            const node2 = curr[el];
            if (terminal) {
              node2._errors.push(mapper(issue2));
            }
            curr = node2;
            i++;
          }
        }
      }
    }
  };
  processError(error);
  return fieldErrors;
}

// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/parse.js
function finalizeParams(callee, params) {
  return { callee: params?.callee ?? callee, Err: params?.Err };
}
var _parse = (_Err) => {
  const fn = (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
      throw new $ZodAsyncError;
    }
    if (result.issues.length) {
      const e = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e, _params?.callee ?? fn);
      throw e;
    }
    return result.value;
  };
  return fn;
};
var _parseAsync = (_Err) => {
  const fn = async (schema, value, _ctx, params) => {
    const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
      result = await result;
    if (result.issues.length) {
      const e = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e, params?.callee ?? fn);
      throw e;
    }
    return result.value;
  };
  return fn;
};
var _safeParse = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
  const result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise) {
    throw new $ZodAsyncError;
  }
  return result.issues.length ? {
    success: false,
    error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, async: true } : { async: true };
  let result = schema._zod.run({ value, issues: [] }, ctx);
  if (result instanceof Promise)
    result = await result;
  return result.issues.length ? {
    success: false,
    error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  } : { success: true, data: result.value };
};
var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);
var _encode = (_Err) => {
  const parse = _parse(_Err);
  const fn = (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return parse(schema, value, ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _decode = (_Err) => {
  const parse = _parse(_Err);
  const fn = (schema, value, _ctx, _params) => {
    return parse(schema, value, _ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _encodeAsync = (_Err) => {
  const parseAsync = _parseAsync(_Err);
  const fn = async (schema, value, _ctx, _params) => {
    const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
    return await parseAsync(schema, value, ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _decodeAsync = (_Err) => {
  const parseAsync = _parseAsync(_Err);
  const fn = async (schema, value, _ctx, _params) => {
    return await parseAsync(schema, value, _ctx, finalizeParams(fn, _params));
  };
  return fn;
};
var _safeEncode = (_Err) => (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParse(_Err)(schema, value, ctx);
};
var _safeDecode = (_Err) => (schema, value, _ctx) => {
  return _safeParse(_Err)(schema, value, _ctx);
};
var _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
  const ctx = _ctx ? { ..._ctx, direction: "backward" } : { direction: "backward" };
  return _safeParseAsync(_Err)(schema, value, ctx);
};
var _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
  return _safeParseAsync(_Err)(schema, value, _ctx);
};
// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/regexes.js
var cuid = /^[cC][0-9a-z]{6,}$/;
var cuid2 = /^[0-9a-z]+$/;
var ulid = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/;
var xid = /^[0-9a-vA-V]{20}$/;
var ksuid = /^[A-Za-z0-9]{27}$/;
var nanoid = /^[a-zA-Z0-9_-]{21}$/;
function nanoidOfLength(length) {
  return new RegExp(`^[a-zA-Z0-9_-]{${length}}$`);
}
var duration = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
var guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
var uuid = (version) => {
  if (!version)
    return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
  return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
};
var email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
var _emoji = `^[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$`;
function emoji() {
  return new RegExp(_emoji, "u");
}
var ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
var cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
var cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
var base64url = /^[A-Za-z0-9_-]*$/;
var httpProtocol = /^https?$/;
var e164 = /^\+[1-9]\d{6,14}$/;
var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
function anchor(source) {
  return new RegExp(`^${source}$`);
}
var date = /* @__PURE__ */ anchor(dateSource);
function timeSource(args) {
  const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
  const regex = typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : args.seconds ? `${hhmm}:[0-5]\\d(?:\\.\\d+)?` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
  return regex;
}
function time(args) {
  return new RegExp(`^${timeSource(args)}$`);
}
function datetime(args) {
  const opts = ["Z"];
  if (args.offset)
    opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
  const qualified = `${timeSource({ precision: args.precision, seconds: true })}(?:${opts.join("|")})`;
  const timeRegex = args.local ? `${qualified}|${timeSource({ precision: args.precision })}` : qualified;
  return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
}
var string = (params) => {
  const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
  return new RegExp(`^${regex}$`);
};
var integer = /^-?\d+$/;
var number = /^-?\d+(?:\.\d+)?$/;
var boolean = /^(?:true|false)$/i;
var lowercase = /^[^A-Z]*$/;
var uppercase = /^[^a-z]*$/;

// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/checks.js
var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
  var _a2;
  inst._zod ?? (inst._zod = {});
  inst._zod.def = def;
  (_a2 = inst._zod).onattach ?? (_a2.onattach = []);
});
var _whenHasLength = (payload) => {
  const val = payload.value;
  return !nullish(val) && val.length !== undefined;
};
var numericOriginMap = {
  number: "number",
  bigint: "bigint",
  object: "date"
};
var $ZodCheckLessThan = /* @__PURE__ */ $constructor("$ZodCheckLessThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    if (def.value < curr) {
      if (def.inclusive)
        bag.maximum = def.value;
      else
        bag.exclusiveMaximum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value <= def.value : payload.value < def.value) {
      return;
    }
    payload.issues.push({
      origin: numericOriginMap[typeof payload.value] ?? origin,
      code: "too_big",
      maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckGreaterThan = /* @__PURE__ */ $constructor("$ZodCheckGreaterThan", (inst, def) => {
  $ZodCheck.init(inst, def);
  const origin = numericOriginMap[typeof def.value];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    if (def.value > curr) {
      if (def.inclusive)
        bag.minimum = def.value;
      else
        bag.exclusiveMinimum = def.value;
    }
  });
  inst._zod.check = (payload) => {
    if (def.inclusive ? payload.value >= def.value : payload.value > def.value) {
      return;
    }
    payload.issues.push({
      origin: numericOriginMap[typeof payload.value] ?? origin,
      code: "too_small",
      minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
      input: payload.value,
      inclusive: def.inclusive,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMultipleOf = /* @__PURE__ */ $constructor("$ZodCheckMultipleOf", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    var _a2;
    (_a2 = inst2._zod.bag).multipleOf ?? (_a2.multipleOf = def.value);
  });
  inst._zod.check = (payload) => {
    if (typeof payload.value !== typeof def.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    const isMultiple = typeof payload.value === "bigint" ? def.value !== BigInt(0) && payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0;
    if (isMultiple)
      return;
    payload.issues.push({
      origin: typeof payload.value,
      code: "not_multiple_of",
      divisor: def.value,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckNumberFormat = /* @__PURE__ */ $constructor("$ZodCheckNumberFormat", (inst, def) => {
  $ZodCheck.init(inst, def);
  def.format = def.format || "float64";
  const isInt = def.format?.includes("int");
  const origin = isInt ? "int" : "number";
  const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    bag.minimum = minimum;
    bag.maximum = maximum;
    if (isInt)
      bag.pattern = integer;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    if (isInt) {
      if (!Number.isInteger(input)) {
        payload.issues.push({
          expected: origin,
          format: def.format,
          code: "invalid_type",
          continue: false,
          input,
          inst
        });
        return;
      }
      if (!Number.isSafeInteger(input)) {
        if (input > 0) {
          payload.issues.push({
            input,
            code: "too_big",
            maximum: Number.MAX_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        } else {
          payload.issues.push({
            input,
            code: "too_small",
            minimum: Number.MIN_SAFE_INTEGER,
            note: "Integers must be within the safe integer range.",
            inst,
            origin,
            inclusive: true,
            continue: !def.abort
          });
        }
        return;
      }
    }
    if (input < minimum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_small",
        minimum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
    if (input > maximum) {
      payload.issues.push({
        origin: "number",
        input,
        code: "too_big",
        maximum,
        inclusive: true,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCheckMaxLength = /* @__PURE__ */ $constructor("$ZodCheckMaxLength", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = _whenHasLength);
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    if (def.maximum < curr)
      inst2._zod.bag.maximum = def.maximum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const units = input.length;
    const length = typeof input === "string" && units > def.maximum ? codePointLength(input) : units;
    if (length <= def.maximum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_big",
      maximum: def.maximum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckMinLength = /* @__PURE__ */ $constructor("$ZodCheckMinLength", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = _whenHasLength);
  inst._zod.onattach.push((inst2) => {
    const curr = inst2._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    if (def.minimum > curr)
      inst2._zod.bag.minimum = def.minimum;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const units = input.length;
    const length = typeof input === "string" && units >= def.minimum && units < def.minimum * 2 ? codePointLength(input) : units;
    if (length >= def.minimum)
      return;
    const origin = getLengthableOrigin(input);
    payload.issues.push({
      origin,
      code: "too_small",
      minimum: def.minimum,
      inclusive: true,
      input,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLengthEquals = /* @__PURE__ */ $constructor("$ZodCheckLengthEquals", (inst, def) => {
  var _a2;
  $ZodCheck.init(inst, def);
  (_a2 = inst._zod.def).when ?? (_a2.when = _whenHasLength);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.minimum = def.length;
    bag.maximum = def.length;
    bag.length = def.length;
  });
  inst._zod.check = (payload) => {
    const input = payload.value;
    const units = input.length;
    const length = typeof input === "string" && units >= def.length && units <= def.length * 2 ? codePointLength(input) : units;
    if (length === def.length)
      return;
    const origin = getLengthableOrigin(input);
    const tooBig = length > def.length;
    payload.issues.push({
      origin,
      ...tooBig ? { code: "too_big", maximum: def.length } : { code: "too_small", minimum: def.length },
      inclusive: true,
      exact: true,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStringFormat = /* @__PURE__ */ $constructor("$ZodCheckStringFormat", (inst, def) => {
  var _a2, _b;
  $ZodCheck.init(inst, def);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.format = def.format;
    if (def.pattern) {
      bag.patterns ?? (bag.patterns = new Set);
      bag.patterns.add(def.pattern);
    }
  });
  if (def.pattern)
    (_a2 = inst._zod).check ?? (_a2.check = (payload) => {
      def.pattern.lastIndex = 0;
      if (def.pattern.test(payload.value))
        return;
      payload.issues.push({
        origin: "string",
        code: "invalid_format",
        format: def.format,
        input: payload.value,
        ...def.pattern ? { pattern: def.pattern.toString() } : {},
        inst,
        continue: !def.abort
      });
    });
  else
    (_b = inst._zod).check ?? (_b.check = () => {});
});
var $ZodCheckRegex = /* @__PURE__ */ $constructor("$ZodCheckRegex", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    def.pattern.lastIndex = 0;
    if (def.pattern.test(payload.value))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: payload.value,
      pattern: def.pattern.toString(),
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckLowerCase = /* @__PURE__ */ $constructor("$ZodCheckLowerCase", (inst, def) => {
  def.pattern ?? (def.pattern = lowercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckUpperCase = /* @__PURE__ */ $constructor("$ZodCheckUpperCase", (inst, def) => {
  def.pattern ?? (def.pattern = uppercase);
  $ZodCheckStringFormat.init(inst, def);
});
var $ZodCheckIncludes = /* @__PURE__ */ $constructor("$ZodCheckIncludes", (inst, def) => {
  $ZodCheck.init(inst, def);
  const escapedRegex = escapeRegex(def.includes);
  const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position},}${escapedRegex}` : escapedRegex);
  def.pattern = pattern;
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.includes(def.includes, def.position))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: def.includes,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckStartsWith = /* @__PURE__ */ $constructor("$ZodCheckStartsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.startsWith(def.prefix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: def.prefix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckEndsWith = /* @__PURE__ */ $constructor("$ZodCheckEndsWith", (inst, def) => {
  $ZodCheck.init(inst, def);
  const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
  def.pattern ?? (def.pattern = pattern);
  inst._zod.onattach.push((inst2) => {
    const bag = inst2._zod.bag;
    bag.patterns ?? (bag.patterns = new Set);
    bag.patterns.add(pattern);
  });
  inst._zod.check = (payload) => {
    if (payload.value.endsWith(def.suffix))
      return;
    payload.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: def.suffix,
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodCheckOverwrite = /* @__PURE__ */ $constructor("$ZodCheckOverwrite", (inst, def) => {
  $ZodCheck.init(inst, def);
  inst._zod.check = (payload) => {
    payload.value = def.tx(payload.value);
  };
});

// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/doc.js
class Doc {
  constructor(args = [], closed = {}) {
    this.content = [];
    this.indent = 0;
    this.args = args;
    this.closed = closed;
  }
  indented(fn) {
    this.indent += 1;
    fn(this);
    this.indent -= 1;
  }
  write(arg) {
    if (typeof arg === "function") {
      arg(this, { execution: "sync" });
      arg(this, { execution: "async" });
      return;
    }
    const content = arg;
    const lines = content.split(`
`).filter((x) => x);
    const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
    const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
    for (const line of dedented) {
      this.content.push(line);
    }
  }
  compile() {
    const F = Function;
    const content = this?.content ?? [``];
    const factory = new F(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {
${content.join(`
`)}
};`);
    return factory(...Object.values(this.closed));
  }
}

// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/versions.js
var version = {
  major: 4,
  minor: 5,
  patch: 4
};

// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/schemas.js
var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
  var _a2;
  inst ?? (inst = {});
  inst._zod.def = def;
  inst._zod.bag = inst._zod.bag || {};
  inst._zod.version = version;
  const defChecks = inst._zod.def.checks;
  const checks = inst._zod.traits.has("$ZodCheck") ? [inst, ...defChecks ?? []] : defChecks?.length ? [...defChecks] : [];
  for (const ch of checks) {
    for (const fn of ch._zod.onattach) {
      fn(inst);
    }
  }
  if (checks.length === 0) {
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    inst._zod.deferred?.push(() => {
      inst._zod.run = inst._zod.parse;
    });
  } else {
    const runChecks = (payload, checks2, ctx) => {
      if (payload.memo)
        return payload;
      let isAborted = aborted(payload);
      let asyncResult;
      for (const ch of checks2) {
        if (ch._zod.def.when) {
          if (explicitlyAborted(payload))
            continue;
          const shouldRun = ch._zod.def.when(payload);
          if (!shouldRun)
            continue;
        } else if (isAborted) {
          continue;
        }
        const currLen = payload.issues.length;
        const _ = ch._zod.check(payload);
        if (_ instanceof Promise && ctx?.async === false) {
          throw new $ZodAsyncError;
        }
        if (asyncResult || _ instanceof Promise) {
          asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
            await _;
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              return;
            attachSchema(payload.issues, currLen, inst);
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          });
        } else {
          const nextLen = payload.issues.length;
          if (nextLen === currLen)
            continue;
          attachSchema(payload.issues, currLen, inst);
          if (!isAborted)
            isAborted = aborted(payload, currLen);
        }
      }
      if (asyncResult) {
        return asyncResult.then(() => {
          return payload;
        });
      }
      return payload;
    };
    const handleCanaryResult = (canary, payload, ctx) => {
      if (aborted(canary)) {
        canary.aborted = true;
        return canary;
      }
      const checkResult = runChecks(payload, checks, ctx);
      if (checkResult instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
      }
      return inst._zod.parse(checkResult, ctx);
    };
    inst._zod.run = (payload, ctx) => {
      if (ctx.skipChecks) {
        return inst._zod.parse(payload, ctx);
      }
      if (ctx.direction === "backward") {
        const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
        if (canary instanceof Promise) {
          return canary.then((canary2) => {
            return handleCanaryResult(canary2, payload, ctx);
          });
        }
        return handleCanaryResult(canary, payload, ctx);
      }
      const result = inst._zod.parse(payload, ctx);
      if (result instanceof Promise) {
        if (ctx.async === false)
          throw new $ZodAsyncError;
        return result.then((result2) => runChecks(result2, checks, ctx));
      }
      return runChecks(result, checks, ctx);
    };
  }
}, {
  get "~standard"() {
    return hide(this, "~standard", standardProps(this));
  },
  set "~standard"(value) {
    own(this, "~standard", value);
  }
});
var toStandardResult = (r) => r.success ? { value: r.data } : { issues: r.error?.issues };
function standardProps(inst) {
  return {
    validate: (value) => {
      try {
        return toStandardResult(safeParse(inst, value));
      } catch (_) {
        return safeParseAsync(inst, value).then(toStandardResult);
      }
    },
    vendor: "zod",
    version: 1
  };
}
var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
  inst._zod.parse = (payload, _) => {
    if (def.coerce)
      try {
        payload.value = String(payload.value);
      } catch (_2) {}
    if (typeof payload.value === "string")
      return payload;
    payload.issues.push({
      expected: "string",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
var $ZodStringFormat = /* @__PURE__ */ $constructor("$ZodStringFormat", (inst, def) => {
  $ZodCheckStringFormat.init(inst, def);
  $ZodString.init(inst, def);
});
var $ZodGUID = /* @__PURE__ */ $constructor("$ZodGUID", (inst, def) => {
  def.pattern ?? (def.pattern = guid);
  $ZodStringFormat.init(inst, def);
});
var $ZodUUID = /* @__PURE__ */ $constructor("$ZodUUID", (inst, def) => {
  if (def.version) {
    const versionMap = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    };
    const v = versionMap[def.version];
    if (v === undefined)
      throw new Error(`Invalid UUID version: "${def.version}"`);
    def.pattern ?? (def.pattern = uuid(v));
  } else
    def.pattern ?? (def.pattern = uuid());
  $ZodStringFormat.init(inst, def);
});
var $ZodEmail = /* @__PURE__ */ $constructor("$ZodEmail", (inst, def) => {
  def.pattern ?? (def.pattern = email);
  $ZodStringFormat.init(inst, def);
});
var URL_BAD_FORMAT = 1;
var URL_UNPARSEABLE = 2;
function parseURLObject(trimmed, def) {
  if (!def.normalize && def.protocol?.source === httpProtocol.source && !/^https?:\/\//i.test(trimmed)) {
    return URL_BAD_FORMAT;
  }
  try {
    return new URL(trimmed);
  } catch {
    return URL_UNPARSEABLE;
  }
}
var asciiTabOrNewline = /[\t\n\r]/g;
function stripTabAndNewline(value) {
  return value.replace(asciiTabOrNewline, "");
}
function urlHostnameOk(url, hostname2) {
  hostname2.lastIndex = 0;
  return hostname2.test(url.hostname);
}
function urlProtocolOk(url, protocol) {
  protocol.lastIndex = 0;
  return protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol);
}
var $ZodURL = /* @__PURE__ */ $constructor("$ZodURL", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    try {
      const trimmed = payload.value.trim();
      const url = parseURLObject(trimmed, def);
      if (url === URL_BAD_FORMAT) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid URL format",
          input: payload.value,
          inst,
          continue: !def.abort
        });
        return;
      }
      if (url === URL_UNPARSEABLE) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          input: payload.value,
          inst,
          continue: !def.abort
        });
        return;
      }
      if (def.hostname && !urlHostnameOk(url, def.hostname)) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid hostname",
          pattern: def.hostname.source,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      }
      if (def.protocol && !urlProtocolOk(url, def.protocol)) {
        payload.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid protocol",
          pattern: def.protocol.source,
          input: payload.value,
          inst,
          continue: !def.abort
        });
      }
      payload.value = def.normalize ? url.href : stripTabAndNewline(trimmed);
      return;
    } catch (_) {
      payload.issues.push({
        code: "invalid_format",
        format: "url",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodEmoji = /* @__PURE__ */ $constructor("$ZodEmoji", (inst, def) => {
  def.pattern ?? (def.pattern = emoji());
  $ZodStringFormat.init(inst, def);
});
var $ZodNanoID = /* @__PURE__ */ $constructor("$ZodNanoID", (inst, def) => {
  if (def.length !== undefined && (!Number.isInteger(def.length) || def.length < 1))
    throw new Error(`Invalid nanoid length: ${def.length}`);
  def.pattern ?? (def.pattern = def.length === undefined ? nanoid : nanoidOfLength(def.length));
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID = /* @__PURE__ */ $constructor("$ZodCUID", (inst, def) => {
  def.pattern ?? (def.pattern = cuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodCUID2 = /* @__PURE__ */ $constructor("$ZodCUID2", (inst, def) => {
  def.pattern ?? (def.pattern = cuid2);
  $ZodStringFormat.init(inst, def);
});
var $ZodULID = /* @__PURE__ */ $constructor("$ZodULID", (inst, def) => {
  def.pattern ?? (def.pattern = ulid);
  $ZodStringFormat.init(inst, def);
});
var $ZodXID = /* @__PURE__ */ $constructor("$ZodXID", (inst, def) => {
  def.pattern ?? (def.pattern = xid);
  $ZodStringFormat.init(inst, def);
});
var $ZodKSUID = /* @__PURE__ */ $constructor("$ZodKSUID", (inst, def) => {
  def.pattern ?? (def.pattern = ksuid);
  $ZodStringFormat.init(inst, def);
});
var $ZodISODateTime = /* @__PURE__ */ $constructor("$ZodISODateTime", (inst, def) => {
  def.pattern ?? (def.pattern = datetime(def));
  $ZodStringFormat.init(inst, def);
  if (def.local || def.precision === -1) {
    inst._zod.bag.laxFormat = true;
    inst._zod.onattach.push((s) => {
      s._zod.bag.laxFormat = true;
    });
  }
});
var $ZodISODate = /* @__PURE__ */ $constructor("$ZodISODate", (inst, def) => {
  def.pattern ?? (def.pattern = date);
  $ZodStringFormat.init(inst, def);
});
var $ZodISOTime = /* @__PURE__ */ $constructor("$ZodISOTime", (inst, def) => {
  def.pattern ?? (def.pattern = time(def));
  $ZodStringFormat.init(inst, def);
});
var $ZodISODuration = /* @__PURE__ */ $constructor("$ZodISODuration", (inst, def) => {
  def.pattern ?? (def.pattern = duration);
  $ZodStringFormat.init(inst, def);
});
var $ZodIPv4 = /* @__PURE__ */ $constructor("$ZodIPv4", (inst, def) => {
  def.pattern ?? (def.pattern = ipv4);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv4`;
});
var ipv6Alphabet = /^[0-9a-fA-F:.]+$/;
function isValidIPv6(value) {
  if (!ipv6Alphabet.test(value))
    return false;
  try {
    new URL(`http://[${value}]`);
    return true;
  } catch {
    return false;
  }
}
var $ZodIPv6 = /* @__PURE__ */ $constructor("$ZodIPv6", (inst, def) => {
  def.pattern ?? (def.pattern = ipv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.format = `ipv6`;
  inst._zod.check = (payload) => {
    if (!isValidIPv6(payload.value)) {
      payload.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
var $ZodCIDRv4 = /* @__PURE__ */ $constructor("$ZodCIDRv4", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv4);
  $ZodStringFormat.init(inst, def);
});
function isValidCIDRv6(value) {
  const parts = value.split("/");
  if (parts.length !== 2)
    return false;
  const [address, prefix] = parts;
  if (!prefix)
    return false;
  const prefixNum = Number(prefix);
  if (`${prefixNum}` !== prefix)
    return false;
  if (prefixNum < 0 || prefixNum > 128)
    return false;
  return isValidIPv6(address);
}
var $ZodCIDRv6 = /* @__PURE__ */ $constructor("$ZodCIDRv6", (inst, def) => {
  def.pattern ?? (def.pattern = cidrv6);
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (!isValidCIDRv6(payload.value)) {
      payload.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: payload.value,
        inst,
        continue: !def.abort
      });
    }
  };
});
function isValidBase64(data) {
  if (data === "")
    return true;
  if (/\s/.test(data))
    return false;
  if (data.length % 4 !== 0)
    return false;
  try {
    atob(data);
    return true;
  } catch {
    return false;
  }
}
var $ZodBase64 = /* @__PURE__ */ $constructor("$ZodBase64", (inst, def) => {
  def.pattern ?? (def.pattern = base64);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64";
  inst._zod.check = (payload) => {
    if (isValidBase64(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
function isValidBase64URL(data) {
  if (!base64url.test(data))
    return false;
  const base642 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
  const padded = base642.padEnd(Math.ceil(base642.length / 4) * 4, "=");
  return isValidBase64(padded);
}
var $ZodBase64URL = /* @__PURE__ */ $constructor("$ZodBase64URL", (inst, def) => {
  def.pattern ?? (def.pattern = base64url);
  $ZodStringFormat.init(inst, def);
  inst._zod.bag.contentEncoding = "base64url";
  inst._zod.check = (payload) => {
    if (isValidBase64URL(payload.value))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodE164 = /* @__PURE__ */ $constructor("$ZodE164", (inst, def) => {
  def.pattern ?? (def.pattern = e164);
  $ZodStringFormat.init(inst, def);
});
function isValidJWT(token, algorithm = null) {
  try {
    const tokensParts = token.split(".");
    if (tokensParts.length !== 3)
      return false;
    const [header] = tokensParts;
    if (!header)
      return false;
    const parsedHeader = JSON.parse(atob(header));
    if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT")
      return false;
    if (!parsedHeader.alg)
      return false;
    if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm))
      return false;
    return true;
  } catch {
    return false;
  }
}
var $ZodJWT = /* @__PURE__ */ $constructor("$ZodJWT", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  inst._zod.check = (payload) => {
    if (isValidJWT(payload.value, def.alg))
      return;
    payload.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: payload.value,
      inst,
      continue: !def.abort
    });
  };
});
var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = inst._zod.bag.pattern ?? number;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Number(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
      return payload;
    }
    const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? String(input) : undefined : undefined;
    payload.issues.push({
      expected: "number",
      code: "invalid_type",
      input,
      inst,
      ...received ? { received } : {}
    });
    return payload;
  };
});
var $ZodNumberFormat = /* @__PURE__ */ $constructor("$ZodNumberFormat", (inst, def) => {
  $ZodCheckNumberFormat.init(inst, def);
  $ZodNumber.init(inst, def);
});
var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.pattern = boolean;
  inst._zod.parse = (payload, _ctx) => {
    if (def.coerce)
      try {
        payload.value = Boolean(payload.value);
      } catch (_) {}
    const input = payload.value;
    if (typeof input === "boolean")
      return payload;
    payload.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input,
      inst
    });
    return payload;
  };
});
var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload) => payload;
});
var $ZodNever = /* @__PURE__ */ $constructor("$ZodNever", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _ctx) => {
    payload.issues.push({
      expected: "never",
      code: "invalid_type",
      input: payload.value,
      inst
    });
    return payload;
  };
});
function handleArrayResult(result, final, index) {
  if (result.issues.length) {
    final.issues.push(...prefixIssues(index, result.issues));
  }
  final.value[index] = result.value;
}
var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
  $ZodType.init(inst, def);
  const memo = globalConfig.memoizer;
  memo?.attach(inst);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!Array.isArray(input)) {
      payload.issues.push({
        expected: "array",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = memo ? memo.alloc(inst, payload, Array(input.length), ctx) : Array(input.length);
    const proms = [];
    for (let i = 0;i < input.length; i++) {
      const item = input[i];
      const result = def.element._zod.run({
        value: item,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        proms.push(result.then((result2) => handleArrayResult(result2, payload, i)));
      } else {
        handleArrayResult(result, payload, i);
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
function handlePropertyResult(result, final, key, input, optin, optout) {
  const isPresent = key in input;
  const isOptionalOut = optout === "optional";
  if (!isPresent && isOptionalOut && optin === "optional") {
    return;
  }
  if (result.issues.length) {
    if (optin !== undefined && isOptionalOut && !isPresent) {
      return;
    }
    final.issues.push(...prefixIssues(key, result.issues));
  }
  if (!isPresent && optin === undefined) {
    if (!result.issues.length) {
      final.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: undefined,
        path: [key]
      });
    }
    return;
  }
  if (result.value === undefined) {
    if (isPresent) {
      final.value[key] = undefined;
    }
  } else {
    final.value[key] = result.value;
  }
}
var NO_SYMBOL_KEYS = [];
function normalizeDef(def) {
  const keys = Object.keys(def.shape);
  const ownSymbols = Object.getOwnPropertySymbols(def.shape);
  const symbolKeys = ownSymbols.length ? ownSymbols : NO_SYMBOL_KEYS;
  const allKeys = symbolKeys.length ? [...keys, ...symbolKeys] : keys;
  for (const k of allKeys) {
    if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
      throw new Error(`Invalid element at key "${String(k)}": expected a Zod schema`);
    }
  }
  const okeys = optionalKeys(def.shape);
  return {
    ...def,
    allKeys,
    symbolKeys,
    keySet: new Set(keys),
    numKeys: keys.length,
    optionalKeys: new Set(okeys)
  };
}
function handleCatchall(proms, input, payload, ctx, def, inst) {
  const unrecognized = [];
  const keySet = def.keySet;
  const _catchall = def.catchall._zod;
  const t = _catchall.def.type;
  const optin = _catchall.optin;
  const optout = _catchall.optout;
  for (const key in input) {
    if (keySet.has(key))
      continue;
    if (key === "__proto__") {
      if (t === "never")
        unrecognized.push(key);
      continue;
    }
    if (t === "never") {
      unrecognized.push(key);
      continue;
    }
    const r = _catchall.run({ value: input[key], issues: [] }, ctx);
    if (r instanceof Promise) {
      proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, optin, optout)));
    } else {
      handlePropertyResult(r, payload, key, input, optin, optout);
    }
  }
  if (unrecognized.length) {
    payload.issues.push({
      code: "unrecognized_keys",
      keys: unrecognized,
      input,
      inst,
      continue: true
    });
  }
  if (!proms.length)
    return payload;
  return Promise.all(proms).then(() => {
    return payload;
  });
}
var propShapes = new WeakMap;
var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
  $ZodType.init(inst, def);
  const desc = Object.getOwnPropertyDescriptor(def, "shape");
  if (!desc?.get) {
    const sh = def.shape;
    propShapes.set(def, sh);
    Object.defineProperty(def, "shape", {
      get: () => {
        const newSh = { ...sh };
        Object.defineProperty(def, "shape", {
          value: newSh
        });
        propShapes.set(def, newSh);
        return newSh;
      }
    });
  }
  const _normalized = cached(() => normalizeDef(def));
  defineLazyInternal(inst, "propValues", (zod) => {
    const shape = zod.def.shape;
    const propValues = {};
    for (const key in shape) {
      const field = shape[key]._zod;
      if (field.values) {
        if (!Object.prototype.hasOwnProperty.call(propValues, key)) {
          assignProp(propValues, key, new Set);
        }
        for (const v of field.values)
          propValues[key].add(v);
        if (field.optin !== undefined)
          propValues[key].add(undefined);
      }
    }
    return propValues;
  });
  const isObject2 = isObject;
  const catchall = def.catchall;
  let value;
  const memo = globalConfig.memoizer;
  memo?.attach(inst);
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
    const proms = [];
    const shape = value.shape;
    for (const key of value.allKeys) {
      if (key === "__proto__")
        continue;
      const el = shape[key];
      const optin = el._zod.optin;
      const optout = el._zod.optout;
      const r = el._zod.run({ value: input[key], issues: [] }, ctx);
      if (r instanceof Promise) {
        proms.push(r.then((r2) => handlePropertyResult(r2, payload, key, input, optin, optout)));
      } else {
        handlePropertyResult(r, payload, key, input, optin, optout);
      }
    }
    if (!catchall) {
      return proms.length ? Promise.all(proms).then(() => payload) : payload;
    }
    return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
  };
});
var $ZodObjectJIT = /* @__PURE__ */ $constructor("$ZodObjectJIT", (inst, def) => {
  $ZodObject.init(inst, def);
  const superParse = inst._zod.parse;
  const _normalized = cached(() => normalizeDef(def));
  const memo = globalConfig.memoizer;
  const generateFastpass = (shape) => {
    const normalized = _normalized.value;
    const syms = normalized.symbolKeys;
    const doc = new Doc(["payload", "ctx"], { shape, inst, memo, syms });
    const parseStr = (k) => `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
    const prefixStr = (id, k) => `
          for (let i = 0; i < ${id}.issues.length; i++) {
            const iss = ${id}.issues[i];
            iss.path = iss.path ? [${k}, ...iss.path] : [${k}];
            payload.issues.push(iss);
          }`;
    doc.write(`const input = payload.value;`);
    const ids = Object.create(null);
    let counter = 0;
    for (const key of normalized.allKeys) {
      ids[key] = `key_${counter++}`;
    }
    doc.write(memo ? `const newResult = memo.alloc(inst, payload, {}, ctx);` : `const newResult = {};`);
    for (const key of normalized.allKeys) {
      if (key === "__proto__")
        continue;
      const id = ids[key];
      const k = typeof key === "symbol" ? `syms[${syms.indexOf(key)}]` : esc(key);
      const isPresent = `${k} in input`;
      const schema = shape[key];
      const optin = schema?._zod?.optin;
      const isOptionalIn = optin !== undefined;
      const isOptionalOut = schema?._zod?.optout === "optional";
      doc.write(`const ${id} = ${parseStr(k)};`);
      if (isOptionalIn && isOptionalOut) {
        const assign = optin === "optional" ? `${id}_present` : `${id}.value !== undefined || ${id}_present`;
        doc.write(`
        const ${id}_present = ${isPresent};
        if (!${id}.issues.length || ${id}_present) {
          if (${id}.issues.length) {${prefixStr(id, k)}
          }

          if (${assign}) {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
      } else if (!isOptionalIn) {
        doc.write(`
        const ${id}_present = ${isPresent};
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          newResult[${k}] = ${id}.value;
        }

      `);
      } else {
        doc.write(`
        if (${id}.issues.length) {${prefixStr(id, k)}
        }
        
        if (${id}.value === undefined) {
          if (${isPresent}) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }

      `);
      }
    }
    doc.write(`payload.value = newResult;`);
    doc.write(`return payload;`);
    return doc.compile();
  };
  let fastpass;
  const isObject2 = isObject;
  const jit = !globalConfig.jitless;
  const allowsEval2 = allowsEval;
  const fastEnabled = jit && allowsEval2.value;
  const catchall = def.catchall;
  let value;
  inst._zod.parse = (payload, ctx) => {
    value ?? (value = _normalized.value);
    const input = payload.value;
    if (!isObject2(input)) {
      payload.issues.push({
        expected: "object",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
      if (!fastpass)
        fastpass = generateFastpass(def.shape);
      payload = fastpass(payload, ctx);
      if (!catchall)
        return payload;
      return handleCatchall([], input, payload, ctx, value, inst);
    }
    return superParse(payload, ctx);
  };
});
function handleUnionResults(results, final, inst, ctx) {
  for (const result of results) {
    if (result.issues.length === 0) {
      final.value = result.value;
      return final;
    }
  }
  const nonaborted = results.filter((r) => !aborted(r));
  if (nonaborted.length === 1) {
    final.value = nonaborted[0].value;
    return nonaborted[0];
  }
  final.issues.push({
    code: "invalid_union",
    input: final.value,
    inst,
    errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
  });
  return final;
}
var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : zod.def.options.some((o) => o._zod.optin !== undefined) ? "optional" : undefined);
  defineLazyInternal(inst, "optout", (zod) => zod.def.options.some((o) => o._zod.optout === "optional") ? "optional" : undefined);
  defineLazyInternal(inst, "values", (zod) => {
    if (zod.def.options.every((o) => o._zod.values)) {
      return new Set(zod.def.options.flatMap((option) => Array.from(option._zod.values)));
    }
    return;
  });
  defineLazyInternal(inst, "pattern", (zod) => {
    if (zod.def.options.every((o) => o._zod.pattern)) {
      const patterns = zod.def.options.map((o) => o._zod.pattern);
      return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
    }
    return;
  });
  const first = def.options.length === 1 ? def.options[0]._zod.run : null;
  inst._zod.parse = (payload, ctx) => {
    if (first) {
      return first(payload, ctx);
    }
    let async = false;
    const results = [];
    for (const option of def.options) {
      const result = option._zod.run({
        value: payload.value,
        issues: []
      }, ctx);
      if (result instanceof Promise) {
        results.push(result);
        async = true;
      } else {
        if (result.issues.length === 0)
          return result;
        results.push(result);
      }
    }
    if (!async)
      return handleUnionResults(results, payload, inst, ctx);
    return Promise.all(results).then((results2) => {
      return handleUnionResults(results2, payload, inst, ctx);
    });
  };
});
var $ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
  def.inclusive = false;
  $ZodUnion.init(inst, def);
  const _super = inst._zod.parse;
  defineLazyInternal(inst, "propValues", (zod) => {
    const propValues = {};
    for (const option of zod.def.options) {
      const pv = option._zod.propValues;
      if (!pv || Object.keys(pv).length === 0)
        throw new Error(`Invalid discriminated union option at index "${zod.def.options.indexOf(option)}"`);
      for (const [k, v] of Object.entries(pv)) {
        if (!Object.prototype.hasOwnProperty.call(propValues, k)) {
          assignProp(propValues, k, new Set);
        }
        for (const val of v) {
          propValues[k].add(val);
        }
      }
    }
    return propValues;
  });
  def.options.forEach((option, i) => {
    const propShape = propShapes.get(option._zod.def);
    if (propShape && !Object.prototype.hasOwnProperty.call(propShape, def.discriminator)) {
      throw new Error(`Invalid discriminated union option at index "${i}"`);
    }
  });
  const disc = cached(() => {
    const opts = def.options;
    const map = new Map;
    for (const o of opts) {
      const values = o._zod.propValues?.[def.discriminator];
      if (!values || values.size === 0)
        throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
      for (const v of values) {
        if (map.has(v)) {
          throw new Error(`Duplicate discriminator value "${String(v)}"`);
        }
        map.set(v, o);
      }
    }
    return map;
  });
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isObject(input)) {
      payload.issues.push({
        code: "invalid_type",
        expected: "object",
        input,
        inst
      });
      return payload;
    }
    const opt = disc.value.get(input?.[def.discriminator]);
    if (opt) {
      return opt._zod.run(payload, ctx);
    }
    if (def.unionFallback || ctx.direction === "backward") {
      return _super(payload, ctx);
    }
    payload.issues.push({
      code: "invalid_union",
      errors: [],
      note: "No matching discriminator",
      discriminator: def.discriminator,
      options: Array.from(disc.value.keys()),
      input,
      path: [def.discriminator],
      inst
    });
    return payload;
  };
});
var $ZodIntersection = /* @__PURE__ */ $constructor("$ZodIntersection", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    const left = def.left._zod.run({ value: input, issues: [] }, ctx);
    const right = def.right._zod.run({ value: input, issues: [] }, ctx);
    const async = left instanceof Promise || right instanceof Promise;
    if (async) {
      return Promise.all([left, right]).then(([left2, right2]) => {
        return handleIntersectionResults(payload, left2, right2);
      });
    }
    return handleIntersectionResults(payload, left, right);
  };
});
function mergeValues(a, b) {
  if (a === b) {
    return { valid: true, data: a };
  }
  if (a instanceof Date && b instanceof Date && +a === +b) {
    return { valid: true, data: a };
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const bKeys = Object.keys(b);
    const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    if (Object.prototype.hasOwnProperty.call(newObj, "__proto__"))
      delete newObj.__proto__;
    for (const key of sharedKeys) {
      if (key === "__proto__")
        continue;
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
        };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return { valid: false, mergeErrorPath: [] };
    }
    const newArray = [];
    for (let index = 0;index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return {
          valid: false,
          mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
        };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  }
  return { valid: false, mergeErrorPath: [] };
}
function handleIntersectionResults(result, left, right) {
  const unrecKeys = new Map;
  let unrecIssue;
  const keyIssues = new Map;
  const collect = (iss, side) => {
    let keys;
    if (iss.code === "unrecognized_keys" && !iss.path?.length) {
      unrecIssue ?? (unrecIssue = iss);
      keys = iss.keys;
    } else if (iss.code === "invalid_key" && iss.origin === "record" && iss.path?.length === 1) {
      const k = String(iss.path[0]);
      if (!keyIssues.has(k))
        keyIssues.set(k, iss);
      keys = [k];
    } else {
      return false;
    }
    for (const k of keys) {
      if (!unrecKeys.has(k))
        unrecKeys.set(k, {});
      unrecKeys.get(k)[side] = true;
    }
    return true;
  };
  for (const iss of left.issues) {
    if (!collect(iss, "l"))
      result.issues.push(iss);
  }
  for (const iss of right.issues) {
    if (!collect(iss, "r"))
      result.issues.push(iss);
  }
  const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
  if (bothKeys.length) {
    const aggregated = unrecIssue ? bothKeys.filter((k) => unrecIssue.keys.includes(k)) : [];
    if (aggregated.length)
      result.issues.push({ ...unrecIssue, keys: aggregated });
    for (const k of bothKeys) {
      if (!aggregated.includes(k) && keyIssues.has(k))
        result.issues.push(keyIssues.get(k));
    }
  }
  const merged = mergeValues(left.value, right.value);
  if (!merged.valid) {
    if (aborted(result))
      return result;
    throw new Error(`Unmergable intersection. Error path: ` + `${JSON.stringify(merged.mergeErrorPath)}`);
  }
  result.value = merged.data;
  return result;
}
var $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
  $ZodType.init(inst, def);
  const memo = globalConfig.memoizer;
  memo?.attach(inst);
  inst._zod.parse = (payload, ctx) => {
    const input = payload.value;
    if (!isPlainObject(input)) {
      payload.issues.push({
        expected: "record",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    }
    const proms = [];
    const values = def.keyType._zod.values;
    if (values && !def.partial) {
      payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
      const recordKeys = new Set;
      for (const key of values) {
        if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
          recordKeys.add(typeof key === "number" ? key.toString() : key);
          if (key === "__proto__")
            continue;
          const keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
          if (keyResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (keyResult.issues.length) {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
            continue;
          }
          const outKey = keyResult.value;
          if (outKey === "__proto__")
            continue;
          const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => {
              if (result2.issues.length) {
                payload.issues.push(...prefixIssues(key, result2.issues));
              }
              payload.value[outKey] = result2.value;
            }));
          } else {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[outKey] = result.value;
          }
        }
      }
      let unrecognized;
      for (const key in input) {
        if (!recordKeys.has(key)) {
          if (def.mode === "loose") {
            if (key === "__proto__")
              continue;
            payload.value[key] = input[key];
          } else {
            unrecognized = unrecognized ?? [];
            unrecognized.push(key);
          }
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized,
          continue: true
        });
      }
    } else {
      payload.value = memo ? memo.alloc(inst, payload, {}, ctx) : {};
      let unrecognized;
      for (const key of Reflect.ownKeys(input)) {
        if (key === "__proto__")
          continue;
        if (!Object.prototype.propertyIsEnumerable.call(input, key))
          continue;
        let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
        if (keyResult instanceof Promise) {
          throw new Error("Async schemas not supported in object keys currently");
        }
        const checkNumericKey = typeof key === "string" && number.test(key) && keyResult.issues.length;
        if (checkNumericKey) {
          const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
          if (retryResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          if (retryResult.issues.length === 0) {
            keyResult = retryResult;
          }
        }
        if (keyResult.issues.length) {
          if (def.mode === "loose") {
            payload.value[key] = input[key];
          } else if (values) {
            unrecognized = unrecognized ?? [];
            unrecognized.push(key);
          } else {
            payload.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
              input: key,
              path: [key],
              inst
            });
          }
          continue;
        }
        const outKey = keyResult.value;
        if (outKey === "__proto__")
          continue;
        const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => {
            if (result2.issues.length) {
              payload.issues.push(...prefixIssues(key, result2.issues));
            }
            payload.value[outKey] = result2.value;
          }));
        } else {
          if (result.issues.length) {
            payload.issues.push(...prefixIssues(key, result.issues));
          }
          payload.value[outKey] = result.value;
        }
      }
      if (unrecognized && unrecognized.length > 0) {
        payload.issues.push({
          code: "unrecognized_keys",
          input,
          inst,
          keys: unrecognized,
          continue: true
        });
      }
    }
    if (proms.length) {
      return Promise.all(proms).then(() => payload);
    }
    return payload;
  };
});
var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
  $ZodType.init(inst, def);
  const values = getEnumValues(def.entries);
  const valuesSet = new Set(values);
  inst._zod.values = valuesSet;
  const patternValues = values.filter((k) => propertyKeyTypes.has(typeof k));
  inst._zod.pattern = new RegExp(patternValues.length ? `^(${patternValues.map((o) => escapeRegex(o.toString())).join("|")})$` : "^[^\\s\\S]$");
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (valuesSet.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
  $ZodType.init(inst, def);
  const values = new Set(def.values);
  inst._zod.values = values;
  inst._zod.pattern = new RegExp(def.values.length ? `^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$` : "^[^\\s\\S]$");
  inst._zod.parse = (payload, _ctx) => {
    const input = payload.value;
    if (values.has(input)) {
      return payload;
    }
    payload.issues.push({
      code: "invalid_value",
      values: def.values,
      input,
      inst
    });
    return payload;
  };
});
var $ZodTransform = /* @__PURE__ */ $constructor("$ZodTransform", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "optional";
  globalConfig.memoizer?.guard(inst);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    const _out = def.transform(payload.value, payload);
    if (ctx.async) {
      const output = _out instanceof Promise ? _out : Promise.resolve(_out);
      return output.then((output2) => {
        payload.value = output2;
        return payload;
      });
    }
    if (_out instanceof Promise) {
      throw new $ZodAsyncError;
    }
    payload.value = _out;
    return payload;
  };
});
function handleOptionalResult(payload, result) {
  payload.value = result.issues.length ? undefined : result.value;
  return payload;
}
var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
  inst._zod.optout = "optional";
  defineLazyInternal(inst, "values", (zod) => {
    const values = zod.def.innerType._zod.values;
    return values ? new Set([...values, undefined]) : undefined;
  });
  defineLazyInternal(inst, "pattern", (zod) => {
    const pattern = zod.def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === undefined) {
      if (def.innerType._zod.optin !== "defaulted")
        return payload;
      const result = def.innerType._zod.run({ value: payload.value, issues: [] }, ctx);
      if (result instanceof Promise)
        return result.then((result2) => handleOptionalResult(payload, result2));
      return handleOptionalResult(payload, result);
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodExactOptional = /* @__PURE__ */ $constructor("$ZodExactOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  defineLazyInternal(inst, "pattern", (zod) => zod.def.innerType._zod.pattern);
  inst._zod.parse = (payload, ctx) => {
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNullable = /* @__PURE__ */ $constructor("$ZodNullable", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin);
  defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
  defineLazyInternal(inst, "pattern", (zod) => {
    const pattern = zod.def.innerType._zod.pattern;
    return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : undefined;
  });
  defineLazyInternal(inst, "values", (zod) => {
    return zod.def.innerType._zod.values ? new Set([...zod.def.innerType._zod.values, null]) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    if (payload.value === null)
      return payload;
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "defaulted";
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
      return payload;
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleDefaultResult(result2, def));
    }
    return handleDefaultResult(result, def);
  };
});
function handleDefaultResult(payload, def) {
  if (payload.value === undefined) {
    payload.value = def.defaultValue;
  }
  return payload;
}
var $ZodPrefault = /* @__PURE__ */ $constructor("$ZodPrefault", (inst, def) => {
  $ZodType.init(inst, def);
  inst._zod.optin = "defaulted";
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    if (payload.value === undefined) {
      payload.value = def.defaultValue;
    }
    return def.innerType._zod.run(payload, ctx);
  };
});
var $ZodNonOptional = /* @__PURE__ */ $constructor("$ZodNonOptional", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "values", (zod) => {
    const v = zod.def.innerType._zod.values;
    return v ? new Set([...v].filter((x) => x !== undefined)) : undefined;
  });
  inst._zod.parse = (payload, ctx) => {
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleNonOptionalResult(result2, inst));
    }
    return handleNonOptionalResult(result, inst);
  };
});
function handleNonOptionalResult(payload, inst) {
  if (!payload.issues.length && payload.value === undefined) {
    payload.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: payload.value,
      inst
    });
  }
  return payload;
}
function handleCatchResult(payload, result, def, ctx) {
  if (!result.issues.length) {
    payload.value = result.value;
    if (result.memo)
      payload.memo = true;
    return payload;
  }
  payload.value = def.catchValue({
    ...result,
    value: payload.value,
    error: {
      issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config()))
    },
    input: payload.value
  });
  return payload;
}
var $ZodCatch = /* @__PURE__ */ $constructor("$ZodCatch", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional");
  defineLazyInternal(inst, "optout", (zod) => zod.def.innerType._zod.optout);
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run({ value: payload.value, issues: [] }, ctx);
    if (result instanceof Promise) {
      return result.then((result2) => handleCatchResult(payload, result2, def, ctx));
    }
    return handleCatchResult(payload, result, def, ctx);
  };
});
var $ZodPipe = /* @__PURE__ */ $constructor("$ZodPipe", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "values", (zod) => zod.def.in._zod.values);
  defineLazyInternal(inst, "optin", (zod) => zod.def.in._zod.optin);
  defineLazyInternal(inst, "optout", (zod) => zod.def.out._zod.optout);
  defineLazyInternal(inst, "propValues", (zod) => zod.def.in._zod.propValues);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      const right = def.out._zod.run(payload, ctx);
      if (right instanceof Promise) {
        return right.then((right2) => handlePipeResult(right2, def.in, ctx));
      }
      return handlePipeResult(right, def.in, ctx);
    }
    const left = def.in._zod.run(payload, ctx);
    if (left instanceof Promise) {
      return left.then((left2) => handlePipeResult(left2, def.out, ctx));
    }
    return handlePipeResult(left, def.out, ctx);
  };
});
function handlePipeResult(left, next, ctx) {
  if (left.issues.some((iss) => iss.code !== "unrecognized_keys")) {
    left.aborted = true;
    return left;
  }
  return next._zod.run({ value: left.value, issues: left.issues }, ctx);
}
var $ZodPreprocess = /* @__PURE__ */ $constructor("$ZodPreprocess", (inst, def) => {
  $ZodPipe.init(inst, def);
});
var $ZodReadonly = /* @__PURE__ */ $constructor("$ZodReadonly", (inst, def) => {
  $ZodType.init(inst, def);
  defineLazyInternal(inst, "propValues", (zod) => zod.def.innerType._zod.propValues);
  defineLazyInternal(inst, "values", (zod) => zod.def.innerType._zod.values);
  defineLazyInternal(inst, "optin", (zod) => zod.def.innerType?._zod?.optin);
  defineLazyInternal(inst, "optout", (zod) => zod.def.innerType?._zod?.optout);
  inst._zod.parse = (payload, ctx) => {
    if (ctx.direction === "backward") {
      return def.innerType._zod.run(payload, ctx);
    }
    const result = def.innerType._zod.run(payload, ctx);
    if (result instanceof Promise) {
      return result.then(handleReadonlyResult);
    }
    return handleReadonlyResult(result);
  };
});
function handleReadonlyResult(payload) {
  if (!payload.memo)
    payload.value = Object.freeze(payload.value);
  return payload;
}
var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
  $ZodCheck.init(inst, def);
  $ZodType.init(inst, def);
  inst._zod.parse = (payload, _) => {
    return payload;
  };
  inst._zod.check = (payload) => {
    const input = payload.value;
    const r = def.fn(input);
    if (r instanceof Promise) {
      return r.then((r2) => handleRefineResult(r2, payload, input, inst));
    }
    handleRefineResult(r, payload, input, inst);
    return;
  };
});
function handleRefineResult(result, payload, input, inst) {
  if (!result) {
    const _iss = {
      code: "custom",
      input,
      inst,
      path: [...inst._zod.def.path ?? []],
      continue: !inst._zod.def.abort
    };
    if (inst._zod.def.params)
      _iss.params = inst._zod.def.params;
    payload.issues.push(issue(_iss));
  }
}
// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/memoizer.js
class $ZodCyclicError extends Error {
  constructor() {
    super(`Cannot parse a reference cycle that closes through a transform`);
    this.name = "ZodCyclicError";
  }
}
var STATE = "~memo";
var NO_ISSUES = [];
function cloneIssues(issues) {
  return issues.map((iss) => iss.path ? { ...iss, path: iss.path.slice() } : { ...iss });
}
var recursive = /* @__PURE__ */ new WeakMap;
function isRecursive(inst, stack) {
  const cached2 = recursive.get(inst);
  if (cached2 !== undefined)
    return cached2;
  if (stack.has(inst))
    return true;
  stack.add(inst);
  let result = false;
  const check = (child) => {
    if (!result && child?._zod && isRecursive(child, stack))
      result = true;
  };
  const def = inst._zod.def;
  const kind = def.type;
  switch (kind) {
    case "object": {
      for (const key of Reflect.ownKeys(def.shape))
        check(def.shape[key]);
      check(def.catchall);
      break;
    }
    case "array":
      check(def.element);
      break;
    case "tuple":
      for (const el of def.items)
        check(el);
      check(def.rest);
      break;
    case "record":
    case "map":
      check(def.keyType);
      check(def.valueType);
      break;
    case "set":
      check(def.valueType);
      break;
    case "union":
      for (const el of def.options)
        check(el);
      break;
    case "intersection":
      check(def.left);
      check(def.right);
      break;
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "catch":
    case "readonly":
    case "nonoptional":
    case "promise":
    case "success":
      check(def.innerType);
      break;
    case "pipe":
      check(def.in);
      check(def.out);
      break;
    case "function":
      check(def.input);
      check(def.output);
      break;
    case "lazy":
      check(inst._zod.innerType);
      break;
    case "template_literal":
    case "string":
    case "number":
    case "int":
    case "boolean":
    case "bigint":
    case "symbol":
    case "undefined":
    case "null":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "date":
    case "nan":
    case "enum":
    case "literal":
    case "file":
    case "transform":
    case "custom":
      break;
    default: {
      for (const key in def) {
        const desc = Object.getOwnPropertyDescriptor(def, key);
        if (!desc || desc.get)
          continue;
        const value = desc.value;
        if (!value || typeof value !== "object")
          continue;
        if (value._zod)
          check(value);
        else if (Array.isArray(value))
          for (const el of value)
            check(el);
      }
    }
  }
  stack.delete(inst);
  recursive.set(inst, result);
  return result;
}
function bucketFor(state, inst) {
  let bucket = state.buckets.get(inst);
  if (!bucket) {
    bucket = new Map;
    state.buckets.set(inst, bucket);
  }
  return bucket;
}
var handoff;
var open = [];
var memo = {
  alloc(_inst, payload, empty) {
    const bucket = handoff;
    if (!bucket)
      return empty;
    handoff = undefined;
    const entry = { value: empty, issues: null };
    bucket.set(payload.value, entry);
    open.push(entry);
    return empty;
  },
  guard(inst) {
    var _a2;
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    inst._zod.deferred.push(() => {
      const base = inst._zod.parse;
      const wrapped = (payload, ctx) => {
        if (ctx.direction !== "backward" && isBackEdge(ctx, payload.value))
          throw new $ZodCyclicError;
        return base(payload, ctx);
      };
      inst._zod.parse = wrapped;
      if (inst._zod.run === base)
        inst._zod.run = wrapped;
    });
  },
  attach(inst) {
    var _a2;
    let isRecursiveInst;
    let lastCtx;
    let lastBucket;
    (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
    inst._zod.deferred.push(() => {
      const base = inst._zod.parse;
      const wrapped = (payload, ctx) => {
        if (isRecursiveInst === undefined) {
          isRecursiveInst = isRecursive(inst, new Set);
          if (!isRecursiveInst) {
            inst._zod.parse = base;
            if (inst._zod.run === wrapped)
              inst._zod.run = base;
            return base(payload, ctx);
          }
        }
        const input = payload.value;
        if (input === null || typeof input !== "object")
          return base(payload, ctx);
        let state = ctx[STATE];
        if (!state) {
          state = { buckets: new Map, backEdges: undefined };
          ctx[STATE] = state;
        }
        let bucket;
        if (lastCtx === ctx) {
          bucket = lastBucket;
        } else {
          bucket = bucketFor(state, inst);
          lastCtx = ctx;
          lastBucket = bucket;
        }
        const hit = bucket.get(input);
        if (hit) {
          payload.value = hit.value;
          if (hit.issues) {
            if (hit.issues.length)
              payload.issues.push(...cloneIssues(hit.issues));
          } else {
            payload.memo = true;
            state.backEdges ?? (state.backEdges = new Set);
            state.backEdges.add(hit.value);
          }
          return payload;
        }
        handoff = bucket;
        const depth = open.length;
        const result = base(payload, ctx);
        handoff = undefined;
        const entry = open.length > depth ? open.pop() : undefined;
        if (result instanceof Promise) {
          return result.then((r) => {
            if (entry)
              entry.issues = r.issues.length ? cloneIssues(r.issues) : NO_ISSUES;
            return r;
          });
        }
        if (entry)
          entry.issues = result.issues.length ? cloneIssues(result.issues) : NO_ISSUES;
        return result;
      };
      inst._zod.parse = wrapped;
      if (inst._zod.run === base)
        inst._zod.run = wrapped;
    });
  }
};
function memoizer() {
  return memo;
}
function isBackEdge(ctx, value) {
  const backEdges = ctx[STATE]?.backEdges;
  return backEdges !== undefined && value !== null && typeof value === "object" && backEdges.has(value);
}
// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/locales/en.js
var error = () => {
  const Sizable = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" }
  };
  function getSizing(origin) {
    return Sizable[origin] ?? null;
  }
  const FormatDictionary = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    mac: "MAC address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    credit_card: "credit card number",
    jwt: "JWT",
    template_literal: "input"
  };
  const TypeDictionary = {
    nan: "NaN"
  };
  function getTypeName(type, input) {
    if (type === "number" && typeof input === "number" && !Number.isFinite(input)) {
      return String(input);
    }
    return TypeDictionary[type] ?? type;
  }
  return (issue2) => {
    switch (issue2.code) {
      case "invalid_type": {
        const expected = getTypeName(issue2.expected);
        const receivedType = parsedType(issue2.input);
        const received = getTypeName(receivedType, issue2.input);
        return `Invalid input: expected ${expected}, received ${received}`;
      }
      case "invalid_value":
        if (issue2.values.length === 1)
          return `Invalid input: expected ${stringifyPrimitive(issue2.values[0])}`;
        return `Invalid option: expected one of ${joinValues(issue2.values, "|")}`;
      case "too_big": {
        const adj = issue2.exact ? "exactly " : issue2.inclusive ? "<=" : "<";
        const sizing = getSizing(issue2.origin);
        if (sizing)
          return `Too big: expected ${issue2.origin ?? "value"} to have ${adj}${issue2.maximum.toString()} ${sizing.unit ?? "elements"}`;
        return `Too big: expected ${issue2.origin ?? "value"} to be ${adj}${issue2.maximum.toString()}`;
      }
      case "too_small": {
        const adj = issue2.exact ? "exactly " : issue2.inclusive ? ">=" : ">";
        const sizing = getSizing(issue2.origin);
        if (sizing) {
          return `Too small: expected ${issue2.origin} to have ${adj}${issue2.minimum.toString()} ${sizing.unit}`;
        }
        return `Too small: expected ${issue2.origin} to be ${adj}${issue2.minimum.toString()}`;
      }
      case "invalid_format": {
        const _issue = issue2;
        if (_issue.format === "starts_with") {
          return `Invalid string: must start with "${_issue.prefix}"`;
        }
        if (_issue.format === "ends_with")
          return `Invalid string: must end with "${_issue.suffix}"`;
        if (_issue.format === "includes")
          return `Invalid string: must include "${_issue.includes}"`;
        if (_issue.format === "regex")
          return `Invalid string: must match pattern ${_issue.pattern}`;
        return `Invalid ${FormatDictionary[_issue.format] ?? issue2.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${issue2.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${issue2.keys.length > 1 ? "s" : ""}: ${joinValues(issue2.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${issue2.origin}`;
      case "invalid_union":
        if (issue2.options && Array.isArray(issue2.options) && issue2.options.length > 0) {
          const opts = issue2.options.map((o) => `'${o}'`).join(" | ");
          return `Invalid discriminator value. Expected ${opts}`;
        }
        if (issue2.inclusive === false) {
          return "Invalid input: more than one option matched";
        }
        return "Invalid input";
      case "invalid_element":
        return `Invalid value in ${issue2.origin}`;
      default:
        return `Invalid input`;
    }
  };
};
function en_default() {
  return {
    localeError: error()
  };
}
// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/registries.js
var _a2;
class $ZodRegistry {
  constructor() {
    this._map = new WeakMap;
    this._idmap = new Map;
  }
  add(schema, ..._meta) {
    const meta = _meta[0];
    this._map.set(schema, meta);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.set(meta.id, schema);
    }
    return this;
  }
  clear() {
    this._map = new WeakMap;
    this._idmap = new Map;
    return this;
  }
  remove(schema) {
    const meta = this._map.get(schema);
    if (meta && typeof meta === "object" && "id" in meta) {
      this._idmap.delete(meta.id);
    }
    this._map.delete(schema);
    return this;
  }
  get(schema) {
    const p = schema._zod.parent;
    if (p) {
      const pm = { ...this.get(p) ?? {} };
      delete pm.id;
      const f = { ...pm, ...this._map.get(schema) };
      return Object.keys(f).length ? f : undefined;
    }
    return this._map.get(schema);
  }
  has(schema) {
    return this._map.has(schema);
  }
}
function registry() {
  return new $ZodRegistry;
}
(_a2 = globalThis).__zod_globalRegistry ?? (_a2.__zod_globalRegistry = registry());
var globalRegistry = globalThis.__zod_globalRegistry;
// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/api.js
function _string(Class2, params) {
  return new Class2({
    type: "string",
    ...normalizeParams(params)
  });
}
function _email(Class2, params) {
  return new Class2({
    type: "string",
    format: "email",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _guid(Class2, params) {
  return new Class2({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _uuidv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v4",
    ...normalizeParams(params)
  });
}
function _uuidv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v6",
    ...normalizeParams(params)
  });
}
function _uuidv7(Class2, params) {
  return new Class2({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: false,
    version: "v7",
    ...normalizeParams(params)
  });
}
function _url(Class2, params) {
  return new Class2({
    type: "string",
    format: "url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _emoji2(Class2, params) {
  return new Class2({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _nanoid(Class2, params) {
  return new Class2({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cuid2(Class2, params) {
  return new Class2({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ulid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _xid(Class2, params) {
  return new Class2({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ksuid(Class2, params) {
  return new Class2({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _ipv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv4(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _cidrv6(Class2, params) {
  return new Class2({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _base64url(Class2, params) {
  return new Class2({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _e164(Class2, params) {
  return new Class2({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _jwt(Class2, params) {
  return new Class2({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: false,
    ...normalizeParams(params)
  });
}
function _isoDateTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: false,
    local: false,
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDate(Class2, params) {
  return new Class2({
    type: "string",
    format: "date",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _isoTime(Class2, params) {
  return new Class2({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...normalizeParams(params)
  });
}
function _isoDuration(Class2, params) {
  return new Class2({
    type: "string",
    format: "duration",
    check: "string_format",
    ...normalizeParams(params)
  });
}
function _number(Class2, params) {
  return new Class2({
    type: "number",
    checks: [],
    ...normalizeParams(params)
  });
}
function _int(Class2, params) {
  return new Class2({
    type: "number",
    check: "number_format",
    abort: false,
    format: "safeint",
    ...normalizeParams(params)
  });
}
function _boolean(Class2, params) {
  return new Class2({
    type: "boolean",
    ...normalizeParams(params)
  });
}
function _unknown(Class2) {
  return new Class2({
    type: "unknown"
  });
}
function _never(Class2, params) {
  return new Class2({
    type: "never",
    ...normalizeParams(params)
  });
}
function _lt(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _lte(value, params) {
  return new $ZodCheckLessThan({
    check: "less_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _gt(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: false
  });
}
function _gte(value, params) {
  return new $ZodCheckGreaterThan({
    check: "greater_than",
    ...normalizeParams(params),
    value,
    inclusive: true
  });
}
function _multipleOf(value, params) {
  return new $ZodCheckMultipleOf({
    check: "multiple_of",
    ...normalizeParams(params),
    value
  });
}
function _maxLength(maximum, params) {
  const ch = new $ZodCheckMaxLength({
    check: "max_length",
    ...normalizeParams(params),
    maximum
  });
  return ch;
}
function _minLength(minimum, params) {
  return new $ZodCheckMinLength({
    check: "min_length",
    ...normalizeParams(params),
    minimum
  });
}
function _length(length, params) {
  return new $ZodCheckLengthEquals({
    check: "length_equals",
    ...normalizeParams(params),
    length
  });
}
function _regex(pattern, params) {
  return new $ZodCheckRegex({
    check: "string_format",
    format: "regex",
    ...normalizeParams(params),
    pattern
  });
}
function _lowercase(params) {
  return new $ZodCheckLowerCase({
    check: "string_format",
    format: "lowercase",
    ...normalizeParams(params)
  });
}
function _uppercase(params) {
  return new $ZodCheckUpperCase({
    check: "string_format",
    format: "uppercase",
    ...normalizeParams(params)
  });
}
function _includes(includes, params) {
  return new $ZodCheckIncludes({
    check: "string_format",
    format: "includes",
    ...normalizeParams(params),
    includes
  });
}
function _startsWith(prefix, params) {
  return new $ZodCheckStartsWith({
    check: "string_format",
    format: "starts_with",
    ...normalizeParams(params),
    prefix
  });
}
function _endsWith(suffix, params) {
  return new $ZodCheckEndsWith({
    check: "string_format",
    format: "ends_with",
    ...normalizeParams(params),
    suffix
  });
}
function _overwrite(tx) {
  return new $ZodCheckOverwrite({
    check: "overwrite",
    tx
  });
}
function _normalize(form) {
  return _overwrite((input) => input.normalize(form));
}
function _trim() {
  return _overwrite((input) => input.trim());
}
function _toLowerCase() {
  return _overwrite((input) => input.toLowerCase());
}
function _toUpperCase() {
  return _overwrite((input) => input.toUpperCase());
}
function _slugify() {
  return _overwrite((input) => slugify(input));
}
function _array(Class2, element, params) {
  return new Class2({
    type: "array",
    element,
    ...normalizeParams(params)
  });
}
function _refine(Class2, fn, _params) {
  const schema = new Class2({
    type: "custom",
    check: "custom",
    fn,
    ...normalizeParams(_params)
  });
  return schema;
}
function _superRefine(fn, params) {
  const ch = _check((payload) => {
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(issue(issue2, payload.value, ch._zod.def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        if (!("input" in _issue))
          _issue.input = payload.value;
        _issue.inst ?? (_issue.inst = ch);
        _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
        payload.issues.push(issue(_issue));
      }
    };
    return fn(payload.value, payload);
  }, params);
  return ch;
}
function _check(fn, params) {
  const ch = new $ZodCheck({
    check: "custom",
    ...normalizeParams(params)
  });
  ch._zod.check = fn;
  return ch;
}
// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/to-json-schema.js
function assignProps(target, ...sources) {
  for (const source of sources) {
    for (const key of Reflect.ownKeys(source)) {
      if (Object.prototype.propertyIsEnumerable.call(source, key)) {
        assignProp(target, key, source[key]);
      }
    }
  }
  return target;
}
function initializeContext(params) {
  let target = params?.target ?? "draft-2020-12";
  if (target === "draft-4")
    target = "draft-04";
  if (target === "draft-7")
    target = "draft-07";
  return {
    processors: params.processors ?? {},
    metadataRegistry: params?.metadata ?? globalRegistry,
    target,
    unrepresentable: params?.unrepresentable ?? "throw",
    override: params?.override ?? (() => {}),
    io: params?.io ?? "output",
    counter: 0,
    seen: new Map,
    sharedDefsExtractedFor: undefined,
    sharedEmitDoneFor: undefined,
    cycles: params?.cycles ?? "ref",
    reused: params?.reused ?? "inline",
    intersections: [],
    deferred: [],
    external: params?.external ?? undefined
  };
}
function handleUnrepresentable(schema, ctx, json, params, message) {
  const result = typeof ctx.unrepresentable === "function" ? ctx.unrepresentable({ zodSchema: schema, path: params.path, message }) : ctx.unrepresentable;
  if (result === "any")
    return false;
  if (result === undefined || result === "throw")
    throw new Error(message);
  Object.assign(json, result);
  return true;
}
function process2(schema, ctx, _params = { path: [], schemaPath: [] }) {
  var _a3;
  const def = schema._zod.def;
  const seen = ctx.seen.get(schema);
  if (seen) {
    seen.count++;
    const isCycle = _params.schemaPath.includes(schema);
    if (isCycle) {
      seen.cycle = _params.path;
    }
    return seen.schema;
  }
  const result = { schema: {}, count: 1, cycle: undefined, path: _params.path };
  ctx.seen.set(schema, result);
  ctx.sharedDefsExtractedFor = undefined;
  ctx.sharedEmitDoneFor = undefined;
  const overrideSchema = schema._zod.toJSONSchema?.();
  if (overrideSchema) {
    result.schema = overrideSchema;
  } else {
    const params = {
      ..._params,
      schemaPath: [..._params.schemaPath, schema],
      path: _params.path
    };
    if (schema._zod.processJSONSchema) {
      schema._zod.processJSONSchema(ctx, result.schema, params);
    } else {
      const _json = result.schema;
      const processor = ctx.processors[def.type];
      if (!processor) {
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
      }
      processor(schema, ctx, _json, params);
    }
    const parent = schema._zod.parent;
    if (parent) {
      if (!result.ref)
        result.ref = parent;
      process2(parent, ctx, params);
      ctx.seen.get(parent).isParent = true;
    }
  }
  const meta = ctx.metadataRegistry.get(schema);
  if (meta)
    assignProps(result.schema, meta);
  if (ctx.io === "input" && isTransforming(schema)) {
    delete result.schema.examples;
    delete result.schema.default;
  }
  if (ctx.io === "input" && "_prefault" in result.schema)
    (_a3 = result.schema).default ?? (_a3.default = result.schema._prefault);
  delete result.schema._prefault;
  const _result = ctx.seen.get(schema);
  return _result.schema;
}
function encodeJSONPointerSegment(segment) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function extractDefs(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  if (ctx.external && ctx.sharedDefsExtractedFor === ctx.external)
    return;
  const idToSchema = new Map;
  for (const entry of ctx.seen.entries()) {
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      const existing = idToSchema.get(id);
      if (existing && existing !== entry[0]) {
        throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      }
      idToSchema.set(id, entry[0]);
    }
  }
  const makeURI = (entry) => {
    const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
    if (ctx.external) {
      const externalId = ctx.external.registry.get(entry[0])?.id;
      const uriGenerator = ctx.external.uri ?? ((id2) => id2);
      if (externalId) {
        return { ref: uriGenerator(externalId) };
      }
      const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
      entry[1].defId = id;
      return { defId: id, ref: `${uriGenerator("__shared")}#/${defsSegment}/${encodeJSONPointerSegment(id)}` };
    }
    const uriPrefix = `#`;
    const defUriPrefix = `${uriPrefix}/${defsSegment}/`;
    if (entry[1] === root && !entry[1].schema.id) {
      return { ref: uriPrefix };
    }
    const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
    return { defId, ref: defUriPrefix + encodeJSONPointerSegment(defId) };
  };
  const extractToDef = (entry) => {
    if (entry[1].schema.$ref) {
      return;
    }
    const seen = entry[1];
    const { ref, defId } = makeURI(entry);
    seen.def = { ...seen.schema };
    if (defId)
      seen.defId = defId;
    const schema2 = seen.schema;
    for (const key in schema2) {
      delete schema2[key];
    }
    schema2.$ref = ref;
  };
  if (ctx.cycles === "throw") {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.cycle) {
        throw new Error("Cycle detected: " + `#/${seen.cycle?.join("/")}/<root>` + '\n\nSet the `cycles` parameter to `"ref"` to resolve cyclical schemas with defs.');
      }
    }
  }
  for (const entry of ctx.seen.entries()) {
    const seen = entry[1];
    if (schema === entry[0]) {
      extractToDef(entry);
      continue;
    }
    if (ctx.external) {
      const ext = ctx.external.registry.get(entry[0])?.id;
      if (schema !== entry[0] && ext) {
        extractToDef(entry);
        continue;
      }
    }
    const id = ctx.metadataRegistry.get(entry[0])?.id;
    if (id) {
      extractToDef(entry);
      continue;
    }
    if (seen.cycle) {
      extractToDef(entry);
      continue;
    }
    if (seen.count > 1) {
      if (ctx.reused === "ref") {
        extractToDef(entry);
        continue;
      }
    }
  }
  if (ctx.external)
    ctx.sharedDefsExtractedFor = ctx.external;
}
function compactTypeUnion(schema) {
  const options = schema.anyOf;
  if (!Array.isArray(options) || options.length === 0 || schema.type !== undefined)
    return;
  const types = [];
  for (const option of options) {
    if (!option || typeof option !== "object")
      return;
    compactTypeUnion(option);
    const keys = Object.keys(option);
    if (keys.length !== 1 || keys[0] !== "type")
      return;
    const type = option.type;
    for (const member of Array.isArray(type) ? type : [type]) {
      if (typeof member !== "string")
        return;
      if (!types.includes(member))
        types.push(member);
    }
  }
  delete schema.anyOf;
  schema.type = types.length === 1 ? types[0] : types;
}
var FOLDABLE_KEYS = new Set(["type", "properties", "required", "additionalProperties"]);
var UNION_KEYS = ["oneOf", "anyOf"];
function undeclaredConstraint(member) {
  const extra = member.additionalProperties;
  if (extra === undefined || extra === false || typeof extra !== "object" || extra === null)
    return null;
  return Object.keys(extra).length ? extra : null;
}
function foldObjects(members2) {
  const objects = [];
  for (const member of members2) {
    if (typeof member !== "object" || member.type !== "object")
      return null;
    for (const key in member) {
      if (!FOLDABLE_KEYS.has(key))
        return null;
    }
    objects.push(member);
  }
  const properties = {};
  const required2 = new Set;
  for (const object of objects) {
    for (const key in object.properties) {
      if (Object.prototype.hasOwnProperty.call(properties, key))
        continue;
      const parts = [];
      for (const other of objects) {
        const part = other.properties?.[key] ?? undeclaredConstraint(other);
        if (part === null || part === undefined)
          continue;
        if (!parts.some((seen) => JSON.stringify(seen) === JSON.stringify(part)))
          parts.push(part);
      }
      const merged = parts.length === 1 ? parts[0] : foldObjects(parts) ?? { allOf: parts };
      assignProp(properties, key, merged);
    }
    for (const key of object.required ?? [])
      required2.add(key);
  }
  const folded = { type: "object", properties };
  if (required2.size)
    folded.required = [...required2];
  if (objects.every((object) => object.additionalProperties === false)) {
    folded.additionalProperties = false;
  } else {
    const constraints = [];
    for (const object of objects) {
      const constraint = undeclaredConstraint(object);
      if (constraint && !constraints.some((seen) => JSON.stringify(seen) === JSON.stringify(constraint)))
        constraints.push(constraint);
    }
    if (constraints.length === 1)
      folded.additionalProperties = constraints[0];
    else if (constraints.length > 1)
      folded.additionalProperties = { allOf: constraints };
  }
  return folded;
}
function foldIntersection(json) {
  const allOf = json.allOf;
  if (!Array.isArray(allOf) || allOf.length < 2)
    return;
  for (const key of FOLDABLE_KEYS)
    if (key in json)
      return;
  const unions = allOf.filter((m) => UNION_KEYS.some((k) => Array.isArray(m[k])));
  let folded = null;
  if (!unions.length) {
    folded = foldObjects(allOf);
  } else {
    const union = unions[0];
    const keyword = UNION_KEYS.find((k) => Array.isArray(union[k]));
    if (Object.keys(union).length !== 1)
      return;
    const rest = allOf.filter((m) => m !== union);
    const branches = union[keyword].map((branch) => foldObjects([...rest, branch]));
    if (branches.some((b) => !b))
      return;
    folded = { [keyword]: branches };
  }
  if (!folded)
    return;
  delete json.allOf;
  assignProps(json, folded);
}
function finalize(ctx, schema) {
  const root = ctx.seen.get(schema);
  if (!root)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const flattenRef = (zodSchema) => {
    const seen = ctx.seen.get(zodSchema);
    if (seen.ref === null)
      return;
    const schema2 = seen.def ?? seen.schema;
    const _cached = { ...schema2 };
    const ref = seen.ref;
    seen.ref = null;
    if (ref) {
      flattenRef(ref);
      const refSeen = ctx.seen.get(ref);
      const refSchema = refSeen.schema;
      if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
        schema2.allOf = schema2.allOf ?? [];
        schema2.allOf.push(refSchema);
      } else {
        assignProps(schema2, refSchema);
      }
      assignProps(schema2, _cached);
      const isParentRef = zodSchema._zod.parent === ref;
      if (isParentRef) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (!(key in _cached)) {
            delete schema2[key];
          }
        }
      }
      if (refSchema.$ref && refSeen.def) {
        for (const key in schema2) {
          if (key === "$ref" || key === "allOf")
            continue;
          if (key in refSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(refSeen.def[key])) {
            delete schema2[key];
          }
        }
      }
    }
    const parent = zodSchema._zod.parent;
    if (parent && parent !== ref) {
      flattenRef(parent);
      const parentSeen = ctx.seen.get(parent);
      if (parentSeen?.schema.$ref) {
        schema2.$ref = parentSeen.schema.$ref;
        if (parentSeen.def) {
          for (const key in schema2) {
            if (key === "$ref" || key === "allOf")
              continue;
            if (key in parentSeen.def && JSON.stringify(schema2[key]) === JSON.stringify(parentSeen.def[key])) {
              delete schema2[key];
            }
          }
        }
      }
    }
    ctx.override({
      zodSchema,
      jsonSchema: schema2,
      path: seen.path ?? []
    });
  };
  if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
    for (const entry of [...ctx.seen.entries()].reverse()) {
      flattenRef(entry[0]);
    }
    if (ctx.target !== "openapi-3.0") {
      for (const entry of ctx.seen.entries()) {
        compactTypeUnion(entry[1].def ?? entry[1].schema);
      }
    }
    for (const rewrite of ctx.deferred)
      rewrite();
    if (ctx.intersections.length) {
      const carriers = new Map;
      for (const seen of ctx.seen.values()) {
        for (const json of [seen.schema, seen.def]) {
          const allOf = json?.allOf;
          if (!Array.isArray(allOf))
            continue;
          const existing = carriers.get(allOf);
          if (existing)
            existing.push(json);
          else
            carriers.set(allOf, [json]);
        }
      }
      for (const allOf of ctx.intersections) {
        for (const json of carriers.get(allOf) ?? [])
          foldIntersection(json);
      }
    }
  }
  const result = {};
  if (ctx.target === "draft-2020-12") {
    result.$schema = "https://json-schema.org/draft/2020-12/schema";
  } else if (ctx.target === "draft-07") {
    result.$schema = "http://json-schema.org/draft-07/schema#";
  } else if (ctx.target === "draft-04") {
    result.$schema = "http://json-schema.org/draft-04/schema#";
  } else if (ctx.target === "openapi-3.0") {}
  if (ctx.external?.uri) {
    const id = ctx.external.registry.get(schema)?.id;
    if (!id)
      throw new Error("Schema is missing an `id` property");
    result.$id = ctx.external.uri(id);
  }
  assignProps(result, root.defId ? root.schema : root.def ?? root.schema);
  const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
  if (rootMetaId !== undefined && result.id === rootMetaId)
    delete result.id;
  const defs = ctx.external?.defs ?? {};
  if (!ctx.external || ctx.sharedEmitDoneFor !== ctx.external) {
    for (const entry of ctx.seen.entries()) {
      const seen = entry[1];
      if (seen.def && seen.defId) {
        if (seen.def.id === seen.defId)
          delete seen.def.id;
        assignProp(defs, seen.defId, seen.def);
      }
    }
  }
  if (ctx.external)
    ctx.sharedEmitDoneFor = ctx.external;
  if (ctx.external) {} else {
    if (Object.keys(defs).length > 0) {
      if (ctx.target === "draft-2020-12") {
        result.$defs = defs;
      } else {
        result.definitions = defs;
      }
    }
  }
  try {
    const finalized = JSON.parse(JSON.stringify(result));
    Object.defineProperty(finalized, "~standard", {
      value: {
        ...schema["~standard"],
        jsonSchema: {
          input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
          output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
        }
      },
      enumerable: false,
      writable: false
    });
    return finalized;
  } catch (_err) {
    throw new Error("Error converting schema to JSON.");
  }
}
function isTransforming(_schema, _ctx) {
  const ctx = _ctx ?? { seen: new Set };
  if (ctx.seen.has(_schema))
    return false;
  ctx.seen.add(_schema);
  const def = _schema._zod.def;
  if (def.type === "transform")
    return true;
  if (def.type === "array")
    return isTransforming(def.element, ctx);
  if (def.type === "set")
    return isTransforming(def.valueType, ctx);
  if (def.type === "lazy")
    return isTransforming(def.getter(), ctx);
  if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault" || def.type === "catch") {
    return isTransforming(def.innerType, ctx);
  }
  if (def.type === "intersection") {
    return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
  }
  if (def.type === "record" || def.type === "map") {
    return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
  }
  if (def.type === "pipe") {
    if (_schema._zod.traits.has("$ZodCodec"))
      return true;
    return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
  }
  if (def.type === "object") {
    for (const key in def.shape) {
      if (isTransforming(def.shape[key], ctx))
        return true;
    }
    return false;
  }
  if (def.type === "union") {
    for (const option of def.options) {
      if (isTransforming(option, ctx))
        return true;
    }
    return false;
  }
  if (def.type === "tuple") {
    for (const item of def.items) {
      if (isTransforming(item, ctx))
        return true;
    }
    if (def.rest && isTransforming(def.rest, ctx))
      return true;
    return false;
  }
  return false;
}
var createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
  const ctx = initializeContext({ ...params, processors });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
var createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
  const { libraryOptions, target } = params ?? {};
  const ctx = initializeContext({ ...libraryOptions ?? {}, target, io, processors });
  process2(schema, ctx);
  extractDefs(ctx, schema);
  return finalize(ctx, schema);
};
// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/core/json-schema-processors.js
var formatMap = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
};
var stringProcessor = (schema, ctx, _json, _params) => {
  const json = _json;
  json.type = "string";
  const { minimum, maximum, format, patterns, contentEncoding, laxFormat } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minLength = minimum;
  if (typeof maximum === "number")
    json.maxLength = maximum;
  if (format) {
    json.format = formatMap[format] ?? format;
    if (json.format === "")
      delete json.format;
    if (format === "time" || laxFormat) {
      delete json.format;
    }
  }
  if (contentEncoding)
    json.contentEncoding = contentEncoding;
  if (patterns && patterns.size > 0) {
    const patternList = [...patterns];
    if (patternList.length === 1)
      json.pattern = patternList[0].source;
    else if (patternList.length > 1) {
      json.allOf = [
        ...patternList.map((regex) => ({
          ...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
          pattern: regex.source
        }))
      ];
    }
  }
};
var numberProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
  if (typeof format === "string" && format.includes("int"))
    json.type = "integer";
  else
    json.type = "number";
  const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
  const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
  const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
  if (exMin) {
    if (legacy) {
      json.minimum = exclusiveMinimum;
      json.exclusiveMinimum = true;
    } else {
      json.exclusiveMinimum = exclusiveMinimum;
    }
  } else if (typeof minimum === "number") {
    json.minimum = minimum;
  }
  if (exMax) {
    if (legacy) {
      json.maximum = exclusiveMaximum;
      json.exclusiveMaximum = true;
    } else {
      json.exclusiveMaximum = exclusiveMaximum;
    }
  } else if (typeof maximum === "number") {
    json.maximum = maximum;
  }
  if (typeof multipleOf === "number") {
    if (Number.isFinite(multipleOf) && multipleOf !== 0)
      json.multipleOf = Math.abs(multipleOf);
    else
      handleUnrepresentable(schema, ctx, json, params, `A multipleOf divisor of ${multipleOf} cannot be represented in JSON Schema`);
  }
};
var booleanProcessor = (_schema, _ctx, json, _params) => {
  json.type = "boolean";
};
var neverProcessor = (_schema, _ctx, json, _params) => {
  json.not = {};
};
var unknownProcessor = (_schema, _ctx, _json, _params) => {};
var enumProcessor = (schema, _ctx, json, _params) => {
  const def = schema._zod.def;
  const values = getEnumValues(def.entries);
  if (values.length === 0) {
    json.not = {};
    return;
  }
  if (values.every((v) => typeof v === "number"))
    json.type = "number";
  if (values.every((v) => typeof v === "string"))
    json.type = "string";
  json.enum = values;
};
var literalProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  if (def.values.length === 0) {
    json.not = {};
    return;
  }
  const vals = [];
  for (const val of def.values) {
    if (val === undefined) {
      if (handleUnrepresentable(schema, ctx, json, params, "Literal `undefined` cannot be represented in JSON Schema"))
        return;
    } else if (typeof val === "bigint") {
      if (handleUnrepresentable(schema, ctx, json, params, "BigInt literals cannot be represented in JSON Schema"))
        return;
      vals.push(Number(val));
    } else {
      vals.push(val);
    }
  }
  if (vals.length === 0) {} else if (vals.length === 1) {
    const val = vals[0];
    json.type = val === null ? "null" : typeof val;
    if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") {
      json.enum = [val];
    } else {
      json.const = val;
    }
  } else {
    if (vals.every((v) => typeof v === "number"))
      json.type = "number";
    if (vals.every((v) => typeof v === "string"))
      json.type = "string";
    if (vals.every((v) => typeof v === "boolean"))
      json.type = "boolean";
    if (vals.every((v) => v === null))
      json.type = "null";
    json.enum = vals;
  }
};
var customProcessor = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Custom types cannot be represented in JSON Schema");
};
var transformProcessor = (schema, ctx, json, params) => {
  handleUnrepresentable(schema, ctx, json, params, "Transforms cannot be represented in JSON Schema");
};
var arrayProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const { minimum, maximum } = schema._zod.bag;
  if (typeof minimum === "number")
    json.minItems = minimum;
  if (typeof maximum === "number")
    json.maxItems = maximum;
  json.type = "array";
  json.items = process2(def.element, ctx, {
    ...params,
    path: [...params.path, "items"]
  });
};
function inputOptin(schema) {
  const def = schema._zod.def;
  if (def.type === "pipe" && def.in._zod.traits.has("$ZodTransform")) {
    return inputOptin(def.out);
  }
  if (def.type === "catch") {
    return inputOptin(def.innerType);
  }
  return schema._zod.optin;
}
var objectProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  const shape = def.shape;
  const symbolKeys = Object.getOwnPropertySymbols(shape);
  if (symbolKeys.length && handleUnrepresentable(schema, ctx, json, params, "Symbol keys cannot be represented in JSON Schema")) {
    return;
  }
  json.type = "object";
  json.properties = {};
  for (const key in shape) {
    assignProp(json.properties, key, process2(shape[key], ctx, {
      ...params,
      path: [...params.path, "properties", key]
    }));
  }
  const allKeys = new Set(Object.keys(shape));
  const requiredKeys = new Set([...allKeys].filter((key) => {
    const field = def.shape[key];
    if (ctx.io === "input") {
      return inputOptin(field) === undefined;
    } else {
      return field._zod.optout === undefined;
    }
  }));
  if (requiredKeys.size > 0) {
    json.required = Array.from(requiredKeys);
  }
  if (def.catchall?._zod.def.type === "never") {
    json.additionalProperties = false;
  } else if (!def.catchall) {
    if (ctx.io === "output")
      json.additionalProperties = false;
  } else if (def.catchall) {
    json.additionalProperties = process2(def.catchall, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
};
var unionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const isExclusive = def.inclusive === false;
  const options = def.options.map((x, i) => process2(x, ctx, {
    ...params,
    path: [...params.path, isExclusive ? "oneOf" : "anyOf", i]
  }));
  if (isExclusive) {
    json.oneOf = options;
  } else {
    json.anyOf = options;
  }
};
var intersectionProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const a = process2(def.left, ctx, {
    ...params,
    path: [...params.path, "allOf", 0]
  });
  const b = process2(def.right, ctx, {
    ...params,
    path: [...params.path, "allOf", 1]
  });
  const isSimpleIntersection = (val) => ("allOf" in val) && Object.keys(val).length === 1;
  const allOf = [
    ...isSimpleIntersection(a) ? a.allOf : [a],
    ...isSimpleIntersection(b) ? b.allOf : [b]
  ];
  json.allOf = allOf;
  ctx.intersections.push(allOf);
};
function stringifyKeyNames(bySchema, json, visited) {
  if (json.$ref) {
    if (visited.has(json))
      return json;
    visited.add(json);
    const def = bySchema.get(json)?.def;
    if (!def)
      return json;
    const inlined = stringifyKeyNames(bySchema, def, visited);
    return inlined === def ? json : inlined;
  }
  for (const keyword of ["anyOf", "oneOf"]) {
    const branches = json[keyword];
    if (!Array.isArray(branches))
      continue;
    const mapped = branches.map((branch) => stringifyKeyNames(bySchema, branch, visited));
    if (mapped.some((branch, i) => branch !== branches[i]))
      json = { ...json, [keyword]: mapped };
  }
  const types = Array.isArray(json.type) ? json.type : [json.type];
  const numericType = !types.includes("string") && types.some((t) => t === "number" || t === "integer");
  const values = json.enum ?? (json.const !== undefined ? [json.const] : undefined);
  if (!numericType && !values?.some((v) => typeof v === "number"))
    return json;
  const { minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf, format, id, ...rest } = json;
  if (rest.enum)
    rest.enum = rest.enum.map((v) => typeof v === "number" ? String(v) : v);
  else if (typeof rest.const === "number")
    rest.const = String(rest.const);
  if (!numericType)
    return rest;
  rest.type = "string";
  if (!values)
    rest.pattern = (types.includes("number") ? number : integer).source;
  return rest;
}
var pendingRecords = new WeakMap;
function rewriteKeyNames(ctx) {
  const bySchema = new Map;
  for (const entry of ctx.seen.values()) {
    if (entry.def && !bySchema.has(entry.schema))
      bySchema.set(entry.schema, entry);
  }
  const rewrites = new Map;
  for (const record of pendingRecords.get(ctx) ?? []) {
    const seen = ctx.seen.get(record);
    const names = (seen?.def ?? seen?.schema)?.propertyNames;
    if (!names || names === true || rewrites.has(names))
      continue;
    const rewritten = stringifyKeyNames(bySchema, names, new Set);
    if (rewritten !== names)
      rewrites.set(names, rewritten);
  }
  if (!rewrites.size)
    return;
  for (const entry of ctx.seen.values()) {
    for (const carrier of [entry.schema, entry.def]) {
      const rewritten = carrier && rewrites.get(carrier.propertyNames);
      if (rewritten)
        carrier.propertyNames = rewritten;
    }
  }
}
var recordProcessor = (schema, ctx, _json, params) => {
  const json = _json;
  const def = schema._zod.def;
  json.type = "object";
  const keyType = def.keyType;
  const keyBag = keyType._zod.bag;
  const patterns = keyBag?.patterns;
  if (def.mode === "loose" && patterns && patterns.size > 0) {
    const valueSchema = process2(def.valueType, ctx, {
      ...params,
      path: [...params.path, "patternProperties", "*"]
    });
    json.patternProperties = {};
    for (const pattern of patterns) {
      assignProp(json.patternProperties, pattern.source, valueSchema);
    }
  } else {
    if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") {
      json.propertyNames = process2(def.keyType, ctx, {
        ...params,
        path: [...params.path, "propertyNames"]
      });
      let pending = pendingRecords.get(ctx);
      if (!pending) {
        pending = [];
        pendingRecords.set(ctx, pending);
        ctx.deferred.push(() => rewriteKeyNames(ctx));
      }
      pending.push(schema);
    }
    json.additionalProperties = process2(def.valueType, ctx, {
      ...params,
      path: [...params.path, "additionalProperties"]
    });
  }
  const keyValues = keyType._zod.values;
  const omittableOnInput = ctx.io === "input" && inputOptin(def.valueType) !== undefined;
  if (keyValues && !def.partial && !omittableOnInput) {
    const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
    if (validKeyValues.length > 0) {
      json.required = validKeyValues.map(String);
    }
  }
};
var nullableProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  const inner = process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  if (ctx.target === "openapi-3.0") {
    seen.ref = def.innerType;
    json.nullable = true;
  } else {
    json.anyOf = [inner, { type: "null" }];
  }
};
var nonoptionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
var UNREPRESENTABLE_DEFAULT = Symbol();
function serializeDefaultValue(value, schema, ctx, json, params) {
  let unrepresentable = false;
  const serialized = JSON.stringify(value, (_, val) => {
    if (typeof val !== "bigint")
      return val;
    unrepresentable = true;
    return null;
  });
  if (!unrepresentable)
    return JSON.parse(serialized);
  handleUnrepresentable(schema, ctx, json, params, "BigInt defaults cannot be represented in JSON Schema");
  return UNREPRESENTABLE_DEFAULT;
}
var defaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
  if (value !== UNREPRESENTABLE_DEFAULT)
    json.default = value;
};
var prefaultProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  if (ctx.io !== "input")
    return;
  const value = serializeDefaultValue(def.defaultValue, schema, ctx, json, params);
  if (value !== UNREPRESENTABLE_DEFAULT)
    json._prefault = value;
};
var catchProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  let catchValue;
  try {
    catchValue = def.catchValue(undefined);
  } catch {
    handleUnrepresentable(schema, ctx, json, params, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  json.default = catchValue;
};
var pipeProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  const inIsTransform = def.in._zod.traits.has("$ZodTransform");
  const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
  process2(innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = innerType;
};
var readonlyProcessor = (schema, ctx, json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
  json.readOnly = true;
};
var optionalProcessor = (schema, ctx, _json, params) => {
  const def = schema._zod.def;
  process2(def.innerType, ctx, params);
  const seen = ctx.seen.get(schema);
  seen.ref = def.innerType;
};
// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/classic/errors.js
var _installedErrorProtos = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function _lazyMethod(proto, key, make) {
  Object.defineProperty(proto, key, {
    configurable: true,
    enumerable: false,
    get() {
      const value = make(this);
      Object.defineProperty(this, key, { value, configurable: true, writable: true });
      return value;
    },
    set(value) {
      Object.defineProperty(this, key, { value, configurable: true, writable: true });
    }
  });
}
var initializer2 = (inst, issues) => {
  $ZodError.init(inst, issues);
  inst.name = "ZodError";
  const proto = Object.getPrototypeOf(inst);
  if (_installedErrorProtos.has(proto))
    return;
  _installedErrorProtos.add(proto);
  _lazyMethod(proto, "format", (self) => (mapper) => formatError(self, mapper));
  _lazyMethod(proto, "flatten", (self) => (mapper) => flattenError(self, mapper));
  _lazyMethod(proto, "addIssue", (self) => (issue2) => {
    self.issues.push(issue2);
    self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
  });
  _lazyMethod(proto, "addIssues", (self) => (issues2) => {
    self.issues.push(...issues2);
    self.message = JSON.stringify(self.issues, jsonStringifyReplacer, 2);
  });
  Object.defineProperty(proto, "isEmpty", {
    configurable: true,
    enumerable: false,
    get() {
      return this.issues.length === 0;
    }
  });
};
var ZodRealError = /* @__PURE__ */ $constructor("ZodError", initializer2, undefined, {
  Parent: Error
});

// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/classic/parse.js
var parse3 = /* @__PURE__ */ _parse(ZodRealError);
var parseAsync2 = /* @__PURE__ */ _parseAsync(ZodRealError);
var safeParse2 = /* @__PURE__ */ _safeParse(ZodRealError);
var safeParseAsync2 = /* @__PURE__ */ _safeParseAsync(ZodRealError);
var encode = /* @__PURE__ */ _encode(ZodRealError);
var decode = /* @__PURE__ */ _decode(ZodRealError);
var encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
var decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
var safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
var safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
var safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
var safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);

// ../../../../../node_modules/.bun/zod@4.5.4/node_modules/zod/v4/classic/schemas.js
function _ensureDefaultLocale() {
  if (!globalConfig.localeError)
    config(en_default());
}
function _ensureDefaultMemoizer() {
  if (!globalConfig.memoizer)
    config({ memoizer: memoizer() });
}
var ZodType = /* @__PURE__ */ $constructor("ZodType", (inst, def) => {
  _ensureDefaultLocale();
  $ZodType.init(inst, def);
  inst.def = def;
  inst.type = def.type;
  return inst;
}, {
  check(...chks) {
    const def = this.def;
    return this.clone(exports_util.mergeDefs(def, {
      checks: [
        ...def.checks ?? [],
        ...chks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
      ]
    }), { parent: true });
  },
  with(...chks) {
    return this.check(...chks);
  },
  clone(def, params) {
    return clone(this, def, params);
  },
  brand() {
    return this;
  },
  register(reg, meta2) {
    reg.add(this, meta2);
    return this;
  },
  refine(check, params) {
    return this.check(refine(check, params));
  },
  superRefine(refinement, params) {
    return this.check(superRefine(refinement, params));
  },
  overwrite(fn) {
    return this.check(_overwrite(fn));
  },
  optional() {
    return optional(this);
  },
  exactOptional() {
    return exactOptional(this);
  },
  nullable() {
    return nullable(this);
  },
  nullish() {
    return optional(nullable(this));
  },
  nonoptional(params) {
    return nonoptional(this, params);
  },
  array() {
    return array(this);
  },
  or(arg) {
    return union([this, arg]);
  },
  and(arg) {
    return intersection(this, arg);
  },
  transform(tx) {
    return pipe(this, transform(tx));
  },
  default(d) {
    return _default(this, d);
  },
  prefault(d) {
    return prefault(this, d);
  },
  catch(params) {
    return _catch(this, params);
  },
  pipe(target) {
    return pipe(this, target);
  },
  readonly() {
    return readonly(this);
  },
  describe(description) {
    const cl = this.clone();
    globalRegistry.add(cl, { description });
    return cl;
  },
  meta(...args) {
    if (args.length === 0)
      return globalRegistry.get(this);
    const cl = this.clone();
    globalRegistry.add(cl, args[0]);
    return cl;
  },
  isOptional() {
    return this.safeParse(undefined).success;
  },
  isNullable() {
    return this.safeParse(null).success;
  },
  apply(fn, ...args) {
    return args.length === 0 ? fn(this) : fn(this, ...args);
  },
  get "~standard"() {
    return exports_util.hide(this, "~standard", {
      ...standardProps(this),
      jsonSchema: {
        input: createStandardJSONSchemaMethod(this, "input"),
        output: createStandardJSONSchemaMethod(this, "output")
      }
    });
  },
  set "~standard"(value) {
    exports_util.own(this, "~standard", value);
  },
  parse: function _parse2(data, params) {
    return parse3(this, data, params, { callee: _parse2 });
  },
  parseAsync: async function _parseAsync2(data, params) {
    return await parseAsync2(this, data, params, { callee: _parseAsync2 });
  },
  safeParse(data, params) {
    return safeParse2(this, data, params);
  },
  async safeParseAsync(data, params) {
    return safeParseAsync2(this, data, params);
  },
  get spa() {
    return this?.safeParseAsync;
  },
  set spa(value) {
    exports_util.own(this, "spa", value);
  },
  encode: function _encode2(data, params) {
    return encode(this, data, params, { callee: _encode2 });
  },
  decode: function _decode2(data, params) {
    return decode(this, data, params, { callee: _decode2 });
  },
  encodeAsync: async function _encodeAsync2(data, params) {
    return await encodeAsync(this, data, params, { callee: _encodeAsync2 });
  },
  decodeAsync: async function _decodeAsync2(data, params) {
    return await decodeAsync(this, data, params, { callee: _decodeAsync2 });
  },
  safeEncode(data, params) {
    return safeEncode(this, data, params);
  },
  safeDecode(data, params) {
    return safeDecode(this, data, params);
  },
  async safeEncodeAsync(data, params) {
    return safeEncodeAsync(this, data, params);
  },
  async safeDecodeAsync(data, params) {
    return safeDecodeAsync(this, data, params);
  },
  toJSONSchema(params) {
    return createToJSONSchemaMethod(this, {})(params);
  },
  get description() {
    return globalRegistry.get(this)?.description;
  },
  get _def() {
    return this._zod.def;
  }
});
var _ZodString = /* @__PURE__ */ $constructor("_ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
  const bag = inst._zod.bag;
  inst.format = bag.format ?? null;
  inst.minLength = bag.minimum ?? null;
  inst.maxLength = bag.maximum ?? null;
}, {
  regex(...args) {
    return this.check(_regex(...args));
  },
  includes(...args) {
    return this.check(_includes(...args));
  },
  startsWith(...args) {
    return this.check(_startsWith(...args));
  },
  endsWith(...args) {
    return this.check(_endsWith(...args));
  },
  min(...args) {
    return this.check(_minLength(...args));
  },
  max(...args) {
    return this.check(_maxLength(...args));
  },
  length(...args) {
    return this.check(_length(...args));
  },
  nonempty(...args) {
    return this.check(_minLength(1, ...args));
  },
  lowercase(params) {
    return this.check(_lowercase(params));
  },
  uppercase(params) {
    return this.check(_uppercase(params));
  },
  trim() {
    return this.check(_trim());
  },
  normalize(...args) {
    return this.check(_normalize(...args));
  },
  toLowerCase() {
    return this.check(_toLowerCase());
  },
  toUpperCase() {
    return this.check(_toUpperCase());
  },
  slugify() {
    return this.check(_slugify());
  }
});
var ZodString = /* @__PURE__ */ $constructor("ZodString", (inst, def) => {
  $ZodString.init(inst, def);
  _ZodString.init(inst, def);
}, {
  email(params) {
    return this.check(_email(ZodEmail, params));
  },
  url(params) {
    return this.check(_url(ZodURL, params));
  },
  jwt(params) {
    return this.check(_jwt(ZodJWT, params));
  },
  emoji(params) {
    return this.check(_emoji2(ZodEmoji, params));
  },
  guid(params) {
    return this.check(_guid(ZodGUID, params));
  },
  uuid(params) {
    return this.check(_uuid(ZodUUID, params));
  },
  uuidv4(params) {
    return this.check(_uuidv4(ZodUUID, params));
  },
  uuidv6(params) {
    return this.check(_uuidv6(ZodUUID, params));
  },
  uuidv7(params) {
    return this.check(_uuidv7(ZodUUID, params));
  },
  nanoid(params) {
    return this.check(_nanoid(ZodNanoID, params));
  },
  cuid(params) {
    return this.check(_cuid(ZodCUID, params));
  },
  cuid2(params) {
    return this.check(_cuid2(ZodCUID2, params));
  },
  ulid(params) {
    return this.check(_ulid(ZodULID, params));
  },
  base64(params) {
    return this.check(_base64(ZodBase64, params));
  },
  base64url(params) {
    return this.check(_base64url(ZodBase64URL, params));
  },
  xid(params) {
    return this.check(_xid(ZodXID, params));
  },
  ksuid(params) {
    return this.check(_ksuid(ZodKSUID, params));
  },
  ipv4(params) {
    return this.check(_ipv4(ZodIPv4, params));
  },
  ipv6(params) {
    return this.check(_ipv6(ZodIPv6, params));
  },
  cidrv4(params) {
    return this.check(_cidrv4(ZodCIDRv4, params));
  },
  cidrv6(params) {
    return this.check(_cidrv6(ZodCIDRv6, params));
  },
  e164(params) {
    return this.check(_e164(ZodE164, params));
  },
  datetime(params) {
    return this.check(_isoDateTime(ZodISODateTime, params));
  },
  date(params) {
    return this.check(_isoDate(ZodISODate, params));
  },
  time(params) {
    return this.check(_isoTime(ZodISOTime, params));
  },
  duration(params) {
    return this.check(_isoDuration(ZodISODuration, params));
  }
});
function string2(params) {
  return _string(ZodString, params);
}
var ZodStringFormat = /* @__PURE__ */ $constructor("ZodStringFormat", (inst, def) => {
  $ZodStringFormat.init(inst, def);
  _ZodString.init(inst, def);
});
var ZodISODateTime = /* @__PURE__ */ $constructor("ZodISODateTime", (inst, def) => {
  $ZodISODateTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodISODate = /* @__PURE__ */ $constructor("ZodISODate", (inst, def) => {
  $ZodISODate.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodISOTime = /* @__PURE__ */ $constructor("ZodISOTime", (inst, def) => {
  $ZodISOTime.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodISODuration = /* @__PURE__ */ $constructor("ZodISODuration", (inst, def) => {
  $ZodISODuration.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmail = /* @__PURE__ */ $constructor("ZodEmail", (inst, def) => {
  $ZodEmail.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodGUID = /* @__PURE__ */ $constructor("ZodGUID", (inst, def) => {
  $ZodGUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodUUID = /* @__PURE__ */ $constructor("ZodUUID", (inst, def) => {
  $ZodUUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodURL = /* @__PURE__ */ $constructor("ZodURL", (inst, def) => {
  $ZodURL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodEmoji = /* @__PURE__ */ $constructor("ZodEmoji", (inst, def) => {
  $ZodEmoji.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNanoID = /* @__PURE__ */ $constructor("ZodNanoID", (inst, def) => {
  $ZodNanoID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID = /* @__PURE__ */ $constructor("ZodCUID", (inst, def) => {
  $ZodCUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCUID2 = /* @__PURE__ */ $constructor("ZodCUID2", (inst, def) => {
  $ZodCUID2.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodULID = /* @__PURE__ */ $constructor("ZodULID", (inst, def) => {
  $ZodULID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodXID = /* @__PURE__ */ $constructor("ZodXID", (inst, def) => {
  $ZodXID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodKSUID = /* @__PURE__ */ $constructor("ZodKSUID", (inst, def) => {
  $ZodKSUID.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv4 = /* @__PURE__ */ $constructor("ZodIPv4", (inst, def) => {
  $ZodIPv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodIPv6 = /* @__PURE__ */ $constructor("ZodIPv6", (inst, def) => {
  $ZodIPv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv4 = /* @__PURE__ */ $constructor("ZodCIDRv4", (inst, def) => {
  $ZodCIDRv4.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodCIDRv6 = /* @__PURE__ */ $constructor("ZodCIDRv6", (inst, def) => {
  $ZodCIDRv6.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64 = /* @__PURE__ */ $constructor("ZodBase64", (inst, def) => {
  $ZodBase64.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodBase64URL = /* @__PURE__ */ $constructor("ZodBase64URL", (inst, def) => {
  $ZodBase64URL.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodE164 = /* @__PURE__ */ $constructor("ZodE164", (inst, def) => {
  $ZodE164.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodJWT = /* @__PURE__ */ $constructor("ZodJWT", (inst, def) => {
  $ZodJWT.init(inst, def);
  ZodStringFormat.init(inst, def);
});
var ZodNumber = /* @__PURE__ */ $constructor("ZodNumber", (inst, def) => {
  $ZodNumber.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
  const bag = inst._zod.bag;
  inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
  inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
  inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? 0.5);
  inst.isFinite = true;
  inst.format = bag.format ?? null;
}, {
  gt(value, params) {
    return this.check(_gt(value, params));
  },
  gte(value, params) {
    return this.check(_gte(value, params));
  },
  min(value, params) {
    return this.check(_gte(value, params));
  },
  lt(value, params) {
    return this.check(_lt(value, params));
  },
  lte(value, params) {
    return this.check(_lte(value, params));
  },
  max(value, params) {
    return this.check(_lte(value, params));
  },
  int(params) {
    return this.check(int(params));
  },
  safe(params) {
    return this.check(int(params));
  },
  positive(params) {
    return this.check(_gt(0, params));
  },
  nonnegative(params) {
    return this.check(_gte(0, params));
  },
  negative(params) {
    return this.check(_lt(0, params));
  },
  nonpositive(params) {
    return this.check(_lte(0, params));
  },
  multipleOf(value, params) {
    return this.check(_multipleOf(value, params));
  },
  step(value, params) {
    return this.check(_multipleOf(value, params));
  },
  finite() {
    return this;
  }
});
function number2(params) {
  return _number(ZodNumber, params);
}
var ZodNumberFormat = /* @__PURE__ */ $constructor("ZodNumberFormat", (inst, def) => {
  $ZodNumberFormat.init(inst, def);
  ZodNumber.init(inst, def);
});
function int(params) {
  return _int(ZodNumberFormat, params);
}
var ZodBoolean = /* @__PURE__ */ $constructor("ZodBoolean", (inst, def) => {
  $ZodBoolean.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
});
function boolean2(params) {
  return _boolean(ZodBoolean, params);
}
var ZodUnknown = /* @__PURE__ */ $constructor("ZodUnknown", (inst, def) => {
  $ZodUnknown.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unknownProcessor(inst, ctx, json, params);
});
function unknown() {
  return _unknown(ZodUnknown);
}
var ZodNever = /* @__PURE__ */ $constructor("ZodNever", (inst, def) => {
  $ZodNever.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
});
function never(params) {
  return _never(ZodNever, params);
}
var ZodArray = /* @__PURE__ */ $constructor("ZodArray", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodArray.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
  inst.element = def.element;
}, {
  min(n, params) {
    return this.check(_minLength(n, params));
  },
  nonempty(params) {
    return this.check(_minLength(1, params));
  },
  max(n, params) {
    return this.check(_maxLength(n, params));
  },
  length(n, params) {
    return this.check(_length(n, params));
  },
  unwrap() {
    return this.element;
  }
});
function array(element, params) {
  return _array(ZodArray, element, params);
}
var ZodObject = /* @__PURE__ */ $constructor("ZodObject", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodObjectJIT.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
  exports_util.installLazyProp(inst, "shape", (self) => self._zod.def.shape, false);
}, {
  keyof() {
    return _enum(Object.keys(this._zod.def.shape));
  },
  catchall(catchall) {
    return this.clone({ ...this._zod.def, catchall });
  },
  passthrough() {
    return this.clone({ ...this._zod.def, catchall: unknown() });
  },
  loose() {
    return this.clone({ ...this._zod.def, catchall: unknown() });
  },
  strict() {
    return this.clone({ ...this._zod.def, catchall: never() });
  },
  strip() {
    return this.clone({ ...this._zod.def, catchall: undefined });
  },
  extend(incoming) {
    return exports_util.extend(this, incoming);
  },
  safeExtend(incoming) {
    return exports_util.safeExtend(this, incoming);
  },
  merge(other) {
    return exports_util.merge(this, other);
  },
  pick(mask) {
    return exports_util.pick(this, mask);
  },
  omit(mask) {
    return exports_util.omit(this, mask);
  },
  partial(...args) {
    return exports_util.partial(ZodOptional, this, args[0]);
  },
  exactPartial(...args) {
    return exports_util.partial(ZodExactOptional, this, args[0], "exactPartial");
  },
  required(...args) {
    return exports_util.required(ZodNonOptional, this, args[0]);
  }
});
function object(shape, params) {
  const def = {
    type: "object",
    shape: shape ?? {},
    ...exports_util.normalizeParams(params)
  };
  return new ZodObject(def);
}
var ZodUnion = /* @__PURE__ */ $constructor("ZodUnion", (inst, def) => {
  $ZodUnion.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
  inst.options = def.options;
});
function union(options, params) {
  return new ZodUnion({
    type: "union",
    options,
    ...exports_util.normalizeParams(params)
  });
}
var ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("ZodDiscriminatedUnion", (inst, def) => {
  ZodUnion.init(inst, def);
  $ZodDiscriminatedUnion.init(inst, def);
});
function discriminatedUnion(discriminator, options, params) {
  return new ZodDiscriminatedUnion({
    type: "union",
    options,
    discriminator,
    ...exports_util.normalizeParams(params)
  });
}
var ZodIntersection = /* @__PURE__ */ $constructor("ZodIntersection", (inst, def) => {
  $ZodIntersection.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
});
function intersection(left, right) {
  return new ZodIntersection({
    type: "intersection",
    left,
    right
  });
}
var ZodRecord = /* @__PURE__ */ $constructor("ZodRecord", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodRecord.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
  inst.keyType = def.keyType;
  inst.valueType = def.valueType;
});
function record(keyType, valueType, params) {
  if (!valueType || !valueType._zod) {
    return new ZodRecord({
      type: "record",
      keyType: string2(),
      valueType: keyType,
      ...exports_util.normalizeParams(valueType)
    });
  }
  return new ZodRecord({
    type: "record",
    keyType,
    valueType,
    ...exports_util.normalizeParams(params)
  });
}
var ZodEnum = /* @__PURE__ */ $constructor("ZodEnum", (inst, def) => {
  $ZodEnum.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
  inst.enum = def.entries;
  inst.options = Object.values(def.entries);
  const keys = new Set(Object.keys(def.entries));
  inst.extract = (values, params) => {
    const newEntries = {};
    for (const value of values) {
      if (keys.has(value)) {
        newEntries[value] = def.entries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...exports_util.normalizeParams(params),
      entries: newEntries
    });
  };
  inst.exclude = (values, params) => {
    const newEntries = { ...def.entries };
    for (const value of values) {
      if (keys.has(value)) {
        delete newEntries[value];
      } else
        throw new Error(`Key ${value} not found in enum`);
    }
    return new ZodEnum({
      ...def,
      checks: [],
      ...exports_util.normalizeParams(params),
      entries: newEntries
    });
  };
});
function _enum(values, params) {
  const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
  return new ZodEnum({
    type: "enum",
    entries,
    ...exports_util.normalizeParams(params)
  });
}
var ZodLiteral = /* @__PURE__ */ $constructor("ZodLiteral", (inst, def) => {
  $ZodLiteral.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
  inst.values = new Set(def.values);
  Object.defineProperty(inst, "value", {
    get() {
      if (def.values.length > 1) {
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      }
      return def.values[0];
    }
  });
});
function literal(value, params) {
  return new ZodLiteral({
    type: "literal",
    values: Array.isArray(value) ? value : [value],
    ...exports_util.normalizeParams(params)
  });
}
var ZodTransform = /* @__PURE__ */ $constructor("ZodTransform", (inst, def) => {
  _ensureDefaultMemoizer();
  $ZodTransform.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
  inst._zod.parse = (payload, _ctx) => {
    if (_ctx.direction === "backward") {
      throw new $ZodEncodeError(inst.constructor.name);
    }
    payload.addIssue = (issue2) => {
      if (typeof issue2 === "string") {
        payload.issues.push(exports_util.issue(issue2, payload.value, def));
      } else {
        const _issue = issue2;
        if (_issue.fatal)
          _issue.continue = false;
        _issue.code ?? (_issue.code = "custom");
        if (!("input" in _issue))
          _issue.input = payload.value;
        _issue.inst ?? (_issue.inst = inst);
        payload.issues.push(exports_util.issue(_issue));
      }
    };
    const output = def.transform(payload.value, payload);
    if (output instanceof Promise) {
      return output.then((output2) => {
        payload.value = output2;
        return payload;
      });
    }
    payload.value = output;
    return payload;
  };
});
function transform(fn) {
  return new ZodTransform({
    type: "transform",
    transform: fn
  });
}
var ZodOptional = /* @__PURE__ */ $constructor("ZodOptional", (inst, def) => {
  $ZodOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function optional(innerType) {
  return new ZodOptional({
    type: "optional",
    innerType
  });
}
var ZodExactOptional = /* @__PURE__ */ $constructor("ZodExactOptional", (inst, def) => {
  $ZodExactOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function exactOptional(innerType) {
  return new ZodExactOptional({
    type: "optional",
    innerType
  });
}
var ZodNullable = /* @__PURE__ */ $constructor("ZodNullable", (inst, def) => {
  $ZodNullable.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nullable(innerType) {
  return new ZodNullable({
    type: "nullable",
    innerType
  });
}
var ZodDefault = /* @__PURE__ */ $constructor("ZodDefault", (inst, def) => {
  $ZodDefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeDefault = inst.unwrap;
});
function _default(innerType, defaultValue) {
  return new ZodDefault({
    type: "default",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : exports_util.shallowClone(defaultValue);
    }
  });
}
var ZodPrefault = /* @__PURE__ */ $constructor("ZodPrefault", (inst, def) => {
  $ZodPrefault.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function prefault(innerType, defaultValue) {
  return new ZodPrefault({
    type: "prefault",
    innerType,
    get defaultValue() {
      return typeof defaultValue === "function" ? defaultValue() : exports_util.shallowClone(defaultValue);
    }
  });
}
var ZodNonOptional = /* @__PURE__ */ $constructor("ZodNonOptional", (inst, def) => {
  $ZodNonOptional.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function nonoptional(innerType, params) {
  return new ZodNonOptional({
    type: "nonoptional",
    innerType,
    ...exports_util.normalizeParams(params)
  });
}
var ZodCatch = /* @__PURE__ */ $constructor("ZodCatch", (inst, def) => {
  $ZodCatch.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
  inst.removeCatch = inst.unwrap;
});
function _catch(innerType, catchValue) {
  return new ZodCatch({
    type: "catch",
    innerType,
    catchValue: typeof catchValue === "function" ? catchValue : exports_util.constantCatch(catchValue)
  });
}
var ZodPipe = /* @__PURE__ */ $constructor("ZodPipe", (inst, def) => {
  $ZodPipe.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
  inst.in = def.in;
  inst.out = def.out;
});
function pipe(in_, out) {
  return new ZodPipe({
    type: "pipe",
    in: in_,
    out
  });
}
var ZodPreprocess = /* @__PURE__ */ $constructor("ZodPreprocess", (inst, def) => {
  ZodPipe.init(inst, def);
  $ZodPreprocess.init(inst, def);
});
var ZodReadonly = /* @__PURE__ */ $constructor("ZodReadonly", (inst, def) => {
  $ZodReadonly.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
  inst.unwrap = () => inst._zod.def.innerType;
});
function readonly(innerType) {
  return new ZodReadonly({
    type: "readonly",
    innerType
  });
}
var ZodCustom = /* @__PURE__ */ $constructor("ZodCustom", (inst, def) => {
  $ZodCustom.init(inst, def);
  ZodType.init(inst, def);
  inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
});
function refine(fn, _params = {}) {
  return _refine(ZodCustom, fn, _params);
}
function superRefine(fn, params) {
  return _superRefine(fn, params);
}
function preprocess(fn, schema) {
  return new ZodPreprocess({
    type: "pipe",
    in: transform(fn),
    out: schema
  });
}

// ../../../../omo-config-core/src/schema/reasoning-vocabulary.ts
var REASONING_LEVELS = ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
var REASONING_AUTO = "auto";
var REASONING_LEVEL_SET = new Set(REASONING_LEVELS);
var REASONING_LEVEL_OR_AUTO_SET = new Set([...REASONING_LEVELS, REASONING_AUTO]);
function isReasoningLevel(value) {
  return REASONING_LEVEL_SET.has(value);
}
function normalizeReasoning(input) {
  const normalized = input.trim().toLowerCase();
  if (!normalized)
    return {};
  if (normalized === "none")
    return { level: "off" };
  if (normalized === REASONING_AUTO)
    return { level: REASONING_AUTO };
  if (isReasoningLevel(normalized))
    return { level: normalized };
  return { passthrough: normalized };
}
function splitReasoningSuffix(model, options) {
  if (typeof model !== "string")
    return { base: "" };
  const trimmed = model.trim();
  if (!trimmed)
    return { base: "" };
  const separatorIndex = trimmed.lastIndexOf(":");
  if (separatorIndex === -1)
    return { base: trimmed };
  const base = trimmed.slice(0, separatorIndex).trim();
  const token = trimmed.slice(separatorIndex + 1).trim().toLowerCase();
  if (!base || !REASONING_LEVEL_OR_AUTO_SET.has(token))
    return { base: trimmed };
  if (token === "max" && !(options?.allowMaxSuffix ?? base.includes("/")))
    return { base: trimmed };
  return { base, level: token };
}

// ../../../../omo-config-core/src/schema/model-ref.ts
var REASONING_LEVELS_OR_AUTO = [...REASONING_LEVELS, "auto"];
var OmoReasoningSchema = union([
  _enum(REASONING_LEVELS_OR_AUTO),
  string2()
]);
var OmoModelRefObjectSchema = object({
  model: string2(),
  reasoning: OmoReasoningSchema.optional(),
  temperature: number2().min(0).max(2).optional(),
  top_p: number2().min(0).max(1).optional(),
  max_tokens: number2().int().positive().optional(),
  provider_options: record(string2(), unknown()).optional()
}).strict();
var OmoModelRefSchema = union([string2(), OmoModelRefObjectSchema]);

// ../../../../omo-config-core/src/schema/fallback-models.ts
var OmoThinkingConfigSchema = object({
  type: _enum(["enabled", "disabled"]),
  budgetTokens: number2().optional()
}).strict();
var OmoReasoningEffortSchema = OmoReasoningSchema;
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function canonicalReasoning(value) {
  if (typeof value !== "string")
    return;
  const normalized = normalizeReasoning(value);
  return normalized.level ?? normalized.passthrough;
}
function canonicalModelString(model) {
  const colon = splitReasoningSuffix(model, { allowMaxSuffix: true });
  if (colon.level !== undefined)
    return `${colon.base}:${colon.level}`;
  const trimmed = model.trim();
  const parenthesized = trimmed.match(/^(.*)\(([^()]+)\)\s*$/);
  const spaced = parenthesized === null ? trimmed.match(/^(.*\S)\s+([a-z][a-z0-9_-]*)$/i) : null;
  const base = (parenthesized?.[1] ?? spaced?.[1])?.trim();
  const token = (parenthesized?.[2] ?? spaced?.[2])?.trim();
  if (base === undefined || token === undefined)
    return trimmed;
  const normalized = normalizeReasoning(token);
  return normalized.level === undefined ? trimmed : `${base}:${normalized.level}`;
}
function normalizeLegacyModelFields(entry) {
  const normalized = { ...entry };
  delete normalized["variant"];
  delete normalized["reasoningEffort"];
  delete normalized["thinking"];
  delete normalized["textVerbosity"];
  delete normalized["maxTokens"];
  delete normalized["providerOptions"];
  if (typeof entry["model"] === "string")
    normalized["model"] = canonicalModelString(entry["model"]);
  const explicitReasoning = canonicalReasoning(entry["reasoning"]);
  const variant = canonicalReasoning(entry["variant"]);
  const reasoningEffort = canonicalReasoning(entry["reasoningEffort"]);
  const thinking = isRecord(entry["thinking"]) ? entry["thinking"] : undefined;
  const reasoning = explicitReasoning ?? reasoningEffort ?? variant ?? (thinking?.["type"] === "disabled" ? "off" : undefined);
  if (reasoning !== undefined)
    normalized["reasoning"] = reasoning;
  const providerOptions = isRecord(entry["provider_options"]) ? { ...entry["provider_options"] } : isRecord(entry["providerOptions"]) ? { ...entry["providerOptions"] } : {};
  if (thinking?.["type"] === "enabled")
    providerOptions["thinking"] = { ...thinking };
  if (entry["textVerbosity"] !== undefined)
    providerOptions["textVerbosity"] = entry["textVerbosity"];
  if (Object.keys(providerOptions).length > 0)
    normalized["provider_options"] = providerOptions;
  if (entry["max_tokens"] !== undefined)
    normalized["max_tokens"] = entry["max_tokens"];
  else if (entry["maxTokens"] !== undefined)
    normalized["max_tokens"] = entry["maxTokens"];
  return normalized;
}
var OmoLegacyFallbackModelObjectInputSchema = object({
  model: string2(),
  reasoning: OmoReasoningSchema.optional(),
  temperature: number2().min(0).max(2).optional(),
  top_p: number2().min(0).max(1).optional(),
  max_tokens: number2().int().positive().optional(),
  provider_options: record(string2(), unknown()).optional(),
  variant: string2().optional(),
  reasoningEffort: OmoReasoningEffortSchema.optional(),
  thinking: OmoThinkingConfigSchema.optional(),
  textVerbosity: _enum(["low", "medium", "high"]).optional(),
  maxTokens: number2().optional(),
  providerOptions: record(string2(), unknown()).optional()
}).strict();
var OmoFallbackModelObjectSchema = preprocess((value) => isRecord(value) ? normalizeLegacyModelFields(value) : value, OmoLegacyFallbackModelObjectInputSchema);
var OmoFallbackModelsSchema = union([
  string2(),
  array(string2()),
  array(OmoFallbackModelObjectSchema),
  array(union([string2(), OmoFallbackModelObjectSchema]))
]);

// ../../../../omo-config-core/src/schema/agent.ts
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var OmoAgentModelEntrySchema = union([string2(), OmoFallbackModelObjectSchema]);
var OmoAgentDefInputSchema = object({
  description: string2().optional(),
  prompt: string2().optional(),
  model: string2().optional(),
  models: array(OmoAgentModelEntrySchema).optional(),
  reasoning: OmoReasoningSchema.optional(),
  variant: string2().optional(),
  reasoningEffort: OmoReasoningEffortSchema.optional(),
  tools: record(string2(), boolean2()).optional(),
  execution_mode: _enum(["in-process", "process"]).optional(),
  background: boolean2().optional(),
  max_depth: number2().int().nonnegative().optional(),
  allowed_subagents: array(string2()).optional(),
  disallowed_tools: array(string2()).optional(),
  max_turns: number2().int().nonnegative().optional(),
  temperature: number2().min(0).max(2).optional(),
  disable: boolean2().optional()
}).strict();
var OmoAgentDefSchema = preprocess((value) => isRecord2(value) ? normalizeLegacyModelFields(value) : value, OmoAgentDefInputSchema);
var OmoAgentsConfigSchema = record(string2(), OmoAgentDefSchema);

// ../../../../omo-config-core/src/schema/category.ts
function isRecord3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var OmoCategoryConfigObjectSchema = object({
  description: string2().optional(),
  model: string2().optional(),
  models: array(union([string2(), OmoFallbackModelObjectSchema])).optional(),
  reasoning: OmoReasoningSchema.optional(),
  temperature: number2().min(0).max(2).optional(),
  top_p: number2().min(0).max(1).optional(),
  max_tokens: number2().int().positive().optional(),
  provider_options: record(string2(), unknown()).optional(),
  fallback_models: OmoFallbackModelsSchema.optional(),
  variant: string2().optional(),
  maxTokens: number2().optional(),
  thinking: OmoThinkingConfigSchema.optional(),
  reasoningEffort: OmoReasoningEffortSchema.optional(),
  textVerbosity: _enum(["low", "medium", "high"]).optional(),
  tools: record(string2(), boolean2()).optional(),
  prompt_append: string2().optional(),
  max_prompt_tokens: number2().int().positive().optional(),
  is_unstable_agent: boolean2().optional(),
  disable: boolean2().optional(),
  warn_unavailable: boolean2().optional()
}).strict();
var OmoCategoryConfigSchema = preprocess((value) => isRecord3(value) ? normalizeLegacyModelFields(value) : value, OmoCategoryConfigObjectSchema);
var OmoCategoriesConfigSchema = record(string2(), OmoCategoryConfigSchema);

// ../../../../omo-config-core/src/schema/harness.ts
var HARNESS_IDS = ["codex", "opencode", "omo"];
var OMO_CONFIG_HARNESS_IDS = ["opencode", "senpi", "codex"];
var OmoHarnessIdSchema = _enum(OMO_CONFIG_HARNESS_IDS);

// ../../../../omo-config-core/src/schema/codegraph.ts
var OmoCodegraphSettingsShape = {
  enabled: boolean2(),
  auto_provision: boolean2(),
  daemon: boolean2(),
  telemetry: boolean2(),
  install_dir: string2().optional(),
  watch_debounce_ms: number2().finite().nonnegative().optional(),
  excluded_roots: array(string2()).optional(),
  session_start_cooldown_ms: number2().finite().min(60000).optional()
};
var OmoCodegraphSettingsLayerSchema = object(OmoCodegraphSettingsShape).partial().strict();
var OmoCodegraphSettingsSchema = OmoCodegraphSettingsLayerSchema.extend({
  enabled: boolean2().default(true),
  auto_provision: boolean2().default(true),
  daemon: boolean2().default(true),
  telemetry: boolean2().default(false)
}).strict();

// ../../../../omo-config-core/src/schema/git-master.ts
var OmoGitMasterSettingsShape = {
  commit_footer: union([boolean2(), string2()]),
  include_co_authored_by: boolean2()
};
var OmoGitMasterSettingsLayerSchema = object(OmoGitMasterSettingsShape).partial().strict();
var OmoGitMasterSettingsSchema = OmoGitMasterSettingsLayerSchema.extend({
  commit_footer: union([boolean2(), string2()]).default(true),
  include_co_authored_by: boolean2().default(true)
}).strict();

// ../../../../omo-config-core/src/schema/memory.ts
var OmoMemoryReflectionTriggerSchema = object({
  step_count: number2().int().nonnegative().default(25),
  on_compaction: boolean2().default(true)
}).strict();
var OmoMemoryReflectionSchema = object({
  enabled: boolean2().default(true),
  trigger: OmoMemoryReflectionTriggerSchema.default({ step_count: 25, on_compaction: true }),
  merge: _enum(["auto", "integration"]).default("auto"),
  category: string2().min(1).default("quick"),
  timeout_minutes: number2().int().positive().default(15),
  sandbox: _enum(["auto", "required", "off"]).default("auto")
}).strict();
var OmoMemorySyncSchema = object({
  remote: string2().min(1).optional(),
  enabled: boolean2().default(true)
}).strict();
var OmoMemorySearchSchema = object({
  enabled: boolean2().default(true)
}).strict();
var OmoMemoryNudgeSchema = object({
  enabled: boolean2().default(true),
  every_user_turns: number2().int().min(1).default(10)
}).strict();
var OmoMemoryFactsSchema = object({
  enabled: boolean2().default(true),
  debounce_settles: number2().int().min(1).default(4)
}).strict();
var OmoMemoryDreamSchema = object({
  enabled: boolean2().default(true),
  idle_minutes: number2().int().min(0).default(30),
  min_hours_between: number2().int().min(1).default(24),
  shutdown_launch: boolean2().default(true),
  auto_select_max: number2().int().min(1).max(10).default(5),
  auto_select_max_chars: number2().int().min(1e4).default(150000)
}).strict();
var OmoMemoryPeopleSchema = object({
  enabled: boolean2().default(true),
  max_entries: number2().int().min(1).max(100).default(40),
  max_entry_chars: number2().int().min(50).max(500).default(200)
}).strict();
var OmoMemorySoulSchema = object({
  edit_notice: boolean2().default(true)
}).strict();
var OmoMemoryWriteNoticeSchema = object({
  enabled: boolean2().default(true)
}).strict();
var OmoMemoryReflectionTriggerLayerSchema = object({
  step_count: number2().int().nonnegative().optional(),
  on_compaction: boolean2().optional()
}).strict();
var OmoMemoryReflectionLayerSchema = object({
  enabled: boolean2().optional(),
  trigger: OmoMemoryReflectionTriggerLayerSchema.optional(),
  merge: _enum(["auto", "integration"]).optional(),
  category: string2().min(1).optional(),
  timeout_minutes: number2().int().positive().optional(),
  sandbox: _enum(["auto", "required", "off"]).optional()
}).strict();
var OmoMemorySyncLayerSchema = object({
  remote: string2().min(1).optional(),
  enabled: boolean2().optional()
}).strict();
var OmoMemorySearchLayerSchema = object({
  enabled: boolean2().optional()
}).strict();
var OmoMemoryNudgeLayerSchema = object({
  enabled: boolean2().optional(),
  every_user_turns: number2().int().min(1).optional()
}).strict();
var OmoMemoryFactsLayerSchema = object({
  enabled: boolean2().optional(),
  debounce_settles: number2().int().min(1).optional()
}).strict();
var OmoMemoryDreamLayerSchema = object({
  enabled: boolean2().optional(),
  idle_minutes: number2().int().min(0).optional(),
  min_hours_between: number2().int().min(1).optional(),
  shutdown_launch: boolean2().optional(),
  auto_select_max: number2().int().min(1).max(10).optional(),
  auto_select_max_chars: number2().int().min(1e4).optional()
}).strict();
var OmoMemoryPeopleLayerSchema = object({
  enabled: boolean2().optional(),
  max_entries: number2().int().min(1).max(100).optional(),
  max_entry_chars: number2().int().min(50).max(500).optional()
}).strict();
var OmoMemorySoulLayerSchema = object({
  edit_notice: boolean2().optional()
}).strict();
var OmoMemoryWriteNoticeLayerSchema = object({
  enabled: boolean2().optional()
}).strict();
var OmoMemoryAgentOverridesSchema = object({
  enabled: boolean2().optional(),
  agent: string2().min(1).optional(),
  reflection: OmoMemoryReflectionLayerSchema.optional(),
  nudge: OmoMemoryNudgeLayerSchema.optional(),
  facts: OmoMemoryFactsLayerSchema.optional(),
  dream: OmoMemoryDreamLayerSchema.optional(),
  people: OmoMemoryPeopleLayerSchema.optional(),
  soul: OmoMemorySoulLayerSchema.optional(),
  write_notice: OmoMemoryWriteNoticeLayerSchema.optional(),
  sync: OmoMemorySyncLayerSchema.optional(),
  search: OmoMemorySearchLayerSchema.optional(),
  compile_warn_tokens: number2().int().positive().optional()
}).strict();
var OmoMemorySettingsSchema = object({
  enabled: boolean2().default(true),
  agent: string2().min(1).default("auto"),
  tool_exposure: _enum(["direct", "search"]).default("direct"),
  reflection: OmoMemoryReflectionSchema.default({
    enabled: true,
    trigger: { step_count: 25, on_compaction: true },
    merge: "auto",
    category: "quick",
    timeout_minutes: 15,
    sandbox: "auto"
  }),
  nudge: OmoMemoryNudgeSchema.default({ enabled: true, every_user_turns: 10 }),
  facts: OmoMemoryFactsSchema.default({ enabled: true, debounce_settles: 4 }),
  dream: OmoMemoryDreamSchema.default({
    enabled: true,
    idle_minutes: 30,
    min_hours_between: 24,
    shutdown_launch: true,
    auto_select_max: 5,
    auto_select_max_chars: 150000
  }),
  people: OmoMemoryPeopleSchema.default({ enabled: true, max_entries: 40, max_entry_chars: 200 }),
  soul: OmoMemorySoulSchema.default({ edit_notice: true }),
  write_notice: OmoMemoryWriteNoticeSchema.default({ enabled: true }),
  sync: OmoMemorySyncSchema.default({ enabled: true }),
  search: OmoMemorySearchSchema.default({ enabled: true }),
  compile_warn_tokens: number2().int().positive().default(30000),
  agents: record(string2(), OmoMemoryAgentOverridesSchema).default({})
}).strict();
var OmoMemorySettingsLayerSchema = object({
  enabled: boolean2().optional(),
  agent: string2().min(1).optional(),
  tool_exposure: _enum(["direct", "search"]).optional(),
  reflection: OmoMemoryReflectionLayerSchema.optional(),
  nudge: OmoMemoryNudgeLayerSchema.optional(),
  facts: OmoMemoryFactsLayerSchema.optional(),
  dream: OmoMemoryDreamLayerSchema.optional(),
  people: OmoMemoryPeopleLayerSchema.optional(),
  soul: OmoMemorySoulLayerSchema.optional(),
  write_notice: OmoMemoryWriteNoticeLayerSchema.optional(),
  sync: OmoMemorySyncLayerSchema.optional(),
  search: OmoMemorySearchLayerSchema.optional(),
  compile_warn_tokens: number2().int().positive().optional(),
  agents: record(string2(), OmoMemoryAgentOverridesSchema).optional()
}).strict();

// ../../../../omo-config-core/src/schema/model-catalog.ts
function isRecord4(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
var OmoModelCatalogEntryInputSchema = object({
  model: string2(),
  reasoning: OmoReasoningSchema.optional(),
  variant: string2().optional(),
  reasoningEffort: OmoReasoningEffortSchema.optional()
}).strict();
var OmoModelCatalogEntrySchema = preprocess((value) => isRecord4(value) ? normalizeLegacyModelFields(value) : value, OmoModelCatalogEntryInputSchema);
var OmoModelCatalogSchema = record(string2(), OmoModelCatalogEntrySchema);
var OmoModelCatalogEntryLayerInputSchema = OmoModelCatalogEntryInputSchema.partial();
var OmoModelCatalogEntryLayerSchema = preprocess((value) => isRecord4(value) ? normalizeLegacyModelFields(value) : value, OmoModelCatalogEntryLayerInputSchema);
var OmoModelCatalogLayerSchema = record(string2(), OmoModelCatalogEntryLayerSchema);

// ../../../../omo-config-core/src/schema/task.ts
import { availableParallelism } from "node:os";
var ResidencyMaxChildrenInputSchema = union([number2().int().nonnegative(), literal("unlimited")]);
var OmoTaskWaitSchema = object({
  min_ms: number2().int().positive().default(5000),
  default_ms: number2().int().positive().default(60000),
  max_ms: number2().int().positive().default(600000)
}).strict();
var OmoTaskTeamSettingsSchema = object({
  max_members: number2().int().min(1).max(8).default(8),
  max_parallel_members: number2().int().min(1).max(8).default(4),
  max_wall_clock_minutes: number2().int().positive().default(120)
}).strict();
var OmoTaskWarningsSchema = object({
  unavailable_categories: boolean2().default(true)
}).strict();
var OmoTaskDagSettingsSchema = object({
  max_nodes_per_run: number2().int().positive().default(64),
  max_runs_per_session: number2().int().positive().default(16),
  subscriber_ring: number2().int().positive().default(1000),
  heartbeat_ms: number2().int().positive().default(15000),
  history_default_limit: number2().int().positive().default(256),
  history_max_limit: number2().int().positive().default(1000),
  retention_days: number2().int().positive().default(7),
  max_prompt_bytes: number2().int().positive().default(262144)
}).strict();
var OmoTaskSettingsSchema = object({
  default_execution_mode: _enum(["in-process", "process"]).default("in-process"),
  default_concurrency: number2().int().nonnegative().default(5),
  global_concurrency: number2().int().nonnegative().default(8),
  provider_concurrency: record(string2(), number2().int().nonnegative()).optional(),
  model_concurrency: record(string2(), number2().int().nonnegative()).optional(),
  max_depth: number2().int().nonnegative().default(1),
  residency_max_children: ResidencyMaxChildrenInputSchema.default(8),
  ttl_ms: number2().int().positive().default(86400000),
  state_dir: string2().optional(),
  reattach_on_reconcile: boolean2().optional(),
  resume_children: boolean2().default(true),
  warnings: OmoTaskWarningsSchema.default({ unavailable_categories: true }),
  wait: OmoTaskWaitSchema.default({ min_ms: 5000, default_ms: 60000, max_ms: 600000 }),
  team: OmoTaskTeamSettingsSchema.default({
    max_members: 8,
    max_parallel_members: 4,
    max_wall_clock_minutes: 120
  }),
  dag: OmoTaskDagSettingsSchema.optional()
}).strict();
var OmoTaskDagSettingsLayerSchema = object({
  max_nodes_per_run: number2().int().positive().optional(),
  max_runs_per_session: number2().int().positive().optional(),
  subscriber_ring: number2().int().positive().optional(),
  heartbeat_ms: number2().int().positive().optional(),
  history_default_limit: number2().int().positive().optional(),
  history_max_limit: number2().int().positive().optional(),
  retention_days: number2().int().positive().optional(),
  max_prompt_bytes: number2().int().positive().optional()
}).strict();
var OmoTaskWaitLayerSchema = object({
  min_ms: number2().int().positive().optional(),
  default_ms: number2().int().positive().optional(),
  max_ms: number2().int().positive().optional()
}).strict();
var OmoTaskTeamSettingsLayerSchema = object({
  max_members: number2().int().min(1).max(8).optional(),
  max_parallel_members: number2().int().min(1).max(8).optional(),
  max_wall_clock_minutes: number2().int().positive().optional()
}).strict();
var OmoTaskWarningsLayerSchema = object({
  unavailable_categories: boolean2().optional()
}).strict();
var OmoTaskSettingsLayerSchema = object({
  default_execution_mode: _enum(["in-process", "process"]).optional(),
  default_concurrency: number2().int().nonnegative().optional(),
  global_concurrency: number2().int().nonnegative().optional(),
  provider_concurrency: record(string2(), number2().int().nonnegative()).optional(),
  model_concurrency: record(string2(), number2().int().nonnegative()).optional(),
  max_depth: number2().int().nonnegative().optional(),
  residency_max_children: ResidencyMaxChildrenInputSchema.optional(),
  ttl_ms: number2().int().positive().optional(),
  state_dir: string2().optional(),
  reattach_on_reconcile: boolean2().optional(),
  resume_children: boolean2().optional(),
  warnings: OmoTaskWarningsLayerSchema.optional(),
  wait: OmoTaskWaitLayerSchema.optional(),
  team: OmoTaskTeamSettingsLayerSchema.optional(),
  dag: OmoTaskDagSettingsLayerSchema.optional()
}).strict();
function resolveOmoTaskSettings(input, resolveParallelism = availableParallelism) {
  const record2 = record(string2(), unknown()).parse(input);
  return OmoTaskSettingsSchema.parse({
    ...record2,
    residency_max_children: record2["residency_max_children"] ?? Math.max(8, resolveParallelism() * 3),
    global_concurrency: record2["global_concurrency"] ?? Math.max(8, resolveParallelism() * 2)
  });
}

// ../../../../omo-config-core/src/schema/team.ts
var OmoTeamMemberBaseSchema = object({
  name: string2().min(1).regex(/^[a-z0-9-]+$/),
  cwd: string2().optional(),
  worktreePath: string2().optional(),
  subscriptions: array(string2()).optional(),
  backendType: _enum(["in-process", "tmux"]).default("in-process"),
  color: string2().optional(),
  isActive: boolean2().default(true)
}).strict();
var OmoTeamCategoryMemberSchema = OmoTeamMemberBaseSchema.extend({
  kind: literal("category"),
  category: string2().min(1),
  prompt: string2().min(1)
});
var OmoTeamSubagentMemberSchema = OmoTeamMemberBaseSchema.extend({
  kind: literal("subagent_type"),
  subagent_type: string2().min(1),
  prompt: string2().optional()
});
var OmoTeamMemberSchema = discriminatedUnion("kind", [
  OmoTeamCategoryMemberSchema,
  OmoTeamSubagentMemberSchema
]);
var OmoTeamSpecBaseSchema = object({
  version: literal(1).default(1),
  name: string2().min(1).regex(/^[a-z0-9-]+$/).optional(),
  description: string2().optional(),
  createdAt: number2().int().positive().optional(),
  leadAgentId: string2().optional(),
  teamAllowedPaths: array(string2()).optional(),
  sessionPermission: string2().optional(),
  members: array(OmoTeamMemberSchema).min(1).max(8)
}).strict();
var OmoTeamSpecSchema = OmoTeamSpecBaseSchema.superRefine((teamSpec, ctx) => {
  if (teamSpec.leadAgentId === undefined && teamSpec.members.length > 1) {
    ctx.addIssue({
      code: "custom",
      message: "leadAgentId required when a team has multiple members",
      path: ["leadAgentId"]
    });
  }
});
var OmoTeamSpecLayerSchema = OmoTeamSpecBaseSchema.partial();
var OmoTeamsConfigSchema = record(string2(), OmoTeamSpecSchema);
var OmoTeamsConfigLayerSchema = record(string2(), OmoTeamSpecLayerSchema);

// ../../../../omo-config-core/src/schema/telemetry.ts
var OmoTelemetrySettingsShape = {
  enabled: boolean2()
};
var OmoTelemetrySettingsLayerSchema = object(OmoTelemetrySettingsShape).partial().strict();
var OmoTelemetrySettingsSchema = OmoTelemetrySettingsLayerSchema.extend({
  enabled: boolean2().default(true)
}).strict();

// ../../../../omo-config-core/src/schema/format-on-mutation.ts
var mode = _enum(["off", "best-effort", "required"]);
var languages = record(string2(), boolean2()).optional();
var OmoFormatOnMutationLayerSchema = object({
  mode: mode.optional(),
  languages,
  maxFileBytes: number2().int().positive().optional(),
  timeoutMs: number2().int().positive().optional()
}).strict();
var OmoFormatOnMutationSchema = OmoFormatOnMutationLayerSchema.extend({
  mode: mode.default("best-effort"),
  maxFileBytes: number2().int().positive().default(1048576),
  timeoutMs: number2().int().positive().default(3000)
}).strict();

// ../../../../omo-config-core/src/schema/config.ts
var OmoOpenCodeHarnessConfigSchema = record(string2(), unknown());
var OmoTypedHarnessConfigSchema = object({
  formatOnMutation: OmoFormatOnMutationLayerSchema.optional(),
  categories: OmoCategoriesConfigSchema.optional(),
  agents: OmoAgentsConfigSchema.optional(),
  codegraph: OmoCodegraphSettingsLayerSchema.optional(),
  git_master: OmoGitMasterSettingsLayerSchema.optional(),
  task: OmoTaskSettingsLayerSchema.optional(),
  teams: OmoTeamsConfigLayerSchema.optional(),
  models: OmoModelCatalogLayerSchema.optional(),
  memory: OmoMemorySettingsLayerSchema.optional(),
  telemetry: OmoTelemetrySettingsLayerSchema.optional()
}).strict();
var OmoConfigProfileSchema = object({
  formatOnMutation: OmoFormatOnMutationLayerSchema.optional(),
  categories: OmoCategoriesConfigSchema.optional(),
  agents: OmoAgentsConfigSchema.optional(),
  codegraph: OmoCodegraphSettingsLayerSchema.optional(),
  git_master: OmoGitMasterSettingsLayerSchema.optional(),
  task: OmoTaskSettingsLayerSchema.optional(),
  teams: OmoTeamsConfigLayerSchema.optional(),
  models: OmoModelCatalogLayerSchema.optional(),
  memory: OmoMemorySettingsLayerSchema.optional(),
  telemetry: OmoTelemetrySettingsLayerSchema.optional(),
  "[opencode]": OmoOpenCodeHarnessConfigSchema.optional(),
  "[senpi]": OmoTypedHarnessConfigSchema.optional(),
  "[codex]": OmoTypedHarnessConfigSchema.optional()
}).strict();
var OmoConfigSchema = object({
  formatOnMutation: OmoFormatOnMutationSchema.optional(),
  $schema: string2().optional(),
  categories: OmoCategoriesConfigSchema.optional(),
  agents: OmoAgentsConfigSchema.optional(),
  codegraph: OmoCodegraphSettingsSchema.optional(),
  git_master: OmoGitMasterSettingsSchema.optional(),
  task: OmoTaskSettingsSchema.optional(),
  teams: OmoTeamsConfigSchema.optional(),
  models: OmoModelCatalogSchema.optional(),
  memory: OmoMemorySettingsSchema.optional(),
  telemetry: OmoTelemetrySettingsSchema.optional(),
  "[opencode]": OmoOpenCodeHarnessConfigSchema.optional(),
  "[senpi]": OmoTypedHarnessConfigSchema.optional(),
  "[codex]": OmoTypedHarnessConfigSchema.optional(),
  profiles: record(string2(), OmoConfigProfileSchema).default({}),
  _migrations: array(string2()).optional(),
  legacy_migrations: record(string2(), unknown()).optional()
}).strict();
var OmoConfigLayerSchema = object({
  formatOnMutation: OmoFormatOnMutationLayerSchema.optional(),
  $schema: string2().optional(),
  categories: OmoCategoriesConfigSchema.optional(),
  agents: OmoAgentsConfigSchema.optional(),
  codegraph: OmoCodegraphSettingsLayerSchema.optional(),
  git_master: OmoGitMasterSettingsLayerSchema.optional(),
  task: OmoTaskSettingsLayerSchema.optional(),
  teams: OmoTeamsConfigLayerSchema.optional(),
  models: OmoModelCatalogLayerSchema.optional(),
  memory: OmoMemorySettingsLayerSchema.optional(),
  telemetry: OmoTelemetrySettingsLayerSchema.optional(),
  "[opencode]": OmoOpenCodeHarnessConfigSchema.optional(),
  "[senpi]": OmoTypedHarnessConfigSchema.optional(),
  "[codex]": OmoTypedHarnessConfigSchema.optional(),
  profiles: record(string2(), OmoConfigProfileSchema).optional(),
  _migrations: array(string2()).optional(),
  legacy_migrations: record(string2(), unknown()).optional()
}).strict();

// ../../../../../node_modules/.bun/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/scanner.js
function createScanner(text, ignoreTrivia = false) {
  const len = text.length;
  let pos = 0, value = "", tokenOffset = 0, token = 16, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0;
  function scanHexDigits(count, exact) {
    let digits = 0;
    let value2 = 0;
    while (digits < count || !exact) {
      let ch = text.charCodeAt(pos);
      if (ch >= 48 && ch <= 57) {
        value2 = value2 * 16 + ch - 48;
      } else if (ch >= 65 && ch <= 70) {
        value2 = value2 * 16 + ch - 65 + 10;
      } else if (ch >= 97 && ch <= 102) {
        value2 = value2 * 16 + ch - 97 + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count) {
      value2 = -1;
    }
    return value2;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value = "";
    tokenOffset = 0;
    token = 16;
    scanError = 0;
  }
  function scanNumber() {
    let start = pos;
    if (text.charCodeAt(pos) === 48) {
      pos++;
    } else {
      pos++;
      while (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text.length && text.charCodeAt(pos) === 46) {
      pos++;
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3;
        return text.substring(start, pos);
      }
    }
    let end = pos;
    if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
      pos++;
      if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) {
        pos++;
      }
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3;
      }
    }
    return text.substring(start, end);
  }
  function scanString() {
    let result = "", start = pos;
    while (true) {
      if (pos >= len) {
        result += text.substring(start, pos);
        scanError = 2;
        break;
      }
      const ch = text.charCodeAt(pos);
      if (ch === 34) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92) {
        result += text.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2;
          break;
        }
        const ch2 = text.charCodeAt(pos++);
        switch (ch2) {
          case 34:
            result += '"';
            break;
          case 92:
            result += "\\";
            break;
          case 47:
            result += "/";
            break;
          case 98:
            result += "\b";
            break;
          case 102:
            result += "\f";
            break;
          case 110:
            result += `
`;
            break;
          case 114:
            result += "\r";
            break;
          case 116:
            result += "\t";
            break;
          case 117:
            const ch3 = scanHexDigits(4, true);
            if (ch3 >= 0) {
              result += String.fromCharCode(ch3);
            } else {
              scanError = 4;
            }
            break;
          default:
            scanError = 5;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text.substring(start, pos);
          scanError = 2;
          break;
        } else {
          scanError = 6;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value = "";
    scanError = 0;
    tokenOffset = pos;
    lineStartOffset = lineNumber;
    prevTokenLineStartOffset = tokenLineStartOffset;
    if (pos >= len) {
      tokenOffset = len;
      return token = 17;
    }
    let code = text.charCodeAt(pos);
    if (isWhiteSpace(code)) {
      do {
        pos++;
        value += String.fromCharCode(code);
        code = text.charCodeAt(pos);
      } while (isWhiteSpace(code));
      return token = 15;
    }
    if (isLineBreak(code)) {
      pos++;
      value += String.fromCharCode(code);
      if (code === 13 && text.charCodeAt(pos) === 10) {
        pos++;
        value += `
`;
      }
      lineNumber++;
      tokenLineStartOffset = pos;
      return token = 14;
    }
    switch (code) {
      case 123:
        pos++;
        return token = 1;
      case 125:
        pos++;
        return token = 2;
      case 91:
        pos++;
        return token = 3;
      case 93:
        pos++;
        return token = 4;
      case 58:
        pos++;
        return token = 6;
      case 44:
        pos++;
        return token = 5;
      case 34:
        pos++;
        value = scanString();
        return token = 10;
      case 47:
        const start = pos - 1;
        if (text.charCodeAt(pos + 1) === 47) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value = text.substring(start, pos);
          return token = 12;
        }
        if (text.charCodeAt(pos + 1) === 42) {
          pos += 2;
          const safeLength = len - 1;
          let commentClosed = false;
          while (pos < safeLength) {
            const ch = text.charCodeAt(pos);
            if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
            if (isLineBreak(ch)) {
              if (ch === 13 && text.charCodeAt(pos) === 10) {
                pos++;
              }
              lineNumber++;
              tokenLineStartOffset = pos;
            }
          }
          if (!commentClosed) {
            pos++;
            scanError = 1;
          }
          value = text.substring(start, pos);
          return token = 13;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
      case 45:
        value += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text.charCodeAt(pos))) {
          return token = 16;
        }
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        value += scanNumber();
        return token = 11;
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value = text.substring(tokenOffset, pos);
          switch (value) {
            case "true":
              return token = 8;
            case "false":
              return token = 9;
            case "null":
              return token = 7;
          }
          return token = 16;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhiteSpace(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125:
      case 93:
      case 123:
      case 91:
      case 34:
      case 58:
      case 44:
      case 47:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    let result;
    do {
      result = scanNext();
    } while (result >= 12 && result <= 15);
    return result;
  }
  return {
    setPosition,
    getPosition: () => pos,
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: () => token,
    getTokenValue: () => value,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => pos - tokenOffset,
    getTokenStartLine: () => lineStartOffset,
    getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
    getTokenError: () => scanError
  };
}
function isWhiteSpace(ch) {
  return ch === 32 || ch === 9;
}
function isLineBreak(ch) {
  return ch === 10 || ch === 13;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var CharacterCodes;
(function(CharacterCodes2) {
  CharacterCodes2[CharacterCodes2["lineFeed"] = 10] = "lineFeed";
  CharacterCodes2[CharacterCodes2["carriageReturn"] = 13] = "carriageReturn";
  CharacterCodes2[CharacterCodes2["space"] = 32] = "space";
  CharacterCodes2[CharacterCodes2["_0"] = 48] = "_0";
  CharacterCodes2[CharacterCodes2["_1"] = 49] = "_1";
  CharacterCodes2[CharacterCodes2["_2"] = 50] = "_2";
  CharacterCodes2[CharacterCodes2["_3"] = 51] = "_3";
  CharacterCodes2[CharacterCodes2["_4"] = 52] = "_4";
  CharacterCodes2[CharacterCodes2["_5"] = 53] = "_5";
  CharacterCodes2[CharacterCodes2["_6"] = 54] = "_6";
  CharacterCodes2[CharacterCodes2["_7"] = 55] = "_7";
  CharacterCodes2[CharacterCodes2["_8"] = 56] = "_8";
  CharacterCodes2[CharacterCodes2["_9"] = 57] = "_9";
  CharacterCodes2[CharacterCodes2["a"] = 97] = "a";
  CharacterCodes2[CharacterCodes2["b"] = 98] = "b";
  CharacterCodes2[CharacterCodes2["c"] = 99] = "c";
  CharacterCodes2[CharacterCodes2["d"] = 100] = "d";
  CharacterCodes2[CharacterCodes2["e"] = 101] = "e";
  CharacterCodes2[CharacterCodes2["f"] = 102] = "f";
  CharacterCodes2[CharacterCodes2["g"] = 103] = "g";
  CharacterCodes2[CharacterCodes2["h"] = 104] = "h";
  CharacterCodes2[CharacterCodes2["i"] = 105] = "i";
  CharacterCodes2[CharacterCodes2["j"] = 106] = "j";
  CharacterCodes2[CharacterCodes2["k"] = 107] = "k";
  CharacterCodes2[CharacterCodes2["l"] = 108] = "l";
  CharacterCodes2[CharacterCodes2["m"] = 109] = "m";
  CharacterCodes2[CharacterCodes2["n"] = 110] = "n";
  CharacterCodes2[CharacterCodes2["o"] = 111] = "o";
  CharacterCodes2[CharacterCodes2["p"] = 112] = "p";
  CharacterCodes2[CharacterCodes2["q"] = 113] = "q";
  CharacterCodes2[CharacterCodes2["r"] = 114] = "r";
  CharacterCodes2[CharacterCodes2["s"] = 115] = "s";
  CharacterCodes2[CharacterCodes2["t"] = 116] = "t";
  CharacterCodes2[CharacterCodes2["u"] = 117] = "u";
  CharacterCodes2[CharacterCodes2["v"] = 118] = "v";
  CharacterCodes2[CharacterCodes2["w"] = 119] = "w";
  CharacterCodes2[CharacterCodes2["x"] = 120] = "x";
  CharacterCodes2[CharacterCodes2["y"] = 121] = "y";
  CharacterCodes2[CharacterCodes2["z"] = 122] = "z";
  CharacterCodes2[CharacterCodes2["A"] = 65] = "A";
  CharacterCodes2[CharacterCodes2["B"] = 66] = "B";
  CharacterCodes2[CharacterCodes2["C"] = 67] = "C";
  CharacterCodes2[CharacterCodes2["D"] = 68] = "D";
  CharacterCodes2[CharacterCodes2["E"] = 69] = "E";
  CharacterCodes2[CharacterCodes2["F"] = 70] = "F";
  CharacterCodes2[CharacterCodes2["G"] = 71] = "G";
  CharacterCodes2[CharacterCodes2["H"] = 72] = "H";
  CharacterCodes2[CharacterCodes2["I"] = 73] = "I";
  CharacterCodes2[CharacterCodes2["J"] = 74] = "J";
  CharacterCodes2[CharacterCodes2["K"] = 75] = "K";
  CharacterCodes2[CharacterCodes2["L"] = 76] = "L";
  CharacterCodes2[CharacterCodes2["M"] = 77] = "M";
  CharacterCodes2[CharacterCodes2["N"] = 78] = "N";
  CharacterCodes2[CharacterCodes2["O"] = 79] = "O";
  CharacterCodes2[CharacterCodes2["P"] = 80] = "P";
  CharacterCodes2[CharacterCodes2["Q"] = 81] = "Q";
  CharacterCodes2[CharacterCodes2["R"] = 82] = "R";
  CharacterCodes2[CharacterCodes2["S"] = 83] = "S";
  CharacterCodes2[CharacterCodes2["T"] = 84] = "T";
  CharacterCodes2[CharacterCodes2["U"] = 85] = "U";
  CharacterCodes2[CharacterCodes2["V"] = 86] = "V";
  CharacterCodes2[CharacterCodes2["W"] = 87] = "W";
  CharacterCodes2[CharacterCodes2["X"] = 88] = "X";
  CharacterCodes2[CharacterCodes2["Y"] = 89] = "Y";
  CharacterCodes2[CharacterCodes2["Z"] = 90] = "Z";
  CharacterCodes2[CharacterCodes2["asterisk"] = 42] = "asterisk";
  CharacterCodes2[CharacterCodes2["backslash"] = 92] = "backslash";
  CharacterCodes2[CharacterCodes2["closeBrace"] = 125] = "closeBrace";
  CharacterCodes2[CharacterCodes2["closeBracket"] = 93] = "closeBracket";
  CharacterCodes2[CharacterCodes2["colon"] = 58] = "colon";
  CharacterCodes2[CharacterCodes2["comma"] = 44] = "comma";
  CharacterCodes2[CharacterCodes2["dot"] = 46] = "dot";
  CharacterCodes2[CharacterCodes2["doubleQuote"] = 34] = "doubleQuote";
  CharacterCodes2[CharacterCodes2["minus"] = 45] = "minus";
  CharacterCodes2[CharacterCodes2["openBrace"] = 123] = "openBrace";
  CharacterCodes2[CharacterCodes2["openBracket"] = 91] = "openBracket";
  CharacterCodes2[CharacterCodes2["plus"] = 43] = "plus";
  CharacterCodes2[CharacterCodes2["slash"] = 47] = "slash";
  CharacterCodes2[CharacterCodes2["formFeed"] = 12] = "formFeed";
  CharacterCodes2[CharacterCodes2["tab"] = 9] = "tab";
})(CharacterCodes || (CharacterCodes = {}));

// ../../../../../node_modules/.bun/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/string-intern.js
var cachedSpaces = new Array(20).fill(0).map((_, index) => {
  return " ".repeat(index);
});
var maxCachedValues = 200;
var cachedBreakLinesWithSpaces = {
  " ": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return `
` + " ".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + " ".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return `\r
` + " ".repeat(index);
    })
  },
  "\t": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return `
` + "\t".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + "\t".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return `\r
` + "\t".repeat(index);
    })
  }
};
var supportedEols = [`
`, "\r", `\r
`];

// ../../../../../node_modules/.bun/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/format.js
function format(documentText, range, options) {
  let initialIndentLevel;
  let formatText;
  let formatTextStart;
  let rangeStart;
  let rangeEnd;
  if (range) {
    rangeStart = range.offset;
    rangeEnd = rangeStart + range.length;
    formatTextStart = rangeStart;
    while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
      formatTextStart--;
    }
    let endOffset = rangeEnd;
    while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
      endOffset++;
    }
    formatText = documentText.substring(formatTextStart, endOffset);
    initialIndentLevel = computeIndentLevel(formatText, options);
  } else {
    formatText = documentText;
    initialIndentLevel = 0;
    formatTextStart = 0;
    rangeStart = 0;
    rangeEnd = documentText.length;
  }
  const eol = getEOL(options, documentText);
  const eolFastPathSupported = supportedEols.includes(eol);
  let numberLineBreaks = 0;
  let indentLevel = 0;
  let indentValue;
  if (options.insertSpaces) {
    indentValue = cachedSpaces[options.tabSize || 4] ?? repeat(cachedSpaces[1], options.tabSize || 4);
  } else {
    indentValue = "\t";
  }
  const indentType = indentValue === "\t" ? "\t" : " ";
  let scanner = createScanner(formatText, false);
  let hasError = false;
  function newLinesAndIndent() {
    if (numberLineBreaks > 1) {
      return repeat(eol, numberLineBreaks) + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    const amountOfSpaces = indentValue.length * (initialIndentLevel + indentLevel);
    if (!eolFastPathSupported || amountOfSpaces > cachedBreakLinesWithSpaces[indentType][eol].length) {
      return eol + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    if (amountOfSpaces <= 0) {
      return eol;
    }
    return cachedBreakLinesWithSpaces[indentType][eol][amountOfSpaces];
  }
  function scanNext() {
    let token = scanner.scan();
    numberLineBreaks = 0;
    while (token === 15 || token === 14) {
      if (token === 14 && options.keepLines) {
        numberLineBreaks += 1;
      } else if (token === 14) {
        numberLineBreaks = 1;
      }
      token = scanner.scan();
    }
    hasError = token === 16 || scanner.getTokenError() !== 0;
    return token;
  }
  const editOperations = [];
  function addEdit(text, startOffset, endOffset) {
    if (!hasError && (!range || startOffset < rangeEnd && endOffset > rangeStart) && documentText.substring(startOffset, endOffset) !== text) {
      editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
    }
  }
  let firstToken = scanNext();
  if (options.keepLines && numberLineBreaks > 0) {
    addEdit(repeat(eol, numberLineBreaks), 0, 0);
  }
  if (firstToken !== 17) {
    let firstTokenStart = scanner.getTokenOffset() + formatTextStart;
    let initialIndent = indentValue.length * initialIndentLevel < 20 && options.insertSpaces ? cachedSpaces[indentValue.length * initialIndentLevel] : repeat(indentValue, initialIndentLevel);
    addEdit(initialIndent, formatTextStart, firstTokenStart);
  }
  while (firstToken !== 17) {
    let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
    let secondToken = scanNext();
    let replaceContent = "";
    let needsLineBreak = false;
    while (numberLineBreaks === 0 && (secondToken === 12 || secondToken === 13)) {
      let commentTokenStart = scanner.getTokenOffset() + formatTextStart;
      addEdit(cachedSpaces[1], firstTokenEnd, commentTokenStart);
      firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
      needsLineBreak = secondToken === 12;
      replaceContent = needsLineBreak ? newLinesAndIndent() : "";
      secondToken = scanNext();
    }
    if (secondToken === 2) {
      if (firstToken !== 1) {
        indentLevel--;
      }
      if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 1) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else if (secondToken === 4) {
      if (firstToken !== 3) {
        indentLevel--;
      }
      if (options.keepLines && numberLineBreaks > 0 || !options.keepLines && firstToken !== 3) {
        replaceContent = newLinesAndIndent();
      } else if (options.keepLines) {
        replaceContent = cachedSpaces[1];
      }
    } else {
      switch (firstToken) {
        case 3:
        case 1:
          indentLevel++;
          if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 5:
          if (options.keepLines && numberLineBreaks > 0 || !options.keepLines) {
            replaceContent = newLinesAndIndent();
          } else {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 12:
          replaceContent = newLinesAndIndent();
          break;
        case 13:
          if (numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 6:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (!needsLineBreak) {
            replaceContent = cachedSpaces[1];
          }
          break;
        case 10:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else if (secondToken === 6 && !needsLineBreak) {
            replaceContent = "";
          }
          break;
        case 7:
        case 8:
        case 9:
        case 11:
        case 2:
        case 4:
          if (options.keepLines && numberLineBreaks > 0) {
            replaceContent = newLinesAndIndent();
          } else {
            if ((secondToken === 12 || secondToken === 13) && !needsLineBreak) {
              replaceContent = cachedSpaces[1];
            } else if (secondToken !== 5 && secondToken !== 17) {
              hasError = true;
            }
          }
          break;
        case 16:
          hasError = true;
          break;
      }
      if (numberLineBreaks > 0 && (secondToken === 12 || secondToken === 13)) {
        replaceContent = newLinesAndIndent();
      }
    }
    if (secondToken === 17) {
      if (options.keepLines && numberLineBreaks > 0) {
        replaceContent = newLinesAndIndent();
      } else {
        replaceContent = options.insertFinalNewline ? eol : "";
      }
    }
    const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
    addEdit(replaceContent, firstTokenEnd, secondTokenStart);
    firstToken = secondToken;
  }
  return editOperations;
}
function repeat(s, count) {
  let result = "";
  for (let i = 0;i < count; i++) {
    result += s;
  }
  return result;
}
function computeIndentLevel(content, options) {
  let i = 0;
  let nChars = 0;
  const tabSize = options.tabSize || 4;
  while (i < content.length) {
    let ch = content.charAt(i);
    if (ch === cachedSpaces[1]) {
      nChars++;
    } else if (ch === "\t") {
      nChars += tabSize;
    } else {
      break;
    }
    i++;
  }
  return Math.floor(nChars / tabSize);
}
function getEOL(options, text) {
  for (let i = 0;i < text.length; i++) {
    const ch = text.charAt(i);
    if (ch === "\r") {
      if (i + 1 < text.length && text.charAt(i + 1) === `
`) {
        return `\r
`;
      }
      return "\r";
    } else if (ch === `
`) {
      return `
`;
    }
  }
  return options && options.eol || `
`;
}
function isEOL(text, offset) {
  return `\r
`.indexOf(text.charAt(offset)) !== -1;
}

// ../../../../../node_modules/.bun/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/parser.js
var ParseOptions;
(function(ParseOptions2) {
  ParseOptions2.DEFAULT = {
    allowTrailingComma: false
  };
})(ParseOptions || (ParseOptions = {}));
function parse4(text, errors2 = [], options = ParseOptions.DEFAULT) {
  let currentProperty = null;
  let currentParent = [];
  const previousParents = [];
  function onValue(value) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value;
    }
  }
  const visitor = {
    onObjectBegin: () => {
      const object2 = {};
      onValue(object2);
      previousParents.push(currentParent);
      currentParent = object2;
      currentProperty = null;
    },
    onObjectProperty: (name) => {
      currentProperty = name;
    },
    onObjectEnd: () => {
      currentParent = previousParents.pop();
    },
    onArrayBegin: () => {
      const array2 = [];
      onValue(array2);
      previousParents.push(currentParent);
      currentParent = array2;
      currentProperty = null;
    },
    onArrayEnd: () => {
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: (error2, offset, length) => {
      errors2.push({ error: error2, offset, length });
    }
  };
  visit(text, visitor, options);
  return currentParent[0];
}
function parseTree(text, errors2 = [], options = ParseOptions.DEFAULT) {
  let currentParent = { type: "array", offset: -1, length: -1, children: [], parent: undefined };
  function ensurePropertyComplete(endOffset) {
    if (currentParent.type === "property") {
      currentParent.length = endOffset - currentParent.offset;
      currentParent = currentParent.parent;
    }
  }
  function onValue(valueNode) {
    currentParent.children.push(valueNode);
    return valueNode;
  }
  const visitor = {
    onObjectBegin: (offset) => {
      currentParent = onValue({ type: "object", offset, length: -1, parent: currentParent, children: [] });
    },
    onObjectProperty: (name, offset, length) => {
      currentParent = onValue({ type: "property", offset, length: -1, parent: currentParent, children: [] });
      currentParent.children.push({ type: "string", value: name, offset, length, parent: currentParent });
    },
    onObjectEnd: (offset, length) => {
      ensurePropertyComplete(offset + length);
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onArrayBegin: (offset, length) => {
      currentParent = onValue({ type: "array", offset, length: -1, parent: currentParent, children: [] });
    },
    onArrayEnd: (offset, length) => {
      currentParent.length = offset + length - currentParent.offset;
      currentParent = currentParent.parent;
      ensurePropertyComplete(offset + length);
    },
    onLiteralValue: (value, offset, length) => {
      onValue({ type: getNodeType(value), offset, length, parent: currentParent, value });
      ensurePropertyComplete(offset + length);
    },
    onSeparator: (sep, offset, length) => {
      if (currentParent.type === "property") {
        if (sep === ":") {
          currentParent.colonOffset = offset;
        } else if (sep === ",") {
          ensurePropertyComplete(offset);
        }
      }
    },
    onError: (error2, offset, length) => {
      errors2.push({ error: error2, offset, length });
    }
  };
  visit(text, visitor, options);
  const result = currentParent.children[0];
  if (result) {
    delete result.parent;
  }
  return result;
}
function findNodeAtLocation(root, path) {
  if (!root) {
    return;
  }
  let node2 = root;
  for (let segment of path) {
    if (typeof segment === "string") {
      if (node2.type !== "object" || !Array.isArray(node2.children)) {
        return;
      }
      let found = false;
      for (const propertyNode of node2.children) {
        if (Array.isArray(propertyNode.children) && propertyNode.children[0].value === segment && propertyNode.children.length === 2) {
          node2 = propertyNode.children[1];
          found = true;
          break;
        }
      }
      if (!found) {
        return;
      }
    } else {
      const index = segment;
      if (node2.type !== "array" || index < 0 || !Array.isArray(node2.children) || index >= node2.children.length) {
        return;
      }
      node2 = node2.children[index];
    }
  }
  return node2;
}
function visit(text, visitor, options = ParseOptions.DEFAULT) {
  const _scanner = createScanner(text, false);
  const _jsonPath = [];
  let suppressedCallbacks = 0;
  function toNoArgVisit(visitFunction) {
    return visitFunction ? () => suppressedCallbacks === 0 && visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisitWithPath(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
  }
  function toBeginVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks++;
      } else {
        let cbReturn = visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice());
        if (cbReturn === false) {
          suppressedCallbacks = 1;
        }
      }
    } : () => true;
  }
  function toEndVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks--;
      }
      if (suppressedCallbacks === 0) {
        visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
      }
    } : () => true;
  }
  const onObjectBegin = toBeginVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty), onObjectEnd = toEndVisit(visitor.onObjectEnd), onArrayBegin = toBeginVisit(visitor.onArrayBegin), onArrayEnd = toEndVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
  const disallowComments = options && options.disallowComments;
  const allowTrailingComma = options && options.allowTrailingComma;
  function scanNext() {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4:
          handleError(14);
          break;
        case 5:
          handleError(15);
          break;
        case 3:
          handleError(13);
          break;
        case 1:
          if (!disallowComments) {
            handleError(11);
          }
          break;
        case 2:
          handleError(12);
          break;
        case 6:
          handleError(16);
          break;
      }
      switch (token) {
        case 12:
        case 13:
          if (disallowComments) {
            handleError(10);
          } else {
            onComment();
          }
          break;
        case 16:
          handleError(1);
          break;
        case 15:
        case 14:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error2, skipUntilAfter = [], skipUntil = []) {
    onError(error2);
    if (skipUntilAfter.length + skipUntil.length > 0) {
      let token = _scanner.getToken();
      while (token !== 17) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString(isValue) {
    const value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
      _jsonPath.push(value);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11:
        const tokenValue = _scanner.getTokenValue();
        let value = Number(tokenValue);
        if (isNaN(value)) {
          handleError(2);
          value = 0;
        }
        onLiteralValue(value);
        break;
      case 7:
        onLiteralValue(null);
        break;
      case 8:
        onLiteralValue(true);
        break;
      case 9:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10) {
      handleError(3, [], [2, 5]);
      return false;
    }
    parseString(false);
    if (_scanner.getToken() === 6) {
      onSeparator(":");
      scanNext();
      if (!parseValue()) {
        handleError(4, [], [2, 5]);
      }
    } else {
      handleError(5, [], [2, 5]);
    }
    _jsonPath.pop();
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 2 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (!parseProperty()) {
        handleError(4, [], [2, 5]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2) {
      handleError(7, [2], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray() {
    onArrayBegin();
    scanNext();
    let isFirstElement = true;
    let needsComma = false;
    while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 4 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (isFirstElement) {
        _jsonPath.push(0);
        isFirstElement = false;
      } else {
        _jsonPath[_jsonPath.length - 1]++;
      }
      if (!parseValue()) {
        handleError(4, [], [4, 5]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (!isFirstElement) {
      _jsonPath.pop();
    }
    if (_scanner.getToken() !== 4) {
      handleError(8, [4], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue() {
    switch (_scanner.getToken()) {
      case 3:
        return parseArray();
      case 1:
        return parseObject();
      case 10:
        return parseString(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17) {
    if (options.allowEmptyContent) {
      return true;
    }
    handleError(4, [], []);
    return false;
  }
  if (!parseValue()) {
    handleError(4, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17) {
    handleError(9, [], []);
  }
  return true;
}
function getNodeType(value) {
  switch (typeof value) {
    case "boolean":
      return "boolean";
    case "number":
      return "number";
    case "string":
      return "string";
    case "object": {
      if (!value) {
        return "null";
      } else if (Array.isArray(value)) {
        return "array";
      }
      return "object";
    }
    default:
      return "null";
  }
}

// ../../../../../node_modules/.bun/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/edit.js
function setProperty(text, originalPath, value, options) {
  const path = originalPath.slice();
  const errors2 = [];
  const root = parseTree(text, errors2);
  let parent = undefined;
  let lastSegment = undefined;
  while (path.length > 0) {
    lastSegment = path.pop();
    parent = findNodeAtLocation(root, path);
    if (parent === undefined && value !== undefined) {
      if (typeof lastSegment === "string") {
        value = { [lastSegment]: value };
      } else {
        value = [value];
      }
    } else {
      break;
    }
  }
  if (!parent) {
    if (value === undefined) {
      throw new Error("Can not delete in empty document");
    }
    return withFormatting(text, { offset: root ? root.offset : 0, length: root ? root.length : 0, content: JSON.stringify(value) }, options);
  } else if (parent.type === "object" && typeof lastSegment === "string" && Array.isArray(parent.children)) {
    const existing = findNodeAtLocation(parent, [lastSegment]);
    if (existing !== undefined) {
      if (value === undefined) {
        if (!existing.parent) {
          throw new Error("Malformed AST");
        }
        const propertyIndex = parent.children.indexOf(existing.parent);
        let removeBegin;
        let removeEnd = existing.parent.offset + existing.parent.length;
        if (propertyIndex > 0) {
          let previous = parent.children[propertyIndex - 1];
          removeBegin = previous.offset + previous.length;
        } else {
          removeBegin = parent.offset + 1;
          if (parent.children.length > 1) {
            let next = parent.children[1];
            removeEnd = next.offset;
          }
        }
        return withFormatting(text, { offset: removeBegin, length: removeEnd - removeBegin, content: "" }, options);
      } else {
        return withFormatting(text, { offset: existing.offset, length: existing.length, content: JSON.stringify(value) }, options);
      }
    } else {
      if (value === undefined) {
        return [];
      }
      const newProperty = `${JSON.stringify(lastSegment)}: ${JSON.stringify(value)}`;
      const index = options.getInsertionIndex ? options.getInsertionIndex(parent.children.map((p) => p.children[0].value)) : parent.children.length;
      let edit;
      if (index > 0) {
        let previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      } else if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty + "," };
      }
      return withFormatting(text, edit, options);
    }
  } else if (parent.type === "array" && typeof lastSegment === "number" && Array.isArray(parent.children)) {
    const insertIndex = lastSegment;
    if (insertIndex === -1) {
      const newProperty = `${JSON.stringify(value)}`;
      let edit;
      if (parent.children.length === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: newProperty };
      } else {
        const previous = parent.children[parent.children.length - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text, edit, options);
    } else if (value === undefined && parent.children.length >= 0) {
      const removalIndex = lastSegment;
      const toRemove = parent.children[removalIndex];
      let edit;
      if (parent.children.length === 1) {
        edit = { offset: parent.offset + 1, length: parent.length - 2, content: "" };
      } else if (parent.children.length - 1 === removalIndex) {
        let previous = parent.children[removalIndex - 1];
        let offset = previous.offset + previous.length;
        let parentEndOffset = parent.offset + parent.length;
        edit = { offset, length: parentEndOffset - 2 - offset, content: "" };
      } else {
        edit = { offset: toRemove.offset, length: parent.children[removalIndex + 1].offset - toRemove.offset, content: "" };
      }
      return withFormatting(text, edit, options);
    } else if (value !== undefined) {
      let edit;
      const newProperty = `${JSON.stringify(value)}`;
      if (!options.isArrayInsertion && parent.children.length > lastSegment) {
        const toModify = parent.children[lastSegment];
        edit = { offset: toModify.offset, length: toModify.length, content: newProperty };
      } else if (parent.children.length === 0 || lastSegment === 0) {
        edit = { offset: parent.offset + 1, length: 0, content: parent.children.length === 0 ? newProperty : newProperty + "," };
      } else {
        const index = lastSegment > parent.children.length ? parent.children.length : lastSegment;
        const previous = parent.children[index - 1];
        edit = { offset: previous.offset + previous.length, length: 0, content: "," + newProperty };
      }
      return withFormatting(text, edit, options);
    } else {
      throw new Error(`Can not ${value === undefined ? "remove" : options.isArrayInsertion ? "insert" : "modify"} Array index ${insertIndex} as length is not sufficient`);
    }
  } else {
    throw new Error(`Can not add ${typeof lastSegment !== "number" ? "index" : "property"} to parent of type ${parent.type}`);
  }
}
function withFormatting(text, edit, options) {
  if (!options.formattingOptions) {
    return [edit];
  }
  let newText = applyEdit(text, edit);
  let begin = edit.offset;
  let end = edit.offset + edit.content.length;
  if (edit.length === 0 || edit.content.length === 0) {
    while (begin > 0 && !isEOL(newText, begin - 1)) {
      begin--;
    }
    while (end < newText.length && !isEOL(newText, end)) {
      end++;
    }
  }
  const edits = format(newText, { offset: begin, length: end - begin }, { ...options.formattingOptions, keepLines: false });
  for (let i = edits.length - 1;i >= 0; i--) {
    const edit2 = edits[i];
    newText = applyEdit(newText, edit2);
    begin = Math.min(begin, edit2.offset);
    end = Math.max(end, edit2.offset + edit2.length);
    end += edit2.content.length - edit2.length;
  }
  const editLength = text.length - (newText.length - end) - begin;
  return [{ offset: begin, length: editLength, content: newText.substring(begin, end) }];
}
function applyEdit(text, edit) {
  return text.substring(0, edit.offset) + edit.content + text.substring(edit.offset + edit.length);
}

// ../../../../../node_modules/.bun/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/main.js
var ScanError;
(function(ScanError2) {
  ScanError2[ScanError2["None"] = 0] = "None";
  ScanError2[ScanError2["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
  ScanError2[ScanError2["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
  ScanError2[ScanError2["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
  ScanError2[ScanError2["InvalidUnicode"] = 4] = "InvalidUnicode";
  ScanError2[ScanError2["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
  ScanError2[ScanError2["InvalidCharacter"] = 6] = "InvalidCharacter";
})(ScanError || (ScanError = {}));
var SyntaxKind;
(function(SyntaxKind2) {
  SyntaxKind2[SyntaxKind2["OpenBraceToken"] = 1] = "OpenBraceToken";
  SyntaxKind2[SyntaxKind2["CloseBraceToken"] = 2] = "CloseBraceToken";
  SyntaxKind2[SyntaxKind2["OpenBracketToken"] = 3] = "OpenBracketToken";
  SyntaxKind2[SyntaxKind2["CloseBracketToken"] = 4] = "CloseBracketToken";
  SyntaxKind2[SyntaxKind2["CommaToken"] = 5] = "CommaToken";
  SyntaxKind2[SyntaxKind2["ColonToken"] = 6] = "ColonToken";
  SyntaxKind2[SyntaxKind2["NullKeyword"] = 7] = "NullKeyword";
  SyntaxKind2[SyntaxKind2["TrueKeyword"] = 8] = "TrueKeyword";
  SyntaxKind2[SyntaxKind2["FalseKeyword"] = 9] = "FalseKeyword";
  SyntaxKind2[SyntaxKind2["StringLiteral"] = 10] = "StringLiteral";
  SyntaxKind2[SyntaxKind2["NumericLiteral"] = 11] = "NumericLiteral";
  SyntaxKind2[SyntaxKind2["LineCommentTrivia"] = 12] = "LineCommentTrivia";
  SyntaxKind2[SyntaxKind2["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
  SyntaxKind2[SyntaxKind2["LineBreakTrivia"] = 14] = "LineBreakTrivia";
  SyntaxKind2[SyntaxKind2["Trivia"] = 15] = "Trivia";
  SyntaxKind2[SyntaxKind2["Unknown"] = 16] = "Unknown";
  SyntaxKind2[SyntaxKind2["EOF"] = 17] = "EOF";
})(SyntaxKind || (SyntaxKind = {}));
var parse5 = parse4;
var ParseErrorCode;
(function(ParseErrorCode2) {
  ParseErrorCode2[ParseErrorCode2["InvalidSymbol"] = 1] = "InvalidSymbol";
  ParseErrorCode2[ParseErrorCode2["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
  ParseErrorCode2[ParseErrorCode2["PropertyNameExpected"] = 3] = "PropertyNameExpected";
  ParseErrorCode2[ParseErrorCode2["ValueExpected"] = 4] = "ValueExpected";
  ParseErrorCode2[ParseErrorCode2["ColonExpected"] = 5] = "ColonExpected";
  ParseErrorCode2[ParseErrorCode2["CommaExpected"] = 6] = "CommaExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBraceExpected"] = 7] = "CloseBraceExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBracketExpected"] = 8] = "CloseBracketExpected";
  ParseErrorCode2[ParseErrorCode2["EndOfFileExpected"] = 9] = "EndOfFileExpected";
  ParseErrorCode2[ParseErrorCode2["InvalidCommentToken"] = 10] = "InvalidCommentToken";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
  ParseErrorCode2[ParseErrorCode2["InvalidUnicode"] = 14] = "InvalidUnicode";
  ParseErrorCode2[ParseErrorCode2["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
  ParseErrorCode2[ParseErrorCode2["InvalidCharacter"] = 16] = "InvalidCharacter";
})(ParseErrorCode || (ParseErrorCode = {}));
function printParseErrorCode(code) {
  switch (code) {
    case 1:
      return "InvalidSymbol";
    case 2:
      return "InvalidNumberFormat";
    case 3:
      return "PropertyNameExpected";
    case 4:
      return "ValueExpected";
    case 5:
      return "ColonExpected";
    case 6:
      return "CommaExpected";
    case 7:
      return "CloseBraceExpected";
    case 8:
      return "CloseBracketExpected";
    case 9:
      return "EndOfFileExpected";
    case 10:
      return "InvalidCommentToken";
    case 11:
      return "UnexpectedEndOfComment";
    case 12:
      return "UnexpectedEndOfString";
    case 13:
      return "UnexpectedEndOfNumber";
    case 14:
      return "InvalidUnicode";
    case 15:
      return "InvalidEscapeCharacter";
    case 16:
      return "InvalidCharacter";
  }
  return "<unknown ParseErrorCode>";
}
function modify(text, path, value, options) {
  return setProperty(text, path, value, options);
}
function applyEdits(text, edits) {
  let sortedEdits = edits.slice(0).sort((a, b) => {
    const diff = a.offset - b.offset;
    if (diff === 0) {
      return a.length - b.length;
    }
    return diff;
  });
  let lastModifiedOffset = text.length;
  for (let i = sortedEdits.length - 1;i >= 0; i--) {
    let e = sortedEdits[i];
    if (e.offset + e.length <= lastModifiedOffset) {
      text = applyEdit(text, e);
    } else {
      throw new Error("Overlapping edit");
    }
    lastModifiedOffset = e.offset;
  }
  return text;
}

// ../../../../omo-config-core/src/loader/merge.ts
var DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);
function isUnsafeObjectKey(key) {
  return DANGEROUS_KEYS.has(key);
}
function isPlainObject2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.prototype.toString.call(value) === "[object Object]";
}
function sanitizeOmoConfigValue(value) {
  if (Array.isArray(value))
    return value.map((entry) => sanitizeOmoConfigValue(entry));
  if (!isPlainObject2(value))
    return value;
  const sanitized = {};
  for (const [key, entry] of Object.entries(value)) {
    if (isUnsafeObjectKey(key))
      continue;
    sanitized[key] = sanitizeOmoConfigValue(entry);
  }
  return sanitized;
}
function mergeCodegraphExcludedRoots(base, override) {
  return [...new Set([...base, ...override])];
}
function mergeOmoConfigRecords(base, override, parentKey) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (isUnsafeObjectKey(key))
      continue;
    const safeValue = sanitizeOmoConfigValue(value);
    const baseValue = result[key];
    result[key] = key === "excluded_roots" && parentKey === "codegraph" && Array.isArray(baseValue) && Array.isArray(safeValue) ? mergeCodegraphExcludedRoots(baseValue, safeValue) : isPlainObject2(baseValue) && isPlainObject2(safeValue) ? mergeOmoConfigRecords(baseValue, safeValue, key) : safeValue;
  }
  return result;
}

// ../../../../omo-config-core/src/loader/paths.ts
import { userInfo } from "node:os";
import { dirname as dirname2, join as join7, posix, resolve as resolve3 } from "node:path";

// ../../../../omo-config-core/src/internal/posix-path.ts
function toPosixPath(path) {
  return path.split("\\").join("/");
}

// ../../../../omo-config-core/src/loader/types.ts
import { existsSync as existsSync4, lstatSync, readFileSync as readFileSync2, realpathSync as realpathSync2 } from "node:fs";
var DEFAULT_READ_FILE_SYSTEM = {
  existsSync: existsSync4,
  lstatSync,
  readFileSync: readFileSync2,
  realpathSync: realpathSync2
};

// ../../../../omo-config-core/src/loader/paths.ts
var MAX_PROJECT_CONFIG_DIRECTORY_DEPTH = 256;
var ACCOUNT_HOME_DIR = userInfo().homedir;
function resolveHomeDir(env = process.env) {
  const homeDir = env.HOME ?? env.USERPROFILE ?? process.cwd();
  return homeDir.startsWith("/") ? posix.resolve(homeDir) : toPosixPath(resolve3(homeDir));
}
function resolveUserOmoConfigPath(env = process.env) {
  return join7(resolveUserOmoConfigDirectory(env), "omo.jsonc");
}
function resolveUserOmoConfigDirectory(env = process.env) {
  return join7(resolveHomeDir(env), ".omo");
}
function detectUserOmoJsonPath(env, fileSystem) {
  const configDir = resolveUserOmoConfigDirectory(env);
  const jsoncPath = join7(configDir, "omo.jsonc");
  if (fileSystem.existsSync(jsoncPath))
    return jsoncPath;
  const jsonPath = join7(configDir, "omo.json");
  return fileSystem.existsSync(jsonPath) ? jsonPath : jsoncPath;
}
function isSymlinkedProjectPath(path, fileSystem) {
  if (fileSystem.lstatSync === undefined || !fileSystem.existsSync(path))
    return false;
  try {
    return fileSystem.lstatSync(path).isSymbolicLink();
  } catch (error2) {
    if (error2 instanceof Error)
      return true;
    throw error2;
  }
}
function isLoadableProjectConfigFile(path, fileSystem) {
  return fileSystem.existsSync(path) && !isSymlinkedProjectPath(path, fileSystem);
}
function detectOmoJsonPath(dir, fileSystem) {
  const omoDir = join7(dir, ".omo");
  if (isSymlinkedProjectPath(omoDir, fileSystem))
    return null;
  const jsoncPath = join7(omoDir, "omo.jsonc");
  if (isLoadableProjectConfigFile(jsoncPath, fileSystem))
    return jsoncPath;
  const jsonPath = join7(omoDir, "omo.json");
  return isLoadableProjectConfigFile(jsonPath, fileSystem) ? jsonPath : null;
}
function realpathOrSelf(path, fileSystem) {
  if (fileSystem.realpathSync === undefined)
    return path;
  try {
    return fileSystem.realpathSync(path);
  } catch {
    return path;
  }
}
function findProjectConfigPathsFarthestFirst(cwd, homeDir, fileSystem, accountHomeDir = homeDir) {
  const startDir = resolve3(cwd);
  const boundaryDirs = [...new Set([resolve3(homeDir), resolve3(accountHomeDir)])];
  const realBoundaryDirs = new Set(boundaryDirs.map((path) => realpathOrSelf(path, fileSystem)));
  const nearestFirst = [];
  let currentDir = startDir;
  for (let depth = 0;depth < MAX_PROJECT_CONFIG_DIRECTORY_DEPTH; depth += 1) {
    const isHomeDir = boundaryDirs.includes(currentDir) || realBoundaryDirs.has(realpathOrSelf(currentDir, fileSystem));
    const configPath = isHomeDir ? null : detectOmoJsonPath(currentDir, fileSystem);
    if (configPath !== null)
      nearestFirst.push(configPath);
    if (isHomeDir)
      break;
    const parentDir = dirname2(currentDir);
    if (parentDir === currentDir)
      break;
    currentDir = parentDir;
  }
  return nearestFirst.reverse();
}
function resolveOmoConfigPaths(options) {
  const fileSystem = options.fileSystem ?? DEFAULT_READ_FILE_SYSTEM;
  const env = options.env ?? process.env;
  const userPath = detectUserOmoJsonPath(env, fileSystem);
  const projectPaths = findProjectConfigPathsFarthestFirst(options.cwd, resolveHomeDir(env), fileSystem, ACCOUNT_HOME_DIR);
  return [
    { path: userPath, scope: "user" },
    ...projectPaths.map((path) => ({ path, scope: "project" }))
  ];
}

// ../../../../omo-config-core/src/loader/resolution.ts
var HARNESS_KEYS = [...new Set([...HARNESS_IDS, ...OMO_CONFIG_HARNESS_IDS])].map((harness) => `[${harness}]`);
function profileName(value) {
  return value === "" ? undefined : value;
}
function profileNameFromOpenCodeConfigDir(path) {
  const match = path?.match(/(?:^|[\\/])profiles[\\/]([^\\/]+)[\\/]*$/);
  return profileName(match?.[1]);
}
function resolveOmoProfileName(options = {}) {
  const env = options.env ?? process.env;
  return profileName(options.profile) ?? profileName(env["OMO_PROFILE"]) ?? profileName(env["OCX_PROFILE"]) ?? profileNameFromOpenCodeConfigDir(env["OPENCODE_CONFIG_DIR"]);
}
function toRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return;
  return Object.fromEntries(Object.entries(value));
}
function withoutControlKeys(config2) {
  const result = {};
  for (const [key, value] of Object.entries(config2)) {
    if (key === "profiles" || HARNESS_KEYS.includes(key))
      continue;
    result[key] = value;
  }
  return result;
}
function harnessLayer(config2, harness) {
  if (harness === undefined)
    return {};
  return toRecord(config2[`[${harness}]`]) ?? {};
}
function resolveOmoConfigView(options) {
  const profiles = toRecord(options.config["profiles"]);
  const profile = options.profile === undefined ? undefined : toRecord(profiles?.[options.profile]);
  const diagnostics = profile === undefined && options.profile !== undefined ? [{
    kind: "profile",
    message: `Activated omo profile "${options.profile}" does not exist; using the base configuration`,
    path: `profiles.${options.profile}`
  }] : [];
  const layers = [
    withoutControlKeys(options.config),
    harnessLayer(options.config, options.harness),
    profile === undefined ? {} : withoutControlKeys(profile),
    profile === undefined ? {} : harnessLayer(profile, options.harness)
  ];
  let config2 = {};
  for (const layer of layers)
    config2 = mergeOmoConfigRecords(config2, layer);
  const resolvedProfile = options.profile !== undefined && profile !== undefined ? options.profile : undefined;
  return {
    config: withoutControlKeys(config2),
    diagnostics,
    ...resolvedProfile === undefined ? {} : { profile: resolvedProfile }
  };
}

// ../../../../omo-config-core/src/loader/loader.ts
function parseJsoncSafe(content) {
  const errors2 = [];
  const data = parse5(content.charCodeAt(0) === 65279 ? content.slice(1) : content, errors2, {
    allowTrailingComma: true,
    disallowComments: false
  });
  return {
    data: errors2.length === 0 ? data : null,
    errors: errors2.map((error2) => ({
      message: printParseErrorCode(error2.error),
      offset: error2.offset
    }))
  };
}
var DEFAULT_RAW_CONFIG = {
  agents: {},
  categories: {},
  codegraph: OmoCodegraphSettingsSchema.parse({}),
  task: resolveOmoTaskSettings({}),
  teams: {}
};
function stripResolutionControlKeys(config2) {
  const {
    "[codex]": _codex,
    "[opencode]": _opencode,
    "[senpi]": _senpi,
    profiles: _profiles,
    ...resolved
  } = config2;
  return resolved;
}
function validationDiagnostic(path, issues) {
  const issuePaths = issues.map((issue2) => issue2.path.map((segment) => String(segment)).join("."));
  return {
    kind: "validation",
    message: `Invalid omo config at ${path}: ${issuePaths.join(", ")}`,
    path,
    issuePaths
  };
}
function toRecord2(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return null;
  const record2 = {};
  for (const [key, entry] of Object.entries(value)) {
    record2[key] = entry;
  }
  return record2;
}
function readConfigSource(path, scope, fileSystem) {
  if (!fileSystem.existsSync(path)) {
    return { source: { exists: false, loaded: false, path, scope } };
  }
  let content;
  try {
    content = fileSystem.readFileSync(path, "utf-8");
  } catch (error2) {
    const message = error2 instanceof Error ? error2.message : String(error2);
    return {
      diagnostic: { kind: "read", message: `Failed to read ${path}: ${message}`, path },
      source: { exists: true, loaded: false, path, scope }
    };
  }
  const parsed = parseJsoncSafe(content);
  if (parsed.errors.length > 0) {
    return {
      diagnostic: {
        kind: "parse",
        message: `JSONC parse error in ${path}: ${parsed.errors.map((error2) => error2.message).join(", ")}`,
        path
      },
      source: { exists: true, loaded: false, path, scope }
    };
  }
  const validation = OmoConfigLayerSchema.safeParse(parsed.data);
  if (!validation.success) {
    return {
      diagnostic: validationDiagnostic(path, validation.error.issues),
      source: { exists: true, loaded: false, path, scope }
    };
  }
  const parsedRecord = toRecord2(parsed.data);
  if (parsedRecord === null) {
    return {
      diagnostic: { kind: "validation", message: `Invalid omo config at ${path}: root must be an object`, path },
      source: { exists: true, loaded: false, path, scope }
    };
  }
  return {
    source: { exists: true, loaded: true, path, scope },
    value: parsedRecord
  };
}
function loadOmoConfig(options = {}) {
  const fileSystem = options.fileSystem ?? DEFAULT_READ_FILE_SYSTEM;
  const cwd = options.cwd ?? process.cwd();
  let merged = {};
  const diagnostics = [];
  const layers = [];
  const sources = [];
  for (const candidate of resolveOmoConfigPaths({
    cwd,
    ...options.env === undefined ? {} : { env: options.env },
    fileSystem,
    ...options.platform === undefined ? {} : { platform: options.platform }
  })) {
    const loaded = readConfigSource(candidate.path, candidate.scope, fileSystem);
    sources.push(loaded.source);
    if (loaded.diagnostic !== undefined)
      diagnostics.push(loaded.diagnostic);
    if (loaded.value !== undefined) {
      layers.push({ config: loaded.value, source: loaded.source });
      merged = mergeOmoConfigRecords(merged, loaded.value);
    }
  }
  const requestedProfile = resolveOmoProfileName({
    ...options.env === undefined ? {} : { env: options.env },
    ...options.profile === undefined ? {} : { profile: options.profile }
  });
  const resolved = resolveOmoConfigView({
    config: merged,
    ...options.harness === undefined ? {} : { harness: options.harness },
    ...requestedProfile === undefined ? {} : { profile: requestedProfile }
  });
  const finalConfig = OmoConfigSchema.safeParse(mergeOmoConfigRecords(DEFAULT_RAW_CONFIG, resolved.config));
  if (finalConfig.success) {
    return {
      config: stripResolutionControlKeys(finalConfig.data),
      diagnostics: [...diagnostics, ...resolved.diagnostics],
      layers,
      ...resolved.profile === undefined ? {} : { profile: resolved.profile },
      sources
    };
  }
  return {
    config: stripResolutionControlKeys(OmoConfigSchema.parse(DEFAULT_RAW_CONFIG)),
    diagnostics: [...diagnostics, ...resolved.diagnostics, validationDiagnostic("(merged omo config)", finalConfig.error.issues)],
    layers,
    ...resolved.profile === undefined ? {} : { profile: resolved.profile },
    sources
  };
}

// ../../../../omo-config-core/src/writer/types.ts
import {
  copyFileSync,
  existsSync as existsSync5,
  lstatSync as lstatSync2,
  mkdirSync,
  readFileSync as readFileSync3,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
var DEFAULT_WRITE_FILE_SYSTEM = {
  copyFileSync,
  existsSync: existsSync5,
  lstatSync: lstatSync2,
  mkdirSync,
  readFileSync: readFileSync3,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileExclusiveSync: (path, content) => {
    writeFileSync(path, content, { encoding: "utf-8", flag: "wx" });
  },
  writeFileSync
};

class OmoConfigWriteError extends Error {
  path;
  operation;
  name = "OmoConfigWriteError";
  constructor(path, operation, cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`Failed to ${operation} omo config at ${path}: ${detail}`, { cause });
    this.path = path;
    this.operation = operation;
  }
}

// ../../../../omo-config-core/src/writer/writer.ts
import { randomUUID as randomUUID2 } from "node:crypto";
import { dirname as dirname3, join as join8, posix as posix2 } from "node:path";

// ../../../../omo-config-core/src/internal/jsonc-parse.ts
function stripBom(content) {
  return content.charCodeAt(0) === 65279 ? content.slice(1) : content;
}
function parseJsoncSafe2(content) {
  const errors2 = [];
  const data = parse5(stripBom(content), errors2, {
    allowTrailingComma: true,
    disallowComments: false
  });
  return {
    data: errors2.length > 0 ? null : data,
    errors: errors2.map((e) => ({
      message: printParseErrorCode(e.error),
      offset: e.offset,
      length: e.length
    }))
  };
}

// ../../../../omo-config-core/src/writer/writer.ts
var EMPTY_OMO_CONFIG = `// OMO configuration
{
}
`;
var FORMATTING_OPTIONS = {
  eol: `
`,
  insertSpaces: true,
  tabSize: 2
};
function backupSuffix() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
function isFileExistsError(error2) {
  return error2 instanceof Error && Reflect.get(error2, "code") === "EEXIST";
}
function backupCandidate(basePath, attempt) {
  return attempt === 0 ? basePath : `${basePath}.${attempt}`;
}
function writeBackup(path, content, fileSystem) {
  const basePath = `${path}.bak.${backupSuffix()}`;
  let attempt = 0;
  while (true) {
    const candidate = backupCandidate(basePath, attempt);
    try {
      fileSystem.writeFileExclusiveSync(candidate, content);
      return candidate;
    } catch (error2) {
      if (!isFileExistsError(error2))
        throw error2;
      attempt += 1;
    }
  }
}
function resolveWritePath(options) {
  if (options.targetPath !== undefined)
    return options.targetPath;
  const fileSystem = options.fileSystem ?? DEFAULT_WRITE_FILE_SYSTEM;
  if (options.scope === "user") {
    const jsoncPath2 = resolveUserOmoConfigPath(options.env);
    if (fileSystem.existsSync(jsoncPath2))
      return jsoncPath2;
    const jsonPath2 = join8(dirname3(jsoncPath2), "omo.json");
    return fileSystem.existsSync(jsonPath2) ? jsonPath2 : jsoncPath2;
  }
  const jsoncPath = join8(options.projectDir ?? process.cwd(), ".omo", "omo.jsonc");
  if (fileSystem.existsSync(jsoncPath))
    return jsoncPath;
  const jsonPath = join8(dirname3(jsoncPath), "omo.json");
  return fileSystem.existsSync(jsonPath) ? jsonPath : jsoncPath;
}
function directoryPath(path) {
  return path.startsWith("/") ? posix2.dirname(path) : dirname3(path);
}
function writeAtomically(path, content, fileSystem) {
  const tempPath = `${path}.${randomUUID2()}.tmp`;
  let tempCreated = false;
  try {
    fileSystem.writeFileExclusiveSync(tempPath, content);
    tempCreated = true;
    fileSystem.renameSync(tempPath, path);
  } catch (error2) {
    try {
      if (tempCreated)
        fileSystem.unlinkSync(tempPath);
    } catch (cleanupError) {
      if (!(cleanupError instanceof Error))
        throw cleanupError;
    }
    throw new OmoConfigWriteError(path, "write", error2);
  }
}
function assertConfigPathIsSafe(path, fileSystem) {
  try {
    if (fileSystem.lstatSync(path).isSymbolicLink()) {
      throw new OmoConfigWriteError(path, "read", new Error("Refusing to edit symlinked omo config"));
    }
  } catch (error2) {
    if (error2 instanceof OmoConfigWriteError)
      throw error2;
    throw new OmoConfigWriteError(path, "read", error2);
  }
}
function assertProjectConfigDirectoryIsSafe(directory, fileSystem) {
  try {
    if (fileSystem.lstatSync(directory).isSymbolicLink()) {
      throw new OmoConfigWriteError(directory, "read", new Error("Refusing to edit config under symlinked project .omo directory"));
    }
  } catch (error2) {
    if (error2 instanceof OmoConfigWriteError)
      throw error2;
    throw new OmoConfigWriteError(directory, "read", error2);
  }
}
function assertJsoncCanBeModified(path, content) {
  const parsed = parseJsoncSafe2(content);
  if (parsed.errors.length === 0)
    return;
  const message = parsed.errors.map((error2) => `${error2.message} at offset ${error2.offset}`).join(", ");
  throw new OmoConfigWriteError(path, "parse", new SyntaxError(message));
}
function updateOmoConfig(options) {
  const fileSystem = options.fileSystem ?? DEFAULT_WRITE_FILE_SYSTEM;
  const path = resolveWritePath(options);
  const directory = directoryPath(path);
  const existed = fileSystem.existsSync(path);
  let content = EMPTY_OMO_CONFIG;
  try {
    fileSystem.mkdirSync(directory, { recursive: true });
    if (options.scope === "project")
      assertProjectConfigDirectoryIsSafe(directory, fileSystem);
    if (existed) {
      assertConfigPathIsSafe(path, fileSystem);
      content = fileSystem.readFileSync(path, "utf-8");
    }
  } catch (error2) {
    if (error2 instanceof OmoConfigWriteError)
      throw error2;
    throw new OmoConfigWriteError(path, "read", error2);
  }
  assertJsoncCanBeModified(path, content);
  let backupPath;
  if (existed) {
    try {
      assertConfigPathIsSafe(path, fileSystem);
      backupPath = writeBackup(path, content, fileSystem);
    } catch (error2) {
      if (error2 instanceof OmoConfigWriteError)
        throw error2;
      throw new OmoConfigWriteError(path, "backup", error2);
    }
  }
  let nextContent = content;
  for (const edit of options.edits) {
    nextContent = applyEdits(nextContent, modify(nextContent, [...edit.path], edit.value, { formattingOptions: FORMATTING_OPTIONS }));
  }
  writeAtomically(path, nextContent, fileSystem);
  return backupPath === undefined ? { path } : { backupPath, path };
}

// ../../../../omo-config-core/src/migration/batch.ts
import { dirname as dirname5, posix as posix3 } from "node:path";

// ../../../../omo-config-core/src/internal/plain-object.ts
var DANGEROUS_KEYS2 = new Set(["__proto__", "constructor", "prototype"]);
function isUnsafeObjectKey2(key) {
  return DANGEROUS_KEYS2.has(key);
}
function isPlainObject3(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && Object.prototype.toString.call(value) === "[object Object]";
}

// ../../../../omo-config-core/src/migration/backup-move.ts
function isCrossDeviceError(error2) {
  return error2 instanceof Error && Reflect.get(error2, "code") === "EXDEV";
}
function moveMigrationBackup(fileSystem, sourcePath, backupPath) {
  try {
    fileSystem.renameSync(sourcePath, backupPath);
  } catch (error2) {
    if (!isCrossDeviceError(error2))
      throw error2;
    fileSystem.copyFileSync(sourcePath, backupPath);
    fileSystem.unlinkSync(sourcePath);
  }
}

// ../../../../omo-config-core/src/migration/commit.ts
import { basename as basename3, dirname as dirname4, join as join9, resolve as resolve4 } from "node:path";

// ../../../../omo-config-core/src/migration/merge.ts
function displayValue(value) {
  const encoded = JSON.stringify(value);
  return encoded === undefined ? String(value) : encoded;
}
function displayPath(path) {
  return path.join(".");
}
function cloneValue(value) {
  if (Array.isArray(value))
    return value.map((entry) => cloneValue(entry));
  if (!isPlainObject3(value))
    return value;
  const clone2 = {};
  for (const [key, entry] of Object.entries(value)) {
    if (isUnsafeObjectKey2(key))
      continue;
    clone2[key] = cloneValue(entry);
  }
  return clone2;
}
function hasOwn(record2, key) {
  return Object.prototype.hasOwnProperty.call(record2, key);
}
function mergeInto(existing, legacy, path, diagnostics) {
  const additions = {};
  for (const [key, legacyValue] of Object.entries(legacy)) {
    if (isUnsafeObjectKey2(key))
      continue;
    const nextPath = [...path, key];
    if (!hasOwn(existing, key)) {
      additions[key] = cloneValue(legacyValue);
      continue;
    }
    const keptValue = existing[key];
    if (isPlainObject3(keptValue) && isPlainObject3(legacyValue)) {
      const nested = mergeInto(keptValue, legacyValue, nextPath, diagnostics);
      if (Object.keys(nested).length > 0)
        additions[key] = nested;
      continue;
    }
    diagnostics.push(`skipped: ${displayPath(nextPath)} legacy=${displayValue(legacyValue)} kept=${displayValue(keptValue)}`);
  }
  return additions;
}
function applyAdditions(existing, additions) {
  const result = cloneValue(existing);
  if (!isPlainObject3(result))
    throw new Error("Migration target must be a plain object");
  for (const [key, value] of Object.entries(additions)) {
    if (isUnsafeObjectKey2(key))
      continue;
    const current = result[key];
    result[key] = isPlainObject3(current) && isPlainObject3(value) ? applyAdditions(current, value) : cloneValue(value);
  }
  return result;
}
function mergeWithoutClobber(existing, legacy) {
  const diagnostics = [];
  const additions = mergeInto(existing, legacy, [], diagnostics);
  return {
    additions,
    diagnostics,
    merged: applyAdditions(existing, additions)
  };
}
function collectMigrationEdits(value, path = []) {
  const edits = [];
  for (const [key, entry] of Object.entries(value)) {
    if (isUnsafeObjectKey2(key))
      continue;
    const nextPath = [...path, key];
    if (isPlainObject3(entry) && Object.keys(entry).length > 0) {
      edits.push(...collectMigrationEdits(entry, nextPath));
    } else {
      edits.push({ path: nextPath, value: cloneValue(entry) });
    }
  }
  return edits;
}

// ../../../../omo-config-core/src/migration/predicate.ts
function hasMigrationMarker(target, migrationId) {
  const markers = target["_migrations"];
  return Array.isArray(markers) && markers.some((marker) => marker === migrationId);
}
function shouldRunMigration(input) {
  return input.legacySourcesExist && !hasMigrationMarker(input.target, input.migrationId);
}

// ../../../../omo-config-core/src/migration/types.ts
class MigrationValidationError extends Error {
  targetPath;
  name = "MigrationValidationError";
  constructor(targetPath, message) {
    super(`Migration validation failed for ${targetPath}: ${message}`);
    this.targetPath = targetPath;
  }
}

class MigrationTransactionError extends Error {
  name = "MigrationTransactionError";
  constructor(message) {
    super(message);
  }
}
var DEFAULT_MIGRATION_CLOCK = {
  now: () => Date.now()
};
var DEFAULT_MIGRATION_PROCESS = {
  isAlive: (pid) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch (error2) {
      if (!(error2 instanceof Error))
        throw error2;
      return Reflect.get(error2, "code") !== "ESRCH";
    }
  },
  pid: process.pid
};
var DEFAULT_MIGRATION_FILE_SYSTEM = {
  ...DEFAULT_WRITE_FILE_SYSTEM,
  removeIfContentsMatchSync: (path, expected) => {
    if (!DEFAULT_WRITE_FILE_SYSTEM.existsSync(path))
      return false;
    if (DEFAULT_WRITE_FILE_SYSTEM.readFileSync(path, "utf-8") !== expected)
      return false;
    DEFAULT_WRITE_FILE_SYSTEM.unlinkSync(path);
    return true;
  },
  replaceIfContentsMatchSync: (path, expected, content) => {
    if (!DEFAULT_WRITE_FILE_SYSTEM.existsSync(path))
      return false;
    if (DEFAULT_WRITE_FILE_SYSTEM.readFileSync(path, "utf-8") !== expected)
      return false;
    DEFAULT_WRITE_FILE_SYSTEM.writeFileSync(path, content, "utf-8");
    return true;
  }
};

// ../../../../omo-config-core/src/migration/commit.ts
function parseDocument(path, content) {
  const parsed = parseJsoncSafe2(content);
  if (parsed.errors.length > 0 || !isPlainObject3(parsed.data)) {
    const detail = parsed.errors.map((error2) => `${error2.message} at ${error2.offset}`).join(", ");
    throw new MigrationTransactionError(`Migration document at ${path} is not a JSONC object${detail === "" ? "" : `: ${detail}`}`);
  }
  return parsed.data;
}
function targetDocument(path, fileSystem) {
  if (!fileSystem.existsSync(path))
    return {};
  return parseDocument(path, fileSystem.readFileSync(path, "utf-8"));
}
function markerValue(target, migrationId, targetPath) {
  const value = target["_migrations"];
  if (value === undefined)
    return [migrationId];
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string")) {
    throw new MigrationValidationError(targetPath, "the existing migration marker must be an array of strings");
  }
  return hasMigrationMarker(target, migrationId) ? value : [...value, migrationId];
}
function validateTarget(targetPath, document) {
  const result = OmoConfigSchema.safeParse(document);
  if (result.success)
    return;
  const detail = result.error.issues.map((issue2) => `${issue2.path.join(".")}: ${issue2.message}`).join(", ");
  throw new MigrationValidationError(targetPath, detail);
}
function writerInput(targetPath, env) {
  const homeDir = resolveHomeDir(env);
  const userDirectory = toPosixPath(join9(homeDir, ".omo"));
  const fileName = basename3(targetPath);
  if (toPosixPath(dirname4(targetPath)) === userDirectory && (fileName === "omo.json" || fileName === "omo.jsonc")) {
    return { scope: "user" };
  }
  if (basename3(dirname4(targetPath)) === ".omo" && (fileName === "omo.json" || fileName === "omo.jsonc")) {
    return { projectDir: dirname4(dirname4(targetPath)), scope: "project" };
  }
  throw new MigrationTransactionError(`Migration target is not an omo config path: ${targetPath}`);
}
function sameResolvedPath(a, b) {
  return toPosixPath(resolve4(a)) === toPosixPath(resolve4(b));
}
var writeOmoMigrationTarget = (input) => {
  const options = writerInput(input.targetPath, input.env);
  const result = updateOmoConfig({
    ...options,
    edits: input.edits,
    env: input.env,
    fileSystem: input.fileSystem,
    targetPath: input.targetPath
  });
  if (!sameResolvedPath(result.path, input.targetPath)) {
    throw new MigrationTransactionError(`Migration writer resolved ${result.path} instead of ${input.targetPath}`);
  }
};
function prepareTargetWrite(input) {
  const merged = mergeWithoutClobber(input.target, input.additions);
  const marker = markerValue(input.target, input.migrationId, input.targetPath);
  const document = { ...merged.merged, _migrations: marker };
  validateTarget(input.targetPath, document);
  const edits = [...collectMigrationEdits(merged.additions), { path: ["_migrations"], value: marker }];
  return { diagnostics: merged.diagnostics, document, edits };
}
function prepareTargetReplacement(input) {
  const marker = markerValue(input.target, input.migrationId, input.targetPath);
  const document = { ...input.document, _migrations: marker };
  validateTarget(input.targetPath, document);
  const edits = [];
  for (const key of Object.keys(input.target)) {
    if (key !== "_migrations" && !Object.prototype.hasOwnProperty.call(input.document, key)) {
      edits.push({ path: [key], value: undefined });
    }
  }
  for (const [key, value] of Object.entries(input.document)) {
    if (key !== "_migrations")
      edits.push({ path: [key], value });
  }
  edits.push({ path: ["_migrations"], value: marker });
  return { diagnostics: [], document, edits };
}
function writePreparedTarget(input) {
  input.writeTarget({
    edits: input.prepared.edits,
    env: input.env,
    fileSystem: input.fileSystem,
    targetPath: input.targetPath
  });
}

// ../../../../omo-config-core/src/migration/journal.ts
import { join as join10 } from "node:path";
function migrationJournalPath(env) {
  return toPosixPath(join10(resolveHomeDir(env), ".omo", ".migration-journal.json"));
}
function isFileExistsError2(error2) {
  return error2 instanceof Error && Reflect.get(error2, "code") === "EEXIST";
}
function journalTempPath(path, process3, clock, attempt) {
  const suffix = `${process3.pid}.${clock.now()}`;
  return attempt === 0 ? `${path}.${suffix}.tmp` : `${path}.${suffix}.${attempt}.tmp`;
}
function parseJournal(value) {
  if (!isPlainObject3(value))
    throw new Error("Migration journal must be an object");
  if (value["version"] !== 1)
    throw new Error("Migration journal version is unsupported");
  if (typeof value["targetPath"] !== "string" || typeof value["migrationId"] !== "string") {
    throw new Error("Migration journal target is invalid");
  }
  if (!isPlainObject3(value["targetWrite"]) || !isPlainObject3(value["targetWrite"]["additions"])) {
    throw new Error("Migration journal target write is invalid");
  }
  const targetWriteMode = value["targetWrite"]["mode"];
  if (targetWriteMode !== undefined && targetWriteMode !== "replace-target") {
    throw new Error("Migration journal target write mode is invalid");
  }
  if (typeof value["targetWritten"] !== "boolean" || !Array.isArray(value["completedMoves"])) {
    throw new Error("Migration journal completion state is invalid");
  }
  const diagnostics = value["diagnostics"];
  if (diagnostics !== undefined && (!Array.isArray(diagnostics) || !diagnostics.every((entry) => typeof entry === "string"))) {
    throw new Error("Migration journal diagnostics are invalid");
  }
  if (!value["completedMoves"].every((path) => typeof path === "string")) {
    throw new Error("Migration journal completed moves are invalid");
  }
  if (!Array.isArray(value["backupMoves"]))
    throw new Error("Migration journal backup plan is invalid");
  const backupMoves = [];
  for (const move of value["backupMoves"]) {
    if (!isPlainObject3(move) || typeof move["from"] !== "string" || typeof move["to"] !== "string") {
      throw new Error("Migration journal backup move is invalid");
    }
    backupMoves.push({ from: move["from"], to: move["to"] });
  }
  return {
    backupMoves,
    completedMoves: [...value["completedMoves"]],
    diagnostics: diagnostics === undefined ? [] : [...diagnostics],
    migrationId: value["migrationId"],
    targetPath: value["targetPath"],
    targetWrite: {
      additions: { ...value["targetWrite"]["additions"] },
      ...targetWriteMode === undefined ? {} : { mode: targetWriteMode }
    },
    targetWritten: value["targetWritten"],
    version: 1
  };
}
function readMigrationJournal(fileSystem, env) {
  const path = migrationJournalPath(env);
  if (!fileSystem.existsSync(path))
    return null;
  return parseJournal(JSON.parse(fileSystem.readFileSync(path, "utf-8")));
}
function writeMigrationJournal(journal, fileSystem, env, process3, clock) {
  const path = migrationJournalPath(env);
  const content = `${JSON.stringify(journal)}
`;
  let attempt = 0;
  while (true) {
    const temporaryPath = journalTempPath(path, process3, clock, attempt);
    try {
      fileSystem.writeFileExclusiveSync(temporaryPath, content);
      fileSystem.renameSync(temporaryPath, path);
      return;
    } catch (error2) {
      if (!isFileExistsError2(error2))
        throw error2;
      attempt += 1;
    }
  }
}
function removeMigrationJournal(fileSystem, env) {
  const path = migrationJournalPath(env);
  if (fileSystem.existsSync(path))
    fileSystem.unlinkSync(path);
}

// ../../../../omo-config-core/src/migration/lock.ts
import { join as join11 } from "node:path";
var DEFAULT_LEASE_DURATION_MS = 30000;
var GUARD_LEASE_DURATION_MS = 1000;
var LIVE_OWNER_STALE_LEASE_MULTIPLIER = 2;
var MUTATION_GUARD_RETRY_DELAYS_MS = [2, 4, 8, 16, 32];
var MUTATION_GUARD_SLEEP_VIEW = new Int32Array(new SharedArrayBuffer(4));
function migrationLockPath(env) {
  return toPosixPath(join11(resolveHomeDir(env), ".omo", ".migration.lock"));
}
function mutationGuardPath(env) {
  return `${migrationLockPath(env)}.guard`;
}
function isFileExistsError3(error2) {
  return error2 instanceof Error && Reflect.get(error2, "code") === "EEXIST";
}
function isFileMissingError(error2) {
  return error2 instanceof Error && Reflect.get(error2, "code") === "ENOENT";
}
function parseLockRecord(content) {
  try {
    const value = JSON.parse(content);
    if (typeof value !== "object" || value === null)
      return null;
    const pid = Reflect.get(value, "pid");
    const leaseExpiresAt = Reflect.get(value, "leaseExpiresAt");
    if (typeof pid !== "number" || !Number.isInteger(pid) || pid < 1)
      return null;
    if (typeof leaseExpiresAt !== "number" || !Number.isFinite(leaseExpiresAt))
      return null;
    return { leaseExpiresAt, pid };
  } catch (error2) {
    if (error2 instanceof SyntaxError)
      return null;
    throw error2;
  }
}
function leaseContent(process3, clock, duration2) {
  return `${JSON.stringify({ leaseExpiresAt: clock.now() + duration2, pid: process3.pid })}
`;
}
function isReclaimable(record2, clock, process3, leaseDurationMs) {
  const now = clock.now();
  if (record2.leaseExpiresAt > now)
    return false;
  if (!process3.isAlive(record2.pid))
    return true;
  return record2.leaseExpiresAt + leaseDurationMs * LIVE_OWNER_STALE_LEASE_MULTIPLIER <= now;
}
function sleepSync(milliseconds) {
  Atomics.wait(MUTATION_GUARD_SLEEP_VIEW, 0, 0, milliseconds);
}
function acquireMutationGuard(input) {
  const path = mutationGuardPath(input.env);
  for (let attempt = 0;attempt <= MUTATION_GUARD_RETRY_DELAYS_MS.length; attempt += 1) {
    const content = leaseContent(input.process, input.clock, GUARD_LEASE_DURATION_MS);
    try {
      input.fileSystem.writeFileExclusiveSync(path, content);
      return content;
    } catch (error2) {
      if (!isFileExistsError3(error2))
        throw error2;
    }
    try {
      const observedContent = input.fileSystem.readFileSync(path, "utf-8");
      const observed = parseLockRecord(observedContent);
      if (observed === null || isReclaimable(observed, input.clock, input.process, GUARD_LEASE_DURATION_MS)) {
        input.fileSystem.removeIfContentsMatchSync(path, observedContent);
      }
    } catch (error2) {
      if (!isFileMissingError(error2))
        throw error2;
    }
    const retryDelayMs = MUTATION_GUARD_RETRY_DELAYS_MS[attempt];
    if (retryDelayMs !== undefined)
      sleepSync(retryDelayMs);
  }
  return null;
}
function releaseMutationGuard(input) {
  input.fileSystem.removeIfContentsMatchSync(mutationGuardPath(input.env), input.content);
}
function acquireMigrationLock(input) {
  const leaseDurationMs = input.leaseDurationMs ?? DEFAULT_LEASE_DURATION_MS;
  const path = migrationLockPath(input.env);
  input.fileSystem.mkdirSync(toPosixPath(join11(resolveHomeDir(input.env), ".omo")), { recursive: true });
  for (let attempt = 0;attempt < 3; attempt += 1) {
    const currentContent = leaseContent(input.process, input.clock, leaseDurationMs);
    try {
      input.fileSystem.writeFileExclusiveSync(path, currentContent);
      let ownedContent = currentContent;
      const mutate = (mutation) => {
        const guardContent2 = acquireMutationGuard(input);
        if (guardContent2 === null)
          throw new Error("Migration lock mutation is busy");
        try {
          const renewedContent = leaseContent(input.process, input.clock, leaseDurationMs);
          if (!mutation(renewedContent))
            throw new Error("Migration lock ownership was lost");
          ownedContent = renewedContent;
        } finally {
          releaseMutationGuard({ env: input.env, fileSystem: input.fileSystem, content: guardContent2 });
        }
      };
      return {
        release: () => {
          const guardContent2 = acquireMutationGuard(input);
          if (guardContent2 === null) {
            input.fileSystem.removeIfContentsMatchSync(path, ownedContent);
            return;
          }
          try {
            input.fileSystem.removeIfContentsMatchSync(path, ownedContent);
          } finally {
            releaseMutationGuard({ env: input.env, fileSystem: input.fileSystem, content: guardContent2 });
          }
        },
        renew: () => {
          mutate((renewedContent) => input.fileSystem.replaceIfContentsMatchSync(path, ownedContent, renewedContent));
        }
      };
    } catch (error2) {
      if (!isFileExistsError3(error2))
        throw error2;
    }
    const guardContent = acquireMutationGuard(input);
    if (guardContent === null)
      return null;
    try {
      let observedContent;
      try {
        observedContent = input.fileSystem.readFileSync(path, "utf-8");
      } catch (error2) {
        if (isFileMissingError(error2))
          continue;
        throw error2;
      }
      const observed = parseLockRecord(observedContent);
      if (observed !== null && !isReclaimable(observed, input.clock, input.process, leaseDurationMs))
        return null;
      input.fileSystem.removeIfContentsMatchSync(path, observedContent);
    } finally {
      releaseMutationGuard({ env: input.env, fileSystem: input.fileSystem, content: guardContent });
    }
  }
  return null;
}

// ../../../../omo-config-core/src/migration/recovery.ts
function resumeMigrationJournal(input) {
  const journal = readMigrationJournal(input.fileSystem, input.env);
  if (journal === null)
    return false;
  input.renewLock();
  const target = targetDocument(journal.targetPath, input.fileSystem);
  if (!hasMigrationMarker(target, journal.migrationId)) {
    const prepared = journal.targetWrite.mode === "replace-target" ? prepareTargetReplacement({
      document: journal.targetWrite.additions,
      migrationId: journal.migrationId,
      target,
      targetPath: journal.targetPath
    }) : prepareTargetWrite({
      additions: journal.targetWrite.additions,
      migrationId: journal.migrationId,
      target,
      targetPath: journal.targetPath
    });
    writePreparedTarget({
      env: input.env,
      fileSystem: input.fileSystem,
      prepared,
      targetPath: journal.targetPath,
      writeTarget: input.writeTarget
    });
  }
  const targetRecorded = { ...journal, targetWritten: true };
  writeMigrationJournal(targetRecorded, input.fileSystem, input.env, input.process, input.clock);
  for (const move of targetRecorded.backupMoves) {
    if (targetRecorded.completedMoves.includes(move.from))
      continue;
    input.renewLock();
    if (input.fileSystem.existsSync(move.from)) {
      if (input.fileSystem.existsSync(move.to)) {
        throw new MigrationTransactionError(`Migration backup path already exists: ${move.to}`);
      }
      moveMigrationBackup(input.fileSystem, move.from, move.to);
    } else if (!input.fileSystem.existsSync(move.to)) {
      throw new MigrationTransactionError(`Migration source and backup are both missing: ${move.from}`);
    }
    Object.assign(targetRecorded, { completedMoves: [...targetRecorded.completedMoves, move.from] });
    writeMigrationJournal(targetRecorded, input.fileSystem, input.env, input.process, input.clock);
  }
  removeMigrationJournal(input.fileSystem, input.env);
  return true;
}

// ../../../../omo-config-core/src/migration/batch.ts
function parseSource(path, content) {
  const parsed = parseJsoncSafe2(content);
  if (parsed.errors.length > 0) {
    const detail = parsed.errors.map((error2) => `${error2.message} at ${error2.offset}`).join(", ");
    throw new MigrationTransactionError(`Migration source at ${path} is invalid JSONC: ${detail}`);
  }
  return parsed.data;
}
function loadSources(sources, fileSystem) {
  return sources.filter((source) => fileSystem.existsSync(source.path)).map((source) => ({ ...source, value: parseSource(source.path, fileSystem.readFileSync(source.path, "utf-8")) }));
}
function backupBasePath(source, migrationId) {
  return source.backupPath ?? `${source.path}.bak.${encodeURIComponent(migrationId)}`;
}
function backupMoves(sources, migrationId, fileSystem, protectedPaths) {
  const paths = new Set(sources.map((source) => source.path));
  const destinations = new Set;
  const moves = [];
  for (const source of sources) {
    if (!fileSystem.existsSync(source.path))
      continue;
    const basePath = backupBasePath(source, migrationId);
    let destination = basePath;
    let attempt = 1;
    while (fileSystem.existsSync(destination) || destinations.has(destination)) {
      if (source.backupPath !== undefined)
        throw new MigrationTransactionError(`Migration backup path already exists: ${destination}`);
      destination = `${basePath}.${attempt}`;
      attempt += 1;
    }
    if (paths.has(destination) || protectedPaths.has(destination))
      throw new MigrationTransactionError(`Migration backup path is protected: ${destination}`);
    destinations.add(destination);
    moves.push({ from: source.path, to: destination });
  }
  return moves;
}
function assertSafeSourcePaths(sources, protectedPaths) {
  const seen = new Set;
  for (const source of sources) {
    if (seen.has(source.path))
      throw new MigrationTransactionError(`Duplicate migration source: ${source.path}`);
    if (protectedPaths.has(source.path))
      throw new MigrationTransactionError(`Migration source is protected: ${source.path}`);
    seen.add(source.path);
  }
}
function directoryPath2(path) {
  return path.startsWith("/") ? posix3.dirname(path) : dirname5(path);
}
function ensureBackupDirectories(moves, fileSystem) {
  for (const move of moves)
    fileSystem.mkdirSync(directoryPath2(move.to), { recursive: true });
}
function transformResult(value) {
  if (isPlainObject3(value) && isPlainObject3(value.document) && Array.isArray(value.diagnostics) && value.diagnostics.every((diagnostic) => typeof diagnostic === "string")) {
    return { diagnostics: value.diagnostics, document: value.document };
  }
  if (!isPlainObject3(value))
    throw new MigrationTransactionError("Migration transform must return a plain object");
  return { diagnostics: [], document: value };
}
function executePlan(input) {
  const { env, fileSystem, journalResumed, plan } = input;
  const protectedPaths = new Set([plan.targetPath, migrationJournalPath(env), migrationLockPath(env)]);
  assertSafeSourcePaths(plan.sources, protectedPaths);
  const existingSources = plan.sources.filter((source) => fileSystem.existsSync(source.path));
  const target = targetDocument(plan.targetPath, fileSystem);
  const replaceTarget = plan.mode === "replace-target";
  if (!shouldRunMigration({
    legacySourcesExist: replaceTarget ? fileSystem.existsSync(plan.targetPath) : existingSources.length > 0,
    migrationId: plan.id,
    target
  })) {
    return { diagnostics: [], journalResumed, status: "skipped" };
  }
  const loaded = replaceTarget ? [{ path: plan.targetPath, value: target }] : loadSources(existingSources, fileSystem);
  const transformed = transformResult(plan.transform(loaded));
  const prepared = replaceTarget ? prepareTargetReplacement({ document: transformed.document, migrationId: plan.id, target, targetPath: plan.targetPath }) : prepareTargetWrite({ additions: transformed.document, migrationId: plan.id, target, targetPath: plan.targetPath });
  const diagnostics = [...transformed.diagnostics, ...prepared.diagnostics];
  const moves = backupMoves(existingSources, plan.id, fileSystem, protectedPaths);
  const preview = { backupMoves: moves, targetPath: plan.targetPath, transform: transformed.document };
  if (input.dryRun)
    return { diagnostics, journalResumed, preview, status: "planned" };
  ensureBackupDirectories(moves, fileSystem);
  const journal = {
    backupMoves: moves,
    completedMoves: [],
    diagnostics,
    migrationId: plan.id,
    targetPath: plan.targetPath,
    targetWrite: {
      additions: transformed.document,
      ...replaceTarget ? { mode: "replace-target" } : {}
    },
    targetWritten: false,
    version: 1
  };
  writeMigrationJournal(journal, fileSystem, env, input.process, input.clock);
  input.onBoundary?.("journal-written");
  input.renewLock();
  writePreparedTarget({ env, fileSystem, prepared, targetPath: plan.targetPath, writeTarget: input.writeTarget });
  input.onBoundary?.("target-written");
  const targetRecorded = { ...journal, targetWritten: true };
  writeMigrationJournal(targetRecorded, fileSystem, env, input.process, input.clock);
  input.onBoundary?.("target-recorded");
  for (const move of targetRecorded.backupMoves) {
    input.renewLock();
    if (fileSystem.existsSync(move.to))
      throw new MigrationTransactionError(`Migration backup path already exists: ${move.to}`);
    moveMigrationBackup(fileSystem, move.from, move.to);
    input.onBoundary?.("source-moved");
    Object.assign(targetRecorded, { completedMoves: [...targetRecorded.completedMoves, move.from] });
    writeMigrationJournal(targetRecorded, fileSystem, env, input.process, input.clock);
    input.onBoundary?.("source-recorded");
  }
  removeMigrationJournal(fileSystem, env);
  return { diagnostics, journalResumed, preview, status: "migrated" };
}
function runMigrations(options) {
  const clock = options.clock ?? DEFAULT_MIGRATION_CLOCK;
  const home = globalThis.process.env["HOME"];
  const userProfile = globalThis.process.env["USERPROFILE"];
  const env = options.env ?? { ...home === undefined ? {} : { HOME: home }, ...userProfile === undefined ? {} : { USERPROFILE: userProfile } };
  const fileSystem = options.fileSystem ?? DEFAULT_MIGRATION_FILE_SYSTEM;
  const process3 = { isAlive: options.isProcessAlive ?? DEFAULT_MIGRATION_PROCESS.isAlive, pid: options.pid ?? DEFAULT_MIGRATION_PROCESS.pid };
  const writeTarget = options.writeTarget ?? writeOmoMigrationTarget;
  const lock = acquireMigrationLock({ clock, env, fileSystem, ...options.leaseDurationMs === undefined ? {} : { leaseDurationMs: options.leaseDurationMs }, process: process3 });
  if (lock === null)
    return { journalResumed: false, results: [], status: "locked" };
  try {
    const journalResumed = resumeMigrationJournal({ clock, env, fileSystem, process: process3, renewLock: lock.renew, writeTarget });
    lock.renew();
    const results = options.discover().map((plan) => executePlan({
      clock,
      dryRun: options.dryRun ?? false,
      env,
      fileSystem,
      journalResumed,
      onBoundary: options.onBoundary,
      plan,
      process: process3,
      renewLock: lock.renew,
      writeTarget
    }));
    if (options.dryRun !== true)
      options.afterMigrations?.(results);
    return { journalResumed, results, status: "completed" };
  } finally {
    lock.release();
  }
}

// ../../shared/src/config-migration.ts
import { existsSync as existsSync6 } from "node:fs";
import { posix as posix4, win32 } from "node:path";
var MIGRATION_ID = "2026-07-codex-config-jsonc";
var OMO_SCHEMA_URL = "https://raw.githubusercontent.com/code-yeongyu/oh-my-openagent/dev/assets/omo.schema.json";
function isRecord5(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function recordAt(value, key) {
  const candidate = value[key];
  return isRecord5(candidate) ? candidate : undefined;
}
function migrationHistory(sources, configPath) {
  const history = [];
  for (const source of sources) {
    if (!isRecord5(source.value))
      continue;
    for (const key of ["_migrations", "appliedMigrations"]) {
      const values = source.value[key];
      if (!Array.isArray(values))
        continue;
      for (const value of values) {
        if (typeof value === "string" && !history.includes(value))
          history.push(value);
      }
    }
  }
  return history.length === 0 ? {} : { [configPath]: history };
}
function transformConfigJsonc(configPath, sources) {
  const config2 = sources.find((source) => source.path === configPath);
  const legacy = config2 === undefined || !isRecord5(config2.value) ? {} : config2.value;
  const omo = recordAt(legacy, "[omo]");
  const senpi = recordAt(legacy, "[senpi]");
  const history = migrationHistory(sources, configPath);
  return {
    diagnostics: omo !== undefined && senpi !== undefined ? ["conflict: [senpi] legacy [omo] kept [senpi]"] : [],
    document: {
      $schema: OMO_SCHEMA_URL,
      ...recordAt(legacy, "codegraph") === undefined ? {} : { codegraph: recordAt(legacy, "codegraph") },
      ...recordAt(legacy, "[opencode]") === undefined ? {} : { "[opencode]": recordAt(legacy, "[opencode]") },
      ...recordAt(legacy, "[codex]") === undefined ? {} : { "[codex]": recordAt(legacy, "[codex]") },
      ...senpi === undefined && omo === undefined ? {} : { "[senpi]": senpi ?? omo },
      ...Object.keys(history).length === 0 ? {} : { legacy_migrations: history }
    }
  };
}
function timestamp(value) {
  return value ?? new Date().toISOString().replace(/[:.]/g, "-");
}
function sourceExists(options, path) {
  return (options.discoveryFileSystem ?? options.fileSystem ?? { existsSync: existsSync6 }).existsSync(path);
}
function migrationPlan(homeDir, options) {
  const platform = options.platform ?? process.platform;
  const paths = options.pathOperations ?? (platform === "win32" ? win32 : posix4);
  const configPath = paths.join(homeDir, ".omo", "config.jsonc");
  const sidecarPath = `${configPath}.migrations.json`;
  const sourcePaths = [configPath, sidecarPath].filter((path) => sourceExists(options, path));
  if (sourcePaths.length === 0)
    return;
  const backupRoot = paths.join(homeDir, ".omo", `migration-backup-${timestamp(options.backupTimestamp)}-opencode-config`, ".omo");
  return {
    id: MIGRATION_ID,
    sources: sourcePaths.map((path) => ({
      backupPath: paths.join(backupRoot, path === configPath ? "config.jsonc" : "config.jsonc.migrations.json"),
      path
    })),
    targetPath: paths.join(homeDir, ".omo", "omo.jsonc"),
    transform: (sources) => transformConfigJsonc(configPath, sources)
  };
}
function migratedSources(results) {
  return [...new Set(results.flatMap((result) => result.status === "migrated" ? result.preview?.backupMoves.map((move) => move.from) ?? [] : []))].sort();
}
function runCodexConfigMigration(options) {
  const environment = options.environment ?? process.env;
  const homeDir = options.homeDir ?? environment["HOME"] ?? environment["USERPROFILE"];
  if (homeDir === undefined || homeDir.length === 0) {
    return { error: "Cannot migrate configuration because no home directory is available", journalResumed: false, migratedFrom: [], results: [] };
  }
  try {
    const batch = runMigrations({
      ...options.clock === undefined ? {} : { clock: options.clock },
      discover: () => {
        const plan = migrationPlan(homeDir, options);
        return plan === undefined ? [] : [plan];
      },
      ...options.env === undefined ? { env: { HOME: homeDir } } : { env: options.env },
      ...options.fileSystem === undefined ? {} : { fileSystem: options.fileSystem },
      ...options.isProcessAlive === undefined ? {} : { isProcessAlive: options.isProcessAlive },
      ...options.onBoundary === undefined ? {} : { onBoundary: options.onBoundary },
      ...options.pid === undefined ? {} : { pid: options.pid }
    });
    return {
      ...batch.status === "locked" ? { error: "Configuration migration is already running" } : {},
      journalResumed: batch.journalResumed,
      migratedFrom: migratedSources(batch.results),
      results: batch.results
    };
  } catch (error2) {
    return {
      error: error2 instanceof Error ? error2.message : String(error2),
      journalResumed: false,
      migratedFrom: [],
      results: []
    };
  }
}

// ../../shared/src/config-loader.ts
var ENV_BOOLEAN_SETTINGS = [
  ["auto_provision", "AUTO_PROVISION"],
  ["enabled", "ENABLED"],
  ["telemetry", "TELEMETRY"]
];
function resolveHomeDir2(options) {
  const env = options.env ?? process.env;
  return options.homeDir ?? env.HOME ?? env.USERPROFILE ?? homedir5();
}
function environmentWithHome(env, homeDir) {
  return { ...env, HOME: homeDir };
}
function migrationEnvironment(homeDir, env) {
  return {
    HOME: homeDir,
    ...env.USERPROFILE === undefined ? {} : { USERPROFILE: env.USERPROFILE }
  };
}
function runCodexStartupMigration(options) {
  return runCodexConfigMigration(options);
}
function parseBoolean(value) {
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized))
    return true;
  if (["0", "false", "no", "off"].includes(normalized))
    return false;
  return;
}
function envOverrides(env, warnings) {
  const codegraph = {};
  for (const prefix of ["OMO", "CODEX"]) {
    for (const [setting, suffix] of ENV_BOOLEAN_SETTINGS) {
      const name = `${prefix}_CODEGRAPH_${suffix}`;
      const rawValue = env[name];
      if (rawValue === undefined)
        continue;
      const value = parseBoolean(rawValue);
      if (value === undefined)
        warnings.push(`${name} has invalid boolean value "${rawValue}"`);
      else
        codegraph[setting] = value;
    }
    const installDir = env[`${prefix}_CODEGRAPH_INSTALL_DIR`];
    if (installDir !== undefined)
      codegraph["install_dir"] = installDir;
    const cooldown = env[`${prefix}_CODEGRAPH_SESSION_START_COOLDOWN_MS`];
    if (cooldown !== undefined) {
      const value = Number(cooldown);
      if (!Number.isFinite(value) || value < 60000) {
        warnings.push(`${prefix}_CODEGRAPH_SESSION_START_COOLDOWN_MS has invalid number value "${cooldown}"`);
      } else
        codegraph["session_start_cooldown_ms"] = value;
    }
    const debounce = env[`${prefix}_CODEGRAPH_WATCH_DEBOUNCE_MS`];
    if (debounce !== undefined) {
      const value = Number(debounce);
      if (!Number.isFinite(value) || value < 0)
        warnings.push(`${prefix}_CODEGRAPH_WATCH_DEBOUNCE_MS has invalid number value "${debounce}"`);
      else
        codegraph["watch_debounce_ms"] = value;
    }
  }
  return Object.keys(codegraph).length === 0 ? {} : { codegraph };
}
function migrationWarnings(result) {
  const warnings = [];
  if (result.error !== undefined)
    warnings.push(`omo-codex: configuration migration: ${result.error}`);
  if (result.journalResumed)
    warnings.push("omo-codex: recovered an interrupted configuration migration");
  if (result.migratedFrom.length > 0) {
    warnings.push(`omo-codex: migrated legacy configuration from ${result.migratedFrom.join(", ")}`);
  }
  for (const migration of result.results) {
    for (const diagnostic of migration.diagnostics) {
      warnings.push(`omo-codex: configuration migration: ${diagnostic}`);
    }
  }
  return warnings;
}
function applicabilityWarnings(config2) {
  return config2.codegraph?.watch_debounce_ms === undefined ? [] : ["codegraph.watch_debounce_ms is not supported for harness codex"];
}
function codexCodegraphConfig(value) {
  if (value === undefined)
    return;
  return {
    auto_provision: value.auto_provision,
    daemon: value.daemon,
    enabled: value.enabled,
    telemetry: value.telemetry,
    ...value.excluded_roots === undefined ? {} : { excluded_roots: value.excluded_roots },
    ...value.install_dir === undefined ? {} : { install_dir: value.install_dir },
    ...value.session_start_cooldown_ms === undefined ? {} : { session_start_cooldown_ms: value.session_start_cooldown_ms },
    ...value.watch_debounce_ms === undefined ? {} : { watch_debounce_ms: value.watch_debounce_ms }
  };
}
function getCodexOmoConfig(options = {}) {
  const env = options.env ?? process.env;
  const homeDir = resolveHomeDir2(options);
  const environment = environmentWithHome(env, homeDir);
  const migration = runCodexStartupMigration({
    cwd: options.cwd ?? process.cwd(),
    environment,
    env: migrationEnvironment(homeDir, environment),
    ...options.fileSystem === undefined ? {} : { fileSystem: options.fileSystem },
    ...options.platform === undefined ? {} : { platform: options.platform }
  });
  const result = loadOmoConfig({
    ...options.cwd === undefined ? {} : { cwd: options.cwd },
    env: environment,
    ...options.fileSystem === undefined ? {} : { fileSystem: options.fileSystem },
    harness: "codex",
    ...options.platform === undefined ? {} : { platform: options.platform },
    ...options.profile === undefined ? {} : { profile: options.profile }
  });
  const trustedConfig = loadOmoConfig({
    cwd: homeDir,
    env: environment,
    ...options.fileSystem === undefined ? {} : { fileSystem: options.fileSystem },
    harness: "codex",
    ...options.platform === undefined ? {} : { platform: options.platform },
    ...options.profile === undefined ? {} : { profile: options.profile }
  });
  const envWarnings = [];
  const config2 = OmoConfigSchema.parse(mergeOmoConfigRecords(result.config, envOverrides(env, envWarnings)));
  const trustedCodegraphInstallDir = trustedConfig.config.codegraph?.install_dir;
  const { codegraph, ...resolvedConfig } = config2;
  const codexCodegraph = codexCodegraphConfig(codegraph);
  return {
    ...resolvedConfig,
    ...codexCodegraph === undefined ? {} : { codegraph: codexCodegraph },
    sources: result.sources,
    ...trustedCodegraphInstallDir === undefined ? {} : { trustedCodegraphInstallDir },
    warnings: [
      ...migrationWarnings(migration),
      ...result.diagnostics.map((diagnostic) => diagnostic.message),
      ...envWarnings,
      ...applicabilityWarnings(config2)
    ]
  };
}

// src/mcp-bridge.ts
import { spawn } from "node:child_process";

// ../../../../mcp-stdio-core/src/record.ts
function isPlainRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
// ../../../../mcp-stdio-core/src/responses.ts
function successResponse(id, result) {
  return { jsonrpc: "2.0", id, result };
}
function errorResponse(id, code, message, data) {
  return { jsonrpc: "2.0", id, error: data === undefined ? { code, message } : { code, message, data } };
}
function jsonRpcId(value) {
  return typeof value === "string" || typeof value === "number" || value === null ? value : null;
}
function messageFromError(error2) {
  return error2 instanceof Error ? error2.message : String(error2);
}
// ../../../../mcp-stdio-core/src/transport.ts
var HEADER_SEPARATOR = Buffer.from(`\r
\r
`);
async function* readStdioJsonRpcMessages(input) {
  let buffer = Buffer.alloc(0);
  for await (const chunk of input) {
    buffer = Buffer.concat([buffer, bufferFromChunk(chunk)]);
    while (true) {
      const result = readNextMessage(buffer);
      if (result.kind === "incomplete")
        break;
      buffer = result.remaining;
      if (result.message)
        yield result.message;
    }
  }
  const trailing = buffer.toString("utf8").trim();
  if (trailing.length > 0) {
    yield parseJsonPayload(trailing, "line");
  }
}
async function writeStdioJsonRpcResponse(output, response, responseMode) {
  const body = JSON.stringify(response);
  const payload = responseMode === "framed" ? `Content-Length: ${Buffer.byteLength(body, "utf8")}\r
\r
${body}` : `${body}
`;
  await writeChunk(output, payload);
}
function writeChunk(output, chunk) {
  return new Promise((resolve5, reject) => {
    let settled = false;
    const onError = (error2) => {
      if (settled)
        return;
      settled = true;
      reject(error2);
    };
    output.once("error", onError);
    try {
      output.write(chunk, (error2) => {
        if (settled)
          return;
        settled = true;
        if (error2) {
          queueMicrotask(() => output.removeListener("error", onError));
          reject(error2);
          return;
        }
        output.removeListener("error", onError);
        resolve5();
      });
    } catch (error2) {
      output.removeListener("error", onError);
      if (settled)
        return;
      settled = true;
      reject(error2);
    }
  });
}
function readNextMessage(buffer) {
  if (buffer.length === 0)
    return { kind: "incomplete" };
  return startsWithContentLength(buffer) ? readFramedMessage(buffer) : readLineMessage(buffer);
}
function readLineMessage(buffer) {
  const newlineIndex = buffer.indexOf(10);
  if (newlineIndex === -1)
    return { kind: "incomplete" };
  const line = buffer.subarray(0, newlineIndex).toString("utf8").replace(/\r$/, "");
  if (line.trim().length === 0) {
    return { kind: "complete", remaining: buffer.subarray(newlineIndex + 1) };
  }
  return {
    kind: "complete",
    message: parseJsonPayload(line, "line"),
    remaining: buffer.subarray(newlineIndex + 1)
  };
}
function readFramedMessage(buffer) {
  const separatorIndex = buffer.indexOf(HEADER_SEPARATOR);
  if (separatorIndex === -1)
    return { kind: "incomplete" };
  const headers = buffer.subarray(0, separatorIndex).toString("ascii");
  const contentLength = parseContentLength(headers);
  const bodyStart = separatorIndex + HEADER_SEPARATOR.length;
  if (contentLength === undefined) {
    return {
      kind: "complete",
      message: {
        kind: "parse_error",
        message: "Missing or invalid Content-Length header",
        responseMode: "framed"
      },
      remaining: buffer.subarray(bodyStart)
    };
  }
  const bodyEnd = bodyStart + contentLength;
  if (buffer.length < bodyEnd)
    return { kind: "incomplete" };
  const body = buffer.subarray(bodyStart, bodyEnd).toString("utf8");
  return {
    kind: "complete",
    message: parseJsonPayload(body, "framed"),
    remaining: buffer.subarray(bodyEnd)
  };
}
function startsWithContentLength(buffer) {
  const prefix = buffer.subarray(0, "content-length:".length).toString("ascii").toLowerCase();
  return prefix === "content-length:";
}
function parseContentLength(headers) {
  for (const line of headers.split(`\r
`)) {
    const match = /^content-length:\s*(\d+)$/i.exec(line);
    if (match === null)
      continue;
    const value = match[1];
    if (value === undefined)
      return;
    return Number(value);
  }
  return;
}
function parseJsonPayload(payload, responseMode) {
  try {
    return { kind: "request", payload: JSON.parse(payload), responseMode };
  } catch (error2) {
    return { kind: "parse_error", message: error2 instanceof Error ? error2.message : String(error2), responseMode };
  }
}
function bufferFromChunk(chunk) {
  if (Buffer.isBuffer(chunk))
    return chunk;
  if (typeof chunk === "string")
    return Buffer.from(chunk);
  throw new TypeError(`Unsupported stdio chunk type: ${typeof chunk}`);
}

// ../../../../mcp-stdio-core/src/server.ts
var DEFAULT_IDLE_TIMEOUT_MS = 10 * 60000;
var DEFAULT_PARENT_POLL_INTERVAL_MS = 30000;
var noopLog = () => {};
function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error2) {
    return !hasErrorCode(error2, "ESRCH");
  }
}
async function runJsonRpcStdioServer(config2) {
  const log = config2.log ?? noopLog;
  const idleTimeoutMs = config2.idleTimeoutMs ?? DEFAULT_IDLE_TIMEOUT_MS;
  let isClosed = false;
  const idleTimer = createIdleTimer(idleTimeoutMs, log, () => {
    isClosed = true;
    config2.onIdleTimeout?.();
  });
  const watchdog = createParentWatchdog(config2.parentWatchdog, (parentPid, pollIntervalMs) => {
    isClosed = true;
    log("parent_exit", { parent_pid: parentPid, poll_interval_ms: pollIntervalMs });
    config2.onParentExit?.();
    config2.input.destroy();
  });
  log("stdio_started", { cwd: process.cwd(), idle_timeout_ms: idleTimeoutMs });
  idleTimer.arm();
  try {
    for await (const message of readStdioJsonRpcMessages(config2.input)) {
      if (isClosed)
        break;
      idleTimer.arm();
      if (message.kind === "parse_error") {
        if (!await handleParseError(message, config2, log))
          break;
        continue;
      }
      if (!await handleRequest(message, config2, log))
        break;
    }
  } catch (error2) {
    if (!(isClosed && hasErrorCode(error2, "ERR_STREAM_PREMATURE_CLOSE")))
      throw error2;
  } finally {
    idleTimer.clear();
    watchdog.clear();
    log("stdio_stopped");
  }
}
async function handleParseError(message, config2, log) {
  log("parse_error", { message: message.message });
  const response = config2.parseErrorResponse?.(message.message) ?? errorResponse(null, -32700, "Parse error", message.message);
  if (response === undefined)
    return true;
  return writeResponse(response, {
    output: config2.output,
    responseMode: message.responseMode,
    log
  });
}
async function handleRequest(message, config2, log) {
  const parsed = message.payload;
  const id = isPlainRecord2(parsed) ? jsonRpcId(parsed["id"]) : null;
  const method = isPlainRecord2(parsed) && typeof parsed["method"] === "string" ? parsed["method"] : null;
  log("request", { id: id === null ? null : String(id), method });
  let response;
  try {
    response = await config2.handler(parsed, config2.handlerOptions);
  } catch (error2) {
    if (config2.onHandlerError === undefined)
      throw error2;
    config2.onHandlerError(error2);
    return true;
  }
  if (response === undefined)
    return true;
  if (!await writeResponse(response, {
    output: config2.output,
    responseMode: message.responseMode,
    log
  }))
    return false;
  log("response", { id: String(response.id), method, is_error: response.error !== undefined });
  return true;
}
async function writeResponse(response, context) {
  try {
    await writeStdioJsonRpcResponse(context.output, response, context.responseMode);
    return true;
  } catch (error2) {
    if (!isTerminalOutputError(error2))
      throw error2;
    context.log("output_error", { message: messageFromError(error2) });
    return false;
  }
}
function isTerminalOutputError(error2) {
  if (!(error2 instanceof Error) || !("code" in error2))
    return false;
  return error2.code === "EPIPE" || error2.code === "ERR_STREAM_DESTROYED" || error2.code === "ERR_STREAM_WRITE_AFTER_END";
}
function hasErrorCode(error2, code) {
  return error2 instanceof Error && "code" in error2 && error2.code === code;
}
function createParentWatchdog(config2, onDeadParent) {
  if (config2 === undefined)
    return { clear: () => {} };
  const pollIntervalMs = config2.pollIntervalMs ?? DEFAULT_PARENT_POLL_INTERVAL_MS;
  if (pollIntervalMs <= 0)
    return { clear: () => {} };
  const parentPid = config2.parentPid ?? process.ppid;
  const probeAlive = config2.probeAlive ?? isProcessAlive;
  let fired = false;
  const timer = setInterval(() => {
    if (fired)
      return;
    const alive = probeAlive(parentPid);
    config2.onPoll?.(alive);
    if (alive)
      return;
    fired = true;
    onDeadParent(parentPid, pollIntervalMs);
  }, pollIntervalMs);
  timer.unref();
  return {
    clear: () => {
      clearInterval(timer);
    }
  };
}
function createIdleTimer(idleTimeoutMs, log, onTimeout) {
  let timer = null;
  return {
    arm: () => {
      if (timer !== null)
        clearTimeout(timer);
      if (idleTimeoutMs <= 0)
        return;
      timer = setTimeout(() => {
        log("idle_timeout", { idle_timeout_ms: idleTimeoutMs });
        onTimeout();
      }, idleTimeoutMs);
      timer.unref();
    },
    clear: () => {
      if (timer === null)
        return;
      clearTimeout(timer);
      timer = null;
    }
  };
}
// src/serve-invocation.ts
import { extname } from "node:path";
import { execPath as processExecPath } from "node:process";
var WINDOWS_CMD_EXTENSIONS = new Set([".bat", ".cmd"]);
var WINDOWS_NODE_SCRIPT_EXTENSIONS = new Set([".cjs", ".js", ".mjs"]);
function resolveServeProcessInvocation(command, args, platform = process.platform) {
  if (platform !== "win32")
    return { args: [...args], command };
  const extension = extname(command).toLowerCase();
  if (WINDOWS_NODE_SCRIPT_EXTENSIONS.has(extension)) {
    return { args: [command, ...args], command: processExecPath };
  }
  if (WINDOWS_CMD_EXTENSIONS.has(extension)) {
    return { args: ["/d", "/s", "/c", command, ...args], command: "cmd.exe" };
  }
  return { args: [...args], command };
}

// src/mcp-bridge.ts
class CodegraphBridgeStdioError extends Error {
  streamName;
  name = "CodegraphBridgeStdioError";
  constructor(streamName) {
    super(`CodeGraph MCP bridge missing child ${streamName}`);
    this.streamName = streamName;
  }
}
var CODEGRAPH_NODE_DESCRIPTION = "Inspect one named symbol or file. In symbol mode, includeCode=true includes leaf-symbol source when available. Container symbols such as classes, interfaces, structs, enums, modules, and namespaces return structural outlines with member lists by design. For container source, request a specific member symbol or use file mode with symbolsOnly=false plus offset/limit.";
var CODEGRAPH_NODE_INCLUDE_CODE_DESCRIPTION = "Symbol mode: include leaf-symbol source when available. Container symbols such as classes, interfaces, structs, enums, modules, and namespaces intentionally return structural outlines with members; request a specific member symbol or use file mode with symbolsOnly=false plus offset/limit for source.";
var CODEGRAPH_CONTAINER_OUTLINE_GUIDANCE = "Container symbols intentionally return structural outlines with members. For source, request a specific member symbol or call codegraph_node in file mode with symbolsOnly=false plus offset/limit around the symbol location.";
var SIGKILL_ESCALATION_MS = 2000;
async function runBridgedCodegraphProcess(command, args, options) {
  const invocation = resolveServeProcessInvocation(command, args);
  const child = spawn(invocation.command, invocation.args, {
    cwd: options.cwd,
    env: options.env,
    stdio: ["pipe", "pipe", "inherit"],
    windowsHide: true
  });
  const childInput = child.stdin;
  const childOutput = child.stdout;
  if (childInput === null)
    throw new CodegraphBridgeStdioError("stdin");
  if (childOutput === null)
    throw new CodegraphBridgeStdioError("stdout");
  const pendingResponses = new Map;
  let defaultResponseMode = "framed";
  const childExit = new Promise((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code !== null) {
        resolveExit(code);
        return;
      }
      resolveExit(signal === null ? 0 : 1);
    });
  });
  const destroyChildPipes = () => {
    childInput.destroy();
    childOutput.destroy();
  };
  childExit.then(destroyChildPipes, destroyChildPipes);
  let parentWatchdogFired = false;
  const parentWatchdog = createParentWatchdog(options.parentWatchdog, () => {
    parentWatchdogFired = true;
    options.input.destroy();
    destroyChildPipes();
    terminateCodegraphChild(child);
  });
  const clientForwardingDone = forwardClientToCodegraph(options.input, childInput, pendingResponses, (mode2) => {
    defaultResponseMode = mode2;
  }, () => parentWatchdogFired);
  const responseForwardingDone = forwardCodegraphToClient(childOutput, options.output, pendingResponses, () => defaultResponseMode, () => parentWatchdogFired);
  const bridgeDone = Promise.all([clientForwardingDone, responseForwardingDone]);
  const childAndResponsesDone = Promise.all([childExit, responseForwardingDone]).then(([exitCode]) => exitCode);
  try {
    return await Promise.race([childAndResponsesDone, bridgeDone.then(() => childExit)]);
  } catch (error2) {
    destroyChildPipes();
    if (child.exitCode === null && child.signalCode === null)
      child.kill("SIGKILL");
    await childExit.catch(() => {
      return;
    });
    throw error2;
  } finally {
    parentWatchdog.clear();
  }
}
function terminateCodegraphChild(child) {
  if (child.exitCode !== null || child.signalCode !== null)
    return;
  child.kill("SIGTERM");
  const escalation = setTimeout(() => {
    if (child.exitCode === null && child.signalCode === null)
      child.kill("SIGKILL");
  }, SIGKILL_ESCALATION_MS);
  escalation.unref();
}
function isWatchdogTeardownError(error2) {
  if (!(error2 instanceof Error) || !("code" in error2))
    return false;
  return error2.code === "ERR_STREAM_PREMATURE_CLOSE" || error2.code === "ERR_STREAM_DESTROYED" || error2.code === "ERR_STREAM_WRITE_AFTER_END" || error2.code === "EPIPE";
}
async function forwardClientToCodegraph(input, childInput, pendingResponses, setDefaultResponseMode, tolerateWatchdogClose) {
  try {
    for await (const message of readStdioJsonRpcMessages(input)) {
      if (message.kind === "parse_error") {
        continue;
      }
      const responseMode = message.responseMode;
      setDefaultResponseMode(responseMode);
      const key = responseModeKey(message.payload);
      if (key !== null) {
        pendingResponses.set(key, {
          method: jsonRpcMethod(message.payload),
          responseMode,
          toolName: jsonRpcToolName(message.payload)
        });
      }
      await writeLine(childInput, JSON.stringify(message.payload));
    }
    childInput.end();
  } catch (error2) {
    if (!(tolerateWatchdogClose() && isWatchdogTeardownError(error2)))
      throw error2;
  }
}
async function forwardCodegraphToClient(childOutput, output, pendingResponses, defaultResponseMode, tolerateWatchdogClose) {
  try {
    for await (const message of readStdioJsonRpcMessages(childOutput)) {
      if (message.kind === "parse_error") {
        await writeStdioJsonRpcResponse(output, errorResponse(null, -32700, "Parse error", message.message), defaultResponseMode());
        continue;
      }
      const key = responseModeKey(message.payload);
      const pendingResponse = key === null ? undefined : pendingResponses.get(key);
      const responseMode = pendingResponse?.responseMode ?? defaultResponseMode();
      if (key !== null)
        pendingResponses.delete(key);
      await writeStdioJsonRpcResponse(output, clarifyCodegraphResponse(message.payload, pendingResponse), responseMode);
    }
  } catch (error2) {
    if (!(tolerateWatchdogClose() && isWatchdogTeardownError(error2)))
      throw error2;
  }
}
function responseModeKey(payload) {
  if (!isPlainRecord2(payload) || !("id" in payload))
    return null;
  const id = jsonRpcId(payload["id"]);
  return `${typeof id}:${String(id)}`;
}
function jsonRpcMethod(payload) {
  if (!isPlainRecord2(payload))
    return null;
  const method = payload["method"];
  return typeof method === "string" ? method : null;
}
function jsonRpcToolName(payload) {
  if (jsonRpcMethod(payload) !== "tools/call" || !isPlainRecord2(payload))
    return null;
  const params = payload["params"];
  if (!isPlainRecord2(params))
    return null;
  const name = params["name"];
  return typeof name === "string" ? name : null;
}
function clarifyCodegraphResponse(payload, pendingResponse) {
  if (pendingResponse?.method === "tools/list")
    return clarifyCodegraphToolsList(payload);
  if (pendingResponse?.method === "tools/call" && pendingResponse.toolName === "codegraph_node") {
    return clarifyCodegraphNodeCallResult(payload);
  }
  return payload;
}
function clarifyCodegraphToolsList(payload) {
  if (!isPlainRecord2(payload))
    return payload;
  const result = payload["result"];
  if (!isPlainRecord2(result) || !Array.isArray(result["tools"]))
    return payload;
  let changed = false;
  const tools = result["tools"].map((tool) => {
    if (!isPlainRecord2(tool) || tool["name"] !== "codegraph_node")
      return tool;
    if (!hasCodegraphNodeContractMetadata(tool))
      return tool;
    changed = true;
    return clarifyCodegraphNodeTool(tool);
  });
  if (!changed)
    return payload;
  return { ...payload, result: { ...result, tools } };
}
function clarifyCodegraphNodeTool(tool) {
  const clarified = {
    ...tool,
    description: CODEGRAPH_NODE_DESCRIPTION
  };
  const inputSchema = tool["inputSchema"];
  if (isPlainRecord2(inputSchema))
    clarified["inputSchema"] = clarifyCodegraphNodeInputSchema(inputSchema);
  return clarified;
}
function hasCodegraphNodeContractMetadata(tool) {
  if (typeof tool["description"] === "string")
    return true;
  const inputSchema = tool["inputSchema"];
  if (!isPlainRecord2(inputSchema))
    return false;
  const properties = inputSchema["properties"];
  return isPlainRecord2(properties) && isPlainRecord2(properties["includeCode"]);
}
function clarifyCodegraphNodeInputSchema(inputSchema) {
  const properties = inputSchema["properties"];
  if (!isPlainRecord2(properties))
    return inputSchema;
  const includeCode = properties["includeCode"];
  if (!isPlainRecord2(includeCode))
    return inputSchema;
  return {
    ...inputSchema,
    properties: {
      ...properties,
      includeCode: {
        ...includeCode,
        description: CODEGRAPH_NODE_INCLUDE_CODE_DESCRIPTION
      }
    }
  };
}
function clarifyCodegraphNodeCallResult(payload) {
  if (!isPlainRecord2(payload))
    return payload;
  const result = payload["result"];
  if (!isPlainRecord2(result) || !Array.isArray(result["content"]))
    return payload;
  let changed = false;
  const content = result["content"].map((item) => {
    if (!isPlainRecord2(item) || item["type"] !== "text" || typeof item["text"] !== "string")
      return item;
    const text = clarifyContainerOutlineGuidance(item["text"]);
    if (text === item["text"])
      return item;
    changed = true;
    return { ...item, text };
  });
  if (!changed)
    return payload;
  return { ...payload, result: { ...result, content } };
}
function clarifyContainerOutlineGuidance(text) {
  if (!text.includes("Structural outline only"))
    return text;
  return text.replace(/Structural outline only[^\n]*(?:\n[^\n]*(?:Read|read)[^\n]*)?/g, CODEGRAPH_CONTAINER_OUTLINE_GUIDANCE);
}
async function writeLine(output, line) {
  if (output.write(`${line}
`))
    return;
  await new Promise((resolveDrain, reject) => {
    output.once("drain", resolveDrain);
    output.once("error", reject);
  });
}

// src/mcp-unavailable.ts
async function runUnavailableCodegraphMcpServer(options) {
  await runJsonRpcStdioServer({
    handler: handleUnavailableCodegraphMcpRequest,
    handlerOptions: {
      reason: options.reason.trim(),
      serverVersion: options.serverVersion
    },
    input: options.input,
    output: options.output,
    parentWatchdog: options.parentWatchdog ?? {}
  });
}
async function handleUnavailableCodegraphMcpRequest(input, options) {
  if (!isPlainRecord2(input)) {
    return errorResponse(null, -32600, "Invalid Request");
  }
  const id = jsonRpcId(input["id"]);
  const method = input["method"];
  if (method === "notifications/initialized")
    return;
  if (method === "ping")
    return successResponse(id, {});
  if (method === "initialize") {
    return successResponse(id, {
      capabilities: { tools: { listChanged: false } },
      protocolVersion: requestedProtocolVersion(input["params"]),
      serverInfo: { name: "codegraph", version: options.serverVersion }
    });
  }
  if (method === "tools/list") {
    return successResponse(id, { tools: [] });
  }
  if (method === "tools/call") {
    return successResponse(id, {
      content: [{ text: options.reason, type: "text" }],
      isError: true
    });
  }
  return errorResponse(id, -32601, `Method not found: ${String(method)}`);
}
function requestedProtocolVersion(params) {
  if (!isPlainRecord2(params) || typeof params["protocolVersion"] !== "string")
    return "2024-11-05";
  return params["protocolVersion"];
}

// src/session-start-cooldown.ts
var DEFAULT_SESSION_START_COOLDOWN_MS = 15 * 60 * 1000;
var MAX_SESSION_START_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// src/session-start-worker.ts
var SESSION_START_CWD_ENV = "OMO_CODEGRAPH_SESSION_START_CWD";

// src/serve.ts
var CODEGRAPH_SKIP_HINT = `CodeGraph MCP skipped: codegraph binary not found. Install CodeGraph or set OMO_CODEGRAPH_BIN.
`;
var CODEGRAPH_DISABLED_HINT = `CodeGraph MCP skipped: disabled by OMO SOT config. Set [codex].codegraph.enabled=true to enable it.
`;
var CODEGRAPH_EXCLUDED_HINT = `CodeGraph MCP skipped: project excluded by OMO CodeGraph policy.
`;
var CODEGRAPH_VERSION = CODEGRAPH_PINNED_VERSION;
var PROJECT_CWD_ENV_KEYS = ["OMO_CODEGRAPH_PROJECT_CWD", SESSION_START_CWD_ENV, "PWD"];
async function runCodegraphServe(options = {}) {
  const env = options.env ?? processEnv;
  const homeDir = options.homeDir ?? homedir6();
  const wrapperCwd = options.cwd ?? processCwd();
  const projectCwd = resolveProjectCwd(env, wrapperCwd);
  const config2 = options.config ?? getCodexOmoConfig({ cwd: projectCwd, env, homeDir });
  const codegraphConfig = config2.codegraph ?? {};
  if (codegraphConfig.enabled === false) {
    return runUnavailableMcp(CODEGRAPH_DISABLED_HINT, options);
  }
  const excludedRoots = codegraphConfig.excluded_roots;
  const exclusion = shouldExcludeCodegraphProject(projectCwd, {
    homeDir,
    ...excludedRoots === undefined ? {} : { excludedRoots }
  });
  if (exclusion.excluded) {
    return runUnavailableMcp(CODEGRAPH_EXCLUDED_HINT, options);
  }
  const trustedInstallDir = config2.trustedCodegraphInstallDir;
  const installDir = trustedInstallDir ?? join12(homeDir, ".omo", "codegraph");
  const resolutionOptions = {
    env,
    homeDir,
    provisioned: () => provisionedBinFromInstallDir(installDir)
  };
  let resolution = options.resolve?.(resolutionOptions) ?? resolveCodegraphCommand(resolutionOptions);
  const resolveManagedBin = options.resolveManagedBin ?? (options.resolve === undefined ? provisionedBinFromInstallDir : () => null);
  const managedInstallExists = options.managedInstallExists ?? (options.resolve === undefined ? hasCodegraphManagedInstall : () => false);
  const managedBin = resolveManagedBin(installDir);
  if (resolution.source !== "env" && managedBin !== null) {
    resolution = { argsPrefix: [], command: managedBin, exists: true, source: "provisioned" };
  } else if (resolution.source !== "env" && codegraphConfig.auto_provision !== false && managedInstallExists(installDir)) {
    const upgraded = await provisionMissingCodegraph({
      config: codegraphConfig,
      ensureProvisioned: options.ensureProvisioned ?? ensureCodegraphProvisioned,
      homeDir,
      resolution,
      ...trustedInstallDir === undefined ? {} : { trustedInstallDir }
    });
    if (upgraded !== null)
      resolution = upgraded;
  }
  const nodeSupport = evaluateCodegraphNodeSupport({ env, nodeVersion: options.nodeVersion });
  if (!resolution.exists || shouldSkipResolvedCommand(resolution, options.commandExists ?? existsSync7)) {
    if (resolution.source === "path" && !nodeSupport.supported) {
      return runUnavailableMcp(buildCodegraphNodeSkipHint(nodeSupport), options);
    }
    const provisioned = await provisionMissingCodegraph({
      config: codegraphConfig,
      ensureProvisioned: options.ensureProvisioned ?? ensureCodegraphProvisioned,
      homeDir,
      resolution,
      ...trustedInstallDir === undefined ? {} : { trustedInstallDir }
    });
    if (provisioned === null) {
      return runUnavailableMcp(CODEGRAPH_SKIP_HINT, options);
    }
    resolution = provisioned;
  }
  if (codegraphCommandRequiresSupportedLocalNode(resolution) && !nodeSupport.supported) {
    return runUnavailableMcp(buildCodegraphNodeSkipHint(nodeSupport), options);
  }
  const runProcess = options.runProcess ?? runBridgedCodegraphProcess;
  const codegraphEnv = codegraphEnvForConfig(trustedInstallDir, homeDir, codegraphConfig.daemon !== false, options.buildEnv);
  const mergedEnv = buildCodegraphChildEnv({ ambientEnv: env, codegraphEnv, runtimeEnv: env });
  return runProcess(resolution.command, [...resolution.argsPrefix, "serve", "--mcp"], {
    cwd: projectCwd,
    env: mergedEnv,
    input: options.stdin ?? processStdin,
    output: options.stdout ?? processStdout,
    stderr: options.stderr ?? processStderr,
    stdio: "pipe",
    parentWatchdog: options.parentWatchdog ?? {}
  });
}
async function runUnavailableMcp(reason, options) {
  (options.stderr ?? processStderr).write(reason);
  await runUnavailableCodegraphMcpServer({
    input: options.stdin ?? processStdin,
    output: options.stdout ?? processStdout,
    reason,
    serverVersion: CODEGRAPH_VERSION,
    parentWatchdog: options.parentWatchdog ?? {}
  });
  return 0;
}
async function provisionMissingCodegraph(options) {
  if (options.resolution.source === "env")
    return null;
  if (options.config.auto_provision === false)
    return null;
  const installDir = options.trustedInstallDir ?? join12(options.homeDir, ".omo", "codegraph");
  const result = await options.ensureProvisioned({
    installDir,
    lockDir: join12(installDir, ".locks"),
    version: CODEGRAPH_VERSION
  });
  if (!result.provisioned || result.binPath === undefined)
    return null;
  return { argsPrefix: [], command: result.binPath, exists: true, source: "provisioned" };
}
function shouldSkipResolvedCommand(resolution, commandExists) {
  if (resolution.source !== "env")
    return false;
  if (!looksLikePath2(resolution.command))
    return false;
  return !commandExists(resolution.command);
}
function looksLikePath2(command) {
  return command.includes("/") || command.includes("\\");
}
function codegraphEnvForConfig(trustedInstallDir, homeDir, daemon, buildEnv) {
  const env = buildEnv?.({ daemon, homeDir }) ?? buildCodegraphEnv({ daemon, homeDir });
  return trustedInstallDir === undefined ? env : { ...env, CODEGRAPH_INSTALL_DIR: trustedInstallDir };
}
function resolveProjectCwd(env, fallback) {
  for (const key of PROJECT_CWD_ENV_KEYS) {
    const candidate = env[key]?.trim();
    if (candidate === undefined || candidate.length === 0)
      continue;
    const resolved = resolve5(candidate);
    if (existsSync7(resolved))
      return resolved;
  }
  return resolve5(fallback);
}
function provisionedBinFromInstallDir(installDir) {
  return resolvePinnedCodegraphBin(installDir);
}
async function runCodegraphServeCli() {
  process.exitCode = await runCodegraphServe();
}
if (isDirectInvocation(process.argv[1])) {
  runCodegraphServeCli().catch((error2) => {
    processStderr.write(`${error2 instanceof Error ? error2.stack ?? error2.message : String(error2)}
`);
    process.exitCode = 1;
  });
}
function isDirectInvocation(argvPath) {
  if (argvPath === undefined)
    return false;
  const modulePath = fileURLToPath(import.meta.url);
  const moduleName = basename4(modulePath);
  if (moduleName !== "serve.js" && moduleName !== "serve.ts")
    return false;
  return realpathSync3(resolve5(argvPath)) === realpathSync3(modulePath);
}
export {
  resolveServeProcessInvocation,
  runCodegraphServe,
  runCodegraphServeCli
};
