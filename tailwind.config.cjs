/**
 * File: tailwind.config.cjs
 * Description: Basic Tailwind CSS configuration for the entire project.
 */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/renderer/index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#007bff',
        // Change off-black to pure black
        'off-black': '#000000'
      }
    }
  },
  plugins: [],
  future: {
    hoverOnlyWhenSupported: true,
  }
}