import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Niyyah — app local-first, installable (PWA).
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      workbox: {
        // précache aussi l'adhan → disponible hors-ligne (fichier > 2 Mo par défaut)
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest,mp3}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: {
        name: "Niyyah — Agenda du Deen",
        short_name: "Niyyah",
        description: "Productivité spirituelle : salât, Qur'an, habitudes, Ramadan, muhasaba.",
        lang: "fr",
        theme_color: "#2f4a3e",
        background_color: "#f6f1e7",
        display: "standalone",
        orientation: "portrait",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ]
});
