/**
 * File: configStore.ts
 * Description: Provides JSON-based config support with in-memory caching and debounced writes.
 * - In-memory cache for configuration to avoid repeated file I/O
 * - Debounced writes to disk for better performance
 * - Centralized ignore patterns for file filtering
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

interface IgnorePattern {
  pattern: string
  flags?: string
}

interface RepoprompterConfig {
  global: {
    knownLargeFiles: string[]
    ignorePatterns: (string | IgnorePattern)[]
  }
  repos: {
    [repoPath: string]: RepoSettings
  }
}

class ConfigStore {
  private config: RepoprompterConfig | null = null
  private configPath: string
  private saveTimeout: NodeJS.Timeout | null = null
  private readonly SAVE_DEBOUNCE_MS = 500

  constructor() {
    this.configPath = this.getConfigFilePath()
    this.loadConfigFromDisk()
  }

  private getConfigFilePath(): string {
    const userDataDir = app.getPath('userData')
    return path.join(userDataDir, 'settings.json')
  }

  private getDefaultConfig(): RepoprompterConfig {
    return {
      global: {
        knownLargeFiles: [
          'pnpm-lock.yaml',
          'project.pbxproj',
          'package-lock.json',
          '.DS_Store'
        ],
        ignorePatterns: [
          // Lock files
          'package-lock.json',
          'pnpm-lock.yaml',
          'yarn.lock',
          'composer.lock',
          'Pipfile.lock',
          'poetry.lock',
          'Gemfile.lock',
          'go.sum',
          'Cargo.lock',
          
          // Build/dist patterns
          { pattern: '^(dist|build|out|target|release)[\\\\/]', flags: '' },
          { pattern: '^\\.next[\\\\/]', flags: '' },
          { pattern: '^\\.nuxt[\\\\/]', flags: '' },
          { pattern: '^\\.output[\\\\/]', flags: '' },
          { pattern: '^public[\\\\/].*\\.(js|css|map)$', flags: '' },
          
          // Dependencies
          { pattern: '^node_modules[\\\\/]', flags: '' },
          { pattern: '^vendor[\\\\/]', flags: '' },
          { pattern: '^__pycache__[\\\\/]', flags: '' },
          
          // Config files
          { pattern: '\\.(config|conf)\\.(js|ts|json|yaml|yml)$', flags: '' },
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
          
          // Documentation
          { pattern: '^README\\.(md|txt|rst)$', flags: 'i' },
          { pattern: '^CHANGELOG\\.(md|txt|rst)$', flags: 'i' },
          { pattern: '^LICENSE(\\.(md|txt))?$', flags: 'i' },
          { pattern: '^CONTRIBUTING\\.(md|txt)$', flags: 'i' },
          '.gitignore',
          '.gitattributes',
          '.dockerignore',
          
          // IDE files
          { pattern: '^\\.vscode[\\\\/]', flags: '' },
          { pattern: '^\\.idea[\\\\/]', flags: '' },
          { pattern: '^\\.vs[\\\\/]', flags: '' },
          '*.swp',
          '*.swo',
          '*~',
          
          // Assets
          { pattern: '\\.(png|jpe?g|gif|svg|ico|webp|avif)$', flags: 'i' },
          { pattern: '\\.(mp4|avi|mov|wmv|flv|webm)$', flags: 'i' },
          { pattern: '\\.(mp3|wav|ogg|m4a|aac)$', flags: 'i' },
          { pattern: '\\.(woff2?|ttf|eot|otf)$', flags: 'i' },
          { pattern: '\\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$', flags: 'i' },
          
          // Generated files
          { pattern: '\\.min\\.(js|css)$', flags: '' },
          { pattern: '\\.map$', flags: '' },
          { pattern: '\\.d\\.ts$', flags: '' },
          { pattern: 'coverage[\\\\/]', flags: '' },
          { pattern: '\\.nyc_output[\\\\/]', flags: '' },
          { pattern: 'logs?[\\\\/]', flags: '' },
          { pattern: 'tmp[\\\\/]', flags: '' },
          { pattern: 'temp[\\\\/]', flags: '' },
          
          // Environment files
          { pattern: '^\\.env(\\.|$)', flags: '' },
          '.DS_Store',
          'Thumbs.db',
          
          // Test fixtures
          { pattern: '[\\\\/](fixtures|mocks|__fixtures__|__mocks__)[\\\\/]', flags: '' },
          { pattern: '\\.fixtures?\\.(js|ts|json)$', flags: '' },
          { pattern: '\\.mock\\.(js|ts)$', flags: '' },
          
          // Hidden files (except .git for submodules awareness)
          { pattern: '^\\.[^/]+$', flags: '' },
          { pattern: '[\\\\/]\\.[^/]+$', flags: '' },
          '.git/'
        ]
      },
      repos: {}
    }
  }

  private loadConfigFromDisk(): void {
    if (!fs.existsSync(this.configPath)) {
      this.config = this.getDefaultConfig()
      return
    }
    
    try {
      const raw = fs.readFileSync(this.configPath, 'utf-8')
      const parsed = JSON.parse(raw) as RepoprompterConfig
      
      // Merge with defaults to ensure new ignore patterns are included
      const defaultConfig = this.getDefaultConfig()
      this.config = {
        global: {
          knownLargeFiles: parsed.global?.knownLargeFiles || defaultConfig.global.knownLargeFiles,
          ignorePatterns: parsed.global?.ignorePatterns || defaultConfig.global.ignorePatterns
        },
        repos: parsed.repos || {}
      }
    } catch (err) {
      console.error('Failed to parse settings.json. Using default config.', err)
      this.config = this.getDefaultConfig()
    }
  }

  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
    }
    
    this.saveTimeout = setTimeout(() => {
      this.saveConfigToDisk()
    }, this.SAVE_DEBOUNCE_MS)
  }

  private saveConfigToDisk(): void {
    if (!this.config) return
    
    try {
      fs.mkdirSync(path.dirname(this.configPath), { recursive: true })
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8')
    } catch (err) {
      console.error('Failed to save settings.json:', err)
    }
  }

  public getConfig(): RepoprompterConfig {
    if (!this.config) {
      this.loadConfigFromDisk()
    }
    return this.config!
  }

  public getRepoSettings(repoPath: string): RepoSettings {
    const config = this.getConfig()
    if (!config.repos[repoPath]) {
      config.repos[repoPath] = {
        userInstructions: '',
        groups: []
      }
      this.scheduleSave()
    }
    return config.repos[repoPath]
  }

  public updateRepoSettings(repoPath: string, updates: Partial<RepoSettings>): void {
    const config = this.getConfig()
    const existing = config.repos[repoPath] || {
      userInstructions: '',
      groups: []
    }

    config.repos[repoPath] = {
      ...existing,
      ...updates
    }
    
    this.scheduleSave()
  }

  public getKnownLargeFiles(): string[] {
    return this.getConfig().global.knownLargeFiles
  }

  public setKnownLargeFiles(newList: string[]): void {
    const config = this.getConfig()
    config.global.knownLargeFiles = newList
    this.scheduleSave()
  }

  public getIgnorePatterns(): (string | IgnorePattern)[] {
    return this.getConfig().global.ignorePatterns
  }

  public setIgnorePatterns(patterns: (string | IgnorePattern)[]): void {
    const config = this.getConfig()
    config.global.ignorePatterns = patterns
    this.scheduleSave()
  }

  public isFileIgnored(filePath: string): boolean {
    const patterns = this.getIgnorePatterns()
    
    return patterns.some(pattern => {
      if (typeof pattern === 'string') {
        // Simple string match
        return filePath === pattern || 
               filePath.endsWith(pattern) || 
               filePath.includes(`/${pattern}`) ||
               filePath.includes(`\\${pattern}`)
      } else {
        // Regex pattern
        try {
          const regex = new RegExp(pattern.pattern, pattern.flags || '')
          return regex.test(filePath)
        } catch (err) {
          console.error(`Invalid regex pattern: ${pattern.pattern}`, err)
          return false
        }
      }
    })
  }

  // Force save immediately (useful on app shutdown)
  public forceSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
    this.saveConfigToDisk()
  }
}

// Singleton instance
const configStore = new ConfigStore()

// Export functions for backward compatibility
export function getRepoSettings(repoPath: string): RepoSettings {
  return configStore.getRepoSettings(repoPath)
}

export function updateRepoSettings(repoPath: string, updates: Partial<RepoSettings>) {
  configStore.updateRepoSettings(repoPath, updates)
}

export function getKnownLargeFiles(): string[] {
  return configStore.getKnownLargeFiles()
}

export function setKnownLargeFiles(newList: string[]) {
  configStore.setKnownLargeFiles(newList)
}

export function getIgnorePatterns(): (string | IgnorePattern)[] {
  return configStore.getIgnorePatterns()
}

export function setIgnorePatterns(patterns: (string | IgnorePattern)[]) {
  configStore.setIgnorePatterns(patterns)
}

export function isFileIgnored(filePath: string): boolean {
  return configStore.isFileIgnored(filePath)
}

// Force save on app quit
app.on('before-quit', () => {
  configStore.forceSave()
})

export { configStore }