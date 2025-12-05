/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37', 
        dark: '#1a1a1a',
        // Add these new colors for MainLayout
        'jewel-gold': '#D4AF37',   // Classic Gold
        'jewel-dark': '#0F172A',   // Deep Blue/Black
        'jewel-cream': '#FDFBF7',  // Off-white background
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}