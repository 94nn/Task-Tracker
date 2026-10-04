import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site from https://USERNAME.github.io/REPOSITORY-NAME/,
// so every asset URL must be prefixed with "/REPOSITORY-NAME/".
// The deploy workflow sets BASE_PATH automatically from the repository name.
// Locally (npm run dev / npm run preview) the app is served from "/".
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
