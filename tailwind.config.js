/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#2563EB',
        'primary-dark': '#1D4ED8',
        'background-color': '#F8FAFC',
        'card': '#FFFFFF',
        'border-color': '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'success': '#16A34A',
        'warning': '#D97706',
        'danger': '#DC2626',
      }
    },
  },
  plugins: [],
}
