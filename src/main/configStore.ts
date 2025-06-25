/**
 * File: configStore.ts
 * Description: Provides JSON-based config support for storing known large files and per-repo settings.
 * - getRepoSettings, updateRepoSettings
 * - getKnownLargeFiles, setKnownLargeFiles
 */

import { app } from 'electron'
import fs from 'fs'
import path from 'path'

let configCache: RepoprompterConfig | null = null
let saveTimer: NodeJS.Timeout | null = null
const SAVE_DEBOUNCE_MS = 200

interface RepoGroup {
  name: string
  files: string[]
}

interface RepoSettings {
  userInstructions: string
  groups: RepoGroup[]
}

interface RepoprompterConfig {
  global: {
    knownLargeFiles: string[]
  }
  repos: {
    [repoPath: string]: RepoSettings
  }
}

/** Resolve the user's config file path in the OS-specific userData directory. */
function getConfigFilePath(): string {
  const userDataDir = app.getPath('userData')
  return path.join(userDataDir, 'settings.json')
}

/** Build the default config if no config file is found. */
function getDefaultConfig(): RepoprompterConfig {
  return {
    global: {
      knownLargeFiles: [
        'pnpm-lock.yaml',
        'project.pbxproj',
        'package-lock.json',
        '.DS_Store'
      ]
    },
    repos: {}
  }
}

function readConfigFromDisk(): RepoprompterConfig {
  const configPath = getConfigFilePath()
  if (!fs.existsSync(configPath)) {
    return getDefaultConfig()
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf-8')
    const parsed = JSON.parse(raw) as RepoprompterConfig
    return parsed
  } catch (err) {
    console.error('Failed to parse settings.json. Returning default config.', err)
    return getDefaultConfig()
  }
}

function writeConfigToDisk(config: RepoprompterConfig) {
  const configPath = getConfigFilePath()
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true })
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save settings.json:', err)
  }
}

/**
 * Load config from disk, or return a default config if file not found / parse error.
 */
export function loadConfig(): RepoprompterConfig {
  if (!configCache) {
    configCache = readConfigFromDisk()
  }
  return configCache
}

/** Save the entire config object to disk. */
function saveConfigDebounced() {
  if (!configCache) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (configCache) {
      writeConfigToDisk(configCache)
    }
    saveTimer = null
  }, SAVE_DEBOUNCE_MS)
}

export function saveConfig() {
  saveConfigDebounced()
}

/** Get or create the settings object for a particular repo. */
export function getRepoSettings(repoPath: string): RepoSettings {
  const config = loadConfig()
  if (!config.repos[repoPath]) {
    config.repos[repoPath] = {
      userInstructions: '',
      groups: []
    }
    saveConfig()
  }
  return config.repos[repoPath]
}

/** Merge partial updates into the repo’s settings and save. */
export function updateRepoSettings(repoPath: string, updates: Partial<RepoSettings>) {
  const config = loadConfig()
  const existing = config.repos[repoPath] || {
    userInstructions: '',
    groups: []
  }

  const newSettings: RepoSettings = {
    ...existing,
    ...updates
  }
  config.repos[repoPath] = newSettings
  saveConfig()
}

/** Retrieve global knownLargeFiles. */
export function getKnownLargeFiles(): string[] {
  const config = loadConfig()
  return config.global.knownLargeFiles
}

/** Persist a new global knownLargeFiles list. */
export function setKnownLargeFiles(newList: string[]) {
  const config = loadConfig()
  config.global.knownLargeFiles = newList
  saveConfig()
}
