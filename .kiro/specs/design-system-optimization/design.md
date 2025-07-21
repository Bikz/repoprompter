# Design Document

## Overview

This design outlines a comprehensive redesign of RepoPrompter's styling system to create a unified, maintainable, and performant design architecture. The solution consolidates multiple styling approaches into a single Tailwind-based system with optimized design tokens, eliminates redundant CSS, and establishes consistent component patterns.

## Architecture

### Design System Structure

```
src/renderer/styles/
├── design-tokens.css     # Core design tokens (optimized)
├── components.css        # Component-specific utilities
└── base.css             # Base styles and resets

src/renderer/components/ui/
├── Button.tsx           # Unified button component
├── Input.tsx            # New unified input component  
├── Card.tsx             # Optimized card component
├── Modal.tsx            # New unified modal component
└── FileTree.tsx         # New dedicated file tree component
```

### Styling Approach

1. **Tailwind-First**: All components use Tailwind utilities with design tokens
2. **Component Composition**: Reusable UI components with consistent APIs
3. **Design Token System**: CSS custom properties for theming and consistency
4. **Minimal Custom CSS**: Only for complex interactions and animations

## Components and Interfaces

### Core Design Tokens (Optimized)

```css
:root {
  /* Spacing Scale - Simplified */
  --space-1: 4px;   /* xs */
  --space-2: 8px;   /* sm */
  --space-3: 12px;  /* md */
  --space-4: 16px;  /* lg */
  --space-6: 24px;  /* xl */
  --space-8: 32px;  /* 2xl */

  /* Typography Scale */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* Colors - Semantic */
  --color-primary: #0A84FF;
  --color-success: #32D74B;
  --color-danger: #FF3B30;
  --color-warning: #FF9500;
  
  /* Surface Colors */
  --surface-primary: rgba(255, 255, 255, 0.8);
  --surface-secondary: rgba(255, 255, 255, 0.6);
  --surface-border: rgba(0, 0, 0, 0.08);
  
  /* Text Colors */
  --text-primary: rgba(0, 0, 0, 0.85);
  --text-secondary: rgba(0, 0, 0, 0.6);
  --text-tertiary: rgba(0, 0, 0, 0.4);
}

.dark {
  --surface-primary: rgba(44, 44, 46, 0.8);
  --surface-secondary: rgba(44, 44, 46, 0.6);
  --surface-border: rgba(255, 255, 255, 0.1);
  
  --text-primary: rgba(255, 255, 255, 0.85);
  --text-secondary: rgba(255, 255, 255, 0.6);
  --text-tertiary: rgba(255, 255, 255, 0.4);
}
```

### Button Component (Unified)

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

// Tailwind classes for consistent styling
const buttonVariants = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
}

const buttonSizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base'
}
```

### Input Component (New)

```typescript
interface InputProps {
  variant?: 'default' | 'search'
  size?: 'sm' | 'md'
  error?: boolean
  className?: string
}

// Consistent input styling across all forms
const inputStyles = 'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white'
```

### File Tree Component (Redesigned)

```typescript
interface FileTreeProps {
  nodes: TreeNode[]
  selectedFiles: Set<string>
  onSelectionChange: (path: string) => void
  className?: string
}

// Simplified tree styling with consistent spacing
const treeStyles = {
  container: 'font-mono text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg',
  node: 'flex items-center py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer',
  selected: 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500',
  indent: 'w-4 flex-shrink-0'
}
```

### Modal Component (New)

```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

// Consistent modal styling and positioning
const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg'
}
```

## Data Models

### Design Token Configuration

```typescript
interface DesignTokens {
  spacing: Record<string, string>
  colors: {
    primary: string
    secondary: string
    success: string
    danger: string
    warning: string
  }
  typography: {
    sizes: Record<string, string>
    weights: Record<string, string>
  }
  borderRadius: Record<string, string>
  shadows: Record<string, string>
}
```

### Component Style Configuration

```typescript
interface ComponentStyles {
  button: {
    variants: Record<string, string>
    sizes: Record<string, string>
    base: string
  }
  input: {
    variants: Record<string, string>
    sizes: Record<string, string>
    base: string
  }
  card: {
    base: string
    variants: Record<string, string>
  }
}
```

## Error Handling

### CSS Loading and Fallbacks

1. **Progressive Enhancement**: Base styles load first, enhancements layer on top
2. **Theme Switching**: Graceful fallbacks when theme switching fails
3. **Component Isolation**: Component styles don't leak or conflict
4. **Performance Monitoring**: Track CSS bundle size and loading performance

### Style Conflicts

1. **CSS Specificity**: Use consistent specificity levels to prevent conflicts
2. **Namespace Isolation**: Component styles are properly scoped
3. **Theme Consistency**: Ensure all components respect theme changes
4. **Responsive Behavior**: All components work across different screen sizes

## Testing Strategy

### Visual Regression Testing

1. **Component Screenshots**: Capture all component variants in light/dark modes
2. **Layout Testing**: Verify spacing and alignment across different content sizes
3. **Theme Switching**: Test smooth transitions between light and dark modes
4. **Responsive Testing**: Verify components work on different screen sizes

### Performance Testing

1. **CSS Bundle Size**: Monitor and optimize CSS bundle size
2. **Render Performance**: Measure component render times
3. **Memory Usage**: Track memory usage of styling system
4. **Load Times**: Measure initial CSS load and parse times

### Accessibility Testing

1. **Color Contrast**: Verify all color combinations meet WCAG standards
2. **Focus States**: Ensure all interactive elements have clear focus indicators
3. **Screen Reader**: Test that styling doesn't interfere with screen readers
4. **High Contrast Mode**: Verify compatibility with system high contrast modes

### Integration Testing

1. **Component Composition**: Test that components work together harmoniously
2. **Theme Consistency**: Verify all components respect global theme settings
3. **State Management**: Test styling during different application states
4. **Cross-Browser**: Verify consistent appearance across different browsers

## Implementation Phases

### Phase 1: Foundation
- Optimize design tokens and remove unused CSS
- Create unified Button and Input components
- Update core layout components (Card, Modal)

### Phase 2: File Tree Redesign  
- Create dedicated FileTree component
- Implement clean, IDE-like styling
- Optimize tree performance and interactions

### Phase 3: Component Migration
- Migrate all existing components to new system
- Remove old CSS classes and redundant styles
- Update all component usage throughout the app

### Phase 4: Polish and Optimization
- Fine-tune spacing and visual hierarchy
- Optimize CSS bundle size
- Add smooth transitions and micro-interactions