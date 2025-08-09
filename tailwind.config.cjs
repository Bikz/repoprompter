/**
 * File: tailwind.config.cjs
 * Description: Tailwind CSS configuration with design tokens
 */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/renderer/index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Core layout utilities
    'flex', 'flex-1', 'flex-col', 'flex-shrink-0',
    'grid', 'block', 'hidden', 'relative', 'absolute', 'fixed',
    // Common spacing
    'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6',
    'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-6',
    'px-2', 'px-3', 'px-4', 'px-6', 'py-1', 'py-2', 'py-4',
    'm-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mt-4',
    // Text utilities
    'text-xs', 'text-sm', 'text-base', 'text-lg',
    'font-medium', 'font-semibold', 'font-mono',
    'text-center', 'truncate',
    // Colors (using CSS variables)
    'text-primary', 'text-secondary', 'text-tertiary',
    'bg-substrate', 'bg-surface', 'border-surface',
    // Interactive states
    'hover:bg-gray-100', 'hover:bg-gray-200', 'dark:hover:bg-gray-700', 'dark:hover:bg-gray-800',
    'focus:outline-none', 'focus-visible:ring-2',
    // Sizing
    'w-4', 'w-5', 'w-8', 'w-16', 'w-80', 'w-96', 'w-full',
    'h-4', 'h-5', 'h-8', 'h-10', 'h-12', 'h-14', 'h-16', 'h-full', 'h-screen',
    'max-w-4xl', 'max-h-[80vh]', 'min-h-0', 'min-h-screen',
    // Border and radius
    'border', 'border-b', 'border-t', 'rounded', 'rounded-md', 'rounded-lg', 'rounded-full',
    // Positioning and transforms
    'items-center', 'justify-center', 'justify-between', 'justify-end',
    'overflow-hidden', 'overflow-auto', 'overflow-x-auto',
    'transition-all', 'transition-transform', 'rotate-90',
    // Z-index and backdrop
    'z-10', 'z-50', 'backdrop-blur-sm',
    // Opacity and visibility
    'opacity-0', 'opacity-50', 'opacity-90', 'opacity-100',
  ],
  theme: {
    extend: {
      colors: {
        // Using optimized CSS variables for dynamic theming
        'substrate': 'var(--bg-substrate)',
        'surface': {
          DEFAULT: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
        },
        'primary': 'var(--color-primary)',
        'danger': 'var(--color-danger)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'border': 'var(--surface-border)',
      },
      textColor: {
        'primary': 'var(--text-primary)',
        'secondary': 'var(--text-secondary)',
        'tertiary': 'var(--text-tertiary)',
      },
      placeholderColor: {
        'tertiary': 'var(--text-tertiary)',
      },
      fontFamily: {
        'sans': ['var(--font-sans)'],
        'mono': ['var(--font-mono)'],
      },
      fontSize: {
        'xs': ['var(--text-xs)', { lineHeight: '16px' }],
        'sm': ['var(--text-sm)', { lineHeight: '20px' }],
        'base': ['var(--text-base)', { lineHeight: '24px' }],
        'lg': ['var(--text-lg)', { lineHeight: '28px' }],
      },
      spacing: {
        // Using default Tailwind spacing scale for better optimization
        // Custom spacing removed as it wasn't providing significant value
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'normal': 'var(--transition-normal)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.21, 0.61, 0.35, 1)',
      },
    }
  },
  plugins: [
    // Add focus-visible support
    function({ addVariant }) {
      addVariant('focus-visible', '&:focus-visible')
    }
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
  corePlugins: {
    // Disable unused core plugins for smaller bundle
    container: false,
    float: false,
    clear: false,
    skew: false,
    caretColor: false,
    sepia: false,
    saturate: false,
    hueRotate: false,
    brightness: false,
    contrast: false,
  }
}