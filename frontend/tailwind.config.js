/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#FAFAF7',
          card: '#FFFFFF',
        },
        surface: {
          subtle: '#F3F4F0',
          border: '#E5E7EB',
        },
        charcoal: {
          DEFAULT: '#1F2421',
          muted: '#4B5563',
          faint: '#9CA3AF',
        },
        brand: {
          lavender: '#8B80F9',
          lavenderLight: '#EDE9FE',
          sage: '#65A30D',
          sageLight: '#F7FEE7',
          teal: '#0D9488',
          tealLight: '#CCFBF1',
        }
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
