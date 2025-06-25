/**
 * File: configStore.ts
 * Description: Provides JSON-based config support for storing known large files and per-repo settings.
 * - getRepoSettings, updateRepoSettings
 * - getKnownLargeFiles, setKnownLargeFiles
 */

import { app } from 'electron'
import fs from 'fs'
import path from 'path'

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
    ignorePatterns: string[]
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
      ],
      ignorePatterns: [
        'package-lock.json',
        'pnpm-lock.yaml',
        'yarn.lock',
        'composer.lock',
        'Pipfile.lock',
        'poetry.lock',
        'Gemfile.lock',
        'go.sum',
        'Cargo.lock',
        '^(dist|build|out|target|release)[\\/]',
        '^\\.next[\\/]',
        '^\\.nuxt[\\/]',
        '^\\.output[\\/]',
        '^public[\\/].*\\.(js|css|map)$',
        '^node_modules[\\/]',
        '^vendor[\\/]',
        '^__pycache__[\\/]',
        '\\.(config|conf)\\.(js|ts|json|yaml|yml)$',
        'webpack.config.js',
        'vite.config.js',
        'rollup.config.js',
        'babel.config.js',
        '.eslintrc.json',
        '.prettierrc',
        'jest.config.js',
        'cypress.config.js',
        'playwright.config.js',
        'tailwind.config.js',
        'postcss.config.js',
        '^README\\.(md|txt|rst)$',
        '^CHANGELOG\\.(md|txt|rst)$',
        '^LICENSE(\\.(md|txt))?$',
        '^CONTRIBUTING\\.(md|txt)$',
        '.gitignore',
        '.gitattributes',
        '.dockerignore',
        '^\\.vscode[\\/]',
        '^\\.idea[\\/]',
        '^\\.vs[\\/]',
        '*.swp',
        '*.swo',
        '*~',
        '\\.(png|jpe?g|gif|svg|ico|webp|avif)$',
        '\\.(mp4|avi|mov|wmv|flv|webm)$',
        '\\.(mp3|wav|ogg|m4a|aac)$',
        '\\.(woff2?|ttf|eot|otf)$',
        '\\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$',
        '\\.min\\.(js|css)$',
        '\\.map$',
        '\\.d\\.ts$',
        'coverage[\\/]',
        '\\.nyc_output[\\/]',
        'logs?[\\/]',
        'tmp[\\/]',
        'temp[\\/]',
        '^\\.env(\\.|$)',
        '.DS_Store',
        'Thumbs.db',
        '\\.(csv|json|xml|sql)$',
        '[\\/](fixtures|mocks|__fixtures__|__mocks__)[\\/]',
        '\\.fixtures?\\.(js|ts|json)$',
        '\\.mock\\.(js|ts)$'
      ]
    },
    repos: {}
  }
}

/**
 * Load config from disk, or return a default config if file not found / parse error.
 */
export function loadConfig(): RepoprompterConfig {
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

/** Save the entire config object to disk. */
export function saveConfig(config: RepoprompterConfig) {
  const configPath = getConfigFilePath()
  try {
    fs.mkdirSync(path.dirname(configPath), { recursive: true })
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save settings.json:', err)
  }
}

/** Get or create the settings object for a particular repo. */
export function getRepoSettings(repoPath: string): RepoSettings {
  const config = loadConfig()
  if (!config.repos[repoPath]) {
    config.repos[repoPath] = {
      userInstructions: '',
      groups: []
    }
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
  saveConfig(config)
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
  saveConfig(config)
}

/** Retrieve global ignore patterns. */
export function getIgnorePatterns(): string[] {
  const config = loadConfig()
  return config.global.ignorePatterns
}

/** Persist a new global ignore pattern list. */
export function setIgnorePatterns(newList: string[]) {
  const config = loadConfig()
  config.global.ignorePatterns = newList
  saveConfig(config)
}