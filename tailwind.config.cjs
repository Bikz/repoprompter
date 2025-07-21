/**
 * File: tailwind.config.cjs
 * Description: Tailwind CSS configuration with design tokens
 */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/renderer/index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
    "./src/renderer/components/**/*.{js,ts,jsx,tsx}",
    "./src/renderer/components/ui/**/*.{js,ts,jsx,tsx}",
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
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
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
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  }
}