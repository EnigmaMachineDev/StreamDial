/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Shared EnigmaMachineDev dark-green palette (same values as SoulframeTools'
      // `sf` tokens). Namespaced as `brand` so it survives a site rename.
      colors: {
        brand: {
          bg: '#0a0f0a',
          panel: '#0f1a0f',
          card: '#142014',
          border: '#1e3a1e',
          hover: '#1a2e1a',
          accent: '#2d5a2d',
          green: '#4a8c4a',
          bright: '#6abf6a',
          text: '#c8e6c8',
          muted: '#7a9f7a',
          dim: '#3a5a3a',
        },
        // Platform accents for badges (not part of the green theme surface).
        youtube: '#ff0033',
        twitch: '#9146ff',
        kick: '#53fc18',
        live: '#e53935',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
