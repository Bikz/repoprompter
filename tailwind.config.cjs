/**
 * File: tailwind.config.cjs
 * Description: Basic Tailwind CSS configuration for the entire project.
 */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#007bff'
      },
    },
  },
  plugins: [],
}