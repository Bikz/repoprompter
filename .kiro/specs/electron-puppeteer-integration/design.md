# Design Document

## Overview

The Puppeteer integration will enable remote debugging of the RepoPrompter Electron application by exposing Chrome DevTools Protocol (CDP) endpoints in development mode. This will allow external scripts to connect, capture console logs, take screenshots, and extract debugging information for easy sharing with AI assistants.

## Architecture

### Core Components

1. **Electron Main Process Configuration**

   - Enable remote debugging when `NODE_ENV=development`
   - Configure CDP port (default: 9222)
   - Add command line switches for debugging

2. **Debug Script (`debug-electron.js`)**

   - Standalone Node.js script using Puppeteer
   - Connects to running Electron app via CDP
   - Captures console logs and takes screenshots
   - Exports data to shareable formats

3. **Package Scripts**
   - Add npm/pnpm scripts for easy debugging
   - Combine app startup with debug script execution

## Components and Interfaces

### Electron Main Process Changes

```typescript
// src/main/main.ts modifications
interface DebugConfig {
  enabled: boolean;
  port: number;
  host: string;
}

const debugConfig: DebugConfig = {
  enabled: process.env.NODE_ENV === "development",
  port: 9222,
  host: "localhost",
};
```

### Debug Script Interface

```javascript
// debug-electron.js
interface DebugOutput {
  timestamp: string
  logs: ConsoleMessage[]
  screenshot?: string
  appState: {
    url: string
    title: string
    windowSize: { width: number, height: number }
  }
}

interface ConsoleMessage {
  timestamp: string
  level: 'log' | 'error' | 'warn' | 'info'
  text: string
  location?: string
}
```

### Configuration

```json
// package.json scripts
{
  "scripts": {
    "dev:debug": "cross-env NODE_ENV=development electron-vite dev --remote-debugging-port=9222",
    "debug:capture": "node debug-electron.js",
    "debug:logs": "node debug-electron.js --logs-only",
    "debug:screenshot": "node debug-electron.js --screenshot-only"
  }
}
```

## Data Models

### Console Log Structure

```typescript
interface ConsoleLog {
  timestamp: Date;
  level: "log" | "error" | "warn" | "info" | "debug";
  message: string;
  args: any[];
  location?: {
    file: string;
    line: number;
    column: number;
  };
  stackTrace?: string;
}
```

### Debug Session Output

```typescript
interface DebugSession {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  appInfo: {
    version: string;
    platform: string;
    electronVersion: string;
  };
  logs: ConsoleLog[];
  screenshots: string[];
  errors: Error[];
}
```

## Error Handling

### Connection Errors

- Detect if Electron app is not running
- Provide clear instructions to start app in debug mode
- Handle CDP connection timeouts gracefully

### Runtime Errors

- Catch and log Puppeteer errors
- Handle window state changes (minimized, closed)
- Graceful degradation when features are unavailable

### Output Errors

- Handle file system write permissions
- Validate output directory existence
- Provide fallback locations for debug files

## Testing Strategy

### Manual Testing

1. Start Electron app in debug mode
2. Run debug script and verify console log capture
3. Test screenshot functionality
4. Verify output file generation and format

### Integration Testing

1. Test with various console message types
2. Verify behavior when app is not running
3. Test concurrent debugging sessions
4. Validate output file formats and content

### Error Scenario Testing

1. Test connection failures
2. Test file write permission issues
3. Test app state changes during debugging
4. Test malformed console messages

## Implementation Notes

### Electron Configuration

- Use `--remote-debugging-port` flag only in development
- Ensure security by binding to localhost only
- Add proper cleanup when app closes

### Puppeteer Script

- Use headless mode for better performance
- Implement connection retry logic
- Add timeout handling for long-running operations

### Output Format

- Default to human-readable text format
- Optional JSON output for programmatic use
- Include metadata for context (timestamps, app version)

### File Organization

```
debug-output/
├── logs/
│   ├── console-2024-07-21-16-30-00.txt
│   └── session-2024-07-21-16-30-00.json
├── screenshots/
│   ├── app-state-2024-07-21-16-30-00.png
│   └── error-state-2024-07-21-16-30-15.png
└── reports/
    └── debug-session-2024-07-21-16-30-00.html
```

## Security Considerations

- Remote debugging only enabled in development mode
- CDP endpoint bound to localhost only
- No sensitive data exposure through debug output
- Automatic cleanup of debug files after specified retention period
