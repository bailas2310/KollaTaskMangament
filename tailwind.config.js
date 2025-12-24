/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
        'sm': '768px',
        'md': '1024px',
        'lg': '1440px',
      },
      colors: {
        primary: {
          start: '#025240',
          end: '#49C4A6',
          DEFAULT: '#49C4A6',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        neutral: {
          50: '#f8fafc',
          100: '#e2e8f0',
          500: '#64748b',
          900: '#1e293b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      transitionDuration: {
        'smooth': '250ms',
        'fast': '150ms',
      },
      touchAction: {
        'pan-y': 'pan-y',
      },
    },
  },
  plugins: [],
}

