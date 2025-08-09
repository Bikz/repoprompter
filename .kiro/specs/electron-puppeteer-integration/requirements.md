# Requirements Document

## Introduction

This feature will add Puppeteer integration to RepoPrompter for easy debugging and console log extraction. The goal is to provide a simple way to connect to the running Electron app, capture console output, and take screenshots for sharing with AI assistants or troubleshooting.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to connect Puppeteer to my running Electron app, so that I can extract console logs and debug information.

#### Acceptance Criteria

1. WHEN the Electron app starts in development mode THEN it SHALL enable remote debugging on a specific port
2. WHEN a Puppeteer script connects THEN it SHALL successfully access the renderer process
3. WHEN connected THEN Puppeteer SHALL capture all console messages (log, error, warn, info)
4. WHEN logs are captured THEN they SHALL include timestamps and be formatted for easy sharing

### Requirement 2

**User Story:** As a developer, I want a simple script to extract debugging information, so that I can quickly share it with AI assistants.

#### Acceptance Criteria

1. WHEN the debug script runs THEN it SHALL automatically connect to the running Electron app
2. WHEN connected THEN it SHALL capture recent console logs and current app state
3. WHEN capturing is complete THEN it SHALL save the output to a text file
4. WHEN the app is not running THEN it SHALL provide clear instructions to start it in debug mode

### Requirement 3

**User Story:** As a developer, I want to take screenshots of the app state, so that I can provide visual context when reporting issues.

#### Acceptance Criteria

1. WHEN a screenshot is requested THEN it SHALL capture the current Electron window
2. WHEN screenshots are taken THEN they SHALL be saved as PNG files with timestamps
3. WHEN the window is minimized or hidden THEN it SHALL handle the scenario gracefully