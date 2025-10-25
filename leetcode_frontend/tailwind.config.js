/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom dark theme colors
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#2d2d2d',
        'dark-accent': '#3d3d3d',
        'dark-neutral': '#4d4d4d',
        'dark-base-100': '#0f0f0f',
        'dark-base-200': '#1a1a1a', 
        'dark-base-300': '#2d2d2d',
        'dark-info': '#3abff8',
        'dark-success': '#36d399',
        'dark-warning': '#fbbd23',
        'dark-error': '#f87272',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#6366f1",
          "primary-content": "#ffffff",
          "secondary": "#8b5cf6", 
          "secondary-content": "#ffffff",
          "accent": "#06b6d4",
          "accent-content": "#ffffff",
          "neutral": "#2d3748",
          "neutral-content": "#ffffff",
          "base-100": "#0f0f0f",
          "base-200": "#1a1a1a",
          "base-300": "#2d2d2d",
          "base-content": "#ffffff",
          "info": "#3abff8",
          "info-content": "#000000",
          "success": "#36d399",
          "success-content": "#000000",
          "warning": "#fbbd23", 
          "warning-content": "#000000",
          "error": "#f87272",
          "error-content": "#000000",
        },
      },
      "light", // Keep light theme as backup
    ],
    darkTheme: "dark", // Set dark as the default theme
    base: true,
    styled: true,
    utils: true,
    rtl: false,
    prefix: "",
    logs: true,
  },
}
