module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '375px',
        'md': '425px',
        'lg': '428px',
      },
      colors: {
        primary: '#0057B7', // Ukrainian blue
        secondary: '#FFD700', // Ukrainian yellow
        danger: '#DC2626',
        success: '#16A34A',
        background: '#0F172A', // dark mode
        surface: '#1E293B',
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
        'shelter': '#4F46E5',
        'hospital': '#DC2626',
        'pharmacy': '#059669',
        'power': '#F59E0B',
        'water': '#0EA5E9',
        'aid': '#8B5CF6',
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '14px', // 14px base as specified
        'lg': '16px', // 16px for buttons
        'xl': '18px',
        '2xl': '20px',
        '3xl': '24px',
      },
      spacing: {
        '11': '44px', // minimum touch target
        '18': '72px',
        '22': '88px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}